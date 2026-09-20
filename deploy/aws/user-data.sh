#!/bin/bash
# ==============================================================================
# AWS Auto Scaling Launch Template - User Data Script
# Project: MindVisionTech (Dockerized Next.js + Express)
# ==============================================================================

set -e
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo ">>> [1/5] Updating packages and installing Docker..."
apt-get update -y
apt-get install -y docker.io docker-compose-v2 git awscli

systemctl enable docker
systemctl start docker

echo ">>> [2/5] Setting up swap space (2GB)..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo ">>> [3/5] Cloning latest MindVisionTech repository..."
mkdir -p /var/www
cd /var/www
git clone https://github.com/vasanthakumarj2004/mindvisiontech.git
cd mindvisiontech

echo ">>> [4/5] Preparing environment configurations..."
# In autoscaling, the database is centralized (e.g., MongoDB Atlas or dedicated DB host)
cat << 'EOF' > .env.docker
# Centralized MongoDB URI (Replace with your Atlas or dedicated Mongo instance connection string)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/mindvisiontech?retryWrites=true&w=majority

# Production Domain Settings
CLIENT_URL=https://mindvisiontech.com
CORS_ORIGINS=https://mindvisiontech.com,https://www.mindvisiontech.com

# AWS S3 Storage
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=mindvisiontech-assets
AWS_S3_BUCKET_DOMAIN=mindvisiontech-assets.s3.ap-south-1.amazonaws.com
EOF

echo ">>> [5/5] Launching containers via Docker Compose..."
# For autoscaled app instances, launch client and server services
docker compose -f docker-compose.prod.yml up -d --build

echo ">>> Instance successfully initialized and ready for ALB traffic!"
