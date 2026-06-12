---
title: Distributed Compaction in SlateDb
author: Ryan Dielhenn
date: 2026-05-26
description: A visual and written explanation of Distributed Compaction (RFC-0025 in SlateDb)
tags: [SlateDb, Distributed Systems Engineering, Object Storage]
---

# Background

[SlateDb](https://slatedb.io) is an embedded key-value store built on object storage. It uses a Log-Structured Merge Tree, or LSM for short, to batch writes to object storage to reduce write latency. Incoming writes land in an in-memory buffer called the memtable. Once the memtable fills up, it is flushed to an immutable Sorted String Table (SST) in object storage. Freshly flushed SSTs land in L0. From there, SlateDb uses size-tiered compaction, where SSTs are grouped by size and merged together as each tier fills up. LSM trees let you tune the tradeoffs between read, write, and space amplification. I recommend reading [this blog](https://www.bitsxpages.com/p/understanding-lsm-trees-via-read) by Almog Gavra if you want know more about these tradeoffs.

The following is what you would see if you listed the contents of an object storage bucket path used by SlateDb:

```
manifest/
  00000000001.manifest  # This is a snapshot of the database state.
  00000000002.manifest
  00000000003.manifest
  ...
compactions/
  00000000001.compactions # Jobs scheduled for compaction by the
  00000000002.compactions # compaction coordinator.
  00000000003.compactions
  ...
compacted/
  <ULID1>.sst # This is compacted data
  <ULID2>.sst # L0 ssts also happen to live here which have not been compacted yet
  <ULID3>.sst
  ...
wal/ # This is the write ahead log. Writes land here first so that they can be replayed in a failure scenario.
  00000000001.sst 
  00000000002.sst 
  00000000003.sst
gc/
  manifest.boundary # Garbage collector deletes .manifest versions at or below this Boundary
  compactions.boundary # Garbage collecor deletes .compactions files at or below this Boundary
```

All of this is hidden from the user under simple put/get/scan APIs.

# Compaction

Compaction is a critical background process of the LSM tree that takes Sorted String Tables (SST for short) and merges them to produce an output SST with non-repeating keys. This process does a few things. When multiple SSTs share keys, merging them removes duplicate entries and cleans up tombstones left behind by deletes, reducing space amplification. It also reduces the number of SSTs that need to be read to find a key i.e. reduces read amplification.

![LSM Compaction Merge Step Detail](/lsm_compaction_merge_step_cdc_minimal.svg)

# Distributed Compaction

A single compactor is a bottleneck: if it cannot keep pace with write throughput, the whole system degrades in two stages. First, as uncompacted SSTs pile up in L0, more files need to be scanned to find a key, increasing read latency. Then, once the L0 file count reaches `l0_max_ssts`, the flusher stops writing immutable memtables to L0. Those memtables accumulate in memory until `max_unflushed_bytes` is exceeded, at which point SlateDb applies backpressure that stalls writes from being durably written to object storage. A lagging compactor therefore degrades read latency first, then write throughput.

![How distributing compaction across workers relieves the single-compactor bottleneck](/slatedb_distributed_compaction_why_it_helps_minimal.svg)

Idealy, we want to be able to parallelize compaction of L0 and Sorted Run compaction. Parallelization of compaction jobs containing L0 SST's was not possible on a single machine before RFC-25, even with `max_concurrent_compactions` set to something other than 1. RFC-24 allowed parallelization of L0 SSTs in different segments, but explicitly kept parallel L0 compaction within a single segment out of scope.

From RFC-24:

> Parallel L0 compaction within a single segment is a separate concern tied to the watermark's single-cursor design and is not addressed here.

RFC-25 is a natural place to address this shortcoming in SlateDb.

L0 SST compaction jobs running in parallel in conjunction with Subcompactions (RFC-0027 by Almog Gavra) should be a massive improvement to SlateDb's throughput capability.

# How it works

The whole design hangs on one constraint: SlateDb has a **single-writer invariant**. Only one process may commit to the manifest. Break it and two writers can clobber each other's view of the database. So distributing compaction can't simply mean "let many machines write results." The trick is to split the one thing that must stay single from the work that wants to scale out:

- A single **coordinator** owns scheduling and is the only process that commits to the manifest.
- Any number of stateless **workers** poll for jobs, execute the actual compaction (the expensive, I/O-bound part), and report results back.

There's no lock service, no consensus protocol, no new infrastructure. The only coordination primitive is the object store itself.

## Claiming work without a lock

Workers claim jobs using optimistic concurrency. Each new version of `.compactions` is written as the next sequentially-numbered file (`...0003.compactions`) using create-if-not-exists. To claim a job, a worker reads the latest state, marks the job as its own, and writes the next file. If another worker got there first, the write fails with `AlreadyExists`, and the loser simply re-reads and tries again. This works identically across every object store SlateDb supports, including ones with no native compare-and-swap.

## The state machine

A compaction job moves through a small state machine, and two states were added for distribution:

```
Submitted --> Scheduled <-> Running --> Compacted --> Completed
    |                          |           |
    |                          v           |
    +-----------------------> Failed <-----+
```

**`Scheduled`** keeps the coordinator the single gatekeeper. A worker is only ever allowed to claim a `Scheduled` job, never a raw `Submitted` one. This guarantees the coordinator has validated the job against the current manifest before any worker can touch it.

**`Compacted`** solves a subtler problem. When the executor ran in-process, the coordinator learned a job was done via an in-process message signal, then updated the manifest. A remote worker can't deliver that signal it can only write to the object store. If a worker wrote `Completed` directly, a coordinator crash would leave it unable to tell "finished, manifest already committed" apart from "finished, manifest not yet committed." `Compacted` means precisely "the worker finished and wrote its output SSTs; the manifest may or may not be updated yet." It is the distributed equivalent of that in-process signal, and it gives crash recovery an unambiguous rule: every `Compacted` job needs a manifest-write retry.

## Detecting dead workers

Workers heartbeat by piggybacking a timestamp onto their progress writes. The detail I like here: **heartbeats are tied to throughput, not wall-clock time.** A worker writes a heartbeat every `heartbeat_bytes` of data processed, not every N seconds. So a machine that is technically alive but pathologically slow due to a degraded disk or a noisy neighbor falls behind the heartbeat rate and gets its job reclaimed, exactly as if it had crashed. Liveness is defined as "making real compaction progress," which is the property we actually care about.

When the coordinator sees a `Running` job whose heartbeat is older than `worker_heartbeat_timeout_ms`, it resets the job to `Submitted` and clears the owner. Crucially, the job keeps its already-written output SSTs, so the next worker to pick it up resumes from the last checkpoint instead of starting over. And on a graceful shutdown, a worker proactively resets its in-flight jobs so peers can grab them immediately rather than waiting out the timeout.

# Guide

## Preamble

Running SlateDb itself is out of scope for this blog, but here are some helpful resources for anyone interested (directly from the SlateDb website):

- [Connect to Azure Blob Storage](https://slatedb.io/docs/tutorials/abs/)
- [Connect to S3](https://slatedb.io/docs/tutorials/s3/)
- [Connect to Google Cloud Storage](https://slatedb.io/docs/tutorials/gcs/)

This writeup is about running distributed compaction for SlateDb but anything else you'd like to know is on the SlateDb website.

## Running external/distributed compaction

Historically compaction ran as a single process either embedded in the writer or via a standalone process via cli.

```
slatedb --env-file .env --path <db-path> run-compactor
```

This cli still exists if you'd like to run compaction as an entirely separate process outside of the DB writer. Now, you may also disable the embedded compaction worker to decouple compaction scheduling/coordination from the running of actual compaction jobs by adding the `--no-embedded-worker` flag.

```
slatedb --env-file .env --path <db-path> run-compactor --no-embedded-worker
```

You should not start more than one compaction coordinator. Doing so will fence the writer and halt all DB operations. This is behavior that existed pre distributed compaction and is expected.

However, you may now run multiple workers separately via the `run-worker` sub-command of the slatedb cli. Compaction jobs take a majority of the computing resources anyway so allowing workers to scale was an obvious starting point.

```
slatedb --env-file .env --path <db-path> run-worker
```

We've discussed distributing and scaling coordination but that is out of scope for this work.

# Future benefits and work

The door is wide open for future enhancements that take advantage of these stateless compaction workers. Below are just a few examples of extensions made possible by the stateless workers added in RFC-0025.

1. Compactions routed to specific workers (or pools of them) based on priority. 

![Compaction Routing](/slatedb_priority_routed_compaction_minimal.svg)

2. A shared worker pool serving multiple database instances, significantly reducing I/O bound threads per database and allowing instances to trade compaction resources as needed.

![A shared worker pool serving multiple SlateDb instances](/slatedb_shared_compaction_worker_pool_minimal.svg)


# Until next time...
