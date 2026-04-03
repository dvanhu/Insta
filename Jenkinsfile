pipeline {

    agent any

    // ── Options ──────────────────────────────────────────────
    options {
        skipDefaultCheckout(true)           // manual checkout in stage 1
        timestamps()                        // prefix every log line with time
        timeout(time: 90, unit: 'MINUTES')  // hard ceiling — kills runaway builds
        buildDiscarder(logRotator(numToKeepStr: '15'))
        disableConcurrentBuilds()           // prevent parallel runs corrupting OWASP DB
    }

    // ── Environment ───────────────────────────────────────────
    environment {
        // Docker
        IMAGE_NAME       = "insta-app"
        DOCKER_CONTAINER = "insta-container"

        // SonarQube
        SONAR_PROJECT_KEY = "Insta-Project"   // exact key matching your existing SQ project
        SONAR_HOST_URL    = "http://localhost:9000"

        // OWASP Dependency Check
        DC_BIN            = "/opt/dependency-check/bin/dependency-check.sh"
        DC_DATA_DIR       = "/opt/dependency-check/data"
        DC_REPORT_DIR     = "reports/dependency-check"

        // Trivy
        TRIVY_CACHE_DIR   = "${env.HOME}/.cache/trivy"
        TRIVY_REPORT_DIR  = "reports/trivy"
    }

    // ════════════════════════════════════════════════════════
    //  STAGES
    // ════════════════════════════════════════════════════════
    stages {

        // ── 1. Checkout ───────────────────────────────────────
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/dvanhu/Insta.git'
                sh 'echo "Commit: $(git rev-parse --short HEAD)"'
            }
        }

        // ── 2. Install Dependencies ───────────────────────────
        stage('Install Dependencies') {
            steps {
                dir('Frontend') {
                    sh '''
                        echo "===== INSTALLING FRONTEND DEPENDENCIES ====="
                        node --version && npm --version
                        npm install
                        echo "===== INSTALL COMPLETE ====="
                    '''
                }
            }
        }

        // ── 3. SonarQube Analysis ─────────────────────────────
        stage('SonarQube Analysis') {
            steps {
                dir('Frontend') {
                    withSonarQubeEnv('SonarQube') {
                        sh '''
                            sonar-scanner \
                                -Dsonar.projectKey=Insta-Project \
                                -Dsonar.projectName="Insta Project" \
                                -Dsonar.sources=. \
                                -Dsonar.host.url=http://localhost:9000
                        '''
                    }
                }
            }
        }

        // ── 4. Quality Gate ───────────────────────────────────
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // ── 5. Security Scans — PARALLEL ─────────────────────
        // OWASP and Trivy FS run simultaneously — saves ~4 min per build
        stage('Security Scans') {
            parallel {

                // ── 5a. OWASP Dependency Check ─────────────────
                stage('OWASP Dependency Check') {
                    steps {
                        script {
                            // Smart DB update logic:
                            //   DB missing       → full download  (~3 min with API key)
                            //   DB > 4 hours old → incremental    (~1-2 min)
                            //   DB < 4 hours old → --noupdate     (~20 sec)
                            def dbAge = sh(
                                script: """
                                    if [ -f ${DC_DATA_DIR}/odc.mv.db ]; then
                                        echo \$(( ( \$(date +%s) - \$(stat -c %Y ${DC_DATA_DIR}/odc.mv.db) ) / 3600 ))
                                    else
                                        echo 999
                                    fi
                                """,
                                returnStdout: true
                            ).trim().toInteger()

                            echo "OWASP DB age: ${dbAge} hours"
                            def updateFlag = (dbAge < 4) ? '--noupdate' : ''
                            echo "Update mode: ${updateFlag ?: 'UPDATING DB'}"

                            // Requires Jenkins credential:
                            //   Manage Jenkins → Credentials → Global → Add Credential
                            //   Kind: Secret text | ID: nvd-api-key
                            //   Get key free at: https://nvd.nist.gov/developers/request-an-api-key
                            withCredentials([string(credentialsId: 'nvd-api-key', variable: 'NVD_KEY')]) {
                                sh """
                                    mkdir -p ${DC_REPORT_DIR}

                                    ${DC_BIN} \
                                        --project "Insta" \
                                        --scan ./Frontend \
                                        --format HTML \
                                        --format JSON \
                                        --out ${DC_REPORT_DIR} \
                                        --data ${DC_DATA_DIR} \
                                        --nvdApiKey \${NVD_KEY} \
                                        ${updateFlag} \
                                        --failOnCVSS 7 || true

                                    echo "===== OWASP SCAN COMPLETE ====="
                                """
                                // || true = report findings but don't abort pipeline.
                                // Remove || true when you want hard failures on HIGH CVEs.
                            }
                        }
                    }
                    post {
                        always {
                            // Adds "OWASP Dependency Check" link in Jenkins left sidebar
                            publishHTML([
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: "${DC_REPORT_DIR}",
                                reportFiles: 'dependency-check-report.html',
                                reportName: 'OWASP Dependency Check'
                            ])
                            archiveArtifacts(
                                artifacts: "${DC_REPORT_DIR}/**",
                                allowEmptyArchive: true
                            )
                        }
                    }
                }

                // ── 5b. Trivy Filesystem Scan ──────────────────
                stage('Trivy Filesystem Scan') {
                    steps {
                        sh """
                            mkdir -p ${TRIVY_CACHE_DIR} ${TRIVY_REPORT_DIR}

                            trivy fs \
                                --cache-dir ${TRIVY_CACHE_DIR} \
                                --exit-code 0 \
                                --severity HIGH,CRITICAL \
                                --format table \
                                --output ${TRIVY_REPORT_DIR}/trivy-fs-report.txt \
                                ./Frontend

                            echo "===== TRIVY FS SCAN COMPLETE ====="
                            cat ${TRIVY_REPORT_DIR}/trivy-fs-report.txt
                        """
                        // --exit-code 0 = WARN ONLY, never fails the build.
                        // Intentional: FS scan catches dep vulns before image build.
                        // Change to --exit-code 1 once initial findings are triaged.
                    }
                    post {
                        always {
                            archiveArtifacts(
                                artifacts: "${TRIVY_REPORT_DIR}/trivy-fs-report.txt",
                                allowEmptyArchive: true
                            )
                        }
                    }
                }

            } // end parallel
        }

        // ── 6. Docker Build ───────────────────────────────────
        // Dockerfile is at repo ROOT — not inside Frontend/
        // This is correct for your project structure
        stage('Docker Build') {
            steps {
                sh '''
                    echo "===== BUILDING DOCKER IMAGE ====="
                    docker build \
                        -t ${IMAGE_NAME}:latest \
                        -t ${IMAGE_NAME}:${BUILD_NUMBER} \
                        .
                    echo "===== BUILD COMPLETE ====="
                    docker images | grep ${IMAGE_NAME}
                '''
            }
        }

        // ── 7. Trivy Image Scan ───────────────────────────────
        stage('Trivy Image Scan') {
            steps {
                sh """
                    mkdir -p ${TRIVY_REPORT_DIR}

                    trivy image \
                        --cache-dir ${TRIVY_CACHE_DIR} \
                        --exit-code 1 \
                        --severity CRITICAL \
                        --format table \
                        --output ${TRIVY_REPORT_DIR}/trivy-image-report.txt \
                        \${IMAGE_NAME}:latest || true

                    echo "===== TRIVY IMAGE SCAN COMPLETE ====="
                    cat ${TRIVY_REPORT_DIR}/trivy-image-report.txt
                """
                // --exit-code 1 --severity CRITICAL = hard fail on CRITICAL image CVEs.
                // || true keeps pipeline alive so the report is always archived.
                // Remove || true for a true hard block on CRITICAL vulnerabilities.
            }
            post {
                always {
                    archiveArtifacts(
                        artifacts: "${TRIVY_REPORT_DIR}/trivy-image-report.txt",
                        allowEmptyArchive: true
                    )
                }
            }
        }

        // ── 8. Deploy Container ───────────────────────────────
        stage('Deploy Container') {
            steps {
                sh '''
                    echo "===== DEPLOYING CONTAINER ====="

                    # Remove old container gracefully
                    docker rm -f ${DOCKER_CONTAINER} || true

                    # Start new container
                    docker run -d \
                        --name ${DOCKER_CONTAINER} \
                        --restart unless-stopped \
                        -p 3000:3000 \
                        ${IMAGE_NAME}:latest

                    # Confirm it started
                    sleep 3
                    docker ps | grep ${DOCKER_CONTAINER}
                    echo "===== APP RUNNING on http://localhost:3000 ====="
                '''
            }
        }

    } // end stages

    // ════════════════════════════════════════════════════════
    //  POST BUILD
    // ════════════════════════════════════════════════════════
    post {

        success {
            echo """
            ================================================
              BUILD #${BUILD_NUMBER} PASSED
            ================================================
              Image   : ${IMAGE_NAME}:${BUILD_NUMBER}
              App URL : http://localhost:3000
              Reports : Check Jenkins sidebar (OWASP, Trivy)
            ================================================
            """
        }

        failure {
            echo """
            ================================================
              BUILD #${BUILD_NUMBER} FAILED
            ================================================
              Check stage logs above for the failing step.
              All reports are archived in Build Artifacts.
            ================================================
            """
        }

        always {
            // Clean up dangling images older than 72h to save disk space
            sh 'docker image prune -f --filter "until=72h" || true'
        }

    }

} // end pipeline
