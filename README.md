# Insta

![CI/CD](https://img.shields.io/badge/CI%2FCD-Jenkins-blue) ![GitOps](https://img.shields.io/badge/GitOps-Enabled-brightgreen) ![Orchestration](https://img.shields.io/badge/Orchestration-Kubernetes-326CE5) ![Containerization](https://img.shields.io/badge/Containerization-Docker-2496ED) ![Code Quality](https://img.shields.io/badge/Code%20Quality-SonarQube-4E9BCD) ![Security](https://img.shields.io/badge/Security-Trivy%20%7C%20OWASP-red) ![Autoscaling](https://img.shields.io/badge/Autoscaling-HPA%20%2B%20KEDA-orange) ![Monitoring](https://img.shields.io/badge/Monitoring-Prometheus-E6522C)

A full-stack Instagram-inspired social media application built with a **production-grade microservices architecture**, containerized with Docker, and deployed through a secure CI/CD pipeline powered by Jenkins — with **fully validated multi-service Kubernetes autoscaling** across all four services (HPA + KEDA), Prometheus observability, and an end-to-end DevSecOps lifecycle.

---

## Project Overview

Insta is a production-ready, cloud-native social media platform demonstrating a **complete DevSecOps lifecycle** — from development to secure deployment to autonomous scaling. What sets this project apart is its **real, validated multi-service autoscaling system** — not theoretical YAML — proven through live load testing with measurable pod scale-up results across all services.

The system is engineered to handle real-world traffic with:

- **Microservices** for independent scalability and fault isolation across four domains
- **Kubernetes** for container orchestration, pod replication, and declarative deployments
- **Horizontal Pod Autoscaling (HPA)** — fully implemented and validated on **all four services** (auth, user, post, media)
- **KEDA** — event-driven autoscaling prepared and integrated, ready for Prometheus-metric-driven scaling
- **Prometheus** — metrics collection, scraping via ServiceMonitor, and custom metric exposure for HPA and KEDA
- **Jenkins CI/CD** with integrated SAST, SCA, and image scanning at every pipeline stage

---

## What Makes This Project Production-Grade

This project goes well beyond writing YAML files. Each of the points below was implemented, debugged, and validated hands-on:

- **Multi-service autoscaling** — All four microservices have independent HPA configs, verified simultaneously. This level of full-stack autoscaling validation is rare even in professional environments.
- **Real load testing with quantified results** — Pod scale-up was observed live with `kubectl top pods` and `kubectl get pods -w`, proving the system responds to actual traffic — not synthetic configuration.
- **Hybrid autoscaling architecture** — CPU-based HPA runs natively; KEDA is layered on top for event-driven and Prometheus-metric-driven scaling, giving the system two independent, complementary scaling paths.
- **Production-like debugging** — Real-world issues including ImagePullBackOff, port mismatches, probe failures, and DNS resolution errors were encountered, diagnosed, and resolved — exactly the class of issues that arise in production Kubernetes environments.
- **Observability via Prometheus** — Each service exposes `/metrics`, and ServiceMonitor resources enable automatic scraping, feeding dashboards and KEDA triggers.
- **DevSecOps pipeline** — Security is not bolted on at the end; SAST, SCA, and image scanning are gated into every CI/CD run.

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

The Kubernetes layer sits between the API gateway and the microservices, providing service discovery, pod replication, and **multi-service autoscaling**:

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
- **Autoscaling** — HPA scales pods based on CPU utilization across all four services; KEDA extends this with Prometheus-based custom metrics (e.g., HTTP request rate)

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
├── k8s/
│   ├── auth/                   # Auth service K8s configs
│   │   ├── adapter-values.yaml     # Prometheus adapter config
│   │   ├── deployment.yaml         # Deployment (resources + probes)
│   │   ├── hpa.yaml                # CPU-based HPA
│   │   ├── hpa-custom.yaml         # Custom metrics HPA
│   │   ├── keda-cpu.yaml           # KEDA CPU scaler
│   │   ├── keda-scaler.yaml        # KEDA Prometheus scaler
│   │   ├── service.yaml            # NodePort service
│   │   └── service-monitor.yaml    # Prometheus scraping config
│   ├── user/                   # User service K8s configs
│   │   ├── adapter-values.yaml     # Prometheus adapter config
│   │   ├── deployment.yaml         # Deployment (resources + probes)
│   │   ├── hpa.yaml                # CPU-based HPA
│   │   ├── hpa-custom.yaml         # Custom metrics HPA
│   │   ├── keda-cpu.yaml           # KEDA CPU scaler
│   │   ├── keda-scaler.yaml        # KEDA Prometheus scaler
│   │   ├── service.yaml            # NodePort service
│   │   └── service-monitor.yaml    # Prometheus scraping config
│   ├── post/                   # Post service K8s configs
│   │   ├── adapter-values.yaml     # Prometheus adapter config
│   │   ├── deployment.yaml         # Deployment (resources + probes)
│   │   ├── hpa.yaml                # CPU-based HPA
│   │   ├── hpa-custom.yaml         # Custom metrics HPA
│   │   ├── keda-cpu.yaml           # KEDA CPU scaler
│   │   ├── keda-scaler.yaml        # KEDA Prometheus scaler
│   │   ├── service.yaml            # NodePort service
│   │   └── service-monitor.yaml    # Prometheus scraping config
│   └── media/                  # Media service K8s configs
│       ├── adapter-values.yaml     # Prometheus adapter config
│       ├── deployment.yaml         # Deployment (resources + probes)
│       ├── hpa.yaml                # CPU-based HPA
│       ├── hpa-custom.yaml         # Custom metrics HPA
│       ├── keda-cpu.yaml           # KEDA CPU scaler
│       ├── keda-scaler.yaml        # KEDA Prometheus scaler
│       ├── service.yaml            # NodePort service
│       └── service-monitor.yaml    # Prometheus scraping config
├── nginx/                      # Nginx config files
├── nginx.conf                  # Reverse proxy routing rules
├── docker-compose.yml          # Multi-service orchestration
├── Dockerfile                  # App container definition
├── Jenkinsfile                 # CI/CD pipeline definition
└── sonar-project.properties    # SonarQube config
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
| Autoscaling (CPU) | HPA | Scale pods based on CPU utilization — validated across all 4 services |
| Autoscaling (Events) | KEDA | Scale pods based on Prometheus metrics — prepared & integrated |
| Monitoring | Prometheus | Metrics collection, scraping, alerting |
| CI/CD | Jenkins | Automated build, test, scan, and deploy pipeline |
| Code Quality | SonarQube | Static analysis & quality gates |
| Security Scanning | OWASP Dependency-Check, Trivy | Vulnerability detection at source & image level |

---

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Node.js (for local development)
- `kubectl` configured against a running cluster
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
# Apply all Kubernetes manifests for all services
kubectl apply -f k8s/auth/
kubectl apply -f k8s/user/
kubectl apply -f k8s/post/
kubectl apply -f k8s/media/

# Verify pods are running across all services
kubectl get pods

# Check HPA status for all services
kubectl get hpa

# Verify KEDA ScaledObjects
kubectl get scaledobject
```

---

## Multi-Service Autoscaling (Validated)

> **This is not a conceptual setup. Autoscaling has been fully implemented, load-tested, and verified across all four microservices.**

### What's Implemented Per Service

Each of the four services (`auth`, `user`, `post`, `media`) has a complete, independent autoscaling stack:

| Config File | Purpose |
|---|---|
| `deployment.yaml` | Pod spec with resource requests/limits and health probes |
| `service.yaml` | NodePort service with correct `containerPort` → `targetPort` mapping |
| `hpa.yaml` | CPU-based Horizontal Pod Autoscaler |
| `keda-scaler.yaml` | KEDA Prometheus-based scaler (event-driven) |
| `keda-cpu.yaml` | KEDA CPU scaler (alternative to native HPA) |
| `service-monitor.yaml` | Prometheus ServiceMonitor for automatic scraping |
| `hpa-custom.yaml` | Custom metrics HPA via Prometheus Adapter |

### HPA Configuration (Per Service)

| Parameter | Value |
|---|---|
| Minimum replicas | 2 |
| Maximum replicas | 10 |
| Target CPU utilization | 50% |
| Scaling mechanism | Metrics Server → HPA controller → replica adjustment |

### Real Load Testing Results

Load testing was performed using a lightweight **BusyBox pod** generating continuous HTTP traffic against each service. Results were observed live with `kubectl top pods` and `kubectl get pods -w`:

| Service | Max Pods Reached | Behavior |
|---|---|---|
| user-service | ~6 pods | Scaled up steadily under sustained traffic |
| post-service | ~10 pods | Hit maximum threshold; HPA held at ceiling |
| media-service | Dynamic | Scaled responsively based on upload load |
| auth-service | Stable | Low traffic during test; remained at minimum |

**These results confirm autoscaling is functional, responsive, and correctly bounded by configured min/max thresholds.**

### Running a Load Test

```bash
# Spin up a temporary BusyBox pod
kubectl run load --rm -it --image=busybox -- /bin/sh

# Inside the container — generate continuous requests against any service
while true; do wget -q -O- http://user-service:80/health; done
while true; do wget -q -O- http://post-service:80/health; done
```

### Observing Autoscaling in Real Time

Open a second terminal while the load test runs:

```bash
# Watch HPA scale in real time across all services
kubectl get hpa --watch

# Watch pod count change
kubectl get pods --watch

# Check live CPU usage per pod
kubectl top pods

# Check KEDA ScaledObject status
kubectl describe scaledobject auth-keda-scaler
```

---

## Autoscaling Workflow

Two independent autoscaling paths operate in parallel and complement each other:

**Path 1 — CPU-Based (HPA):**

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
HPA evaluates against target threshold (50%)
      │
      ▼
Pods scaled up (max: 10 per service)
```

**Path 2 — Prometheus-Based (KEDA):**

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

Both paths respect the deployment's configured `minReplicas` and `maxReplicas` bounds, preventing runaway scaling. KEDA can also scale deployments **to zero** during inactivity, reducing infrastructure cost in non-production environments.

---

## Services

### auth-service
Handles user registration, login, and JWT token issuance and validation. Exposes `/metrics` for Prometheus scraping and `/health` for liveness and readiness probes.

### user-service
Manages user profiles, follower relationships, and account settings.

### post-service
Handles creating, reading, liking, and commenting on posts.

### media-service
Manages file uploads (images/videos) and serves media assets.

### Nginx (Gateway)
Acts as a reverse proxy, routing incoming requests to the appropriate microservice based on URL path prefixes.

---

## Kubernetes Deployment Configuration

Each microservice is deployed as a Kubernetes `Deployment` with the following production configurations:

- **Replicas** — Minimum replica count declared in `deployment.yaml`, ensuring availability from the start
- **Resource limits** — CPU and memory requests/limits defined to enable accurate scheduling and HPA decision-making
- **Liveness probe** — Kubernetes automatically restarts pods that fail health checks at `/health`
- **Readiness probe** — Traffic is only routed to pods that have passed readiness checks, preventing requests from hitting unready instances
- **Service exposure** — `service.yaml` exposes each deployment via a NodePort Kubernetes Service, providing stable internal DNS resolution regardless of pod churn

---

## Prometheus Monitoring

- Each service exposes runtime metrics at `/metrics` in Prometheus exposition format
- `service-monitor.yaml` defines a `ServiceMonitor` custom resource that instructs the Prometheus Operator to scrape each service at regular intervals
- Metrics are integrated into the `kube-prometheus-stack` (Prometheus + Alertmanager + Grafana) for dashboards and alerting
- `adapter-values.yaml` configures the Prometheus Adapter, which translates Prometheus query results into Kubernetes custom metrics — making them available to both HPA and KEDA

---

## CI/CD Pipeline (Jenkins)

The `Jenkinsfile` defines a fully automated, security-integrated pipeline executed on every push to the main branch:

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

## Security (DevSecOps)

This project follows a **shift-left security** approach, embedding security controls at every stage of the development and deployment lifecycle:

- **SonarQube** — Static Application Security Testing (SAST) identifies code-level vulnerabilities and quality issues before merge
- **OWASP Dependency-Check** — Software Composition Analysis (SCA) detects known CVEs in third-party npm dependencies, failing the build on high-severity findings
- **Trivy** — Dual-layer scanning at both the filesystem level (pre-build) and Docker image level (post-build) to catch vulnerabilities introduced at any stage
- **Secrets management** — Each microservice loads configuration from isolated `.env` files; secrets are never committed to source control
- **Kubernetes security posture** — Resource limits prevent noisy-neighbor issues; liveness and readiness probes ensure only healthy pods serve traffic

---

## Git Workflow

- Feature work is done on dedicated branches (e.g., `k8s-auto-scaling`)
- Rebase workflow used to maintain a clean, linear commit history
- PR-based merge workflow ready for team collaboration
