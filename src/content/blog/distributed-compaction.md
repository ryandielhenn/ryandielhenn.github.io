---
title: Distributed Compaction in SlateDB
date: 2026-05-26
description: An intro to SlateDB, LSM Trees, Compaction, and Distributed Compaction
tags: [SlateDB, Distributed Systems Engineering, Object Storage]
---

# Background

[SlateDB](https://slatedb.io/) is a key-value store that writes data to Object Storage. Object Storage allows storage needs to be offloaded to a cloud provider. It is incredibly cheap, allows users to only pay for what they use, and stores data durably. 

Internally, SlateDB uses a Log-Structured Merge Tree, or LSM for short, to batch writes to object storage and minimize perceived latency. Incoming writes land in an in-memory buffer called the memtable. Once the memtable fills up, it is flushed to an immutable Sorted String Table (SST) in object storage. Freshly flushed SSTs land in L0. From there, SlateDB uses size-tiered compaction, where SSTs are grouped by size and merged together as each tier fills up. LSM trees let you tune the tradeoffs between read, write, and space amplification. I recommend reading [this blog](https://www.bitsxpages.com/p/understanding-lsm-trees-via-read) by Almog Gavra if you want know more about these tradeoffs.

The following is an explanation of what SlateDb persists in an object storage bucket:

```
manifest/
  00000000001.manifest  # This is a snapshot of the database state.
  00000000002.manifest
  00000000003.manifest
  ...
compactions/
  00000000001.compactions # This is a set of jobs scheduled for compaction by the compaction
  00000000002.compactions # coordinator.
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
  manifest.boundary
  compactions.boundary
```

# Compaction

Compaction is a critical background process of the LSM tree that takes Sorted String Tables (SST for short) and merges them to produce an output SST with non-repeating keys. This process does a few things. When multiple SSTs share keys, merging them removes duplicate entries and cleans up tombstones left behind by deletes, reducing space amplification. It also reduces the number of SSTs that need to be scanned to find a key, which reduces read amplification.

![LSM Compaction Merge Step Detail](/lsm_compaction_merge_step_cdc_minimal.svg)

# Distributed Compaction

A single compactor is a bottleneck: if it cannot keep pace with write throughput, the whole system degrades. As uncompacted SSTs pile up, more files need to be scanned to find a key, increasing read latency. Eventually when L0 fills up, backpressure is applied to writes, stalling them from being durably written to object storage.

![LSM Compaction Merge Step Detail](/slatedb_distributed_compaction_why_it_helps_minimal.svg)

We want to be able to parallelize compaction of L0. This was not possible on a single machine before RFC-25, even with max_concurrent_compactions set to something other than 1. RFC-24 allowed pallalellization of L0 SSTs in different segments, but explicity kept parallel L0 compaction within a single segment out of scope. 

From RFC-24:

> Parallel L0 compaction *within* a single segment is a separate concern tied to the watermark's single-cursor design and is not addressed here.

RFC-25 is a natural place to address this shortcoming in SlateDB.

Even so, it should be noted that parallel compaction of disjoint sorted run compactions already work today, and the following benchmarks of write throughput with embedded compaction vs distributed compaction clearly demonstrate the benefits. These benchmarks were done before making any changes to allow parallelization of L0 compaction within a single segment.

# Future benefits and work

The door is wide open for future enhancements that take advantage of these stateless compaction workers. 

1. Compactions routed to specific workers (or pools of them) based on priority. 

![Compaction Routing](/slatedb_priority_routed_compaction_minimal.svg)

2. A shared worker pool serving multiple database instances, significantly reducing I/O bound threads per database and allowing instances to trade compaction resources as needed.

![LSM Compaction Merge Step Detail](/slatedb_shared_compaction_worker_pool_minimal.svg)
