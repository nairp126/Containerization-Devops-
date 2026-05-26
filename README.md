
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
* [**Exp 6: Docker Run vs Docker Compose**](./lab/EXP-6/) - Side-by-side comparison of imperative and declarative container management across 6 tasks including multi-stage builds and resource limits.
* [**Exp 7: CI/CD Pipeline using Jenkins, GitHub & Docker Hub**](./lab/EXP-7/) - End-to-end pipeline: Jenkinsfile as Code, Docker-outside-of-Docker, withCredentials for secure auth, ngrok for localhost webhooks, and automated image pushes.
* [**Exp 9: Ansible — Agentless Configuration Management**](./lab/EXP-9/) - Multi-container Ansible lab with Dockerized control/managed nodes, automated SSH key generation, dynamic inventory, and idempotent playbook execution.
* [**Exp 10: SonarQube — Static Code Analysis with Docker**](./lab/EXP-10/) - SonarQube server via Docker Compose, Maven scanner integration, intentional Java bugs/vulnerabilities, REST API queries, and secure token management.
* [**Exp 11: Docker Swarm — Container Orchestration**](./lab/EXP-11/) - Transitioning from Compose to Swarm: stack deploy, service scaling, ingress mesh load balancing, self-healing (exit code 137), and WSL2 networking fixes.
* [**Exp 12: Kubernetes — Container Orchestration with k3d**](./lab/EXP-12/) - Local Kubernetes cluster with k3d, WordPress + MySQL Deployments, NodePort/ClusterIP Services, scaling, self-healing, and Swarm vs K8s comparison.

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
* [**Unit 1: Docker Compose vs Docker Run**](./theory/Unit1/Docker-Compose-vs-Docker-Run) - Declarative vs imperative orchestration, flag-to-YAML mapping, and multi-container dependency management.
* [**Unit 1: Scaling WordPress with Docker Compose**](./theory/Unit1/Scaling-WordPress-with-Docker-Compose) - Horizontal scaling, stateless vs stateful services, and NGINX reverse proxy load balancing.
* [**Unit 1: Docker Swarm**](./theory/Unit1/Docker-Swarm) - Cluster-level orchestration, services vs tasks, routing mesh, rolling updates, node management, and `docker run` vs `docker service` comparison.
* [**Unit 2: Kubernetes Architecture & Core Concepts (Part 1)**](./theory/Unit2/Introduction-to-Kubernetes-Part-1) - Architecture deep dive (Control Plane, Worker Nodes), workload controllers (Deployment/StatefulSet/DaemonSet), networking (Services/Ingress), storage (PV/PVC), RBAC security, and CRI lifecycle.
* [**Unit 2: kubectl, kubeconfig & Local K8s Tools (Part 2)**](./theory/Unit2/Introduction-to-Kubernetes-Part-2) - Local K8s tools (Minikube/k3d/kind), kubectl commands, kubeconfig deep dive, and multi-cluster management.
* [**Unit 2: Hands-on Lab — Deploy & Manage a Web App**](./theory/Unit2/Hands-on-Task) - 13-step Apache httpd lab covering bare pods vs Deployments, scaling, debugging (ImagePullBackOff), exec into containers, and self-healing.
* [**Unit 2: Kubernetes Deployment with YAML**](./theory/Unit2/Kubernetes-Deployment-with-YAML) - Imperative vs declarative, YAML manifest anatomy (4-field structure, label-selector link), production-ready examples with probes and resource limits, and the CLI-to-YAML bridge exercise.
* [**Unit 2: Managing Applications with kubectl**](./theory/Unit2/Managing-Applications-with-kubectl) - Docker → kubectl run → Deployment progression, scaling, rolling updates, rollback, debugging, and declarative YAML management.
* [**Unit 2: Ingress, kubeadm & kubelet**](./theory/Unit2/Ingress-kubeadm-kubelet) - HTTP/HTTPS routing with Ingress, cluster bootstrapping with kubeadm, node agent kubelet, hands-on Ingress lab, and complete architecture overview.
* [**Unit 2: Minikube Clusters & AWS EKS**](./theory/Unit2/Minikube-cluster-and-AWS-EKS) - Local Minikube clusters, AWS EKS managed K8s, eksctl, Fargate, Cluster Autoscaler, ECR, and dev-to-prod workflow.
* [**Unit 4: Git & Version Control**](./theory/Unit4/Git-Basics) - CVCS vs DVCS, Git internals (snapshots, staging area, three areas), SSH/GPG setup, branching, merging, conflicts, stash, rebase, submodules, tagging, undoing changes, and Git in DevOps pipelines.
* [**Unit 4: Version Control Essentials (Git)**](./theory/Unit4/Git%20Hands%20on/Version-Control) - Local vs Centralized vs Distributed VCS, Git architecture (snapshots, staging area, three areas), CLI setups, commits, and daily configuration.
* [**Unit 4: Git and GitHub Hands-On**](./theory/Unit4/Git%20Hands%20on/Git-and-GitHub) - SSH key and GPG signing setup, GitHub authentication, branch management, merge conflict resolution, stashing, rebasing, and release tagging.
* [**Unit 4: GitHub Actions — CI/CD Automation**](./theory/Unit4/Github-Actions) - Workflow YAML anatomy, event triggers (push/PR/cron/manual), matrix builds for parallel testing, secrets management, Docker integration, marketplace actions, job dependencies, and GitHub Actions vs Jenkins comparison.
* [**Unit 4: Docker + GitHub Actions — Automated Container Delivery**](./theory/Unit4/Docker-With-Github-Actions) - FastAPI containerization, Dockerfile breakdown, GitHub Secrets for Docker Hub auth, CI/CD workflow for automated image builds, verification pipeline, and Jenkins vs GitHub Actions comparison.
* [**Unit 4: GitHub Actions Test Automation**](./theory/Unit4/Github-Actions-Automations) - Backend API test automation with FastAPI, pytest parameterized testing, CI workflow for automated test execution, testing pyramid, edge cases, mocking, and real-world expansion strategies.
* [**Unit 4: CI/CD Pipeline — Theory to Production**](./theory/Unit4/CI-CD-Pipeline) - CI/CD definitions (CI vs Delivery vs Deployment), Git Flow branching, SonarQube quality gates, Jenkinsfile (Pipeline as Code), Jenkins master-agent architecture, agent types, credential management, and end-to-end walkthrough.
* [**Unit 4: Ansible — Agentless Configuration Management**](./theory/Unit4/Ansible) - Agentless architecture (SSH), inventory files, YAML playbooks, idempotency, modules, ad-hoc commands, Docker-based hands-on lab, variables/facts/handlers, Vault encryption, Roles, Galaxy, and Ansible vs Chef/Puppet comparison.
* [**Unit 4: Terraform — Infrastructure as Code**](./theory/Unit4/Terraform) - Declarative IaC, Terraform core workflow (init, plan, apply, destroy), providers, variables, outputs, and state file management.
* [**Unit 4: Monitoring & Logging — Prometheus, Grafana & ELK**](./theory/Unit4/Monitoring-and-Logging) - Metrics vs logs, Prometheus pull model, Node Exporter, PromQL, Grafana dashboards, ELK Stack (Elasticsearch + Logstash + Kibana), Filebeat, Loki, Docker Compose hands-on for both stacks, and stack comparison.
* [**Unit 4: Monitoring with Prometheus & Grafana**](./theory/Unit4/Monitoring-With-Prometheus-And-Grafana) - Metrics collection, pull model architecture, Node Exporter installation, PromQL query syntax, and interactive Grafana dashboard setup.

### 🧩 Misc Topics

* [**Misc: Docker Web UIs & Socket Security**](./theory/Misc/Docker-Web-UI) - Using Portainer/Komodo, how `docker.sock` works, full privilege escalation risks, and 6 security mitigation strategies.
* [**Misc: Jenkins — Complete Installation, Configuration & Pipeline Guide**](./theory/Misc/Jenkins-Complete-Guide) - Installation (native/Docker/WSL 2), Nginx reverse proxy, SSL/HTTPS with Let's Encrypt, first pipeline, service management, and troubleshooting.
* [**Misc: Vim & tmux — Essential Terminal Tools for DevOps**](./theory/Misc/Vim-and-TMUX) - Vim modes and commands, tmux session persistence, pane/window management, .vimrc/.tmux.conf customization, and DevOps workflows.

### 📝 Assignments

* [**Assignment 1: Containerized Web App**](./theory/Assigment-1/Report.md) - Deploying a FastAPI & PostgreSQL stack with static Macvlan networking and Docker Compose optimization.

---

## 📂 Repository Structure

```text
Containerization-and-Devops/
├── lab/
│   ├── EXP-1/                      # VMs vs Containers (Vagrant/Docker)
│   ├── EXP-2/                      # Docker Lifecycle & Basic Commands
│   ├── EXP-3/                      # NGINX Base Image Comparisons
│   ├── EXP-4/                      # Docker Essentials & Dockerfiles
│   ├── EXP-5/                      # Volumes, Env Vars, Monitoring & Networks
│   ├── EXP-6/                      # Docker Run vs Docker Compose Comparison
│   ├── EXP-7/                      # CI/CD Pipeline (Jenkins + GitHub + Docker Hub)
│   ├── EXP-9/                      # Ansible — Agentless Config Management with Docker
│   ├── EXP-10/                     # SonarQube — Static Code Analysis with Docker
│   ├── EXP-11/                     # Docker Swarm — Container Orchestration
│   └── EXP-12/                     # Kubernetes — Container Orchestration with k3d
├── theory/
│   ├── Unit1/          
│   │   ├── index.md                # Virtualization → Containers
│   │   ├── Docker Basic.md         # Essential CLI & Flags
│   │   ├── Docker Preserve.md      # Commit, Save, Load, Export
│   │   ├── Docker tutorial.md      # Dockerfile Instructions & Optimization
│   │   ├── Docker API Part A.md    # Engine API Fundamentals
│   │   ├── Docker API Part B.md    # API Security & Cross-Platform
│   │   ├── Docker Multistage.md    # Production-grade Pipelines
│   │   ├── Attach to stopped...md  # PID 1 Lifecycle & Debugging
│   │   ├── Data Management...md    # Volumes, Bind Mounts, tmpfs
│   │   ├── Docker Networking.md    # Bridge, Overlay, DNS, Security
│   │   ├── Docker Compose vs...md  # Declarative Orchestration
│   │   ├── Scaling WordPress...md  # Horizontal Scaling & Proxies
│   │   └── Docker Swarm.md         # Cluster-level Orchestration
│   ├── Unit2/
│   │   ├── Introduction to K...Part-1.md  # K8s Architecture & Core Concepts
│   │   ├── Introduction to K...Part-2.md  # kubectl, kubeconfig & Local Tools
│   │   ├── Hands-on Task.md              # Deploy & Manage Apache httpd Lab
│   │   ├── KUBERNETIS DEPLOY...YAML.md   # Declarative YAML Deployments
│   │   ├── Managing Applicat...kubectl.md # kubectl Application Management
│   │   ├── Ingress.md                    # Ingress, kubeadm & kubelet
│   │   └── Minikube cluster and...EKS.md # Minikube & AWS EKS
│   ├── Unit4/
│   │   ├── Git Basics.md               # Git & Version Control (CVCS/DVCS, Branching, Merging)
│   │   ├── Git Hands on/               # Practical Git & GitHub Guides
│   │   │   ├── Version Control.md      # Evolution, setups, CLI areas, and config
│   │   │   └── Git and GitHub.md       # Keys/Auth, branch management, rebase, and tags
│   │   ├── Github Actions.md           # GitHub Actions CI/CD (Workflows, Matrix, Docker)
│   │   ├── Docker With Github Actions.md # FastAPI + Docker + GitHub Actions CD Pipeline
│   │   ├── Github Actions Automations.md # API Test Automation with pytest + CI
│   │   ├── CI CD Pipeline.md            # Full CI/CD Theory, Git Flow, Jenkins Architecture
│   │   ├── Ansible.md                   # Agentless Config Management, Playbooks, Vault
│   │   ├── Terraform.md                 # Infrastructure as Code, CLI workflow, state files
│   │   ├── Monitoring and Logging.md    # Prometheus, Grafana, ELK Stack, Loki (Overview)
│   │   └── Monitoring With Prometheus And Grafana.md # Deep dive, Node Exporter, PromQL
│   ├── Misc/
│   │   └── Docker Web UI.md              # Portainer, Komodo & Socket Security
│   │   ├── Jenkins complete guide.md     # Full Jenkins Setup, Pipelines & SSL
│   │   └── Vim & TMUX.md                # Vim Modes, tmux Sessions & DevOps Workflows
│   └── Assigment-1/
│       ├── Report.md               # Assignment 1 Report
│       └── docker-compose.yml      # Orchestration Config
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

> Created and Maintained by Pranav R Nair
