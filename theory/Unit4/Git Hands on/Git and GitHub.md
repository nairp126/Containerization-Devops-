---
layout: post
title: "Git & GitHub — Authentication, Commands, and Daily Workflows"
permalink: /theory/unit4/git-and-github
---

## The Post Office Analogy

Before diving into Git commands and GitHub authentication, consider how a **postal system** works:

| Post Office System | Git & GitHub |
| :--- | :--- |
| You write a letter at your desk | You edit files in the **working directory** |
| You seal the letter in an envelope and write the address | You **stage** changes with `git add` (preparing them for sending) |
| You drop the envelope in your outbox | You **commit** with `git commit` (recording the snapshot locally) |
| You take the outbox to the post office for delivery | You **push** with `git push` (uploading commits to GitHub) |
| The post office verifies your ID before accepting mail | GitHub verifies your identity via **SSH keys** or **Personal Access Tokens** |
| Your ID card (passport) proves **who you are** | Your **Authentication Key** proves your identity for push/pull |
| Your handwritten signature proves **you wrote this letter** | Your **Signing Key** proves you authored a specific commit (✅ Verified badge) |
| Even if your passport has your signature on it, the bank needs you to sign separately | Even if it's the **same SSH key**, GitHub needs it added as both Authentication Key AND Signing Key separately |
| You receive mail from the post office | You **pull** or **fetch** changes from GitHub |
| Checking your outbox: "What letters haven't been sent yet?" | `git status` — what changes haven't been committed/pushed yet? |
| Reviewing your sent mail log | `git log` — the complete history of all commits |
| Comparing the draft and the final letter | `git diff` — line-by-line comparison of changes |

> **Key insight:** Git is your *local post office* — it handles all the packaging, labeling, and tracking. GitHub is the *central mail hub* — it receives, stores, and distributes. Authentication is the *ID check* — proving you are who you claim to be before the system trusts your deliveries.

---

## Part I — Configuring Git Identity

Every commit is permanently stamped with your name and email. Before you can commit, Git requires this identity to be configured.

### Setting Global Identity (All Repositories)

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

| Flag | Scope | File Location | Use Case |
| :--- | :--- | :--- | :--- |
| `--global` | All repos for your user account | `~/.gitconfig` | ✅ Most common — your personal default identity |
| `--local` | Current repository only | `.git/config` | Override for specific repos (e.g., work email vs personal email) |
| `--system` | All users on the machine | `/etc/gitconfig` | Enterprise-wide defaults (rare) |

### Setting Per-Repository Identity

If you use a different email for work vs personal projects:

```bash
cd /path/to/work-project
git config user.name "Your Name (Work)"
git config user.email "you@company.com"
```

> Without the `--global` flag, settings apply only to the current repository.

### Verify Your Configuration

```bash
# View all settings and where they come from
git config --list --show-origin

# Check specific values
git config user.name
git config user.email
```

### Additional Useful Configuration

```bash
# Set default editor for commit messages
git config --global core.editor "code --wait"        # VS Code
git config --global core.editor "vim"                 # Vim

# Set default branch name (main instead of master)
git config --global init.defaultBranch main

# Enable colored terminal output
git config --global color.ui auto

# Set pull strategy (avoid merge commits on pull)
git config --global pull.rebase true

# Line ending handling (cross-platform teams)
git config --global core.autocrlf input              # macOS/Linux
git config --global core.autocrlf true               # Windows
```

---

## Part II — GitHub Authentication

GitHub requires authentication to prove your identity when you push, pull, or clone private repositories. There are two methods: **HTTPS with Personal Access Tokens** and **SSH Keys**. Each has distinct trade-offs.

### Authentication Methods Compared

```mermaid
flowchart TD
    subgraph HTTPS["🔑 HTTPS + Personal Access Token (PAT)"]
        direction TB
        H1["Uses token as password"]
        H2["Stored in OS credential manager"]
        H3["URLs: https://github.com/..."]
        H4["Easier setup, token expires"]
    end

    subgraph SSH["🔐 SSH Key Pair"]
        direction TB
        S1["Uses public-key cryptography"]
        S2["Private key stays on your machine"]
        S3["URLs: git@github.com:..."]
        S4["No expiration, passwordless"]
    end

    style HTTPS fill:#f5a623,stroke:#fff,color:#000
    style SSH fill:#238636,stroke:#fff,color:#eee
```

| Aspect | HTTPS + PAT | SSH Key |
| :--- | :--- | :--- |
| **URL format** | `https://github.com/user/repo.git` | `git@github.com:user/repo.git` |
| **Authentication** | Token acts as password | Public-key cryptography |
| **Setup complexity** | ⭐ Simpler — generate token, paste when prompted | ⭐⭐ Moderate — generate key pair, register public key |
| **Security** | Token can be scoped (read-only, repo-only) | Key has full access; no granular scopes |
| **Expiration** | Configurable (30, 60, 90 days, or custom) | Never expires (unless you revoke it) |
| **Convenience** | Credential manager caches it | Fully passwordless after setup |
| **Best for** | CI/CD pipelines, temporary access, fine-grained permissions | Daily development, long-term use, commit signing |

---

### Method 1: Personal Access Token (PAT) — HTTPS Authentication

PATs replace your GitHub password for HTTPS Git operations. GitHub deprecated password authentication in August 2021 — you **must** use a PAT or SSH key.

#### Step 1: Generate a Token on GitHub

1. Log into [github.com](https://github.com)
2. Click your **profile icon** → **Settings**
3. Scroll to **Developer settings** (bottom of left sidebar)
4. Click **Personal access tokens** → **Tokens (classic)** → **Generate new token**
5. Configure:

| Field | Recommendation |
| :--- | :--- |
| **Note** | Descriptive name — e.g., "Laptop Dev Token" |
| **Expiration** | 90 days (balance between security and convenience) |
| **Scopes** | ✅ `repo` (full control of repositories) — minimum for push/pull |

6. Click **Generate token**
7. **⚠️ Copy the token immediately** — you will never see it again

#### Step 2: Use the Token

When Git prompts for credentials during a push/clone:

```text
Username: your-github-username
Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx    ← Paste your PAT here (not your password!)
```

#### Step 3: Cache the Token (Avoid Re-entering)

**macOS:**
```bash
git config --global credential.helper osxkeychain
```

**Linux:**
```bash
# Cache in memory for 1 hour (3600 seconds)
git config --global credential.helper 'cache --timeout=3600'

# OR store permanently in a file (less secure)
git config --global credential.helper store
```

**Windows (Credential Manager):**
```bash
git config --global credential.helper manager
```

Or manually add via Windows Credential Manager:

1. Open **Start Menu** → search **"Credential Manager"**
2. Click **Windows Credentials** → **Add a generic credential**
3. Fill in:

| Field | Value |
| :--- | :--- |
| **Internet or network address** | `git:https://github.com` |
| **Username** | Your GitHub username |
| **Password** | Your Personal Access Token |

4. Click **OK** — Git will now use this automatically

---

### Method 2: SSH Key Pair — Passwordless Authentication

SSH keys use **public-key cryptography** — a mathematically linked pair where the private key stays on your machine and the public key is uploaded to GitHub.

```mermaid
flowchart LR
    subgraph LOCAL["🖥️ Your Machine"]
        PRIV["🔒 Private Key\n~/.ssh/id_ed25519\n(NEVER share this)"]
        PUB["🔓 Public Key\n~/.ssh/id_ed25519.pub\n(Safe to share)"]
    end

    subgraph GH["☁️ GitHub"]
        AUTH["🔑 Authentication Keys\n(push / pull / clone)"]
        SIGN["✅ Signing Keys\n(Verified badge on commits)"]
    end

    PUB -->|"Upload once"| AUTH
    PUB -->|"Upload again"| SIGN
    PRIV -->|"Used locally for\ncryptographic proof"| GH

    style LOCAL fill:#0f3460,stroke:#38bdf8,color:#eee
    style GH fill:#238636,stroke:#fff,color:#eee
```

#### Step 1: Generate an SSH Key Pair

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

| Flag | Purpose |
| :--- | :--- |
| `-t ed25519` | Algorithm — Ed25519 is modern, fast, and secure (preferred over RSA) |
| `-C "email"` | Comment — labels the key for identification |

Press **Enter** to accept default location (`~/.ssh/id_ed25519`). Optionally set a passphrase.

> **Older systems:** If Ed25519 isn't supported, use RSA:
> ```bash
> ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
> ```

This creates two files:

| File | Type | Rule |
| :--- | :--- | :--- |
| `~/.ssh/id_ed25519` | **Private key** 🔒 | **NEVER share, copy, or upload this file** |
| `~/.ssh/id_ed25519.pub` | **Public key** 🔓 | Safe to share — upload to GitHub |

#### Step 2: Start the SSH Agent and Register the Key

```bash
# Start the SSH agent in the background
eval "$(ssh-agent -s)"
# Output: Agent pid 12345

# Add your private key to the agent
ssh-add ~/.ssh/id_ed25519
# Output: Identity added: /home/user/.ssh/id_ed25519 (your-email@example.com)
```

#### Step 3: Copy the Public Key

```bash
cat ~/.ssh/id_ed25519.pub
```

Copy the **entire output** (starts with `ssh-ed25519`, ends with your email).

#### Step 4: Add the Key to GitHub — Authentication

1. Go to [GitHub → Settings → SSH and GPG Keys](https://github.com/settings/keys)
2. Click **New SSH Key**
3. Fill in:

| Field | Value |
| :--- | :--- |
| **Title** | Descriptive name — e.g., "Work Laptop 2026" |
| **Key type** | **Authentication Key** |
| **Key** | Paste the public key |

4. Click **Add SSH Key**

#### Step 5: Add the SAME Key to GitHub — Signing

```mermaid
flowchart TD
    KEY["🔑 Same SSH Key\n(id_ed25519.pub)"]
    KEY -->|"Add as"| AUTH_K["🔓 Authentication Key\n─────────────────\nAllows: push, pull, clone\nQuestion: 'Who are you?'"]
    KEY -->|"Add AGAIN as"| SIGN_K["✅ Signing Key\n─────────────────\nAllows: Verified badge\nQuestion: 'Did YOU make this commit?'"]

    style KEY fill:#0f3460,stroke:#38bdf8,color:#eee
    style AUTH_K fill:#f5a623,stroke:#fff,color:#000
    style SIGN_K fill:#238636,stroke:#fff,color:#eee
```

1. Go back to [GitHub → Settings → SSH and GPG Keys](https://github.com/settings/keys)
2. Click **New SSH Key** again
3. This time, set **Key type** to **Signing Key**
4. Paste the **same public key**
5. Click **Add SSH Key**

> **⚠️ Critical:** Even though it's the **same key**, you must add it in **both** places. GitHub treats authentication and signing as separate concerns:
>
> ```text
> Authentication Key → "Who are you?"     (login, push, pull)
> Signing Key        → "Did YOU make this commit?" (✅ Verified badge)
> ```
>
> Adding only as Authentication will let you push — but your commits will NOT show the ✅ Verified badge.

#### Step 6: Configure Git to Sign Commits

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
```

| Setting | Purpose |
| :--- | :--- |
| `gpg.format ssh` | Use SSH keys (not GPG) for signing |
| `user.signingkey` | Path to your public key |
| `commit.gpgsign true` | Automatically sign every commit |

#### Step 7: Test the SSH Connection

```bash
ssh -T git@github.com
```

**Expected output:**
```text
Hi username! You've successfully authenticated, but GitHub does not provide shell access.
```

If you see this, SSH authentication is working. You can now clone using SSH URLs:

```bash
git clone git@github.com:username/repository.git
```

---

## Part III — Git Command Reference with Examples

This section covers every essential Git command with real-world examples, expected outputs, and when to use each one. Commands are grouped by workflow stage.

### Getting Help

Before memorizing commands, know how to look them up:

| Command | What It Shows | Example |
| :--- | :--- | :--- |
| `git help <command>` | Full manual page (detailed) | `git help commit` |
| `git <command> --help` | Same as above | `git commit --help` |
| `git <command> -h` | Brief summary of options | `git commit -h` |
| `man git-<command>` | Unix manual page | `man git-commit` |
| `git help -a` | List all available Git commands | — |
| `git help -g` | List Git concept guides | — |

> **Tip:** Running a command incorrectly often shows a helpful usage hint automatically.

---

### Stage 1: Creating or Cloning a Repository

#### `git init` — Initialize a New Repository

Turns the current directory into a Git repository by creating a `.git` subdirectory.

```bash
$ mkdir my-project && cd my-project
$ git init
```

```text
Initialized empty Git repository in /home/user/my-project/.git/
```

| What Happens | Details |
| :--- | :--- |
| Creates `.git/` directory | Contains all Git internals — objects, refs, config, hooks |
| No files are tracked yet | You must `git add` files explicitly |
| No remote is configured | You must `git remote add origin <url>` to connect to GitHub |

> **When to use:** Starting a brand-new project from scratch.

#### `git clone` — Copy an Existing Repository

Creates a complete local copy of a remote repository, including all history, branches, and tags.

```bash
# Clone via SSH (recommended after SSH setup)
$ git clone git@github.com:user/repo.git

# Clone via HTTPS (uses PAT for authentication)
$ git clone https://github.com/user/repo.git
```

```text
Cloning into 'repo'...
remote: Counting objects: 100% (156/156), done.
remote: Compressing objects: 100% (89/89), done.
Receiving objects: 100% (156/156), 1.24 MiB | 2.50 MiB/s, done.
Resolving deltas: 100% (67/67), done.
```

| What Happens | Details |
| :--- | :--- |
| Downloads entire repository | All commits, branches, tags — complete history |
| Sets up `origin` remote automatically | Points to the URL you cloned from |
| Checks out the default branch | Usually `main` — your working directory has the latest files |

> **When to use:** Joining an existing project, downloading open-source code.

---

### Stage 2: The Daily Workflow — Status, Add, Commit, Push

```mermaid
flowchart LR
    WD["📁 Working Directory\n(edit files)"]
    SA["📋 Staging Area\n(selected changes)"]
    LR["📦 Local Repository\n(.git — commit history)"]
    RR["☁️ GitHub\n(remote repository)"]

    WD -->|"git add"| SA
    SA -->|"git commit -m '...'"| LR
    LR -->|"git push"| RR
    RR -->|"git pull"| WD
    RR -->|"git fetch"| LR

    style WD fill:#f5a623,stroke:#fff,color:#000
    style SA fill:#8b5cf6,stroke:#fff,color:#eee
    style LR fill:#238636,stroke:#fff,color:#eee
    style RR fill:#0f3460,stroke:#38bdf8,color:#eee
```

#### `git status` — Check Current State

Shows which files are modified, staged, or untracked — the most frequently used command.

```bash
$ git status
```

```text
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   server.py

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        newfile.txt

no changes added to commit (use "git add" and/or "git commit -a")
```

**Reading the output:**

| Section | Meaning |
| :--- | :--- |
| **Changes not staged for commit** | Files modified but not yet added to staging — won't be included in the next commit |
| **Changes to be committed** | Files in the staging area — will be included in the next commit |
| **Untracked files** | New files Git doesn't know about yet |

> **When to use:** Constantly — before `add`, before `commit`, after `pull`. It's your dashboard.

#### `git add` — Stage Changes

Moves changes from the working directory to the staging area, selecting what will be included in the next commit.

```bash
# Stage a specific file
$ git add server.py

# Stage multiple specific files
$ git add server.py config.yaml

# Stage all changes (new, modified, deleted)
$ git add .

# Stage all changes with a review prompt (interactive)
$ git add -p
```

| Variant | What It Stages |
| :--- | :--- |
| `git add <file>` | Only the specified file |
| `git add .` | All changes in the current directory and subdirectories |
| `git add -A` | All changes in the entire repository (same as `git add .` from root) |
| `git add -p` | Interactive — shows each change and asks to stage it (y/n) |
| `git add *.py` | All `.py` files in the current directory |

> **Why the staging area exists:** It lets you commit *part* of your changes. You edited 5 files, but only 3 are related to the current feature — stage only those 3, commit, then handle the rest separately. This creates clean, focused commits.

#### `git commit` — Save a Snapshot

Records the staged changes as a permanent snapshot in the local repository with a descriptive message.

```bash
$ git commit -m "Add user authentication endpoint"
```

```text
[main f1e2d3c] Add user authentication endpoint
 2 files changed, 45 insertions(+), 3 deletions(-)
 create mode 100644 auth.py
```

| Flag | Purpose |
| :--- | :--- |
| `-m "message"` | Inline commit message (most common) |
| (no flag) | Opens your configured editor for a multi-line message |
| `-a -m "msg"` | Stage all tracked modified files AND commit (skips `git add`) |
| `--amend` | Modify the most recent commit (message or content) |

**Writing good commit messages:**

```text
✅ Good: "Fix SQL injection vulnerability in login query"
✅ Good: "Add pagination to /api/users endpoint"
✅ Good: "Refactor payment module for Stripe v3 API"

❌ Bad: "fix"
❌ Bad: "update"
❌ Bad: "changes"
❌ Bad: "asdfgh"
```

**Conventional Commits format (industry standard):**

```text
<type>(<scope>): <description>

feat(auth): add JWT token refresh endpoint
fix(payments): prevent duplicate charge on retry
docs(readme): update installation instructions
refactor(api): extract validation into middleware
test(auth): add unit tests for password reset
```

| Type | When to Use |
| :--- | :--- |
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change that doesn't fix a bug or add a feature |
| `test` | Adding or updating tests |
| `chore` | Build system, CI, or tooling changes |

#### `git push` — Upload to GitHub

Sends your local commits to the remote repository, making them available to teammates.

```bash
# Push current branch to origin
$ git push origin main
```

```text
Counting objects: 100% (5/5), done.
Delta compression using up to 8 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 1.21 KiB | 1.21 MiB/s, done.
Total 3 (delta 2), reused 0 (delta 0)
To git@github.com:user/repo.git
   abc1234..def5678  main -> main
```

| Variant | Behaviour |
| :--- | :--- |
| `git push origin main` | Push `main` branch to the `origin` remote |
| `git push` | Push to the default upstream (if set with `-u`) |
| `git push -u origin main` | Push AND set `origin/main` as the default upstream (first push) |
| `git push --force` | ⚠️ **Dangerous** — overwrites remote history. Only use for personal branches after rebase |

> **First push for a new repo:** Use `git push -u origin main`. The `-u` flag sets up tracking so future pushes only need `git push`.

#### `git pull` — Download and Integrate Changes

Fetches new commits from the remote AND merges them into your current branch. Equivalent to `git fetch` + `git merge`.

```bash
$ git pull origin main
```

```text
remote: Counting objects: 100% (8/8), done.
remote: Compressing objects: 100% (4/4), done.
Receiving objects: 100% (8/8), done.
From git@github.com:user/repo
 * branch            main       -> FETCH_HEAD
Updating abc1234..def5678
Fast-forward
 server.py | 12 +++++++++---
 1 file changed, 9 insertions(+), 3 deletions(-)
```

| Term in Output | Meaning |
| :--- | :--- |
| **Fast-forward** | Your branch had no new commits — Git simply moved the pointer forward (clean, no merge commit) |
| **Merge commit** | Both you and the remote had new commits — Git created a merge commit to combine them |
| **CONFLICT** | Both sides modified the same lines — requires manual resolution |

> **Best practice:** Use `git fetch` + `git merge` separately for more control (see the Inspection section below).

---

### Stage 3: Branching and Merging

#### `git branch` — Manage Branches

```bash
# List all local branches (* = current)
$ git branch
```

```text
* main
  feature-auth
  fix-payment-bug
```

```bash
# Create a new branch
$ git branch feature-auth

# Delete a merged branch
$ git branch -d feature-auth

# Force-delete an unmerged branch
$ git branch -D experimental

# List remote branches
$ git branch -r

# List all branches (local + remote)
$ git branch -a
```

#### `git checkout` / `git switch` — Switch Branches

```bash
# Switch to an existing branch
$ git checkout feature-auth
```

```text
Switched to branch 'feature-auth'
```

```bash
# Create AND switch in one step
$ git checkout -b feature-payments

# Modern alternative (Git 2.23+)
$ git switch feature-auth
$ git switch -c feature-payments      # Create + switch
```

| Command | Purpose |
| :--- | :--- |
| `git checkout <branch>` | Switch to an existing branch |
| `git checkout -b <branch>` | Create a new branch AND switch to it |
| `git switch <branch>` | Switch to a branch (modern, clearer syntax) |
| `git switch -c <branch>` | Create + switch (modern) |

> **Why `git switch` exists:** `git checkout` was overloaded — it switched branches AND restored files. Git 2.23 split it into `git switch` (branches) and `git restore` (files) for clarity.

#### `git merge` — Combine Branches

Integrates changes from one branch into your current branch.

```bash
# First, switch to the target branch
$ git checkout main

# Then merge the feature branch into it
$ git merge feature-auth
```

```text
Updating abc1234..def5678
Fast-forward
 auth.py | 45 ++++++++++++++++++++++++++++++++++++
 1 file changed, 45 insertions(+)
 create mode 100644 auth.py
```

```mermaid
gitGraph
    commit id: "A"
    commit id: "B"
    branch feature-auth
    commit id: "C (add login)"
    commit id: "D (add JWT)"
    checkout main
    commit id: "E (fix typo)"
    merge feature-auth id: "F (merge)"
    commit id: "G (deploy)"
```

| Merge Type | When It Happens | Result |
| :--- | :--- | :--- |
| **Fast-forward** | Main has no new commits since the branch was created | Pointer moves forward — no merge commit |
| **3-way merge** | Both branches have new commits | Creates a merge commit combining both |
| **Conflict** | Same lines modified in both branches | Requires manual resolution |

---

### Stage 4: Inspection and Comparison

#### `git log` — View Commit History

```bash
# Full log with details
$ git log
```

```text
commit abc1234 (HEAD -> main, origin/main)
Author: Alice <alice@example.com>
Date:   Mon May 26 10:30:00 2026 +0530

    Add user authentication endpoint
```

```bash
# Compact one-line format
$ git log --oneline
```

```text
abc1234 (HEAD -> main) Add user authentication endpoint
def5678 Fix payment gateway timeout
789abcd Initial commit
```

```bash
# Visual branch graph
$ git log --oneline --graph --all
```

```text
* abc1234 (HEAD -> main) Merge feature-auth
|\
| * ghi7890 Add JWT validation
| * jkl0123 Add login form
|/
* def5678 Fix homepage layout
* 789abcd Initial commit
```

| Variant | What It Shows |
| :--- | :--- |
| `git log` | Full details — hash, author, date, message |
| `git log --oneline` | Compact — one line per commit |
| `git log --oneline --graph --all` | Visual branch graph with all branches |
| `git log -n 5` | Only the last 5 commits |
| `git log --author="Alice"` | Only commits by Alice |
| `git log --since="2026-05-01"` | Commits after a date |
| `git log -- <file>` | History of a specific file |
| `git log -p` | Show the actual diff for each commit |

#### `git diff` — Compare Changes

Shows line-by-line differences between versions.

```bash
# Unstaged changes (working directory vs staging area)
$ git diff
```

```text
diff --git a/server.py b/server.py
index e69de29..d95f3ad 100644
--- a/server.py
+++ b/server.py
@@ -10,6 +10,8 @@ def login(user, password):
     if not user:
         return {"error": "User required"}, 400
+    # Validate password strength
+    if len(password) < 8:
+        return {"error": "Password too short"}, 400
```

**Reading the diff output:**

| Symbol | Meaning |
| :--- | :--- |
| `---` / `+++` | Old file / New file |
| `@@` | Location in the file (line numbers) |
| `-` (red) | Line was **removed** |
| `+` (green) | Line was **added** |
| (no prefix) | Line is **unchanged** (context) |

| Variant | What It Compares |
| :--- | :--- |
| `git diff` | Working directory vs staging area (unstaged changes) |
| `git diff --staged` | Staging area vs last commit (what will be committed) |
| `git diff HEAD` | Working directory vs last commit (all uncommitted changes) |
| `git diff main..feature` | Difference between two branches |
| `git diff abc123..def456` | Difference between two commits |
| `git diff -- <file>` | Diff for a specific file only |

> **When to use:** Before `git add` — review what you changed. Before `git commit` — review what's staged with `git diff --staged`.

#### `git show` — Inspect a Specific Commit

```bash
# Show details and diff for the latest commit
$ git show

# Show a specific commit
$ git show abc1234
```

#### `git blame` — Who Changed Each Line?

```bash
$ git blame server.py
```

```text
abc1234 (Alice  2026-05-20 10:30) def login(user, password):
def5678 (Bob    2026-05-22 14:15)     query = f"SELECT * FROM users WHERE name='{user}'"
ghi7890 (Carol  2026-05-24 09:00)     # TODO: Fix SQL injection
```

> **When to use:** Tracking down who introduced a bug and when.

---

### Stage 5: Remote Repository Management

#### `git remote` — Manage Remote Connections

```bash
# List remotes with URLs
$ git remote -v
```

```text
origin  git@github.com:user/repo.git (fetch)
origin  git@github.com:user/repo.git (push)
```

```bash
# Add a new remote
$ git remote add origin git@github.com:user/repo.git

# Change a remote's URL (e.g., switch from HTTPS to SSH)
$ git remote set-url origin git@github.com:user/repo.git

# Remove a remote
$ git remote remove origin

# Rename a remote
$ git remote rename origin upstream
```

**Common error and fix:**

```bash
# Error: fatal: remote origin already exists.
# Fix: remove first, then re-add
$ git remote remove origin
$ git remote add origin git@github.com:user/new-repo.git
```

#### `git fetch` vs `git pull` — Safe Download vs Immediate Merge

```mermaid
flowchart LR
    REMOTE["☁️ GitHub\n(origin/main)"]
    TRACKING["📋 Local Tracking\n(origin/main)"]
    LOCAL["📁 Your Branch\n(main)"]

    REMOTE -->|"git fetch\n(safe — downloads only)"| TRACKING
    TRACKING -->|"git merge\n(you decide when)"| LOCAL
    REMOTE -->|"git pull\n(fetch + merge combined)"| LOCAL

    style REMOTE fill:#0f3460,stroke:#38bdf8,color:#eee
    style TRACKING fill:#8b5cf6,stroke:#fff,color:#eee
    style LOCAL fill:#238636,stroke:#fff,color:#eee
```

| Command | Downloads? | Modifies Your Branch? | Risk |
| :--- | :--- | :--- | :--- |
| `git fetch` | ✅ Yes | ❌ No — safe, read-only | None |
| `git pull` | ✅ Yes | ✅ Yes — merges immediately | May cause conflicts |

> **Best practice:** Use `git fetch` first to preview, then `git merge` when ready — especially on shared branches.

---

### Stage 6: Undoing Mistakes

| Scenario | Command | Safety |
| :--- | :--- | :--- |
| Unstage a file (keep changes) | `git restore --staged <file>` | ✅ Safe |
| Discard changes in working directory | `git restore <file>` | ⚠️ Destructive — changes are lost |
| Undo last commit, keep changes staged | `git reset --soft HEAD~1` | ✅ Safe |
| Undo last commit, keep changes unstaged | `git reset HEAD~1` | ✅ Safe |
| Undo last commit, discard everything | `git reset --hard HEAD~1` | 🔴 Destructive |
| Reverse a commit with a new commit | `git revert <hash>` | ✅ Safe — doesn't rewrite history |
| Recover "deleted" commits | `git reflog` + `git reset --hard <hash>` | ✅ Recovery |

---

## Complete First-Time Setup Workflow

For a new machine, run these commands in order:

```bash
# ─── 1. Set Identity ──────────────────────────────────────
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
git config --global init.defaultBranch main
git config --global core.editor "code --wait"

# ─── 2. Generate SSH Key ─────────────────────────────────
ssh-keygen -t ed25519 -C "your-email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# ─── 3. Copy Public Key ──────────────────────────────────
cat ~/.ssh/id_ed25519.pub
# → Copy output → GitHub Settings → SSH Keys → Add as AUTHENTICATION key
# → Copy output → GitHub Settings → SSH Keys → Add as SIGNING key

# ─── 4. Configure Commit Signing ─────────────────────────
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true

# ─── 5. Test Connection ──────────────────────────────────
ssh -T git@github.com

# ─── 6. Clone and Start Working ──────────────────────────
git clone git@github.com:username/repo.git
cd repo
# You're ready!
```

---

## Troubleshooting

| Problem | Cause | Fix |
| :--- | :--- | :--- |
| `Permission denied (publickey)` | SSH key not added to GitHub or SSH agent not running | Run `ssh-add ~/.ssh/id_ed25519`; verify key is in GitHub Settings |
| `remote: Invalid username or password` | PAT expired or wrong, or using password instead of token | Generate a new PAT; paste it as the password |
| `fatal: remote origin already exists` | Remote was already configured | `git remote remove origin` then `git remote add origin <url>` |
| `! [rejected] main -> main (non-fast-forward)` | Remote has commits you don't have locally | `git pull --rebase origin main` then `git push` |
| Commits not showing ✅ Verified on GitHub | SSH key added as Authentication only, not Signing | Add the same key as a **Signing Key** in GitHub Settings |
| `Author identity unknown` | Name/email not configured | `git config --global user.name "Name"` and `user.email` |
| `git push` asks for password every time | Credential helper not configured | Set `git config --global credential.helper manager` (Windows) |
| `ssh: Could not resolve hostname github.com` | DNS or network issue | Check internet connection; try `ping github.com` |
| `error: failed to push some refs` | Local branch is behind remote | `git pull` first, resolve any conflicts, then `git push` |

---

## Glossary

| Term | Definition |
| :--- | :--- |
| **Git** | A distributed version control system for tracking code changes — the industry standard |
| **GitHub** | A web platform for hosting Git repositories with collaboration features (PRs, Issues, Actions) |
| **Repository (Repo)** | A directory tracked by Git, containing all files and their complete change history |
| **Working Directory** | The actual files on disk that you edit — the "workspace" |
| **Staging Area (Index)** | An intermediate area where changes are selected before committing — Git's unique "preview" step |
| **Commit** | A saved snapshot of the staging area with a message, author, timestamp, and unique SHA hash |
| **Branch** | A lightweight movable pointer to a commit — enables isolated, parallel development |
| **Remote** | A hosted copy of the repository (e.g., on GitHub) used for sharing and backup |
| **Origin** | The default name for the remote repository you cloned from |
| **Clone** | Creating a full local copy of a remote repository including all history |
| **Push** | Uploading local commits to a remote repository |
| **Pull** | Downloading and merging remote changes into the current branch (`fetch` + `merge`) |
| **Fetch** | Downloading remote changes without merging — safe, read-only preview |
| **Merge** | Combining changes from one branch into another |
| **HEAD** | Pointer to the current branch's latest commit — "where you are now" |
| **Fast-forward** | A merge where the target branch simply moves its pointer forward (no divergent history) |
| **SSH Key** | A cryptographic key pair (public + private) for passwordless authentication |
| **Ed25519** | A modern, fast, and secure SSH key algorithm — preferred over RSA |
| **Authentication Key** | An SSH key registered on GitHub to prove your identity for push/pull/clone |
| **Signing Key** | An SSH key registered on GitHub to prove authorship of commits (✅ Verified badge) |
| **Personal Access Token (PAT)** | A GitHub-generated token that replaces your password for HTTPS Git operations |
| **Credential Manager** | An OS-level tool that securely caches Git credentials so you don't re-enter them |
| **SSH Agent** | A background process that holds your private SSH keys in memory for automatic authentication |
| **`git config`** | Command to read/write Git configuration at system, global, or local scope |
| **`git status`** | Command showing modified, staged, and untracked files — your working directory dashboard |
| **`git diff`** | Command showing line-by-line differences between file versions |
| **`git log`** | Command displaying the commit history with hashes, authors, dates, and messages |
| **`git blame`** | Command showing who last modified each line of a file and when |
| **`git reflog`** | A log of all HEAD movements — the "undo history" for recovering lost commits |
| **Conventional Commits** | A commit message convention (`feat:`, `fix:`, `docs:`) for readable, machine-parseable history |
| **`.gitconfig`** | The configuration file where Git stores user settings (`~/.gitconfig` for global) |

---

## Quick Reference Card

```bash
# ─── Setup ──────────────────────────────────────────────────
git config --global user.name "Name"
git config --global user.email "email"
ssh-keygen -t ed25519 -C "email"
ssh -T git@github.com                          # Test SSH connection

# ─── Repository ────────────────────────────────────────────
git init                                        # New repo
git clone git@github.com:user/repo.git          # Clone existing
git remote -v                                   # List remotes

# ─── Daily Workflow ─────────────────────────────────────────
git status                                      # What changed?
git add .                                       # Stage all changes
git commit -m "feat: add login page"            # Commit with message
git push                                        # Upload to GitHub
git pull                                        # Download + merge

# ─── Branching ──────────────────────────────────────────────
git branch                                      # List branches
git checkout -b feature-auth                    # Create + switch
git checkout main                               # Switch to main
git merge feature-auth                          # Merge into current
git branch -d feature-auth                      # Delete merged branch

# ─── Inspection ─────────────────────────────────────────────
git log --oneline --graph --all                 # Visual history
git diff                                        # Unstaged changes
git diff --staged                               # Staged changes
git blame server.py                             # Who changed each line?
git show abc1234                                # Inspect a commit

# ─── Undoing ────────────────────────────────────────────────
git restore --staged file.txt                   # Unstage
git restore file.txt                            # Discard changes
git reset --soft HEAD~1                         # Undo commit, keep staged
git revert abc1234                              # Reverse commit (safe)
git reflog                                      # Find "lost" commits

# ─── Remote Management ─────────────────────────────────────
git remote add origin git@github.com:user/repo.git
git remote set-url origin <new-url>
git fetch origin                                # Download without merge
```

---

## Exam / Interview Prep

### Q1: Explain the two methods of authenticating with GitHub — PAT and SSH. What are the trade-offs, and when would you choose each?

**Answer:** GitHub offers two authentication methods:

**Personal Access Token (PAT)** — used with HTTPS URLs (`https://github.com/user/repo.git`). You generate a token on GitHub with specific scopes (e.g., `repo` for repository access) and an expiration date. When Git prompts for a password, you paste the PAT instead. The token can be cached by the OS credential manager (Keychain on macOS, Credential Manager on Windows). **Advantages:** Fine-grained scopes (read-only, specific repos), configurable expiration, easy to revoke. **Disadvantages:** Tokens expire and must be regenerated; if not cached, you re-enter the token on every push.

**SSH Key Pair** — used with SSH URLs (`git@github.com:user/repo.git`). You generate a public-private key pair locally (`ssh-keygen -t ed25519`). The public key is uploaded to GitHub; the private key stays on your machine. The SSH agent handles authentication automatically — no passwords or tokens needed. **Advantages:** Never expires (unless revoked), fully passwordless after setup, can also sign commits (Verified badge). **Disadvantages:** No granular scopes (full access), initial setup is more complex, key must be regenerated if the machine is compromised.

**When to choose:** Use **SSH** for daily development — it's passwordless, permanent, and supports commit signing. Use **PATs** for CI/CD pipelines, temporary access, or when you need fine-grained scope control (e.g., a token that can only read, not write).

---

### Q2: What is the difference between an SSH Authentication Key and an SSH Signing Key on GitHub? Why must the same key be added in both places?

**Answer:** GitHub uses SSH keys for two distinct purposes that it treats as completely separate systems:

**Authentication Key** answers: *"Who are you?"* — It proves your identity when you push, pull, or clone repositories. Without this, GitHub rejects your SSH connections entirely.

**Signing Key** answers: *"Did YOU make this commit?"* — It cryptographically signs each commit you create, allowing GitHub to verify authorship and display a ✅ **Verified** badge next to your commits. Without this, your commits appear as "Unverified" even if you push them successfully.

Even though it's the **same key**, you must add it in both places because GitHub's authentication system (for network access) and its verification system (for commit provenance) are independent subsystems. Adding a key as Authentication does NOT automatically register it for Signing, and vice versa. Locally, you must also configure Git to use the key for signing with `git config --global gpg.format ssh`, `git config --global user.signingkey ~/.ssh/id_ed25519.pub`, and `git config --global commit.gpgsign true`.

This separation is an intentional security design: an organization might allow a key to authenticate (push code) but require a separate, more tightly controlled key for signing (proving authorship for compliance and audit trails).

---

### Q3: Walk through the complete workflow of making a code change, from editing a file to seeing it on GitHub. Explain what happens at each step.

**Answer:** The workflow follows Git's three-area model: Working Directory → Staging Area → Local Repository → Remote Repository.

**Step 1: Edit files** — You modify `server.py` in your editor. The file changes exist only in the **working directory**. `git status` shows it as "modified" under "Changes not staged for commit."

**Step 2: `git add server.py`** — This copies the modified file into the **staging area** (index). The staging area is a preview of what the next commit will contain. You can stage some files and leave others for a separate commit. `git diff --staged` shows exactly what's staged.

**Step 3: `git commit -m "Fix authentication timeout"`** — This takes everything in the staging area and creates a permanent **snapshot** (commit) in the **local repository** (`.git` directory). The commit is assigned a unique SHA-1 hash, stamped with your name, email, timestamp, and signed with your SSH signing key if configured. The commit exists only on your machine at this point.

**Step 4: `git push origin main`** — This uploads your new commit(s) from the local repository to the **remote repository** on GitHub. Git compares your local `main` branch with `origin/main`, computes the delta, compresses the objects, and transfers them over SSH (or HTTPS). GitHub authenticates you using your SSH Authentication Key (or PAT), accepts the objects, updates `origin/main` to point to your new commit, and the change is now visible to all collaborators on GitHub.

At each step, data moves through one boundary: editing (working directory) → staging (`git add`) → committing (`git commit`, local) → pushing (`git push`, remote). This separation gives you fine-grained control: you can edit many files, stage only related ones, commit with a focused message, and push when ready.

---

## Further Reading

- [GitHub SSH Key Documentation](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [GitHub PAT Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [Git Reference Manual](https://git-scm.com/docs)
- [Pro Git Book (Free)](https://git-scm.com/book/en/v2)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Git Cheat Sheet (GitHub)](https://education.github.com/git-cheat-sheet-education.pdf)
- [Oh Shit, Git!?!](https://ohshitgit.com/) — fixing common Git mistakes