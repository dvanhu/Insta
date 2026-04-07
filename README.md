# Insta 
![CI/CD](https://img.shields.io/badge/CI%2FCD-Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white)
![GitOps](https://img.shields.io/badge/GitOps-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![Orchestration](https://img.shields.io/badge/Orchestration-Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![Containerization](https://img.shields.io/badge/Containerization-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Code Quality](https://img.shields.io/badge/Code%20Quality-SonarQube-4E9BCD?style=for-the-badge&logo=sonarqube&logoColor=white)
![Security](https://img.shields.io/badge/Security-OWASP-000000?style=for-the-badge&logo=owasp&logoColor=white)
![Scanner](https://img.shields.io/badge/Scanner-Trivy-1904DA?style=for-the-badge&logo=aqua&logoColor=white)
![Autoscaling](https://img.shields.io/badge/Autoscaling-KEDA-FF6A00?style=for-the-badge&logo=kubernetes&logoColor=white)
![Monitoring](https://img.shields.io/badge/Monitoring-Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white)

A full-stack Instagram-inspired social media application built with a **microservices architecture**, containerized with Docker, and deployed through a **secure CI/CD pipeline** powered by Jenkins — with **Kubernetes-based autoscaling**, **HPA**, **KEDA event-driven scaling**, and **Prometheus monitoring** for production-grade observability and resilience.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Services](#services)
- [Kubernetes Deployment & Autoscaling](#kubernetes-deployment--autoscaling)
- [Autoscaling Workflow](#autoscaling-workflow)
- [Load Testing](#load-testing)
- [CI/CD Pipeline](#cicd-pipeline-jenkins)
- [Security](#security)
- [Resume Highlight](#resume-highlight)

---

## Project Overview

Insta is a production-ready, cloud-native social media platform demonstrating a full DevSecOps lifecycle — from development to secure deployment to autonomous scaling. The system is designed to handle real-world traffic with:

- **Microservices** for independent service scalability and fault isolation
- **Kubernetes** for container orchestration, pod replication, and declarative deployments
- **Horizontal Pod Autoscaling (HPA)** for CPU-driven dynamic scaling
- **KEDA** for event-driven autoscaling based on Prometheus metrics (e.g., request rate)
- **Prometheus** for metrics collection, monitoring, and alerting integration
- **Jenkins CI/CD** with integrated SAST, SCA, and image scanning at every pipeline stage

---

## Architecture Overview

### Application Layer

Traffic enters through Nginx as an API gateway and is routed to the appropriate microservice:

```
                        ┌─────────────────┐
                        │      Nginx      │  :80
                        │  (API Gateway)  │
                        └────────┬────────┘
               ┌─────────────────┼─────────────────┐
               ▼                 ▼                 ▼                 ▼
        ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌─────────────┐
        │auth-service│   │user-service│   │post-service│   │media-service│
        └────────────┘   └────────────┘   └────────────┘   └─────────────┘
```

### Kubernetes Layer

The Kubernetes layer sits between the API gateway and the microservices, providing service discovery, pod replication, and autoscaling:

```
User → Nginx → Kubernetes Service → Pods (Microservices)
                                         │
                              ┌──────────┴──────────┐
                              ▼                     ▼
                        HPA / KEDA           Metrics Server
                              │                     │
                              └──────────┬──────────┘
                                         ▼
                                     Prometheus
```

- **Service-based routing** — Kubernetes Services expose each microservice internally via NodePort, abstracting pod IP changes
- **Pod replication** — Each deployment maintains a configurable replica count with rolling update support
- **Autoscaling** — HPA scales pods based on CPU utilization; KEDA extends this with Prometheus-based custom metrics (e.g., HTTP request rate)

---

## Project Structure

```
Insta/
├── Backend/
│   ├── auth-service/           # Authentication & JWT handling
│   ├── user-service/           # User profiles & relationships
│   ├── post-service/           # Posts, likes, comments
│   └── media-service/          # Image/video upload & storage
├── Frontend/                   # Client-side app (JavaScript/HTML/CSS)
└── k8s/
    └── auth/                   # Kubernetes autoscaling & monitoring configs
        ├── adapter-values.yaml     # Prometheus adapter config (custom metrics)
        ├── deployment.yaml         # Auth service deployment (with probes + resources)
        ├── hpa.yaml                # CPU-based autoscaling
        ├── hpa-custom.yaml         # Custom metrics HPA
        ├── keda-cpu.yaml           # KEDA CPU scaler
        ├── keda-scaler.yaml        # KEDA Prometheus-based autoscaling
        ├── service.yaml            # Kubernetes service (NodePort)
        └── service-monitor.yaml    # Prometheus scraping config
├── nginx/                      # Nginx config files
├── nginx.conf                  # Reverse proxy routing rules
├── docker-compose.yml          # Multi-service orchestration
├── Dockerfile                  # App container definition
├── Jenkinsfile                 # CI/CD pipeline definition
├── sonar-project.properties    # SonarQube code quality config

```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | HTML, CSS, JavaScript | Client-side UI |
| Backend | Node.js (microservices) | Business logic per domain |
| Reverse Proxy | Nginx | API gateway & traffic routing |
| Containerization | Docker & Docker Compose | Service packaging & local orchestration |
| Orchestration | Kubernetes | Container scheduling, replication, service discovery |
| Autoscaling (CPU) | HPA | Scale pods based on CPU utilization |
| Autoscaling (Events) | KEDA | Scale pods based on Prometheus metrics |
| Monitoring | Prometheus | Metrics collection, scraping, alerting |
| CI/CD | Jenkins | Automated build, test, scan, and deploy pipeline |
| Code Quality | SonarQube | Static analysis & code quality gates |
| Security Scanning | OWASP Dependency-Check, Trivy | Vulnerability detection at source & image level |

---

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Node.js (for local development)
- `kubectl` configured against a running cluster (for Kubernetes deployment)
- Helm (for kube-prometheus-stack installation)

### Run Locally with Docker Compose

```bash
# Clone the repository
git clone https://github.com/dvanhu/Insta.git
cd Insta

# Create .env files for each service
touch Backend/auth-service/.env
touch Backend/user-service/.env
touch Backend/post-service/.env
touch Backend/media-service/.env

# Start all services
docker-compose up --build
```

The application will be available at `http://localhost`.

### Deploy to Kubernetes

```bash
# Apply all Kubernetes manifests for the auth service
kubectl apply -f k8s/auth/

# Verify pods are running
kubectl get pods

# Check HPA status
kubectl get hpa

# Verify KEDA ScaledObjects
kubectl get scaledobject
```

---

## Services

### auth-service
Handles user registration, login, and JWT token issuance and validation. Exposes a `/metrics` endpoint for Prometheus scraping and `/health` for liveness and readiness probes.

### user-service
Manages user profiles, follower relationships, and account settings.

### post-service
Handles creating, reading, liking, and commenting on posts.

### media-service
Manages file uploads (images/videos) and serves media assets.

### Nginx (Gateway)
Acts as a reverse proxy, routing incoming requests to the appropriate microservice based on URL path prefixes.

---

## Kubernetes Deployment & Autoscaling

### Kubernetes Setup

Each microservice is deployed as a Kubernetes `Deployment` with the following production configurations:

- **Replicas** — Minimum replica count is declared in `deployment.yaml`, ensuring high availability from the start
- **Resource limits** — CPU and memory requests/limits are defined to enable accurate scheduling and HPA decision-making
- **Liveness probe** — Kubernetes automatically restarts pods that fail health checks at `/health`
- **Readiness probe** — Traffic is only routed to pods that have passed their readiness check, preventing requests from hitting unready instances
- **Service exposure** — `service.yaml` exposes each deployment via a `NodePort` Kubernetes Service, providing stable internal DNS resolution regardless of pod churn

### HPA — Horizontal Pod Autoscaler

`hpa.yaml` configures CPU-based autoscaling for the auth service:

- **Minimum replicas:** 2
- **Maximum replicas:** 10
- **Target CPU utilization:** Configurable threshold (e.g., 50%)
- **Scaling mechanism:** The `metrics-server` collects real-time CPU data from each pod. When average utilization exceeds the threshold, HPA increases the replica count. When load drops, it scales back down respecting the minimum floor.

`hpa-custom.yaml` extends this with custom metric thresholds sourced from Prometheus via the Prometheus Adapter.

### Prometheus Monitoring

- Each service exposes runtime metrics at the `/metrics` endpoint in Prometheus exposition format
- `service-monitor.yaml` defines a `ServiceMonitor` custom resource that instructs the Prometheus Operator to scrape the service at regular intervals
- Metrics are integrated into the `kube-prometheus-stack` (Prometheus + Alertmanager + Grafana) for dashboards and alerting
- `adapter-values.yaml` configures the Prometheus Adapter, which translates Prometheus query results into Kubernetes custom metrics API — making them available to both HPA and KEDA

### KEDA — Event-Driven Autoscaling

KEDA (Kubernetes Event-Driven Autoscaler) extends Kubernetes with autoscaling based on external event sources, going beyond what native HPA supports:

- `keda-cpu.yaml` — A KEDA `ScaledObject` using the built-in CPU trigger as an alternative to native HPA
- `keda-scaler.yaml` — A KEDA `ScaledObject` driven by a live Prometheus query (e.g., `rate(http_requests_total[1m])`), scaling pods based on incoming request rate rather than resource consumption
- KEDA can scale deployments to **zero** during inactivity, reducing infrastructure cost in non-production environments

---

## Autoscaling Workflow

Two parallel autoscaling paths operate independently and complement each other:

**Path 1 — CPU-based (HPA):**
```
Traffic Increase
      │
      ▼
CPU Utilization Rises
      │
      ▼
Metrics Server collects pod CPU data
      │
      ▼
HPA evaluates against target threshold
      │
      ▼
Pods scaled up (max: 10)
```

**Path 2 — Prometheus-based (KEDA):**
```
Traffic Increase
      │
      ▼
Request rate captured in Prometheus
      │
      ▼
KEDA queries Prometheus via ScaledObject
      │
      ▼
KEDA triggers scale-up event
      │
      ▼
Pods scaled based on request rate metric
```

Both paths respect the deployment's configured `minReplicas` and `maxReplicas` bounds, preventing runaway scaling.

---

## Load Testing

Load testing is performed using a lightweight `BusyBox` pod to simulate continuous traffic against the auth service and observe autoscaling behavior in real time.

### Running a Load Test

```bash
# Spin up a temporary BusyBox container
kubectl run load --rm -it --image=busybox -- /bin/sh

# Inside the container — generate continuous requests
while true; do wget -q -O- http://auth-service:80/health; done
```

### Observing Autoscaling

While the load test runs, monitor pod and HPA behavior in a separate terminal:

```bash
# Watch HPA scale in real time
kubectl get hpa --watch

# Watch pod count change
kubectl get pods --watch

# Check KEDA ScaledObject status
kubectl describe scaledobject auth-keda-scaler
```

As request load increases, CPU and/or request-rate metrics cross their thresholds, triggering HPA or KEDA to provision additional pods. When the BusyBox pod is terminated and traffic drops, the pod count scales back down to the minimum.

---

## CI/CD Pipeline (Jenkins)

The `Jenkinsfile` defines a fully automated, security-integrated pipeline executed on every push to the `main` branch:

| Stage | Description |
|---|---|
| Checkout Code | Pulls the latest commit from the main branch |
| Install Dependencies | Runs `npm install` in the Frontend directory |
| SonarQube Analysis | Static code analysis for bugs, code smells, and security hotspots |
| Quality Gate | Blocks the pipeline if code quality standards are not met |
| OWASP Dependency Check | Scans for known CVEs in third-party libraries (fails on CVSS ≥ 7) |
| Trivy Filesystem Scan | Scans source files for HIGH and CRITICAL vulnerabilities |
| Docker Build | Builds the application Docker image |
| Trivy Image Scan | Scans the final Docker image for HIGH and CRITICAL vulnerabilities |
| Deploy Container | Runs the container and exposes it on port 3000 |

Dependency check reports are archived as build artifacts after every pipeline run for audit and compliance purposes.

---

## Security

This project follows a **DevSecOps** approach, embedding security controls at every stage of the development and deployment lifecycle:

- **SonarQube** — Static Application Security Testing (SAST) identifies code-level vulnerabilities and quality issues before merge
- **OWASP Dependency-Check** — Software Composition Analysis (SCA) detects known CVEs in third-party npm dependencies, failing the build on high-severity findings
- **Trivy** — Dual-layer scanning at both the filesystem level (pre-build) and Docker image level (post-build) to catch vulnerabilities introduced at any stage
- **Secrets management** — Each microservice loads configuration from isolated `.env` files; secrets are never committed to source control
- **Kubernetes security posture** — Resource limits prevent noisy-neighbor issues; liveness and readiness probes ensure only healthy pods serve traffic
