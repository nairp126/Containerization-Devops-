# Experiment 1 – Comparison of Virtual Machines (VMs) and Containers using Ubuntu and Nginx


**Name:** Pranav R Nair  
**SAP ID:** 500121466  
**Batch:** 2(CCVT)

---

## 🎯 Aim
To compare Virtual Machines (VMs) using **Vagrant** and Containers using **Docker**, and analyze differences in performance, resource usage, startup time, and efficiency.

---

## 🧠 Theory

### Virtual Machine (VM)
A Virtual Machine runs a complete Guest Operating System on top of a hypervisor.  
Each VM contains:
- Full OS
- Libraries
- Dependencies
- Application

VMs are heavy and require more memory and storage.

---

### Container
A container shares the Host OS kernel and runs only the application with its dependencies.  
Containers are lightweight and start very quickly.

Docker is used to create and manage containers.

---

## ⚙ Tools Used
- Vagrant
- VirtualBox
- Docker Desktop
- Windows OS

---

# 🧪 Procedure

---
## Step 1: Install VirtualBox
- Download VirtualBox from the official website.
- Run the installer and keep default options.
- Restart the system if prompted.

## Step 2: Install Vagrant
- Download Vagrant for Windows.
- Install using default settings.
- Verify installation:

## Step 3: Create Ubuntu VM using Vagrant
---
### Create a new directory:
```bash
   mkdir vm-lab
   cd vm-lab
   
````
---
### Initialize Vagrant with Ubuntu box:
```bash
   vagrant init ubuntu/jammy64
```
---
### Start the VM:
```bash
   vagrant up
```
---
### Access the VM:
```bash
   vagrant ssh
```
---
## Step 4: Install Nginx inside VM
```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl start nginx
```
---
## Step 5: Verify Nginx
```bash
curl localhost
```
---
### Stop and remove vm
```bash
vagrant halt
vagrant destroy
```
---
 ## Experiment Setup – Part B: Containers using WSL (Windows)
 ---
 ### Step 1: Install WSL 2
 ```bash
wsl --install
```
---
### Step 2: Install Ubuntu on WSL
```bash
wsl --install -d Ubuntu
```
---
### Step 3: Install Docker Engine inside WSL
```bash
sudo apt update
sudo apt install -y docker.io
sudo systemctl start docker
sudo usermod -aG docker $USER
```
---
### Step 4: Run Ubuntu Container with Nginx
```bash
docker pull ubuntu

docker run -d -p 8080:80 --name nginx-container nginx
```
---
### Step 5: Verify Nginx in Container
```bash
curl localhost:8080
```
---
### Resource Utilization Observation
VM Observation Commands
```bash
free -h
htop
systemd-analyze
```
---
### Container Observation Commands
```bash
docker stats
free -h
```



