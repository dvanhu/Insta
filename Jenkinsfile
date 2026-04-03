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
                    sh 'npm install'
                }
            }
        }

        // ------------------ SAST ------------------
        stage('SonarQube Analysis') {
            steps {
                dir('Frontend') {
                    withSonarQubeEnv('SonarQube') {
                        sh '''
                        sonar-scanner \
                        -Dsonar.projectKey=insta-frontend \
                        -Dsonar.projectName="Insta Frontend" \
                        -Dsonar.sources=src \
                        -Dsonar.sourceEncoding=UTF-8
                        '''
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

        // ------------------ SCA ------------------
        stage('OWASP Dependency Check') {
            steps {
                dir('Frontend') {
                    sh '''
                    /opt/dependency-check/bin/dependency-check.sh \
                    --project "Insta" \
                    --scan . \
                    --format HTML \
                    --out dependency-check-report \
                    --failOnCVSS 7 \
                    --noupdate
                    '''
                }
            }
        }

        // ------------------ FS SCAN ------------------
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

        // ------------------ BUILD ------------------
        stage('Docker Build') {
            steps {
                sh 'docker build -t $IMAGE_NAME .'
            }
        }

        // ------------------ IMAGE SCAN ------------------
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

        // ------------------ DEPLOY ------------------
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

        success {
            echo "✅ Full DevSecOps pipeline executed successfully"
        }

        failure {
            echo "❌ Pipeline failed — check logs and vulnerabilities"
        }
    }
}
