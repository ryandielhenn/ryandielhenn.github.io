---
title: Distributed Compaction in SlateDb
author: Ryan Dielhenn
date: 2026-06-14
description: A visual and written explanation of Distributed Compaction (RFC-0025 in SlateDb) and discussion of future work
tags: [SlateDb, Distributed Systems Engineering, Object Storage]
---

# Guide

## Preamble

This guide assumes familiarity with SlateDb and how compaction works; if you'd like that context first, skip down to [Background](#background) and the sections that follow, then come back here.

Running SlateDb itself is out of scope for this blog, but here are some helpful resources for anyone interested (directly from the SlateDb website):

- [Connect to Azure Blob Storage](https://slatedb.io/docs/tutorials/abs/)
- [Connect to S3](https://slatedb.io/docs/tutorials/s3/)
- [Connect to Google Cloud Storage](https://slatedb.io/docs/tutorials/gcs/)

This writeup is about running distributed compaction for SlateDb but anything else you'd like to know is on the [SlateDb website](https://slatedb.io/).

## Running external/distributed compaction

Historically compaction ran as a single process either embedded in the writer or as a standalone process via cli.

```
slatedb --env-file .env --path <db-path> run-compactor
```

The cli sub-command `run-compactor` still exists if you'd like to run compaction as an entirely separate process outside of the DB writer. Now, you may also disable the embedded compaction worker to decouple compaction scheduling/coordination from the running of actual compaction jobs by adding the `--no-embedded-worker` flag.

```
slatedb --env-file .env --path <db-path> run-compactor --no-embedded-worker
```

You should not start more than one compaction coordinator. Doing so will fence the writer and halt all DB operations. This is behavior that existed pre distributed compaction and is expected.

However, you may now run multiple workers separately via the `run-worker` sub-command of the slatedb cli. 

```
slatedb --env-file .env --path <db-path> run-worker
```

We've discussed distributing and scaling coordination but that is out of scope for this work.

# Background

[SlateDb](https://slatedb.io) is an embedded key-value store built on object storage. It uses a Log-Structured Merge Tree, or LSM for short, to batch writes to object storage to reduce write latency. Incoming writes land in an in-memory buffer called the memtable. Once the memtable fills up, it is flushed to an immutable Sorted String Table (SST) in object storage. Freshly flushed SSTs land in L0. From there, SlateDb uses size-tiered compaction, where SSTs are grouped by size and merged together as each tier fills up. LSM trees let you tune the tradeoffs between read, write, and space amplification. I recommend reading [this blog](https://www.bitsxpages.com/p/understanding-lsm-trees-via-read) by Almog Gavra if you want know more about these tradeoffs.

The following is what you would see if you listed the contents of an object storage bucket path used by SlateDb:

```
manifest/
  00000000001.manifest  # This is a snapshot of the database state: 
  00000000002.manifest  # SST lists, watermarks, epochs, external dbs, checkpoints etc.
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

# Future benefits and work

The door is wide open for future enhancements that take advantage of these stateless compaction workers. Below are just a few examples of extensions made possible by the stateless workers added in RFC-0025.

## L0 Compaction Watermark

Ideally we want to parallelize compaction work, but it helps to separate two axes of parallelism that are easy to conflate.

The first is running *independent* compactions at the same time e.g. an L0→SR compaction in the same segment, or L0 compactions in two different segments. RFC-24 made this safe by giving each segment its own L0 list and its own `last_compacted_l0_sst_view_id` watermark. Disjoint sorted-run compactions were already safe because they never touch the watermark at all. Distributed compaction is what lets you actually *execute* these across more than one machine: a single embedded worker is capped by one machine's CPU and I/O, and `max_concurrent_compactions` only stretches that one machine so far. Spreading independent jobs across a pool of workers is the bottleneck relief this post is about.

The second axis is parallelizing L0 compactions within the same segment, and here it's worth not overselling: distributed compaction does **not** unlock it. `last_compacted_l0_sst_view_id` is a single cursor over a segment's L0 list, and "already compacted" means "at or below the cursor." A single monotonic boundary can't represent two disjoint, in-flight L0 consumptions at once, so L0 compaction within a tree is serialized whether that tree is served by one embedded worker or a fleet of remote ones. RFC-24 calls this out directly:

> Parallel L0 compaction within a single segment is a separate concern tied to the watermark's single-cursor design and is not addressed here.

![Watermark conflict with workers operating on L0 in the same segment](/slatedb_l0_watermark_problem_minimal.svg)

That note is just as true after RFC-25. Moving work onto stateless workers changes *where* a compaction runs, not whether one L0 compaction can be split in two.

Closing that gap takes one of two things (or both), and neither is distributed compaction:

- **Subcompactions (RFC-0028, by Almog Gavra).** Rather than splitting the L0 list across multiple compactions (which the watermark forbids), a subcompaction keeps it as one logical compaction and splits the *key range* into sub-ranges that run in parallel. The parent commits a single manifest update that advances the watermark exactly once over the whole consumed set, so the single-cursor invariant is never violated which sidesteps the problem instead of fighting it. Subcompactions will parallelize across cores on one worker, which composes cleanly with distributed compaction parallelizing across workers; allowing separate workers to claim subcompactions of the same parent compaction is explicitly labeled as future work in RFC-0028 and out of scope. However, that work may mitigate the inability to distribute L0 jobs within the same segment, single the cursor still advances once per parent compaction but the subcompactions could still run on separate workers.

![Subcompactions](/slatedb_subcompactions_minimal.svg)


- - - *Parallelism from splitting one compaction by key range; the cursor still advances exactly once per parent compaction.*

- **Reworking the watermark** to track a *set* of consumed L0 SSTs instead of a single cursor. This is the more invasive change, but it's what would let two L0 parent compactions in the same segment advance independently.

![Reworking the cursor](/slatedb_watermark_set_rework_minimal.svg)

- - - *Track a set of Compacted SSTs instead of one boundary, so two L0 compactions in the same segment advance independently.*

So the accurate story is that distributed compaction removes the single-*process* ceiling and lays down the stateless-worker foundation, while subcompactions remove the single-*core-per-compaction* ceiling. The watermark design to allow L0 compactions within the same segment to run independently is addressed by neither but is complementary.

## Priority Based Compaction Routing

Once compactions are jobs claimed by stateless workers rather than steps run inline by one process, the coordinator is free to decide *which* job goes *where*. Compactions could be routed to specific workers, or pools of them, based on priority: an L0 compaction on a segment approaching `l0_max_ssts` is far more urgent than a routine sorted-run merge, because the former is what stands between the database and write-stalling backpressure. High-priority jobs could be steered to a dedicated set of low-latency workers while bulk sorted-run merges run on cheaper, best-effort capacity. This turns the worker pool into a scheduling surface where compaction resources follow the work that is most likely to degrade read and write latency.

![Compaction Routing](/slatedb_priority_routed_compaction_minimal.svg)

## Shared Worker Pools

Because the workers are stateless, nothing about a compaction job ties it to a single database instance. A shared worker pool serving many instances would significantly reduce the I/O-bound threads each instance has to reserve for itself, and let instances trade compaction resources as needed e.g. an idle database contributes its share of the pool to a neighbor that is busy ingesting. Without it, capacity is sized per database for that database's worst case. This is true of an embedded compactor and equally of a remote fleet dedicated to one instance, unless you build per-DB autoscaling. Pooling that capacity absorbs those bursts and raises overall utilization, while priority-based routing decides how the shared pool is divided when several instances contend for it at once.

![A shared worker pool serving multiple SlateDb instances](/slatedb_shared_compaction_worker_pool_minimal.svg)

# Conclusion

Distributed compaction (RFC-0025) removes the single-*process* ceiling on compaction and lays down a stateless-worker foundation: jobs are claimed and executed by workers that hold no durable state of their own. On its own that relieves the single-compactor bottleneck that degrades read latency and then write throughput. Just as importantly, the stateless-worker model is what makes the future work above tractable. Reworking the watermark design, adding priority-based routing and shared worker pool support are natural extensions now that a compaction is just a job that any worker can claim.

# Acknowledgments

Thanks to the SlateDb maintainers and community for the reviews, discussion, and guidance that shaped this work. If you'd like to dig into the details or get involved, the relevant RFCs and the project are linked below:

- [RFC-0024: Segment-Oriented Compaction](https://slatedb.io/rfcs/0024-segment-oriented-compaction/)
- [RFC-0025: Distributed Compaction](https://slatedb.io/rfcs/0025-distributed-compaction/)
- [RFC-0028: Subcompactions](https://slatedb.io/rfcs/0028-subcompactions/)
- [SlateDb on GitHub](https://github.com/slatedb/slatedb)
