# MindVisionTech — Enterprise Production Platform & Infrastructure

[![Node.js Version](https://img.shields.io/badge/node.js-v20_LTS-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/next.js-v15%20%2F%20v16-black.svg)](https://nextjs.org/)
[![Docker Engine](https://img.shields.io/badge/docker-24.0+-blue.svg)](https://www.docker.com/)
[![AWS Architecture](https://img.shields.io/badge/aws-Route53_|_ACM_|_ALB_|_EC2-orange.svg)](https://aws.amazon.com/)
[![Database](https://img.shields.io/badge/database-MongoDB%20Atlas%20%2F%207.0-brightgreen.svg)](https://cloud.mongodb.com/)
[![Tests](https://img.shields.io/badge/tests-26%2F26_passing-brightgreen.svg)](https://vitest.dev/)
[![Security](https://img.shields.io/badge/security-hardened_|_rate--limited_|_TLS_1.3-blueviolet.svg)](deploy/aws/nginx-single-ec2.conf)

MindVisionTech is an enterprise-grade web application platform providing industry-focused training in Embedded Systems, IoT, Electric Vehicle (EV) Technology, VLSI, and Full-Stack Engineering. The platform is architected for **high performance, zero downtime, cost efficiency, and automated resilience** on Amazon Web Services (AWS) with MongoDB Atlas.

> 📘 **Looking for deep technical specifications, architectural diagrams, or itemized service cost tables?**  
> Read the comprehensive [**System Architecture & Engineering Specifications (SYSTEM_ARCHITECTURE.md)**](SYSTEM_ARCHITECTURE.md).

---

## 1. Production Architecture Overview

The production deployment replaces the AWS Application Load Balancer (ALB) with **Direct NGINX TLS 1.3 Termination & Certbot (Let's Encrypt)** running directly on the EC2 instance, cutting cloud hosting costs by over 65%:

```mermaid
flowchart TD
    Users["End Users (Browsers & Mobile Apps)"]

    subgraph AWS["AWS Cloud (ap-south-1 Mumbai)"]
        subgraph DNS["AWS Route 53 Global Anycast"]
            R53Apex["A Record: mindvisiontech.com &rarr; 16.4.5.249"]
            R53WWW["A Record: www.mindvisiontech.com &rarr; 16.4.5.249"]
            R53API["A Record: api.mindvisiontech.com &rarr; 16.4.5.249"]
        end

        subgraph EC2Host["EC2 Instance: t3.micro (Ubuntu 24.04 LTS)"]
            EIP["AWS Elastic IP: 16.4.5.249<br/>(Static Public IPv4)"]

            subgraph WebProxy["NGINX 1.24+ Web Server & Reverse Proxy"]
                P80["Port 80 (HTTP)<br/>• 301 Redirect to HTTPS<br/>• ACME Challenge /.well-known/acme-challenge/"]
                P443["Port 443 (HTTPS - TLS 1.2 / 1.3)<br/>• Let's Encrypt SSL Certificate<br/>• Gzip & HTTP Security Headers (HSTS, CSP)"]
                StaticFiles["Static Asset Engine<br/>• Serves Next.js SSG (/var/www/mindvisiontech/out)"]
            end

            subgraph CertbotLayer["SSL Certificate Daemon"]
                Certbot["Certbot Let's Encrypt<br/>• Auto-renews via systemd / cron<br/>• Path: /etc/letsencrypt/live/mindvisiontech.com/"]
            end

            subgraph DockerServices["Docker Engine Runtime"]
                API["Express API Container<br/>• Port 5000 (Loopback 127.0.0.1:5000)<br/>• Node 20 LTS Alpine (~180MB)<br/>• Rate-limited & Sanitized"]
                LocalMongo["Fallback MongoDB Container<br/>• mongo:7.0 (Inactive when Atlas connected)<br/>• Saves 250MB RAM"]
            end

            subgraph SystemResilience["OS Self-Healing & Supervision"]
                Systemd["systemd: mindvisiontech.service<br/>(Auto-starts containers on boot)"]
                Swap["Linux Swap Space: 2 GB (/swapfile)<br/>(Guards against OOM crashes)"]
            end
        end
    end

    subgraph ManagedDB["Cloud Database Layer"]
        Atlas["MongoDB Atlas M0 Free Tier (AWS Mumbai ap-south-1)<br/>• 3-Node Replica Set<br/>• Automated Backups & Monitoring<br/>• Zero Cloud Cost ($0.00/mo)"]
    end

    subgraph Automation["CI/CD Pipeline"]
        GHA["GitHub Actions Cloud Runner<br/>• Vitest Test Suite (26/26 Passing)<br/>• Static Frontend Pre-compilation<br/>• Zero-Downtime Hot-Swap via SSH (< 45s)"]
    end

    %% Traffic Flow
    Users -->|"1. HTTPS / HTTP Requests"| R53Apex
    Users -.->|"1b. Alternate Domains"| R53WWW
    Users -.->|"1c. API Domain"| R53API
    R53Apex -->|"2. Resolves directly to Elastic IP"| EIP
    R53WWW -->|"2. Resolves directly to Elastic IP"| EIP
    R53API -->|"2. Resolves directly to Elastic IP"| EIP

    EIP -->|"Port 80 Traffic"| P80
    EIP -->|"Port 443 TLS Traffic"| P443
    P80 -->|"301 Permanent Redirect"| P443
    Certbot -.->|"Issues & Renews SSL Certs"| P443

    P443 -->|"3a. Serves Static Pages directly from disk"| StaticFiles
    StaticFiles -->|"Ultra-fast TTFB"| Users
    P443 -->|"3b. Reverse Proxy /api/* to 127.0.0.1:5000"| API
    API -->|"4. Encrypted Mongoose Queries (mongodb+srv)"| Atlas
    API -.->|"Emergency Local Fallback"| LocalMongo

    GHA -->|"git push: Deploy Static Bundle & Docker Hot-Reload"| EC2Host
```

---

## 2. Repository Structure

```text
mindvisiontech/
├── .github/
│   └── workflows/
│       └── deploy.yml            # Fast CI/CD: Test -> Pre-build Frontend -> SCP -> EC2 Hot-Swap (< 45s)
├── client/                       # Next.js 15/16 App Router Frontend
│   ├── app/                      # Page routes (courses, blogs, branches, contact, services)
│   ├── components/               # UI components (LeadForm, CourseCard, BranchLocator)
│   ├── public/images/            # Self-hosted production assets (about, authors, blogs)
│   ├── tests/                    # Client Vitest unit & component test suites
│   ├── Dockerfile                # Multi-stage standalone Next.js container build
│   └── next.config.ts            # Dual-mode build config (standalone vs static export)
├── server/                       # Express.js REST API Backend
│   ├── config/                   # MongoDB connection pooling and environment loaders
│   ├── controllers/              # Business logic with field whitelisting (anti-mass assignment)
│   ├── middleware/               # Auth, input sanitization, rate limiting, and error handlers
│   ├── models/                   # Mongoose schemas (Lead, Course, Branch, User)
│   ├── routes/                   # Validated Express routes
│   ├── tests/                    # Vitest unit and API integration test suites
│   ├── Dockerfile                # Production Alpine Node.js container build
│   └── server.js                 # Express server with graceful shutdown & trust-proxy
├── deploy/
│   └── aws/                      # Production AWS Infrastructure & Automation Toolkit
│       ├── backup-db.sh          # Hot MongoDB snapshot & physical volume backup script
│       ├── restore-db.sh         # 1-command database restoration & MongoDB Atlas migration tool
│       ├── start-app.sh          # Self-healing EC2 startup script (systemd boot manager)
│       ├── update-prod.sh        # Zero-downtime hot-reload script with Docker image rollback
│       ├── nginx-single-ec2.conf # Production NGINX config for ALB + single-EC2 setup
│       ├── nginx.conf            # High-scale NGINX config (SSL termination on EC2)
│       ├── provision-asg.sh      # AWS CLI automated provisioner for ALB & Auto Scaling
│       ├── provision-vpc.sh      # AWS CLI provisioner for custom VPC, Subnets & IGW
│       └── setup-backup-cron.sh  # Automated daily 02:00 AM backup cron scheduler
├── docker-compose.yml            # Local development compose (MongoDB 7.0 on port 27017)
├── docker-compose.prod.yml       # Production single-EC2 compose (supports Atlas & local Mongo)
├── docker-compose.asg.yml        # Production stateless API compose for Auto Scaling nodes
├── SYSTEM_ARCHITECTURE.md        # Comprehensive technical specifications & itemized cost breakdown
└── package.json                  # Workspace orchestration and test runner scripts
```

---

## 3. Quick Start & Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) v20 LTS or higher
- [Docker Engine](https://docs.docker.com/engine/install/) & Docker Compose plugin
- Git

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/vasanthakumarj2004/mindvisiontech.git
cd mindvisiontech

# Install all dependencies across root, server, and client
npm install
npm run install:all
```

### 2. Start Local Environment
```bash
# Start local MongoDB container
docker compose up -d mongodb

# Initialize environment variables
cp server/.env.example server/.env

# Launch server (:5000) and client (:3000) concurrently
npm run dev
```

### 3. Run Automated Tests
```bash
# Run all 26 server and client tests (Vitest)
npm test

# Run tests in watch mode
npm --prefix server run test:watch
npm --prefix client run test:watch
```

---

## 4. EC2 Production Deployment & Operations

### Initial EC2 Startup & Self-Healing Setup
To start the application on your EC2 instance and register automatic systemd boot recovery:

```bash
cd /opt/mindvisiontech
sudo git pull origin main
sudo chmod +x deploy/aws/*.sh
sudo ./deploy/aws/start-app.sh
```

**What `start-app.sh` does automatically:**
1. **Swap Memory**: Allocates and mounts a 2 GB swapfile (`/swapfile`) to protect 1 GB RAM instances against OOM crashes.
2. **Daemons**: Enables and starts `docker` and `nginx`, adding `ubuntu` to the `docker` group.
3. **Environment**: Preserves existing `.env.production` or initializes secure defaults.
4. **Database Mode**: Auto-detects MongoDB Atlas (stops local container to save 250 MB RAM) or launches local MongoDB.
5. **Containers**: Builds and runs the Express API container on `127.0.0.1:5000`.
6. **NGINX**: Configures [`deploy/aws/nginx-single-ec2.conf`](deploy/aws/nginx-single-ec2.conf), verifies syntax, and restarts NGINX.
7. **Systemd Daemon**: Registers `/etc/systemd/system/mindvisiontech.service` so the stack **automatically starts on any future EC2 reboot or stop/start**.

---

### Zero-Downtime Application Updates

Trigger an instant update anytime directly on EC2:
```bash
sudo /opt/mindvisiontech/deploy/aws/update-prod.sh main
```

**How the update script protects production:**
- **Pre-deployment DB Snapshot**: Automatically triggers [`deploy/aws/backup-db.sh`](deploy/aws/backup-db.sh) before touching code.
- **Docker Fallback Tagging**: Tags the running image as `mindvisiontech-api:previous`.
- **Fast Frontend Extraction**: If a pre-compiled bundle exists in `/tmp/frontend-dist.tar.gz`, unpacks it in 0.5s without high-CPU compiles on EC2.
- **Atomic Hot-Swap**: Rebuilds the API image and swaps containers in < 50ms.
- **Health Verification**: Polls `/api/health`. On success, prunes older dangling images; **on failure, rolls back to `mindvisiontech-api:previous` immediately**.

---

## 5. MongoDB Atlas Setup & Data Migration

### Connecting to MongoDB Atlas
In `/opt/mindvisiontech/.env.production` on EC2:
```ini
MONGODB_URI="mongodb+srv://mindvision_admin:<ENCODED_PASSWORD>@cluster0.xxxxx.mongodb.net/mindvisiontech?retryWrites=true&w=majority"
```

> [!TIP]
> **Special Characters in Passwords**: If your password contains `@`, `:`, `#`, `$`, or `%`, you **must URL-encode it** (e.g. `@` becomes `%40`). Wrap the entire `MONGODB_URI` line in double quotes `""`.  
> You can encode any password in 1 second by running:  
> `node -e 'console.log(encodeURIComponent(process.argv[1]))' 'your_raw_password'`

### 1-Command Migration to MongoDB Atlas
To migrate existing data from your local EC2 MongoDB container into MongoDB Atlas:

```bash
# Takes latest local backup and restores all collections directly into Atlas
sudo ./deploy/aws/restore-db.sh --to-atlas "YOUR_MONGODB_URI"
```

---

## 6. Continuous Deployment (CI/CD Pipeline)

The GitHub Actions workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) deploys automatically on `git push origin main`:

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant Git as GitHub (main branch)
    participant Runner as GitHub Runner (16 GB RAM)
    participant EC2 as AWS EC2 Server
    participant Docker as Docker Engine

    Dev->>Git: git push origin main
    Git->>Runner: Trigger CI/CD Workflow
    Runner->>Runner: Run Vitest (26 Tests across Server & Client)
    Runner->>Runner: Pre-compile Next.js Static Export (~12s)
    Runner->>EC2: Transfer frontend-dist.tar.gz via SCP (~2s)
    Runner->>EC2: Run update-prod.sh via SSH (~15s)
    EC2->>EC2: Hot Database Backup / Snapshot
    EC2->>Docker: Tag current image as mindvisiontech-api:previous
    EC2->>EC2: Extract Static Bundle to /var/www/mindvisiontech/out (0.5s)
    EC2->>Docker: Build new API image & Hot-Swap container
    EC2->>Docker: Verify http://127.0.0.1:5000/api/health (200 OK)
    EC2-->>Runner: Deployment Succeeded in under 45s!
```

### Required GitHub Secrets
To enable automated deployments, add these secrets under **Settings $\rightarrow$ Secrets and variables $\rightarrow$ Actions**:

| Secret Name | Description | Example |
| :--- | :--- | :--- |
| `EC2_HOST` | Public IP or Elastic IP of your EC2 instance | `13.232.xxx.xxx` |
| `EC2_SSH_KEY` | Private SSH Key (`.pem` file content) | `-----BEGIN RSA PRIVATE KEY-----...` |
| `EC2_USER` | *(Optional)* SSH username (defaults to `ubuntu`) | `ubuntu` |

---

## 7. Monthly Cloud Hosting Costs Summary

| Service | Tier / Usage | Monthly Cost (USD) | Monthly Cost (INR @ ₹86/$) |
| :--- | :--- | :---: | :---: |
| **AWS Route 53** | 1 Hosted Zone + DNS Queries | **$0.60** | ₹51 |
| **AWS Elastic IP** | Public IPv4 Address (`16.4.5.249`) | **$0.00** *(Year 1 Free Tier)*<br/>or **$3.65** *(Standard)* | ₹0 *(Free Tier)*<br/>or ₹314 |
| **Certbot (Let's Encrypt)** | Multi-Domain SSL Certificate | **$0.00** *(Free Forever)* | ₹0 |
| **AWS Application Load Balancer (ALB)** | — | **$0.00** *(Eliminated: Saved ~$18–$22/mo)* | ₹0 |
| **AWS EC2 Compute** | `t2.micro` / `t3.micro` | **$0.00** *(Year 1 Free Tier)*<br/>or **$7.59** *(Standard)* | ₹0 *(Free Tier)*<br/>or ₹652 |
| **AWS EBS Storage** | 20 GB `gp3` SSD | **$1.60** | ₹137 |
| **AWS Data Transfer** | Bandwidth Out (First 100 GB/mo free) | **$0.00** | ₹0 |
| **MongoDB Atlas** | M0 Sandbox Replica Set (AWS Mumbai) | **$0.00** *(Free Forever)* | ₹0 |
| **GitHub Actions** | 2,000 Runner Minutes / month | **$0.00** *(Free Tier)* | ₹0 |
| **TOTAL (Year 1 AWS Free Tier)** | Full Production Stack Live | **~$2.20 / mo** | **~₹189 / mo** |
| **TOTAL (Standard Post-Free Tier)** | Full Production Stack Live | **~$13.44 / mo** | **~₹1,156 / mo** |

*(For full cost analysis, volume pricing, and comparisons, see [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md#4-comprehensive-aws--cloud-cost-breakdown)).*

---

## 8. Security & Hardening Highlights

- **Anti-DDoS & Rate Limiting**: NGINX throttles API traffic to `10 req/s` with burst buffers; Express rate-limits lead creation to 10 submissions per 15 minutes.
- **Reverse Proxy Isolation**: Express API binds strictly to `127.0.0.1:5000` (loopback only); public traffic can only enter through NGINX and the ALB.
- **Mass Assignment Defense**: Controllers strictly whitelist input fields (`name`, `email`, `phone`, `course`, `branch`, `message`).
- **RAM Protection**: Delegating database persistence to MongoDB Atlas frees ~250 MB RAM on EC2; 2 GB swap prevents OOM crashes.
- **Automated Rollback**: Every deployment retains `mindvisiontech-api:previous` for instantaneous, zero-rebuild rollback if healthchecks fail.

---

## 9. Automation Scripts Reference

| Script | Location | Purpose |
| :--- | :--- | :--- |
| `start-app.sh` | [`deploy/aws/start-app.sh`](deploy/aws/start-app.sh) | Self-healing EC2 bootstrap & systemd auto-start manager |
| `update-prod.sh` | [`deploy/aws/update-prod.sh`](deploy/aws/update-prod.sh) | Zero-downtime hot-reload with auto-rollback & image pruning |
| `backup-db.sh` | [`deploy/aws/backup-db.sh`](deploy/aws/backup-db.sh) | Automated MongoDB dump & physical volume filesystem snapshot |
| `restore-db.sh` | [`deploy/aws/restore-db.sh`](deploy/aws/restore-db.sh) | 1-command database restore & MongoDB Atlas cloud migration |
| `nginx-single-ec2.conf` | [`deploy/aws/nginx-single-ec2.conf`](deploy/aws/nginx-single-ec2.conf) | Production NGINX config for ALB + single-EC2 setup |
| `setup-backup-cron.sh` | [`deploy/aws/setup-backup-cron.sh`](deploy/aws/setup-backup-cron.sh) | Daily 02:00 AM UTC backup cron scheduler |
| `provision-vpc.sh` | [`deploy/aws/provision-vpc.sh`](deploy/aws/provision-vpc.sh) | AWS CLI script to provision custom VPC & Subnets |
| `provision-asg.sh` | [`deploy/aws/provision-asg.sh`](deploy/aws/provision-asg.sh) | AWS CLI script for Auto Scaling Group & ALB |

---

## 10. License

Proprietary © [MindVision Technologies](https://mindvisiontech.com). All rights reserved.