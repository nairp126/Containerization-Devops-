---
layout: default
title: "Experiment 5: Docker Volumes, Environment Variables, Monitoring & Networks"
permalink: /lab/EXP-5/
---

## 📋 Objective

To understand and demonstrate Docker's four operational pillars — **persistent data storage** (volumes & bind mounts), **runtime configuration** (environment variables), **observability** (stats, logs, events), and **container-to-container communication** (custom bridge networks) — by building and monitoring a multi-service application stack.

---

## 👨‍🎓 Student Information

| Attribute | Details |
| :--- | :--- |
| **Name** | Pranav R Nair |
| **SAP ID** | 500121466 |
| **Roll No** | R2142230197 |
| **Batch** | 2(CCVT) |

---

## Part 1: Docker Volumes — Persistent Data Storage

### ⚡ Lab 1: Understanding Container Data Lifecycle

#### The Problem: Container Data is Ephemeral

By default, all files created inside a container live in its **writable layer**. This layer is tied to the container — if you `docker rm` it, the data is gone forever.

> **Important Nuance:** Data survives `docker stop` and `docker start` — it's only destroyed on `docker rm`. This is a common misconception.

#### Step 1: Create a container and write data

```bash
docker run -d --name test-container ubuntu sleep 3600
```

| Flag | Purpose |
| :--- | :--- |
| `-d` | **Detached mode** — runs in the background so we can exec into it |
| `--name test-container` | Assigns a human-readable name instead of a random hash |
| `sleep 3600` | Keeps the container alive for 1 hour (ubuntu would exit immediately without a long-running process) |

```bash
# Create directory and write a file inside the running container
docker exec test-container bash -c "mkdir -p /data && echo 'Hello World' > /data/message.txt"

# Verify the file exists
docker exec test-container cat /data/message.txt
```

**Expected Output:**

```text
Hello World
```

| Flag | Purpose |
| :--- | :--- |
| `docker exec` | Runs a command inside a **running** container (does not start a new one) |
| `bash -c "..."` | Runs a compound shell command (mkdir + echo) in one exec call |
| `-p` (in `mkdir -p`) | Creates parent directories as needed — won't error if `/data` doesn't exist |

#### Step 2: Stop, remove, and re-create — data is gone

```bash
# Stop the container (data SURVIVES this step)
docker stop test-container

# Remove the container (data is DESTROYED here)
docker rm test-container

# Start a new container with the same name
docker run -d --name test-container ubuntu sleep 3600

# Try to read the file
docker exec test-container cat /data/message.txt
```

**Expected Output:**

```text
cat: /data/message.txt: No such file or directory
```

> **Deep Dive — Why?** Every container has a thin **writable layer** on top of the image's read-only layers (Union Filesystem). When you `docker rm`, Docker deletes that writable layer and all its contents. The new container starts from a fresh writable layer — it has no memory of the old container's files.
>
> **Solution: Docker Volumes** — Store data outside the container's writable layer so it persists independently.

**Screenshot — Demonstrating ephemeral data loss after `docker rm`:**

![Part 1: Data persistence test and NGINX config setup](Screenshot%202026-03-12%20230947.png)

---

### ⚡ Lab 2: Volume Types

Docker provides three types of storage mounts:

| Type | Managed By | Location | Persists After `docker rm`? | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **Anonymous Volume** | Docker | `/var/lib/docker/volumes/<hash>` | Yes (but hard to find) | Throwaway data |
| **Named Volume** | Docker | `/var/lib/docker/volumes/<name>` | Yes ✅ | Databases, production data |
| **Bind Mount** | You (Host OS) | Any host directory | Yes ✅ | Development, config files |

#### 1. Anonymous Volumes

```bash
docker run -d -v /app/data --name web1 nginx
```

| Flag | Purpose |
| :--- | :--- |
| `-v /app/data` | Creates an anonymous volume mounted at `/app/data` inside the container. Since no name is given, Docker generates a random hash as the volume name. |

```bash
# Check the volume — you'll see a long hex hash as the name
docker volume ls

# See exactly where it's mounted
docker inspect web1 | grep -A 5 Mounts
```

> **Problem with anonymous volumes:** They're hard to identify and reuse. You can't easily attach a new container to the same anonymous volume because you'd need to know the random hash.

#### 2. Named Volumes (Recommended for Production)

```bash
# Create a named volume explicitly
docker volume create mydata

# Attach it to a container
docker run -d -v mydata:/app/data --name web2 nginx
```

| Flag | Purpose |
| :--- | :--- |
| `-v mydata:/app/data` | Mounts the named volume `mydata` at `/app/data` inside the container. If `mydata` doesn't exist, Docker auto-creates it. |

```bash
# List volumes — you'll see "mydata" clearly
docker volume ls

# See metadata: mountpoint, driver, creation date
docker volume inspect mydata
```

#### 3. Bind Mounts (Map Host Directory → Container)

```bash
# Create a directory on your host machine
mkdir ~/myapp-data

# Mount it directly into the container
docker run -d -v ~/myapp-data:/app/data --name web3 nginx
```

| Flag | Purpose |
| :--- | :--- |
| `-v ~/myapp-data:/app/data` | Maps the **host directory** `~/myapp-data` into the container at `/app/data`. Changes in either location are reflected instantly in the other. |

```bash
# Write from the HOST
echo "From Host" > ~/myapp-data/host-file.txt

# Read from INSIDE the container
docker exec web3 cat /app/data/host-file.txt
```

**Expected Output:**

```text
From Host
```

> **Deep Dive — Bind Mounts for Development:** Bind mounts are the backbone of Docker development workflows. You edit code on your host with your IDE, and the container serves it instantly — no rebuild needed. This is why `docker run -v $(pwd):/app` is so common in development.

---

### ⚡ Lab 3: Practical Volume Examples

#### Example 1: Database with Persistent Storage

```bash
# Start MySQL with a named volume for data persistence
docker run -d \
  --name mysql-db \
  -v mysql-data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  mysql:8.0
```

| Flag | Purpose |
| :--- | :--- |
| `-v mysql-data:/var/lib/mysql` | MySQL stores all database files in `/var/lib/mysql`. By mounting a named volume here, the database survives container removal. |
| `-e MYSQL_ROOT_PASSWORD=secret` | Required environment variable — MySQL refuses to start without a root password. |

```bash
# Simulate a crash: stop and delete the container
docker stop mysql-db
docker rm mysql-db

# Start a brand new container with the SAME volume
docker run -d \
  --name new-mysql \
  -v mysql-data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  mysql:8.0
# All databases, tables, and rows from the old container are intact!
```

> **Why this works:** The volume `mysql-data` is independent of any container. Removing `mysql-db` deletes the container but NOT the volume. The new container simply reconnects to the same storage.

#### Example 2: Web Server with Custom Configuration (Bind Mount)

```bash
# Create the config directory
mkdir -p ~/nginx-config

# Write a custom NGINX configuration
cat << 'EOF' > ~/nginx-config/nginx.conf
server {
    listen 80;
    server_name localhost;
    location / {
        default_type text/plain;
        return 200 "Hello from mounted config!";
    }
}
EOF
```

> **Fix Applied:** The `default_type text/plain;` directive was added. Without it, NGINX returns the response with a default `application/octet-stream` content type, causing browsers and `curl` to attempt a file download instead of displaying the text.

```bash
# Run NGINX with the config file bind-mounted
docker run -d \
  --name nginx-custom \
  -p 8080:80 \
  -v ~/nginx-config/nginx.conf:/etc/nginx/conf.d/default.conf \
  nginx
```

| Flag | Purpose |
| :--- | :--- |
| `-p 8080:80` | Maps host port `8080` to container port `80` (NGINX's default listening port) |
| `-v ~/nginx-config/nginx.conf:/etc/nginx/conf.d/default.conf` | Replaces NGINX's default site config with our custom file. Changes to the host file take effect on `nginx -s reload`. |

```bash
# Test — should display the text, not download a file
curl http://localhost:8080
```

**Expected Output:**

```text
Hello from mounted config!
```

---

### ⚡ Lab 4: Volume Management Commands

```bash
# List all volumes
docker volume ls

# Create a named volume explicitly
docker volume create app-volume

# View detailed volume metadata (mountpoint, driver, labels)
docker volume inspect app-volume

# Remove ALL volumes not attached to any container (DANGEROUS in production)
docker volume prune

# Remove a specific volume by name
docker volume rm app-volume

# Copy a file from host into a running container's volume
docker cp local-file.txt container-name:/path/in/volume/
```

> **Common Pitfall:** `docker volume rm` will fail if any container (even a stopped one) is using the volume. Remove the container first with `docker rm`, then the volume.

---

## Part 2: Environment Variables

### ⚡ Lab 1: Setting Environment Variables at Runtime

Environment variables are the standard mechanism for configuring containers without rebuilding images. They follow the **12-Factor App** methodology.

#### Method 1: Using `-e` Flag (Inline)

```bash
docker run -d \
  --name app1 \
  -e DATABASE_URL="postgres://user:pass@db:5432/mydb" \
  -e DEBUG="true" \
  -p 3000:3000 \
  my-node-app
```

| Flag | Purpose |
| :--- | :--- |
| `-e KEY=VALUE` | Sets a single environment variable inside the container. Can be repeated for multiple variables. |

#### Method 2: Using `--env-file` (File-Based)

```bash
# Create a .env file
cat << 'EOF' > .env
DATABASE_HOST=localhost
DATABASE_PORT=5432
API_KEY=secret123
EOF

# Pass everything in the file at once
docker run -d \
  --env-file .env \
  --name app2 \
  my-app
```

| Flag | Purpose |
| :--- | :--- |
| `--env-file .env` | Loads ALL key-value pairs from the file. Keeps secrets out of your command history. |

> **Security Tip:** Never commit `.env` files to git. Add them to `.gitignore`. For production, use Docker Secrets or a vault.

#### Method 3: In the Dockerfile (Build-Time Defaults)

```dockerfile
# Set default values — overridable at runtime with -e
ENV NODE_ENV=production
ENV PORT=3000
ENV APP_VERSION=1.0.0
```

> These defaults are baked into the image. Runtime `-e` flags always take priority over Dockerfile `ENV` values.

---

### ⚡ Lab 2: Building and Testing a Flask App with Environment Variables

#### Step 1: Create the application

> **Fix Applied:** The original notes referenced testing against a Flask app and `my-node-app`, but neither image existed. The commands below create the app from scratch.

```bash
# Create project directory
mkdir -p ~/flask-env-lab && cd ~/flask-env-lab

# Create requirements.txt
echo "Flask==2.3.2" > requirements.txt

# Create the Flask application
cat << 'EOF' > app.py
import os
from flask import Flask, jsonify

app = Flask(__name__)

# Read environment variables with safe defaults
db_host = os.environ.get('DATABASE_HOST', 'localhost')
debug_mode = os.environ.get('DEBUG', 'false').lower() == 'true'
api_key = os.environ.get('API_KEY')

@app.route('/config')
def config():
    return jsonify({
        'db_host': db_host,
        'debug': debug_mode,
        'has_api_key': bool(api_key)
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
EOF
```

#### Step 2: Create the Dockerfile

```bash
cat << 'EOF' > Dockerfile
FROM python:3.9-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

ENV PORT=5000 \
    DEBUG=false

EXPOSE 5000

CMD ["python", "app.py"]
EOF
```

| ENV Variable | Purpose |
| :--- | :--- |
| `PYTHONUNBUFFERED=1` | Forces Python to print output immediately instead of buffering — critical for `docker logs` to work in real-time |
| `PYTHONDONTWRITEBYTECODE=1` | Prevents `.pyc` cache files — keeps the container filesystem clean |

#### Step 3: Build the image

```bash
docker build -t flask-app .
```

**Expected Output:** Build completes with `[+] Building X.Xs (11/11) FINISHED`

**Screenshot — Flask app build and monitoring:**

![Part 2: Dockerfile build, docker stats, and docker logs output](Screenshot%202026-03-12%20231000.png)

---

### ⚡ Lab 3: Test Environment Variables in Action

```bash
# Run with custom environment variables
docker run -d \
  --name my-flask-app \
  -p 5000:5000 \
  -e DATABASE_HOST="prod-db.example.com" \
  -e DEBUG="true" \
  -e API_KEY="sk-123456" \
  flask-app
```

```bash
# Verify environment is set correctly inside the container
docker exec my-flask-app env
docker exec my-flask-app printenv DATABASE_HOST
```

**Expected Output:**

```text
prod-db.example.com
```

```bash
# Test the /config endpoint
curl http://localhost:5000/config
```

**Expected Output:**

```json
{"db_host":"prod-db.example.com","debug":true,"has_api_key":true}
```

> **Deep Dive — ENV Precedence:** Runtime `-e` flags override Dockerfile `ENV` values. The Dockerfile set `DEBUG=false`, but we passed `-e DEBUG="true"` at runtime, so the app runs in debug mode. This is how the same image works in dev (debug=true) and prod (debug=false).

---

## Part 3: Docker Monitoring

### ⚡ Lab 1: `docker stats` — Real-Time Resource Metrics

```bash
# Live dashboard for ALL running containers (Ctrl+C to exit)
docker stats

# Stats for specific containers only
docker stats my-flask-app nginx-custom

# Custom format — cleaner output
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# One-time snapshot (no live update) — useful for scripts
docker stats --no-stream
```

| Column | What It Shows |
| :--- | :--- |
| `CPU %` | Percentage of host CPU used by this container |
| `MEM USAGE / LIMIT` | Current memory consumption vs. allowed maximum |
| `MEM %` | Percentage of allowed memory currently in use |
| `NET I/O` | Total bytes sent/received over the network |
| `BLOCK I/O` | Total bytes read/written to disk |
| `PIDS` | Number of processes running inside the container |

**Example Output from Lab:**

```text
CONTAINER ID   NAME           CPU %   MEM USAGE / LIMIT   MEM %   NET I/O        BLOCK I/O    PIDS
4b534c56828e   my-flask-app   0.18%   46.44MiB / 7.594GiB  0.60%  1.36kB / 792B  537kB / 0B   3
```

---

### ⚡ Lab 2: `docker top` — Process Monitoring

```bash
# View all processes running inside a container
docker top my-flask-app

# Full process listing (like ps -ef inside the container)
docker top my-flask-app -ef
```

> **Deep Dive — PID Namespaces:** Inside the container, the Flask process is PID 1. On the host, it has a completely different PID. `docker top` shows the **host-side PIDs**, which is useful for debugging from outside the container.

---

### ⚡ Lab 3: `docker logs` — Application Logs

```bash
# View all historical logs
docker logs my-flask-app

# Follow logs in real-time (like tail -f)
docker logs -f my-flask-app

# Last 50 lines only
docker logs --tail 50 my-flask-app

# Logs with timestamps
docker logs -t my-flask-app

# Logs since a specific time
docker logs --since 2026-03-12 my-flask-app

# Combine: follow + last 50 lines + timestamps
docker logs -f --tail 50 -t my-flask-app
```

| Flag | Purpose |
| :--- | :--- |
| `-f` (follow) | Streams new logs as they arrive — press `Ctrl+C` to stop |
| `--tail N` | Shows only the last N lines instead of the entire history |
| `-t` | Prepends RFC 3339 timestamps to every log line |
| `--since` | Filters to logs after a given timestamp or relative duration (e.g., `10m`) |

**Flask App Log Output:**

```text
 * Serving Flask app 'app'
 * Debug mode: on
WARNING: This is a development server.
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
172.17.0.1 - - [12/Mar/2026 17:35:03] "GET /config HTTP/1.1" 200 -
```

---

### ⚡ Lab 4: `docker inspect` — Container Details

```bash
# Full JSON dump of ALL container metadata
docker inspect my-flask-app

# Get specific values using Go templates
docker inspect --format='{{.State.Status}}' my-flask-app        # "running"
docker inspect --format='{{.NetworkSettings.IPAddress}}' my-flask-app  # "172.17.0.4"
docker inspect --format='{{.Config.Env}}' my-flask-app           # all env vars

# Resource limits
docker inspect --format='{{.HostConfig.Memory}}' my-flask-app    # memory limit (0 = unlimited)
docker inspect --format='{{.HostConfig.NanoCpus}}' my-flask-app   # CPU limit
```

---

### ⚡ Lab 5: `docker events` — System-Wide Event Stream

```bash
# Watch all Docker events live (container starts, stops, dies, etc.)
docker events

# Only container events
docker events --filter 'type=container'

# Only "start" events
docker events --filter 'event=start'

# Custom format
docker events --format '{{.Type}} {{.Action}} {{.Actor.Attributes.name}}'
```

---

### ⚡ Lab 6: Practical Monitoring Script

```bash
#!/bin/bash
# monitor.sh — Simple Docker monitoring dashboard

echo "=== Docker Monitoring Dashboard ==="
echo "Time: $(date)"
echo

echo "1. Running Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo

echo "2. Resource Usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
echo

echo "3. Recent Events:"
docker events --since '5m' --until '0s' --format '{{.Time}} {{.Type}} {{.Action}}' | tail -5
echo

echo "4. System Disk Usage:"
docker system df
```

> **How to use:** Save as `monitor.sh`, run `chmod +x monitor.sh`, then `./monitor.sh`. This gives you a single-command health check for all running containers.

---

## Part 4: Docker Networks

### ⚡ Lab 1: Understanding Docker Network Types

```bash
# List the three default networks Docker creates at installation
docker network ls
```

**Expected Output:**

```text
NETWORK ID     NAME      DRIVER    SCOPE
abc123         bridge    bridge    local
def456         host      host      local
ghi789         none      null      local
```

| Network | Driver | Purpose |
| :--- | :--- | :--- |
| `bridge` | bridge | Default for standalone containers. Each gets its own IP in a private subnet. |
| `host` | host | Container shares the host's network stack directly — no isolation. |
| `none` | null | Complete network isolation — only loopback interface. |

---

### ⚡ Lab 2: Network Types in Practice

#### 1. Custom Bridge Network (Recommended for multi-container apps)

```bash
# Create a user-defined bridge network
docker network create app-network

# Inspect it
docker network inspect app-network

# Run two containers on the same network
docker run -d --name web1 --network app-network nginx
docker run -d --name web2 --network app-network nginx

# Containers can communicate using names (Docker DNS)
docker exec web1 curl http://web2
```

> **Deep Dive — Why Custom Bridge?** The default `bridge` network does NOT provide DNS resolution — containers must use IP addresses. A user-defined bridge automatically runs Docker's embedded DNS at `127.0.0.11`, enabling container-name-based discovery. Always create a custom bridge for multi-container setups.

#### 2. Host Network

```bash
# Container shares host's network — NGINX runs directly on host port 80
docker run -d --name host-app --network host nginx
curl http://localhost
```

> **Caution:** No port mapping needed (no `-p` flag), but multiple containers can't share the same port. Use on Linux servers for performance-critical applications only.

#### 3. None Network

```bash
# Complete isolation — no network access at all
docker run -d --name isolated-app --network none alpine sleep 3600

# Only the loopback interface exists
docker exec isolated-app ifconfig
```

---

### ⚡ Lab 3: Network Management Commands

```bash
# Create a network with custom subnet and gateway
docker network create \
  --driver bridge \
  --subnet 172.20.0.0/16 \
  --gateway 172.20.0.1 \
  my-subnet

# Connect a running container to a second network
docker network connect app-network existing-container

# Disconnect a container from a network
docker network disconnect app-network container-name

# Remove a specific network
docker network rm app-network

# Remove ALL unused networks
docker network prune
```

---

### ⚡ Lab 4: Multi-Container Communication (DNS Proof)

#### Goal: Prove that Docker DNS resolves container names across a custom network

> **Fix Applied:** The original notes attempted to run a nonexistent `node-app` image. We replaced it with an `alpine` container using `ping` to prove DNS resolution — simpler and guaranteed to work.

```bash
# Create the network
docker network create app-network

# Start PostgreSQL database
docker run -d \
  --name postgres-db \
  --network app-network \
  -e POSTGRES_PASSWORD=secret \
  postgres:15

# Prove DNS works: ping the database by NAME from an alpine container
docker run --rm --network app-network alpine ping -c 4 postgres-db
```

**Expected Output:**

```text
PING postgres-db (172.18.0.2): 56 data bytes
64 bytes from 172.18.0.2: seq=0 ttl=64 time=0.104 ms
64 bytes from 172.18.0.2: seq=1 ttl=64 time=0.165 ms
64 bytes from 172.18.0.2: seq=2 ttl=64 time=0.092 ms
64 bytes from 172.18.0.2: seq=3 ttl=64 time=0.062 ms

--- postgres-db ping statistics ---
4 packets transmitted, 4 packets received, 0% packet loss
```

> **What just happened:** The alpine container resolved the name `postgres-db` → `172.18.0.2` using Docker's embedded DNS. No `/etc/hosts` editing, no IP hardcoding. This is exactly how microservices find each other in Docker.

**Screenshot — PostgreSQL pull and DNS ping proof:**

![Part 4: Postgres deployment and Alpine ping DNS test](Screenshot%202026-03-12%20231016.png)

---

### ⚡ Lab 5: Network Inspection & Debugging

```bash
# View all containers on a network and their IPs
docker network inspect app-network

# Get a container's IP address
docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' postgres-db

# DNS resolution test from inside a container
docker exec web1 nslookup web2

# Internet connectivity test
docker exec web1 ping -c 4 google.com

# Check published port mappings
docker port nginx-custom
```

---

### ⚡ Lab 6: Port Publishing vs Exposing

```bash
# PORT PUBLISHING — makes container accessible from outside Docker
docker run -d -p 8080:80 --name app1 nginx
# Host port 8080 → Container port 80

# DYNAMIC PORT — Docker picks a random available host port
docker run -d -P --name app2 nginx
docker port app2
# Shows: 80/tcp -> 0.0.0.0:32768

# LOCALHOST ONLY — accessible only from the host machine itself
docker run -d -p 127.0.0.1:8080:80 --name app3 nginx

# MULTIPLE PORTS — for HTTPS + HTTP
docker run -d -p 80:80 -p 443:443 --name app4 nginx
```

| Concept | Dockerfile `EXPOSE` | Runtime `-p` |
| :--- | :--- | :--- |
| **What it does** | Documentation only — declares intent | Actually creates the port mapping |
| **Accessible?** | ❌ Not from outside | ✅ Yes, from host and network |
| **Required?** | No (but recommended) | Yes, for external access |

---

## Part 5: Complete Real-World Example — Multi-Service Stack

### Architecture

```text
┌─────────────────────────────────────────────────────┐
│                 myapp-network                        │
│                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐       │
│  │ Flask    │───▶│ PostgreSQL│    │  Redis   │       │
│  │ (5001)   │    │ (5432)   │    │ (6379)   │       │
│  └──────────┘    └──────────┘    └──────────┘       │
│      │               │               │              │
│      │          postgres-data    redis-data          │
│  Port 5001          (volume)       (volume)          │
│  published                                           │
└─────────────────────────────────────────────────────┘
```

### Prerequisites Setup

> **Fix Applied:** The original notes did not include setup commands for required host directories and the `.env.production` file. Without these, Docker's bind mounts and `--env-file` would crash the container on startup.

```bash
# Create required host directories
cd ~
mkdir -p app app-logs

# Create the production environment file
cat << 'EOF' > .env.production
API_SECRET=my_production_secret
EOF
```

### Step-by-Step Deployment

#### Step 1: Create the application network

```bash
docker network create myapp-network
```

#### Step 2: Start PostgreSQL with persistent storage

```bash
docker run -d \
  --name postgres \
  --network myapp-network \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=mydatabase \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:15
```

| Flag | Purpose |
| :--- | :--- |
| `--network myapp-network` | Places the database on the custom network for DNS discovery |
| `-e POSTGRES_DB=mydatabase` | Auto-creates a database named `mydatabase` on first startup |
| `-v postgres-data:/var/lib/postgresql/data` | Named volume ensures database files survive container removal |

#### Step 3: Start Redis cache

```bash
docker run -d \
  --name redis \
  --network myapp-network \
  -v redis-data:/data \
  redis:7-alpine
```

> No port publishing for Redis — it's only accessible within `myapp-network`. This is a security best practice.

#### Step 4: Deploy the Flask application

```bash
docker run -d \
  --name prod-flask-app \
  --network myapp-network \
  -p 5001:5000 \
  -v ~/app-logs:/var/log/app \
  -e DATABASE_URL="postgresql://postgres:mysecretpassword@postgres:5432/mydatabase" \
  -e REDIS_URL="redis://redis:6379" \
  -e DATABASE_HOST="postgres" \
  --env-file .env.production \
  flask-app
```

| Flag | Purpose |
| :--- | :--- |
| `-p 5001:5000` | Maps host port `5001` to the Flask app's port `5000` (5000 may already be in use by the earlier lab) |
| `-v ~/app-logs:/var/log/app` | Bind mount — application logs are written to the host for external log aggregators |
| `-e DATABASE_URL="...@postgres:5432/..."` | The hostname `postgres` resolves via Docker DNS to the PostgreSQL container's IP |
| `--env-file .env.production` | Loads secrets from a file — keeps them out of your bash history |

**Screenshot — Full stack deployment and `docker ps` output:**

![Part 5: Full stack running — postgres, redis, flask-app with docker ps and curl test](Screenshot%202026-03-12%20231030.png)

---

### Step 5: Verify the stack

```bash
# All three containers should be running
docker ps

# Monitor resource usage across all services
docker stats postgres redis prod-flask-app

# Check application logs
docker logs -f prod-flask-app

# Test network connectivity between services
docker exec prod-flask-app ping -c 2 postgres
docker exec prod-flask-app ping -c 2 redis

# View the entire network topology
docker network inspect myapp-network

# Test the API endpoint
curl http://localhost:5001/config
```

**Expected Output:**

```json
{"db_host":"postgres","debug":false,"has_api_key":false}
```

> `db_host` correctly shows `postgres` (the container name), proving Docker DNS resolved the connection string.

**Screenshot — Final verification with curl and config endpoint:**

![Part 5: curl /config endpoint showing postgres hostname resolution](Screenshot%202026-03-12%20231040.png)

---

## Cleanup

```bash
# Stop and remove ALL containers
docker rm -f $(docker ps -aq)

# Remove all unused networks
docker network prune -f

# Remove all unused volumes (CAUTION: destroys all persistent data)
docker volume prune -f

# Remove unused images
docker image prune -f
```

**Screenshot — Full cleanup:**

![Cleanup: docker rm, network prune, volume prune](Screenshot%202026-03-12%20231040.png)

---

## 🔧 Common Pitfalls & Troubleshooting

| Problem | Symptom | Solution |
| :--- | :--- | :--- |
| Container exits immediately | `STATUS: Exited (0)` | Ensure the main process runs in the foreground. For ubuntu, use `sleep 3600` or `bash` with `-it`. |
| Data lost after restart | "No such file" after `docker stop/start` | Data survives `stop/start`. It's only lost after `docker rm`. Use volumes to persist beyond removal. |
| `curl` downloads file instead of showing text | Response prompts download | Add `default_type text/plain;` to your NGINX config. |
| Flask app image not found | `Unable to find image 'flask-app:latest'` | You must `docker build -t flask-app .` first. |
| Containers can't find each other by name | `Could not resolve host` | Use a **custom bridge** network, not the default bridge. |
| Port already in use | `Bind for 0.0.0.0:5000 failed: port is already allocated` | Use a different host port: `-p 5001:5000` |
| `--env-file` crashes container | `open .env.production: no such file or directory` | Create the file before running the container. |
| Bind mount directory creates as root | Permissions denied inside container | Create the host directory before running: `mkdir -p ~/app-logs` |

---

## 📋 Quick Reference Cheatsheet

### Volumes

```bash
docker volume create <name>              # Create named volume
docker run -v <volume>:/path             # Mount named volume
docker run -v /host/path:/container/path # Bind mount
docker volume ls                         # List all volumes
docker volume inspect <name>             # View details
docker volume rm <name>                  # Delete volume
docker volume prune                      # Remove ALL unused
```

### Environment Variables

```bash
docker run -e KEY=value                  # Inline variable
docker run --env-file .env               # From file
docker exec <container> env              # List all env vars
docker exec <container> printenv KEY     # Get one value
# Dockerfile: ENV KEY=value             # Build-time default
```

### Monitoring

```bash
docker stats                             # Live resource dashboard
docker stats --no-stream                 # One-time snapshot
docker logs -f <container>               # Stream logs
docker logs --tail 50 -t <container>     # Last 50 + timestamps
docker top <container>                   # Process list
docker inspect <container>               # Full JSON metadata
docker events                            # System event stream
docker system df                         # Disk usage summary
```

### Networks

```bash
docker network create <name>                   # Create bridge
docker run --network <name> ...                 # Join network
docker network connect <network> <container>    # Add to network
docker network disconnect <network> <container> # Remove from network
docker network inspect <name>                   # View topology
docker network rm <name>                        # Delete network
docker network prune                            # Remove unused
```

---

## 📝 Key Takeaways

1. **Volumes** persist data beyond container lifecycle — always use **named volumes** for databases and production data.
2. **Bind mounts** are ideal for development — edit on your host, see changes instantly in the container.
3. **Environment variables** configure containers dynamically — use `-e` for quick tests, `--env-file` for production.
4. **`docker stats`**, **`docker logs`**, and **`docker events`** form a complete observability toolkit for debugging.
5. **Custom bridge networks** provide DNS-based service discovery — containers find each other by name, not IP.
6. **Never publish database ports** unless absolutely required — keep them on internal networks only.
7. Container data survives `stop/start` but is **destroyed on `docker rm`** — this is the #1 misconception.
8. Always create required host directories and `.env` files **before** running containers with bind mounts.

---

> **Experiment 5** covers the four pillars of operational Docker: storage, configuration, monitoring, and networking. Together, these form the foundation for building production-ready containerized applications.

**Student**: Pranav R Nair | **SAP ID**: 500121466 | **Batch**: 2(CCVT)
