# Automated CI/CD Pipeline with AWS and GitHub Actions

> **Academic Project Implementation**  
> **Student:** Shashank P M (USN: `4JN25MC089`)  
> **Department:** Department of Master of Computer Applications (MCA)  
> **Institution:** Jawaharlal Nehru New College of Engineering (JNNCE), Shivamogga  
> **Affiliation:** Visvesvaraya Technological University (VTU), Belagavi  
> **Guide:** Mr. Prashant Ankalkoti (Assistant Professor)  
> **Reference Repository:** [mchandhan/github-actions](https://github.com/mchandhan/github-actions)

---

## 📌 Project Overview
This project implements an industry-standard, fully automated **Continuous Integration and Continuous Deployment (CI/CD)** pipeline for a Node.js microservice based on Docker, GitHub Actions, and an AWS EC2 Linux server.

On every push to the `main` branch:
1. **Testing Stage:** Starts the Node.js application and validates the response using curl. Fails fast if the application is unreachable.
2. **Build Stage:** Builds the Docker image, tags it with `:latest` and the unique commit SHA (`${{ github.sha }}`) for traceability, and pushes both to DockerHub.
3. **Deployment Stage:** Securely SSHs into the remote AWS EC2 Linux server, pulls the latest Docker image, replaces the old container, performs a live post-deployment health check, and cleans up unused Docker images.

---

## 🏗️ Architecture & Configuration

* **Workflow File:** `.github/workflows/deploy.yml`
* **Docker Image Name:** `newapp` (`${{ secrets.DOCKER_USERNAME }}/newapp:latest`)
* **Container Name:** `newapp-container`
* **Port:** `3000` (mapped `3000:3000`)
* **Base Image:** `node:18`

```
[ Git Push to main ] 
         │
         ▼
[ GitHub Actions (.github/workflows/deploy.yml) ]
         │
         ├── 1. Testing Stage (test)
         │       • node app.js &
         │       • curl -f http://localhost:3000
         │       • Fail-fast on error
         │
         ├── 2. Build Stage (build)
         │       • docker build -t newapp:latest .
         │       • docker tag with :latest and :<commit-sha>
         │       • docker push to DockerHub
         │
         └── 3. Deployment Stage (deploy)
                 • SSH to AWS EC2
                 • docker pull <username>/newapp:latest
                 • Stop and remove 'newapp-container'
                 • docker run -d -p 3000:3000 --name newapp-container
                 • Verify: curl -f http://localhost:3000
                 • docker image prune -f
```

---

## 📂 Repository Structure

```
automated-cicd-pipeline/
├── .github/
│   └── workflows/
│       └── deploy.yml         # 3-Stage CI/CD pipeline (Test -> Build -> Deploy)
├── scripts/
│   ├── test.sh                # Local test runner script
│   └── ec2-setup.sh           # AWS EC2 Docker environment provisioner
├── .dockerignore              # Files excluded from Docker builds
├── .gitignore                 # Files excluded from Git tracking
├── Dockerfile                 # Docker image configuration (node:18 base)
├── app.js                     # Lightweight HTTP microservice
├── package.json               # Node.js project manifest
├── start.sh                   # One-click local startup script
└── README.md                  # Complete documentation
```

---

## 🔑 Required GitHub Secrets

Add the following 5 secrets under:  
**Repository → Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Example Value | Description |
| :--- | :--- | :--- |
| `DOCKER_USERNAME` | `your_dockerhub_user` | Your DockerHub username |
| `DOCKER_PASSWORD` | `dckr_pat_...` | DockerHub Personal Access Token (or password) |
| `SERVER_HOST` | `13.233.xx.xx` | AWS EC2 Public IPv4 Address |
| `SERVER_USER` | `ubuntu` | Remote server username (default for Ubuntu AMI) |
| `SERVER_SSH_KEY` | `-----BEGIN RSA...` | Full private key content (`.pem` file) |

---

## 🚀 Quick Start & Local Execution

### 1. Run Locally
To test the server on your local machine:
```bash
cd /Users/shashankpm/Desktop/automated-cicd-pipeline
./start.sh
```
Open your browser to [http://localhost:3000/](http://localhost:3000/) or [http://localhost:3000/health](http://localhost:3000/health).

### 2. Push to GitHub
```bash
git add .
git commit -m "feat: integrate full CI/CD pipeline from mchandhan/github-actions"
git push origin main
```
