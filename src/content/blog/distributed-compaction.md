---
title: Distributed Compaction in SlateDB
date: 2026-05-26
description: An intro to SlateDB, LSM Trees, Compaction, and Distributed Compaction
tags: [SlateDB, Distributed Systems Engineering, Object Storage]
---

# Background

[SlateDB](https://slatedb.io/) is a key-value store that writes data to Object Storage. Object Storage allows storage needs to be offloaded to a cloud provider. It is incredibly cheap, allows users to only pay for what they use, and stores data durably. 

Internally, SlateDB uses a Log-Structured Merge Tree, or LSM for short, to batch writes to object storage and minimize perceived latency. Incoming writes land in an in-memory buffer called the memtable. Once the memtable fills up, it is flushed to an immutable Sorted String Table (SST) in object storage. Freshly flushed SSTs land in L0. From there, SlateDB uses size-tiered compaction, where SSTs are grouped by size and merged together as each tier fills up. LSM trees let you tune the tradeoffs between read, write, and space amplification.

![LSM Tree Compaction Process](/lsm_tree_compaction_minimal.svg)

# Compaction

Compaction is a critical background process of the LSM tree that takes Sorted String Tables (SST for short) and merges them to produce an output SST with non-repeating keys. This process does a few things. When multiple SSTs share keys, merging them removes duplicate entries and cleans up tombstones left behind by deletes, reducing space amplification. It also reduces the number of SSTs that need to be scanned to find a key, which reduces read amplification.

![LSM Compaction Merge Step Detail](/lsm_compaction_merge_step_cdc_minimal.svg)

# Distributed Compaction

A single compactor is a bottleneck: if it cannot keep pace with write throughput, the whole system degrades. As uncompacted SSTs pile up, more files need to be scanned to find a key, increasing read latency. Eventually when L0 fills up, backpressure is applied to writes, stalling them from being durably written to object storage.

![LSM Compaction Merge Step Detail](/slatedb_distributed_compaction_why_it_helps_minimal.svg)

We want to be able to parallelize compaction of l0, and in theory this is possible but there is a caveat detailed in RFC-24:

> **Parallel L0 compaction across segments.** Parallel compaction of disjoint *sorted-run* compactions already works today, because the `last_compacted_l0_sst_view_id` watermark is unaffected when no L0 SSTs are involved. What segmentation unlocks is parallel *L0-sourced* compaction across segments: each segment has its own L0 list and its own `last_compacted_l0_sst_view_id` watermark, so an L0-draining compaction in segment A can complete out of order relative to one in segment B without the watermark truncation issue that blocks parallel L0 compactions in a single-tree layout. The execution model in this RFC can be extended to exploit this by scheduling L0 compactions in disjoint segments concurrently. Parallel L0 compaction *within* a single segment is a separate concern tied to the watermark's single-cursor design and is not addressed here.

This mentions that segments unlock parallelization of L0 since each LSM tree has its own watermark for L0. However, it would be a shame if segmentation were required for parallelization of L0.

> Parallel L0 compaction *within* a single segment is a separate concern tied to the watermark's single-cursor design and is not addressed here.

RFC-25 is a natural place to address this.

Even so, it is noted that parallel compaction of disjoint sorted run compactions already work today, and the following benchmarks of write throughput with embedded compaction vs distributed compaction clearly demonstrate the benefits. These benchmarks were done before making any changes to allow parallelization of L0 compaction within a single segment.

# Benchmark

| Elapsed | Local writer, embedded compactor (pre distributed compaction) | 1 writer, 3 external compactors + 1 coordinator (EC2/distributed) |
| :--- | :--- | :--- |
| **10s** | 12,412 put/s (12.1 MiB/s) | 55,702 put/s (54.4 MiB/s) |
| **20s** | 7,266 put/s (7.1 MiB/s) | 46,231 put/s (45.1 MiB/s) |
| **30s** | 5,681 put/s (5.5 MiB/s) | 41,111 put/s (40.1 MiB/s) |
| **40s** | 4,895 put/s (4.8 MiB/s) | 35,202 put/s (34.4 MiB/s) |
| **50s** | 4,336 put/s (4.2 MiB/s) | 30,322 put/s (29.6 MiB/s) |
| **60s** | — | 26,597 put/s (26.0 MiB/s) |

# Future benefits and work

I am excited to see how the architecture for distributed compaction in SlateDB opens the door for many new ways to use SlateDB. It also opens the door for future enhancements that take advantage of stateless compaction workers. 

Compactions could also be routed to specific workers (or pools of them) based on priority. 

![Compaction Routing](/slatedb_priority_routed_compaction_minimal.svg)

Ashared worker pool could serve multiple database instances, significantly reducing I/O bound threads per database and allowing instances to trade compaction resources as needed.

![LSM Compaction Merge Step Detail](/slatedb_shared_compaction_worker_pool_minimal.svg)

Taken together, these possibilities make distributed compaction not just a scalability improvement, but a foundation for a more flexible and efficient SlateDB.
