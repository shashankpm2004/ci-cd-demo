#!/usr/bin/env bash
# ==============================================================================
# AWS EC2 Setup Script for Automated CI/CD Pipeline
# Run this on your AWS EC2 instance (Ubuntu 22.04 or 24.04 LTS)
# ==============================================================================

set -e

echo "============================================="
echo " Setting up AWS EC2 Server for Docker CI/CD "
echo "============================================="

# 1. Update system packages
echo "[1/5] Updating system package index..."
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# 2. Add Docker's official GPG key and repository
echo "[2/5] Adding Docker official repository..."
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 3. Install Docker Engine, CLI, and containerd
echo "[3/5] Installing Docker engine..."
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4. Enable and start Docker service
echo "[4/5] Starting and enabling Docker service..."
sudo systemctl enable docker
sudo systemctl start docker

# 5. Add current user (usually 'ubuntu') to docker group
echo "[5/5] Granting Docker permissions to current user ($USER)..."
sudo usermod -aG docker $USER

echo "============================================="
echo " Docker setup complete!                      "
echo " IMPORTANT: Run 'newgrp docker' or logout and"
echo " re-SSH to apply group permissions.         "
echo "============================================="

