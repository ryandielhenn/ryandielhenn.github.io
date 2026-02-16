export const siteConfig = {
  name: "Ryan Dielhenn",
  title: "Software Engineer\nM.S. Computer Science Student",
  description: "Portfolio website of Ryan Dielhenn",
  accentColor: "#1d4ed8",
  resume: "/ryan_dielhenn_resume.pdf",
  social: {
    email: "dielhennr@gmail.com",
    linkedin: "https://linkedin.com/in/ryandielhenn",
    github: "https://github.com/ryandielhenn",
  },
  aboutMe:
    "M.S. Computer Science candidate specializing in scalable distributed systems and applied machine learning. My background includes contributions to Apache Kafka's transition to a self-managed metadata architecture (ZooKeeper removal), including work on Confluent Cloud.",

  skills: ["Java", "Go", "C", "Python", "Apache Kafka", "Docker", "Linux"],
 projects: [
    {
      name: "EDA Dashboard - High-Performance Data Exploration Tool",
      dateRange: "Aug. 2025 – Dec. 2025",
      bullets: [
        "An interactive EDA dashboard with FastAPI and DuckDB for browser-based analysis of million-row datasets with sub-second query performance.",
        "Implemented bias detection and fairness analysis to identify discriminatory patterns across demographic groups and data drift detection to flag distribution shifts.",
        "Leveraged DuckDB to enable fast and memory efficient analytical queries on datasets with millions of rows.",
      ],
      link: "https://github.com/ryandielhenn/eda-dashboard",
      skills: ["Python", "FastAPI", "DuckDB", "Data Analysis", "Bias Detection", "Fairness Analysis", "State Management", "Caching", "Data Visualization"],
    },
    {
      name: "Zephyr - Self-Healing Distributed Cache",
      dateRange: "July 2025 – Nov. 2025",
      bullets: [
        "A distributed caching system in Go with consistent hashing for key distribution, achieving 49K ops/sec throughput (10K operations, 32 concurrent clients, 128-byte values).",
        "Includes an observability stack with Prometheus/Grafana to monitor request latency, throughput, and error rates, plus benchmarking tools to measure routing efficiency and performance under load.",
      ],
      link: "https://github.com/ryandielhenn/zephyrcache",
      skills: ["Go", "Distributed Systems", "Consistent Hashing", "Gossip Protocol", "Docker", "Prometheus", "Grafana"],
    },
    {
      name: "GeoPresence - High-Performance Geospatial Index for IoT",
      dateRange: "Jan. 2020 – Dec. 2020",
      bullets: [
        "A bitmap-based geospatial indexing system designed for IoT and low-power devices using RoaringBitmap compression and HyperLogLog++ for efficient location queries.",
        "Developed during undergraduate research at University of San Francisco (January 2020 - December 2020).",
        "Implemented a C-based adaptive grid index that achieved 17x speedup over the Java implementation and outperformed traditional R-tree indexing by 400x at scale (1M+ points), while R-trees showed advantages on sparse datasets (<7K points).",
        "Features probabilistic point density estimation and adaptive grid resolution optimized for edge computing environments.",
      ],
      link: "https://github.com/USF-BigDataLab/geopresence",
      skills: ["C", "C++", "Java", "Geospatial Computing", "IoT", "Roaring Bitmaps", "HyperLogLog++", "Edge Computing", "Spatial Indexing"],
    },
    {
      name: "DFS - Distributed Filesystem",
      dateRange: "Sept. 2019 – Oct. 2019",
      bullets: [
        "A distributed filesystem built with Java, Netty, and Protocol Buffers.",
        "Features a controller-based architecture that routes client requests to storage nodes using Bloom filters to minimize unnecessary lookups.",
        "Implements data chunking across storage nodes with replication for fault tolerance and availability.",
      ],
      link: "https://github.com/ryandielhenn/dfs",
      skills: ["Java", "Netty", "Protocol Buffers", "Bloom Filters", "Distributed Systems"],
    },
    {
      name: "Fire-Engine - Multithreaded Search Engine",
      dateRange: "Jan. 2019 – April 2019",
      bullets: [
        "A multithreaded search engine that tracks user queries, enables web crawling, and supports search over an inverted index built from the crawled pages.",
      ],
      link: "https://github.com/ryandielhenn/Fire-Engine",
      skills: ["Java", "Multithreading", "Inverted Index", "Web Crawling", "Jetty"],
    },
    {
      name: "itsh - Command Line Shell",
      dateRange: "Feb. 2019 – March 2019",
      bullets: [
        "A command line shell built in C with support for scripts, heredocs, pipes, redirection, background jobs, command history with bang reruns, and built-in commands like cd and setenv.",
        "Features arrow key navigation through history and input editing.",
      ],
      link: "https://github.com/ryandielhenn/itsh",
      skills: ["C", "Systems Programming", "Shell Implementation", "Process Management", "Signal Handling", "Pipes", "Redirection"],
    },
  ], 
  experience: [
  {
    company: "Confluent",
    title: "Software Engineer",
    dateRange: "Jan 2021 – Jul 2022",
    bullets: [


    "Contributed to Apache Kafka's migration from ZooKeeper to KRaft, improving observability and reliability of the distributed consensus layer in Java/Scala.",
    "Built metrics pipelines in Java/Scala to monitor cluster health, quorum state, and inter-broker communication patterns for KRaft; updated Confluent Cloud tooling in Go to integrate new metrics.",
    "Contributed to Confluent Cloud's Cluster Linking integration with KRaft architecture for cross-cluster replication.",
    ]
  },
  {
    company: "Confluent",
    title: "Software Engineering Intern",
    dateRange: "May 2020 – Aug 2020",
    bullets: [
    "Implemented dynamic client reconfiguration in Java/Scala for Apache Kafka, enabling runtime updates to producer/consumer settings (including connection, security, retry, and ack configurations) without service restarts.",
    "Enhanced Confluent Cloud's rebalance tooling with asynchronous replica movement support.",
    "Continued contributing to Apache Kafka during Fall 2020 while completing undergraduate degree.",
    ]
  },
  {
      company: "Big Data Lab - University of San Francisco",
      title: "Undergraduate Researcher",
      dateRange: "Jan 2020 – Dec 2020",
      link: "https://github.com/USF-BigDataLab/geopresence",
      bullets: [
        "Developed a C implementation of Geopresence, a bitmap-based geospatial indexing system, using RoaringBitmap compression and HyperLogLog++ for efficient location queries on IoT devices.",
        "Implemented C-based adaptive grid index achieving 17x speedup over Java; outperformed R-tree indexing by 400x at scale (1M+ points) while R-trees showed advantages on sparse datasets (<7K points)."
      ],
    },
    {
      company: "University of San Francisco",
      title: `Teaching Assistant — Big Data & 
          Operating Systems`,
      dateRange: "Aug 2019 – May 2020",
      bullets: [
        "Designed projects and coursework, reviewed student code weekly, and provided feedback with grades.",
        "Held weekly office hours to guide students through project design and debugging.",
      ],
    },
    {
      company: "University of San Francisco",
      title: "Assistant Systems Administrator",
      dateRange: "May 2019 – Aug 2019",
      bullets: [
        "Supported the CS department by updating, patching, and maintaining Linux lab machines, improving system stability for students and faculty.",
      ],
    },
  ],
  education: [
    {
      school: "California State University, Los Angeles",
      degree: "M.S. Computer Science",
      dateRange: "2025 – 2026",
      achievements: [
        "Specializing in scalable distributed systems and applied machine learning.",
      ],
    },
    {
      school: "University of San Francisco",
      degree: "B.S. Computer Science",
      dateRange: "2016 – 2020",
      achievements: [
        "Graduated Magna Cum Laude with a 3.75 GPA",
        "Minor in Mathematics",
      ],
    },
  ],
};
