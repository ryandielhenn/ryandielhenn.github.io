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
    "Software engineer with experience at Confluent, contributing to Apache Kafka’s KRaft (ZooKeeper-free) architecture. Currently pursuing an M.S. in Computer Science at Cal State LA, specializing in distributed systems, artificial intelligence, and data science.",
  skills: ["Java", "Go", "C", "Python", "Apache Kafka", "Docker", "Linux"],
  projects: [
    {
      name: "Zephyr - Self-Healing Distributed Cache",
      description:
        "A self-healing distributed cache featuring consistent hashing ring for data distribution and load balancing. Implements configurable membership discovery supporting both gossip protocol and etcd-based coordination, with Phi accrual failure detection for adaptive failure detection and automatic node recovery.",
      link: "https://github.com/ryandielhenn/zephyrcache",
      skills: ["Go", "Distributed Systems", "Consistent Hashing", "Gossip Protocol", "Docker", "Prometheus", "Grafana"],
    },
    {
      name: "GeoPresence - Geospatial Index for IoT",
      description:
        "A geospatial index system designed for IoT/low-power devices using Roaring Bitmaps and bitmap compression. Enables location-based services, weather tracking, and GIS applications by creating efficient spatial queries for edge computing environments. Features probabilistic point density estimation with HyperLogLog++ and adaptive grid resolution.",
      link: "https://github.com/USF-BigDataLab/geopresence",
      skills: ["C", "C++", "Java", "Geospatial Computing", "IoT", "Roaring Bitmaps", "HyperLogLog++", "Edge Computing", "Spatial Indexing"],
    },
    {
      name: "DFS: Distributed Filesystem",
      description:
        "A distributed filesystem built with Java, Netty, and Protocol Buffers. Supports replication, dynamic addition of storage nodes, and compression. Fault tolerant: if a node goes down or data is corrupted, the original data remains available. Bloom filters are used by the controller for probabilistic routing of data requests.",
      link: "https://github.com/ryandielhenn/dfs",
      skills: ["Java", "Netty", "Protocol Buffers", "Bloom Filters", "Distributed Systems"],
    },
    {
      name: "Fire-Engine: Multithreaded Search Engine",
      description:
        "A multithreaded search engine that tracks user queries, enables web crawling, and supports search over an inverted index built from the crawled pages.",
      link: "https://github.com/ryandielhenn/Fire-Engine",
      skills: ["Java", "Multithreading", "Inverted Index", "Web Crawling", "Jetty"],
    },
    {
      name: "itsh - Command Line Shell",
      description:
        "A command line shell built in C with support for scripts, heredocs, pipes, redirection, background jobs, command history with bang reruns, and built-in commands like cd and setenv. Features arrow key navigation through history and input editing.",
      link: "https://github.com/ryandielhenn/itsh",
      skills: ["C", "Systems Programming", "Shell Implementation", "Process Management", "Signal Handling", "Pipes", "Redirection"],
    },
  ],
  experience: [
  {
    company: "Confluent",
    title: "Software Engineer (Intern → Contributor → Full-time)",
    dateRange: "May 2020 – Jul 2022",
    bullets: [
      "Collaborated across engineering teams to improve reliability, observability, and security during Kafka’s transition to a ZooKeeper-free architecture (KRaft).",
      "Adapted Cluster Linking to support KRaft, enabling cross-cluster replication without ZooKeeper.",
      "Integrated metrics to ensure visibility into quorum state and cluster health in Kafka’s KRaft mode.",
      "Developed dynamic client reconfiguration in Kafka (as a Summer 2020 intern), allowing producers/consumers to update settings without downtime, and extended Confluent Cloud’s rebalance tooling to support asynchronous replicas.",
      "Continued contributing to Apache Kafka while completing my undergraduate degree (Fall 2020) before returning full time in Jan 2021."
    ]
  },
  {
      company: "University of San Francisco",
      title: "Research Assistant (Distributed Systems & Edge Computing)",
      dateRange: "Jan 2020 – Dec 2020",
      link: "https://github.com/USF-BigDataLab/geopresence",
      bullets: [
        "Developed GeoPresence, a geospatial index and query system for edge computing using bitmap compression (RoaringBitmap) and cardinality-estimation algorithms (HyperLogLog++).",
        "Designed for IoT optimization, enabling local queries to nearby devices instead of centralized services.",
        "Prototyped and benchmarked performance across varied workloads and programming languages.",
        "Contributed to research in distributed systems and edge computing.",
      ],
    },
    {
      company: "University of San Francisco",
      title: "Teaching Assistant — Operating Systems & Big Data",
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
        "Supported the CS department by updating, patching, and maintaining lab machines, improving system stability for students and faculty.",
      ],
    },
  ],
  education: [
    {
      school: "California State University, Los Angeles",
      degree: "M.S. Computer Science",
      dateRange: "2025 – 2026",
      achievements: [
        "Specializing in distributed systems, artificial intelligence, and data science",
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
