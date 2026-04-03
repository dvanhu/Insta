pipeline {
    agent any

    environment {
        IMAGE_NAME = "insta-app"
        DOCKER_CONTAINER = "insta-container"
    }

    tools {
        // Ensure these are configured in Jenkins Global Tool Config
        sonarQube 'SonarQube'
    }

    stages {

        stage('Checkout Code') {
            steps {
                git 'https://github.com/dvanhu/Insta.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'sonar-scanner'
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
                sh '''
                dependency-check.sh \
                --project "Insta" \
                --scan . \
                --format HTML \
                --out dependency-check-report
                '''
            }
        }

        stage('Trivy Filesystem Scan') {
            steps {
                sh '''
                trivy fs \
                --exit-code 1 \
                --severity HIGH,CRITICAL \
                .
                '''
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
            archiveArtifacts artifacts: 'dependency-check-report/**', allowEmptyArchive: true
        }

        success {
            echo "✅ Pipeline passed. Application deployed securely."
        }

        failure {
            echo "❌ Pipeline failed due to security or quality gate violation."
        }
    }
}
