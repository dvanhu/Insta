pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        IMAGE_NAME = "insta-app"
        DOCKER_CONTAINER = "insta-container"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/dvanhu/Insta.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('Frontend') {
                    sh '''
                    echo "===== INSTALLING DEPENDENCIES ====="
                    pwd
                    ls -la
                    npm install
                    '''
                }
            }
        }

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

        stage('Quality Gate') {
            steps {
                timeout(time: 3, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                dir('Frontend') {
                    sh '''
                    /opt/dependency-check/bin/dependency-check.sh \
                    --project "Insta" \
                    --scan . \
                    --format HTML \
                    --out dependency-check-report \
                    --failOnCVSS 7
                    '''
                }
            }
        }

        stage('Trivy Filesystem Scan') {
            steps {
                dir('Frontend') {
                    sh '''
                    trivy fs \
                    --exit-code 1 \
                    --severity HIGH,CRITICAL \
                    .
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                docker build -t $IMAGE_NAME .
                '''
            }
        }

        stage('Trivy Image Scan') {
            steps {
                sh '''
                trivy image \
                --exit-code 1 \
                --severity HIGH,CRITICAL \
                $IMAGE_NAME
                '''
            }
        }

        stage('Deploy Container') {
            steps {
                sh '''
                docker rm -f $DOCKER_CONTAINER || true
                docker run -d -p 3000:3000 --name $DOCKER_CONTAINER $IMAGE_NAME
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'Frontend/dependency-check-report/**', allowEmptyArchive: true
        }
    }
}
