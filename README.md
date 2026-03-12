
# Containerization & DevOps

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)
![Jenkins](https://img.shields.io/badge/jenkins-%232C5263.svg?style=for-the-badge&logo=jenkins&logoColor=white)
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)

## 👨‍🎓 Student Profile

| Attribute | Details |
| :--- | :--- |
| **Name** | Pranav R Nair |
| **SAP ID** | 500121466 |
| **Roll No** | R2142230197 |
| **Batch** | 2(CCVT) |

## 📖 Course Introduction

Welcome to my personal laboratory and documentation repository for the **Containerization and DevOps** specialization. This repository documents my journey through understanding modern deployment strategies, container orchestration, and continuous integration/continuous deployment (CI/CD) pipelines. Here you will find detailed reports on practical experiments and comprehensive notes on theoretical concepts.

---

## 📚 Index

### 🧪 Practical Labs

* [**Exp 1: VMs vs Containers**](./lab/EXP-1/) - Comparison of Vagrant and Docker (Setup & Analysis).
* [**Exp 2: Docker Lifecycle**](./lab/EXP-2/) - Installation, Image Management, and Basic Commands.
* [**Exp 3: NGINX Base Image Comparison**](./lab/EXP-3/) - Deploying NGINX using Official, Ubuntu, and Alpine images to compare size, layers, and build performance.
* [**Exp 4: Docker Essentials**](./lab/EXP-4/) - Dockerfile, .dockerignore, image tagging, multi-stage builds, and publishing to Docker Hub.
* [**Exp 5: Volumes, Env Vars, Monitoring & Networks**](./lab/EXP-5/) - Persistent storage, runtime configuration, observability, and multi-container networking.

### 📘 Theory Units

* [**Unit 1: From Virtualization to Containers**](./theory/Unit1/) - Core concepts, history, and comparison of VM and Container architectures.
* [**Unit 1: Docker Commands & Concepts**](./theory/Unit1/Docker%20Basic) - Essential CLI commands, flags, networking, volumes, and lifecycle management.
* [**Unit 1: Preserving Container Changes**](./theory/Unit1/Docker%20Preserve) - `docker commit`, `save/load` vs `export/import`, and sharing images offline.
* [**Unit 1: Dockerfile & Automation**](./theory/Unit1/Docker%20tutorial) - Dockerfile instructions, CMD vs ENTRYPOINT, layer caching, and building images the right way.
* [**Unit 1: Docker Engine API (Part A)**](./theory/Unit1/Docker%20API%20Part%20A) - REST API fundamentals, CLI-to-API mapping, and hands-on `curl` commands.
* [**Unit 1: Docker Engine API (Part B)**](./theory/Unit1/Docker%20API%20Part%20B) - TCP exposure, TLS security, cross-platform differences, and daemon restart strategies.
* [**Unit 1: Multistage Dockerfiles**](./theory/Unit1/Docker%20Multistage) - Separating build from runtime, scratch/distroless images, and production-grade pipelines.
* [**Unit 1: Attaching to Stopped Containers**](./theory/Unit1/Attach%20to%20stopped%20containers) - Why containers exit, PID 1 lifecycle, and four methods to reconnect.
* [**Unit 1: Data Management in Docker**](./theory/Unit1/Data%20Management%20in%20Docker) - Volumes, bind mounts, tmpfs, `-v` vs `--mount`, and hands-on persistence labs.
* [**Unit 1: Docker Networking**](./theory/Unit1/Docker%20Networking) - Bridge, host, overlay, macvlan drivers, port publishing, DNS, and network security.

---

## 📂 Repository Structure

```text
Containerization-and-Devops/
├── lab/
│   ├── EXP-1/                      # VMs vs Containers (Vagrant/Docker)
│   ├── EXP-2/                      # Docker Lifecycle & Basic Commands
│   ├── EXP-3/                      # NGINX Base Image Comparisons
│   ├── EXP-4/                      # Docker Essentials & Dockerfiles
│   └── EXP-5/                      # Volumes, Env Vars, Monitoring & Networks
├── theory/
│   └── Unit1/          
│       ├── index.md                # Virtualization → Containers
│       ├── Docker Basic.md         # Essential CLI & Flags
│       ├── Docker Preserve.md      # Commit, Save, Load, Export
│       ├── Docker tutorial.md      # Dockerfile Instructions & Optimization
│       ├── Docker API Part A.md    # Engine API Fundamentals
│       ├── Docker API Part B.md    # API Security & Cross-Platform
│       ├── Docker Multistage.md    # Production-grade Pipelines
│       ├── Attach to stopped...md  # PID 1 Lifecycle & Debugging
│       ├── Data Management...md    # Volumes, Bind Mounts, tmpfs
│       └── Docker Networking.md    # Bridge, Overlay, DNS, Security
└── README.md                       # Main Course Index
```


## 🚀 How to Run

To explore the contents of this repository locally:

1. **Clone the repository**:

    ```bash
    git clone https://github.com/nairp126/Containerization-and-Devops-.git
    ```

2. **Navigate to the directory**:

    ```bash
    cd Containerization-and-Devops-
    ```

3. **View Notes**: Open the markdown files in your favorite editor (VS Code, Obsidian) or view them directly on GitHub.

---
*Created and Maintained by Pranav R Nair*
