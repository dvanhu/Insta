# Insta

![CI/CD](https://img.shields.io/badge/CI%2FCD-Jenkins-orange)
![GitOps](https://img.shields.io/badge/GitOps-Enabled-blue)
![Orchestration](https://img.shields.io/badge/Orchestration-Kubernetes-326CE5)
![Containerization](https://img.shields.io/badge/Containerization-Docker-2496ED)
![Autoscaling](https://img.shields.io/badge/Autoscaling-HPA%20%2B%20KEDA-brightgreen)
![Monitoring](https://img.shields.io/badge/Monitoring-Prometheus%20%2B%20Grafana-E6522C)
![Alerting](https://img.shields.io/badge/Alerting-Alertmanager%20%2B%20Gmail-yellow)
![Security](https://img.shields.io/badge/Security-DevSecOps-red)
![Code Quality](https://img.shields.io/badge/Code%20Quality-SonarQube-4E9BCD)

> A full-stack Instagram-inspired social media platform built on a **production-grade microservices architecture** — containerized with Docker, deployed through a secure Jenkins CI/CD pipeline, and featuring a **fully validated multi-service Kubernetes autoscaling system** (HPA + KEDA), a **complete observability stack** (Prometheus + Grafana + Alertmanager), **email-integrated alerting**, and an end-to-end DevSecOps lifecycle.

---

## Project Overview

**Insta** is a production-ready, cloud-native social media platform that demonstrates a complete DevSecOps lifecycle — from development through secure deployment to autonomous real-time scaling and full observability. This is a mid-to-advanced level DevOps project built with the same operational rigor expected in professional engineering environments.

What distinguishes this project is not the presence of configuration files — it is the depth of **hands-on implementation, real-world debugging, and validated outcomes** across every layer of the stack:

- **Microservices** — Independent scalability and fault isolation across four service domains
- **Kubernetes** — Container orchestration with rolling updates, health-checked deployments, and declarative manifests
- **HPA + KEDA** — Fully implemented, load-tested, and simultaneously validated autoscaling across all four services
- **Prometheus + Grafana + Alertmanager** — Full observability stack with custom dashboards, custom metrics, and automated email alerting
- **PrometheusRule-based alerting** — Three production-grade alert rules implemented, debugged, and verified end-to-end
- **Jenkins CI/CD** — Automated pipeline with integrated SAST, SCA, and dual-layer image scanning at every stage

---

## What Makes This Production-Grade

Every capability listed below was **implemented, debugged, and validated hands-on** — not imported from a tutorial and left untouched.

| Capability | Why It Matters |
|---|---|
| **Multi-service autoscaling** | All four microservices have independent, simultaneously validated HPA configs — rare even in professional environments |
| **Real load testing with quantified results** | Pod scale-up observed live with `kubectl top pods` and `kubectl get pods -w` — real traffic, not synthetic config |
| **Hybrid autoscaling (HPA + KEDA)** | CPU-based HPA natively + KEDA for Prometheus-driven event scaling — two independent, complementary scaling paths |
| **Full observability stack** | Prometheus, Grafana, and Alertmanager deployed and integrated — not just installed, but wired together with custom metrics and dashboards |
| **Email-integrated alerting** | Alertmanager configured with Gmail SMTP; HighTraffic, HighCPUUsage, and PodCrashLooping alerts fire and deliver to inbox |
| **GitOps-style monitoring architecture** | Monitoring configuration separated into purpose-specific folders; no secrets in repo; reproducible via script |
| **Operator-level Prometheus knowledge** | Debugged ServiceMonitor label mismatches, Helm config override conflicts, Prometheus Operator CR behavior — real issues with documented resolutions |
| **Production-like debugging** | ImagePullBackOff, port mismatches, probe failures, SMTP auth errors, PrometheusRule not triggering — all encountered, diagnosed, and resolved |
| **DevSecOps pipeline** | Security gated into every CI/CD run — SAST, SCA, and dual-layer image scanning before any deployment |

---

## Architecture Overview

### Application Layer

Traffic enters through Nginx as an API gateway and is routed to the appropriate microservice:

```
                        ┌─────────────────┐
                        │      Nginx      │  :80
                        │  (API Gateway)  │
                        └────────┬────────┘
               ┌─────────────────┼─────────────────┬─────────────────┐
               ▼                 ▼                 ▼                 ▼
        ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌─────────────┐
        │auth-service│   │user-service│   │post-service│   │media-service│
        └────────────┘   └────────────┘   └────────────┘   └─────────────┘
```

### Kubernetes Autoscaling Layer

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

### Observability & Alerting Layer

```
Microservice /metrics
        │
        ▼
Prometheus (scrape via ServiceMonitor)
        │
        ├──────────────────────► Grafana Dashboards
        │                         (RPS, CPU, Pod Scaling)
        │
        ▼
PrometheusRule Evaluation
        │
        ▼
Alertmanager
        │
        ▼
Gmail SMTP → Email Notification
```

- **Service-based routing** — Kubernetes Services expose each microservice via NodePort, abstracting pod IP churn
- **Dual-path autoscaling** — HPA scales pods on CPU; KEDA extends this with Prometheus custom metrics (HTTP request rate)
- **Unified observability** — Every service emits labeled metrics; Grafana visualizes per-service load; Alertmanager routes severity-based notifications

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
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── service-monitor.yaml
│   │   ├── hpa.yaml
│   │   ├── hpa-custom.yaml
│   │   ├── adapter-values.yaml
│   │   └── keda/
│   │       └── scaledobject.yaml
│   ├── user/                   # User service K8s configs (same structure)
│   ├── post/                   # Post service K8s configs (same structure)
│   ├── media/                  # Media service K8s configs (same structure)
│   └── monitoring/             # Full observability stack (GitOps-style)
│       ├── alertmanager/
│       │   ├── alertmanager.yaml   # Source of truth for Alertmanager config
│       │   └── setup.sh            # Automated Kubernetes Secret creation + restart
│       ├── dashboards/
│       │   └── insta-dashboard.json    # Grafana dashboard as code
│       ├── rules/
│       │   └── alerts.yaml         # PrometheusRule definitions
│       ├── helm/
│       │   └── values.yaml         # Clean Helm values (infra-only, no secrets)
│       └── namespace.yaml
├── nginx/
├── nginx.conf
├── docker-compose.yml
├── Dockerfile
├── Jenkinsfile
└── sonar-project.properties
```

### Monitoring Folder Design Philosophy

The `k8s/monitoring/` directory follows a strict GitOps-style separation of concerns:

| Directory | Contents | Rationale |
|---|---|---|
| `alertmanager/` | Config source + setup script | Runtime config managed via Kubernetes Secret, not Helm |
| `dashboards/` | JSON dashboard definitions | Dashboard as code — reproducible, version-controlled |
| `rules/` | PrometheusRule CRDs | Alert definitions decoupled from Helm lifecycle |
| `helm/` | Helm values file | Infrastructure-only defaults; no runtime secrets |

No secrets are stored in the repository. The `setup.sh` script accepts an `APP_PASSWORD` environment variable and creates the required Kubernetes Secret at deploy time.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | HTML, CSS, JavaScript | Client-side UI |
| Backend | Node.js (microservices) | Business logic per domain |
| Reverse Proxy | Nginx | API gateway & traffic routing |
| Containerization | Docker & Docker Compose | Service packaging & local orchestration |
| Orchestration | Kubernetes | Scheduling, replication, service discovery |
| Autoscaling (CPU) | HPA | Scale pods on CPU utilization — validated across all 4 services |
| Autoscaling (Events) | KEDA | Scale pods on Prometheus RPS metrics — fully integrated |
| Custom Metrics | prom-client (Node.js) | Per-service HTTP request counters exposed at `/metrics` |
| Metrics Collection | Prometheus | Scrapes all services via ServiceMonitor CRDs |
| Visualization | Grafana | Custom dashboards: RPS, CPU, pod scaling per service |
| Alerting | Alertmanager + Gmail SMTP | Alert routing and email delivery for HighTraffic, HighCPU, CrashLoop |
| Alert Rules | PrometheusRule CRD | Declarative, operator-managed alert definitions |
| CI/CD | Jenkins | Automated build, test, scan, and deploy pipeline |
| Code Quality | SonarQube | Static analysis & quality gates |
| Security Scanning | OWASP Dependency-Check, Trivy | CVE detection at source & image level |

---

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- `kubectl` configured against a running cluster
- Helm 3.x (for `kube-prometheus-stack` installation)

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

# Verify pods are running
kubectl get pods

# Check HPA status across all services
kubectl get hpa

# Verify KEDA ScaledObjects
kubectl get scaledobject
```

### Deploy Monitoring Stack

```bash
# Install kube-prometheus-stack via Helm
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  -f k8s/monitoring/helm/values.yaml

# Apply PrometheusRule alert definitions
kubectl apply -f k8s/monitoring/rules/alerts.yaml

# Configure Alertmanager with Gmail SMTP (no secrets in repo)
# Set your Gmail App Password before running
export APP_PASSWORD=your_gmail_app_password
bash k8s/monitoring/alertmanager/setup.sh

# Apply Grafana dashboard ConfigMap
kubectl apply -f k8s/monitoring/dashboards/
```

---

## Multi-Service Autoscaling (Validated)

> This is not a conceptual setup. Autoscaling has been **fully implemented, load-tested, and verified across all four microservices** — simultaneously.

### What's Implemented Per Service

Each of the four services (auth, user, post, media) has a complete, independent autoscaling stack:

| Config File | Purpose |
|---|---|
| `deployment.yaml` | Pod spec with resource requests/limits and health probes |
| `service.yaml` | NodePort service with correct `containerPort → targetPort` mapping |
| `hpa.yaml` | CPU-based Horizontal Pod Autoscaler |
| `keda/scaledobject.yaml` | KEDA Prometheus-based scaler (event-driven, per-service RPS) |
| `service-monitor.yaml` | Prometheus ServiceMonitor for automatic scraping |
| `hpa-custom.yaml` | Custom metrics HPA via Prometheus Adapter |

### HPA Configuration (All Services)

| Parameter | Value |
|---|---|
| Minimum replicas | 2 |
| Maximum replicas | 10 |
| Target CPU utilization | 50% |
| Scaling mechanism | Metrics Server → HPA controller → replica adjustment |

### Real Load Testing Results

Load testing was performed using a BusyBox pod generating continuous HTTP traffic against each service. Results observed live with `kubectl top pods` and `kubectl get pods -w`:

| Service | Max Pods Reached | Observed Behavior |
|---|---|---|
| `user-service` | ~6 pods | Scaled up steadily under sustained traffic |
| `post-service` | ~10 pods | Hit maximum threshold; HPA correctly held at ceiling |
| `media-service` | Dynamic | Scaled responsively based on upload load |
| `auth-service` | Stable | Low traffic during test; remained at configured minimum |

These results confirm autoscaling is functional, responsive, and correctly bounded by configured `minReplicas`/`maxReplicas` thresholds.

### Running a Load Test

```bash
# Spin up a temporary BusyBox pod
kubectl run load --rm -it --image=busybox -- /bin/sh

# Inside the container — generate continuous requests against any service
while true; do wget -q -O- http://user-service:80/health; done
while true; do wget -q -O- http://post-service:80/health; done
```

### Observing Autoscaling in Real Time

```bash
# Watch HPA scale in real time across all services
kubectl get hpa --watch

# Watch pod count change dynamically
kubectl get pods --watch

# Check live CPU usage per pod
kubectl top pods

# Inspect KEDA ScaledObject status
kubectl describe scaledobject auth-keda-scaler
```

### Autoscaling Workflow

Two independent autoscaling paths operate in parallel:

**Path 1 — CPU-Based (HPA):**
```
Traffic Increase → CPU Utilization Rises
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
Traffic Increase → /metrics endpoint increments http_requests_total
      │
      ▼
Prometheus scrapes metric via ServiceMonitor
      │
      ▼
KEDA queries Prometheus via ScaledObject
      │
      ▼
Pods scaled based on real-time RPS threshold
```

Both paths respect the deployment's configured `minReplicas` and `maxReplicas` bounds. KEDA can also scale deployments **to zero** during inactivity — a capability native HPA does not support, making it valuable for cost optimization in non-production environments.

---

## Event-Driven Autoscaling with KEDA

> CPU-based HPA reacts to *symptoms*. KEDA reacts to *causes*.

### Why CPU-Based HPA Falls Short

CPU utilization is a lagging indicator — by the time pods are stressed enough to cross the scaling threshold, users are already experiencing latency. CPU spikes also occur for reasons unrelated to traffic (garbage collection, background jobs), triggering unnecessary scale-ups. For a request-driven system, **request rate is a far more accurate and proactive scaling signal**.

### KEDA Integration Flow

```
Service → /metrics → Prometheus → KEDA ScaledObject → HPA → Pods
```

KEDA reads a PromQL query, evaluates the result against a configured threshold, and dynamically manages an HPA object — no manual HPA tuning required. Each service has its own dedicated ScaledObject under `k8s/<service>/keda/scaledobject.yaml`.

### Prometheus Trigger Query (Per Service)

```promql
sum(rate(http_requests_total{service="media-service"}[1m]))
```

This computes the real-time requests-per-second rate for a specific service over a 1-minute rolling window. The `service` label isolates the metric to a single microservice, enabling fully independent scaling per service.

### Threshold-Based Scaling Behavior

| RPS Range | Target Pods | Behavior |
|-----------|-------------|----------|
| 0 – 100 | 2 | Minimum replicas, idle state |
| 100 – 200 | 4 | Moderate load scale-up |
| 200 – 300 | 6 | Sustained traffic response |
| 300+ | 10 | Peak load, ceiling enforced |

---

## Observability & Alerting Architecture

### End-to-End Flow

```
Microservice /metrics endpoint
        │
        ▼
Prometheus (scrape interval via ServiceMonitor CRD)
        │
        ├─────────────────────────────► Grafana
        │                                  │
        │                         ┌────────┴────────┐
        │                         │   Dashboards    │
        │                         │  - Total RPS    │
        │                         │  - Per-service  │
        │                         │  - Pod scaling  │
        │                         │  - CPU usage    │
        │                         └─────────────────┘
        │
        ▼
PrometheusRule Evaluation
  - HighTraffic
  - HighCPUUsage
  - PodCrashLooping
        │
        ▼
Alertmanager
        │
        ▼
Gmail SMTP → Email Notification
```

Every component in this pipeline was implemented, integrated, and validated. Alerts were triggered against live cluster state and confirmed delivered to a Gmail inbox.

---

## Prometheus Monitoring

Each microservice exposes runtime metrics at `/metrics` using `prom-client`, including the custom `http_requests_total` counter labeled per service.

`service-monitor.yaml` defines a `ServiceMonitor` custom resource that instructs the Prometheus Operator to scrape each service at regular intervals. ServiceMonitors carry `release: monitoring` and `app: <service>` labels to satisfy the Prometheus Operator's `serviceMonitorSelector` — a requirement validated through real debugging (see [Production-Level Debugging](#production-level-debugging)).

`adapter-values.yaml` configures the Prometheus Adapter, translating Prometheus query results into Kubernetes custom metrics — available to both HPA and KEDA.

---

## Grafana Dashboards

Four dedicated dashboards are implemented and stored as code in `k8s/monitoring/dashboards/insta-dashboard.json`:

| Dashboard Panel | Metric Source | Purpose |
|---|---|---|
| Total RPS (cluster-wide) | `sum(rate(http_requests_total[1m]))` | Aggregate traffic view |
| Per-service RPS | `rate(http_requests_total{service="..."}[1m])` | Independent service load |
| Pod scaling over time | `kube_deployment_status_replicas` | Correlate traffic with autoscaling response |
| CPU usage per pod | `container_cpu_usage_seconds_total` | HPA trigger visibility |

Dashboards are stored as JSON under version control, making them reproducible and deployable as a Kubernetes ConfigMap — no manual Grafana configuration required after cluster setup.

---

## Alerting System

Three production-grade alert rules are implemented via `PrometheusRule` CRD in `k8s/monitoring/rules/alerts.yaml`:

| Alert | Condition | Severity | Purpose |
|---|---|---|---|
| `HighTraffic` | RPS exceeds configured threshold | warning | Detect traffic surges before HPA reaches ceiling |
| `HighCPUUsage` | Pod CPU above 80% for sustained period | warning | Identify CPU-bound services before user impact |
| `PodCrashLooping` | `kube_pod_container_status_restarts_total` rate elevated | critical | Immediate notification on destabilizing pods |

### Alertmanager Gmail Integration

Alertmanager is configured to route all firing alerts to Gmail via SMTP. The configuration is managed as a Kubernetes Secret — never committed to source control.

```bash
# setup.sh creates the Kubernetes Secret from environment variable
export APP_PASSWORD=your_gmail_app_password
bash k8s/monitoring/alertmanager/setup.sh
```

`alertmanager.yaml` in the repository contains the full configuration with `APP_PASSWORD` as a placeholder — the source of truth for structure and routing logic, safe to version control.

### Why Kubernetes Secret (Not Helm values)

The Prometheus Operator manages Alertmanager configuration via a dedicated Kubernetes Secret (`alertmanager-monitoring-kube-prometheus-alertmanager`). Helm `values.yaml` overrides for `alertmanager.config` are silently ignored when the operator is running — a subtle but critical behavior that was debugged and resolved. The correct pattern is to create or patch the Secret directly, which `setup.sh` automates.

---

## Custom Metrics Implementation

Each microservice exposes a `/metrics` endpoint using the Node.js `prom-client` library. A lightweight Express middleware intercepts every incoming request and increments a labeled counter:

```js
const client = require('prom-client');

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests received',
  labelNames: ['service'],
});

// Middleware — runs on every request
app.use((req, res, next) => {
  httpRequestsTotal.inc({ service: 'user-service' });
  next();
});

// Prometheus scrape endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
```

### Per-Service Labeling Strategy

Every metric emission is labeled with its originating service name:

```
http_requests_total{service="auth-service"}
http_requests_total{service="user-service"}
http_requests_total{service="post-service"}
http_requests_total{service="media-service"}
```

This labeling strategy is foundational for three reasons:

| Reason | Why It Matters |
|--------|----------------|
| **Isolation** | Prometheus can query each service independently without aggregation noise |
| **Per-service scaling** | Each KEDA ScaledObject filters on its own `service` label — no cross-contamination |
| **Accurate alerting** | Dashboards and alerts reflect individual service load, not cluster-wide averages |

Without labels, all four services merge into a single undifferentiated counter, making per-service KEDA triggers and meaningful dashboards impossible.

---

## Kubernetes Deployment Configuration

Each microservice is deployed with the following production-grade configurations:

- **Replicas** — Minimum replica count declared in `deployment.yaml`, ensuring availability from the start
- **Resource limits** — CPU and memory requests/limits defined to enable accurate scheduling and HPA decision-making
- **Liveness probe** — Kubernetes automatically restarts pods that fail health checks at `/health`
- **Readiness probe** — Traffic only routes to pods that have passed readiness checks, preventing requests from hitting unready instances
- **Service exposure** — `service.yaml` exposes each deployment via NodePort, providing stable internal DNS regardless of pod churn

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

### Git Workflow

Work is done on the `k8s-auto-scaling` feature branch, using a **rebase workflow** to maintain a clean, linear commit history. All changes are introduced through pull requests — matching the GitOps workflows used in production engineering teams.

---

## Security (DevSecOps)

This project follows a **shift-left security** approach, embedding security controls at every stage of the development and deployment lifecycle:

- **SonarQube** — Static Application Security Testing (SAST) identifies code-level vulnerabilities and quality issues before merge
- **OWASP Dependency-Check** — Software Composition Analysis (SCA) detects known CVEs in third-party npm dependencies, failing the build on high-severity findings
- **Trivy** — Dual-layer scanning at both the filesystem level (pre-build) and Docker image level (post-build) to catch vulnerabilities introduced at any stage
- **Secrets management** — Each microservice loads configuration from isolated `.env` files; Alertmanager SMTP credentials are stored as Kubernetes Secrets; no secrets are committed to source control
- **Kubernetes security posture** — Resource limits prevent noisy-neighbor issues; liveness and readiness probes ensure only healthy pods serve traffic

---

## Production-Level Debugging

A significant part of this project's value lies in the real operational issues encountered and resolved. These are not edge cases — they represent the class of problems that distinguish engineers who have run production systems from those who have only read about them.

### Autoscaling & Metrics

| Issue | Root Cause | Resolution |
|---|---|---|
| HPA not scaling despite load | Metrics Server not installed; no CPU data available | Installed Metrics Server; confirmed `kubectl top pods` output before testing HPA |
| KEDA ScaledObject not triggering | ServiceMonitor label mismatch; Prometheus not scraping the service | Aligned `release` and `app` labels across ServiceMonitor and Prometheus Operator CR selector |
| Custom HPA not finding metrics | Prometheus Adapter not configured; metrics not available in `custom.metrics.k8s.io` | Configured `adapter-values.yaml`; verified with `kubectl get --raw /apis/custom.metrics.k8s.io/v1beta1` |
| ImagePullBackOff on deployment | Incorrect image tag or registry reference in `deployment.yaml` | Corrected image reference; verified with `kubectl describe pod` |

### Prometheus & Observability

| Issue | Root Cause | Resolution |
|---|---|---|
| ServiceMonitor not scraping | Label key casing error (`App` vs `app`) in ServiceMonitor metadata | Corrected label casing; confirmed targets in Prometheus UI under `/targets` |
| PrometheusRule alerts not triggering | Rule not picked up by Prometheus Operator due to missing `release` label | Added `release: monitoring` label to PrometheusRule metadata to match `ruleSelector` |
| Metrics endpoint returning 404 | `/metrics` route registered after middleware in Express | Moved route registration before conflicting catch-all middleware |

### Alertmanager & Email

| Issue | Root Cause | Resolution |
|---|---|---|
| Alertmanager config silently ignored | Prometheus Operator manages config via dedicated Kubernetes Secret; Helm `alertmanager.config` key has no effect when operator is active | Switched to direct Secret creation via `setup.sh`; patched `alertmanager-monitoring-kube-prometheus-alertmanager` Secret |
| SMTP authentication failure | Gmail App Password not correctly base64-encoded in Secret | Re-encoded credential; verified with `kubectl get secret ... -o jsonpath` |
| Helm values not applying | `helm upgrade` missing `--reuse-values` flag; partial override silently reverted config | Adopted explicit `values.yaml` file passed with `-f` on every upgrade |

---

## Key Engineering Learnings

- **Label consistency is foundational** — A single label casing error (`App` vs `app`) silently broke Prometheus scraping across all services; Kubernetes observability has zero tolerance for label mismatches across CRD selectors
- **Operator-managed components require operator-aware configuration** — The Prometheus Operator owns its Alertmanager Secret; Helm values are for bootstrapping, not for runtime configuration of operator-managed resources
- **Metrics-driven scaling outperforms CPU-based scaling** — Request rate directly represents user-facing load; CPU is a downstream symptom that introduces unnecessary lag into scaling decisions
- **PrometheusRule label alignment is non-negotiable** — `ruleSelector` on the Prometheus CR must match labels on every `PrometheusRule`; missing this is the most common silent failure point in operator-based setups
- **KEDA abstracts HPA complexity** — Rather than managing HPA objects directly, KEDA dynamically creates and updates them based on ScaledObject configuration, keeping scaling logic declarative and version-controlled
- **Load testing is validation, not optional** — Autoscaling configs that look correct on paper can fail in practice due to resource misconfigurations, probe timing, or metric scraping delays; real traffic is the only proof
- **Scale-to-zero is a cost discipline** — KEDA's ability to scale to zero replicas during inactivity is architecturally significant; native HPA enforces a minimum of 1 pod, which accumulates cost silently across many services
- **Dashboard as code compounds in value** — Storing Grafana dashboards as JSON under version control means any cluster rebuild requires zero manual reconfiguration; the observability layer is as reproducible as the application itself
- **Separation of concerns in monitoring config** — Splitting Helm values (infra defaults), Kubernetes Secrets (runtime credentials), and PrometheusRule CRDs (alert logic) into distinct concerns makes the system easier to audit, update, and hand off
