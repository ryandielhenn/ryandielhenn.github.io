---
title: Distributed Compaction in SlateDB
date: 2026-05-26
description: An overview of SlateDB, LSM Trees, Compaction, and Why Distributed Compaction Matters
tags: [SlateDB, Distributed Systems Engineering, Object Storage]
---

# What is SlateDB?

SlateDB is a key-value store that writes data to Object Storage. Object Storage allows storage needs to be offloaded to a cloud provider. It is incredibly cheap, allows users to only pay for what they use, and stores data durably. This means that data replication, one of the banes of building distributed systems, is offloaded to the cloud provider as well.

This is all great! But like most things in engineering, there are tradeoffs. Object storage is optimized for throughput and durability, not latency. A single read or write can take tens of milliseconds compared to sub-millisecond access on local disk. This makes it a poor fit for workloads that require low-latency random access, but an excellent fit for workloads that can tolerate higher latency in exchange for nearly unlimited, cheap, durable storage.

# What is an LSM Tree?

Internally, SlateDB uses a Log-Structured Merge Tree, or LSM for short, to batch writes to object storage and minimize perceived latency. Incoming writes land in an in-memory buffer called the memtable. Once the memtable fills up, it is flushed to an immutable Sorted String Table (SST) in object storage. Freshly flushed SSTs land in L0. From there, SlateDB uses size-tiered compaction, where SSTs are grouped by size and merged together as each tier fills up. LSM trees let you tune the tradeoffs between read, write, and space amplification.

![LSM Tree Compaction Process](/lsm_tree_compaction_everforest_v5.svg)

# What is Compaction?

Before I dive into the intricacies and challenges of implementing distributed compaction in a system, I'd first like to motivate compaction for LSM Trees in general.

Compaction is a critical background process of the LSM tree that takes Sorted String Tables (SST for short) and merges them to produce an output SST with non-repeating keys. This process does a few things. When multiple SSTs share keys, merging them removes duplicate entries and cleans up tombstones left behind by deletes, reducing space amplification. It also reduces the number of SSTs that need to be scanned to find a key, which reduces read amplification.

![LSM Compaction Merge Step Detail](/lsm_compaction_merge_step_rideshare_everforest.svg)

# Why Distribute Compaction?

A single compactor is a bottleneck: if it cannot keep pace with write throughput, the whole system degrades. As uncompacted SSTs pile up, more files need to be scanned to find a key, increasing read latency. Eventually when L0 fills up, backpressure is applied to writes, stalling them from being durably written to object storage.

![LSM Compaction Merge Step Detail](/slatedb_distributed_compaction_why_it_helps_v5.svg)

# Future benefits and work

The architecture for distributed compaction in SlateDB opens the door for many new ways to use SlateDB. It also opens the door for future enhancements that take advantage of stateless compaction workers. For example, a shared worker pool could serve multiple database instances, significantly reducing I/O bound threads per database and allowing instances to trade compaction resources as needed.

![LSM Compaction Merge Step Detail](/slatedb_shared_compaction_worker_pool_v2.svg)

Compactions could also be routed to specific workers (or pools of them) based on priority. Taken together, these possibilities make distributed compaction not just a scalability improvement, but a foundation for a more flexible and efficient SlateDB.
