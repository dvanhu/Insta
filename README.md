# Insta

A full-stack Instagram-inspired social media application built with a **microservices architecture**, containerized with Docker, and deployed through a secure CI/CD pipeline powered by Jenkins.

---

## Architecture Overview

The application is split into independent backend microservices, a frontend client, and an Nginx reverse proxy that routes traffic between them.

```
                        ┌─────────────┐
                        │    Nginx    │  :80
                        │ (API Gateway)│
                        └──────┬──────┘
               ┌───────────────┼───────────────┐
               ▼               ▼               ▼               ▼
        ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
        │auth-service│  │user-service│  │post-service│  │media-service│
        └────────────┘  └────────────┘  └────────────┘  └────────────┘
```

---

## Project Structure

```
Insta/
├── Backend/
│   ├── auth-service/       # Authentication & JWT handling
│   ├── user-service/       # User profiles & relationships
│   ├── post-service/       # Posts, likes, comments
│   └── media-service/      # Image/video upload & storage
├── Frontend/               # Client-side app (JavaScript/HTML/CSS)
├── nginx/                  # Nginx config files
├── nginx.conf              # Reverse proxy routing rules
├── docker-compose.yml      # Multi-service orchestration
├── Dockerfile              # App container definition
├── Jenkinsfile             # CI/CD pipeline definition
└── sonar-project.properties # SonarQube code quality config
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js (microservices) |
| Reverse Proxy | Nginx |
| Containerization | Docker & Docker Compose |
| CI/CD | Jenkins |
| Code Quality | SonarQube |
| Security Scanning | OWASP Dependency-Check, Trivy |

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose installed
- Node.js (for local development)

### Run with Docker Compose

1. Clone the repository:
   ```bash
   git clone https://github.com/dvanhu/Insta.git
   cd Insta
   ```

2. Create `.env` files for each service:
   ```
   Backend/auth-service/.env
   Backend/user-service/.env
   Backend/post-service/.env
   Backend/media-service/.env
   ```

3. Start all services:
   ```bash
   docker-compose up --build
   ```

4. The application will be available at `http://localhost`

---

## Services

### auth-service
Handles user registration, login, and JWT token issuance/validation.

### user-service
Manages user profiles, followers, and following relationships.

### post-service
Handles creating, reading, liking, and commenting on posts.

### media-service
Manages file uploads (images/videos) and serves media assets.

### Nginx (Gateway)
Acts as a reverse proxy, routing incoming requests to the appropriate microservice based on path prefixes.

---

## CI/CD Pipeline (Jenkins)

The `Jenkinsfile` defines a fully automated pipeline with the following stages:

1. **Checkout Code** — Pulls the latest code from the `main` branch
2. **Install Dependencies** — Runs `npm install` in the Frontend directory
3. **SonarQube Analysis** — Static code analysis for code quality and bugs
4. **Quality Gate** — Fails the build if code quality standards are not met
5. **OWASP Dependency Check** — Scans for known CVEs in dependencies (fails on CVSS ≥ 7)
6. **Trivy Filesystem Scan** — Scans source files for HIGH/CRITICAL vulnerabilities
7. **Docker Build** — Builds the application Docker image
8. **Trivy Image Scan** — Scans the final Docker image for HIGH/CRITICAL vulnerabilities
9. **Deploy Container** — Runs the container on port 3000

Dependency check reports are archived as build artifacts after every run.

---

## Security

This project takes a **DevSecOps** approach, integrating security checks directly into the pipeline:

- **SonarQube** for static application security testing (SAST)
- **OWASP Dependency-Check** to detect vulnerable third-party libraries
- **Trivy** for both filesystem and Docker image vulnerability scanning
- Each microservice uses isolated `.env` files to manage secrets — never commit these to source control

---

---

## 📄 License

This project is open source. See the repository for more details.
