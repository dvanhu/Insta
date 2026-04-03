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
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                dir('frontend') {
                    withSonarQubeEnv('SonarQube') {
                        sh 'sonar-scanner'
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                dir('frontend') {
                    sh '''
                    dependency-check.sh \
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
                dir('frontend') {
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
                sh 'docker build -t $IMAGE_NAME .'
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
            archiveArtifacts artifacts: 'frontend/dependency-check-report/**', allowEmptyArchive: true
        }
    }
}
