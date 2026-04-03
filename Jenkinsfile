// ================================================================
//  dvanhu/Insta — DevSecOps Pipeline  (Option B — no API key)
//  All paths hardcoded — no env var interpolation issues
//  --disableOssIndex  → stops rate-limit errors, saves ~46 sec
//  --disableYarnAudit → stops yarn-not-found warnings
//
//  TODO later: Add NVD API key for faster DB updates
//    Manage Jenkins → Credentials → Global → Add Credential
//    Kind: Secret text | ID: nvd-api-key
//    Key:  https://nvd.nist.gov/developers/request-an-api-key
// ================================================================

pipeline {

    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
        timeout(time: 90, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '15'))
        disableConcurrentBuilds()
    }

    environment {
        IMAGE_NAME       = "insta-app"
        DOCKER_CONTAINER = "insta-container"
    }

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
        stage('Security Scans') {
            parallel {

                // ── 5a. OWASP Dependency Check ─────────────────
                stage('OWASP Dependency Check') {
                    steps {
                        script {
                            // Smart DB update:
                            //   DB < 4 hrs old  →  --noupdate  (~20 sec)
                            //   DB > 4 hrs old  →  re-download (~60-90 min, add API key to avoid this)
                            //   DB missing      →  fresh download
                            def dbAge = sh(
                                script: '''
                                    if [ -f /opt/dependency-check/data/odc.mv.db ]; then
                                        echo $(( ( $(date +%s) - $(stat -c %Y /opt/dependency-check/data/odc.mv.db) ) / 3600 ))
                                    else
                                        echo 999
                                    fi
                                ''',
                                returnStdout: true
                            ).trim().toInteger()

                            echo "OWASP DB age: ${dbAge} hours"
                            def updateFlag = (dbAge < 4) ? '--noupdate' : ''
                            echo "Update mode: ${updateFlag ?: 'UPDATING DB'}"

                            sh """
                                mkdir -p reports/dependency-check

                                /opt/dependency-check/bin/dependency-check.sh \
                                    --project "Insta" \
                                    --scan ./Frontend \
                                    --format HTML \
                                    --format JSON \
                                    --out reports/dependency-check \
                                    --data /opt/dependency-check/data \
                                    --disableOssIndex \
                                    --disableYarnAudit \
                                    ${updateFlag} \
                                    --failOnCVSS 7 || true

                                echo "===== OWASP SCAN COMPLETE ====="
                            """
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'reports/dependency-check',
                                reportFiles: 'dependency-check-report.html',
                                reportName: 'OWASP Dependency Check'
                            ])
                            archiveArtifacts(
                                artifacts: 'reports/dependency-check/**',
                                allowEmptyArchive: true
                            )
                        }
                    }
                }

                // ── 5b. Trivy Filesystem Scan ──────────────────
                stage('Trivy Filesystem Scan') {
                    steps {
                        sh '''
                            mkdir -p /tmp/trivy-cache reports/trivy

                            # Check if Trivy DB already exists — skip download if so
                            if [ -f /tmp/trivy-cache/db/trivy.db ]; then
                                SKIP_UPDATE="--skip-db-update"
                            else
                                # Use ghcr.io mirror — avoids IPv6-only mirror.gcr.io
                                SKIP_UPDATE="--db-repository ghcr.io/aquasecurity/trivy-db"
                            fi

                            TRIVY_NO_PROGRESS=true trivy fs \
                                --cache-dir /tmp/trivy-cache \
                                --exit-code 0 \
                                --severity HIGH,CRITICAL \
                                --format table \
                                --output reports/trivy/trivy-fs-report.txt \
                                $SKIP_UPDATE \
                                ./Frontend

                            echo "===== TRIVY FS SCAN COMPLETE ====="
                            cat reports/trivy/trivy-fs-report.txt
                        '''
                        // --exit-code 0 = warn only, never fails the build
                    }
                    post {
                        always {
                            archiveArtifacts(
                                artifacts: 'reports/trivy/trivy-fs-report.txt',
                                allowEmptyArchive: true
                            )
                        }
                    }
                }

            } // end parallel
        }

        // ── 6. Docker Build ───────────────────────────────────
        // Dockerfile is at repo ROOT — correct for your project
        stage('Docker Build') {
            steps {
                sh '''
                    echo "===== BUILDING DOCKER IMAGE ====="
                    docker build \
                        -t insta-app:latest \
                        -t insta-app:${BUILD_NUMBER} \
                        .
                    echo "===== BUILD COMPLETE ====="
                    docker images | grep insta-app
                '''
            }
        }

        // ── 7. Trivy Image Scan ───────────────────────────────
        stage('Trivy Image Scan') {
            steps {
                sh '''
                    mkdir -p /tmp/trivy-cache reports/trivy

                    # Reuse DB downloaded in FS scan — always skip re-download here
                    TRIVY_NO_PROGRESS=true trivy image \
                        --cache-dir /tmp/trivy-cache \
                        --skip-db-update \
                        --exit-code 1 \
                        --severity CRITICAL \
                        --format table \
                        --output reports/trivy/trivy-image-report.txt \
                        insta-app:latest || true

                    echo "===== TRIVY IMAGE SCAN COMPLETE ====="
                    cat reports/trivy/trivy-image-report.txt
                '''
                // --skip-db-update reuses the DB from the FS scan above
                // --exit-code 1 + || true = logs CRITICAL CVEs without aborting
            }
            post {
                always {
                    archiveArtifacts(
                        artifacts: 'reports/trivy/trivy-image-report.txt',
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
                    docker rm -f insta-container || true
                    docker run -d \
                        --name insta-container \
                        --restart unless-stopped \
                        -p 3000:3000 \
                        insta-app:latest
                    sleep 3
                    docker ps | grep insta-container
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
              Image   : insta-app:${BUILD_NUMBER}
              App URL : http://localhost:3000
              Reports : Check Jenkins sidebar and Artifacts
            ================================================
            """
        }
        failure {
            echo """
            ================================================
              BUILD #${BUILD_NUMBER} FAILED
            ================================================
              Check stage logs above for the failing step.
              Reports are archived in Build Artifacts.
            ================================================
            """
        }
        always {
            sh 'docker image prune -f --filter "until=72h" || true'
        }
    }

} // end pipeline
