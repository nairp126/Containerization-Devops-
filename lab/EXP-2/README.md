---
layout: default
title: "Experiment 2: Docker Installation and Container Lifecycle"

---

## 🎯 Objective

The goal of this experiment is to master the fundamental **Docker Container Lifecycle**. You will learn how to:

1. **Pull** images from a registry.
2. **Run** containers with specific configurations (port mapping, detached mode).
3. **Manage** containers (stop, remove) and clean up resources (images).

---

## ⚙️ Prerequisites

* Docker Desktop installed and running.
* Basic understanding of CLI commands.

---

## 🧪 Procedure

### Step 1: Pull a Docker Image

Before we can run a container, we need the "blueprint" or image locally.

```bash
docker pull nginx
```

* **Command**: `docker pull` downloads an image from a Docker Registry (default: Docker Hub).
* **Argument**: `nginx` is the name of the official image for the Nginx web server. Since we didn't specify a tag (like `nginx:1.21`), Docker defaults to `nginx:latest`.
* **Expected Output**:

    ```text
    Using default tag: latest
    ...
    Status: Downloaded newer image for nginx:latest
    ```

### Step 2: Run the Container

Now we instantiate the image into a running container.

```bash
docker run -d -p 8080:80 --name my-web-server nginx
```

* **Command**: `docker run` creates and starts a container.
* **Flags**:
  * `-d` (**Detached**): Runs the container in the background. If you omit this, the container logs will hijack your terminal.
  * `-p 8080:80` (**Port Mapping**): Maps **Host Port 8080** -> **Container Port 80**. This allows you to access the web server at `localhost:8080`.
  * `--name`: Assigns a readable name (`my-web-server`) to the container.
* **Expected Output**: A long unique container ID (e.g., `a1b2c3d4...`).

### Step 3: Verify Running Containers

Check the status of your active containers.

```bash
docker ps
```

* **Command**: Lists only **running** containers.
* **Flags (Optional)**: Use `-a` (`docker ps -a`) to see **all** containers, including stopped ones.
* **Expected Output**: A table showing Container ID, Image, Command, Created Time, Status (Up X seconds), Ports, and Names.

### Step 4: Stop the Container

Gracefully shut down the application.

```bash
docker stop my-web-server
```

* **Command**: Sends a `SIGTERM` signal to the main process inside the container, asking it to stop safely.
* **Argument**: You can use either the **Container ID** or the **Name** (`my-web-server`).
* **Expected Output**: The command echoes the container name.

### Step 5: Remove the Container

Stopping a container does not delete it; it just puts it in an "Exited" state. To free up disk space, we must remove it.

```bash
docker rm my-web-server
```

* **Command**: Deletes the container's mutable layer and metadata.
* **Note**: You cannot remove a *running* container unless you use the `-f` (force) flag. Always stop first!
* **Expected Output**: The command echoes the container name.

### Step 6: Remove the Image (Cleanup)

If you no longer need the Nginx image, remove it to save disk space.

```bash
docker rmi nginx
```

* **Command**: `rmi` stands for **Remove Image**.
* **Expected Output**: Logs showing "Untagged: ..." and "Deleted: ...".

---

## 🧐 Deep Dive

### The Container Lifecycle

A container moves through specific states:

1. **Created**: The container layer is initialized but not started.
2. **Running**: The main process (PID 1) is active.
3. **Paused**: Processes are frozen (SIGSTOP).
4. **Exited**: The main process has stopped (either finished or crashed).
5. **Dead**: The container is non-functional and difficult to remove.

### Docker Hub

When you run `docker pull`, where does the file come from? It comes from **Docker Hub** (hub.docker.com), the world's largest library and community for container images. It is similar to GitHub, but for binaries/images instead of source code.

---

## ⚠️ Troubleshooting & Common Pitfalls

### 1. "Conflict: The container name is already in use"

* **Error**: `Error response from daemon: Conflict. The container name "/my-web-server" is already in use...`
* **Cause**: You tried to run a new container with the same name as an existing one (even if the old one is stopped).
* **Fix**:
  * Remove the old one: `docker rm my-web-server`
  * **OR** Use a different name: `--name my-web-server-2`

### 2. "Cannot destroy container ... (it is running)"

* **Error**: `Error response from daemon: You cannot remove a running container...`
* **Cause**: You ran `docker rm` on a live container.
* **Fix**: Stop it first (`docker stop <name>`), then remove it. Or force remove it (`docker rm -f <name>`).

---
**Student**: Pranav R Nair | **Batch**: 2(CCVT) | **SAP ID**: 500121466

### 📸 Visuals & Outputs

![Screenshot 2026-01-31 084353.png](Screenshot 2026-01-31 084353.png)
