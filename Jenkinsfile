pipeline {
    agent any

    environment {
        IMAGE_NAME = "insta-app"
    }

    stages {

        stage('Checkout') {
            steps {
                git 'https://github.com/dvanhu/Insta.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('SonarQube Scan') {
            steps {
                sh 'sonar-scanner'
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

        stage('Trivy FS Scan') {
            steps {
                sh 'trivy fs --severity HIGH,CRITICAL .'
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t $IMAGE_NAME .'
            }
        }

        stage('Trivy Image Scan') {
            steps {
                sh 'trivy image --severity HIGH,CRITICAL $IMAGE_NAME'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker run -d -p 3000:3000 $IMAGE_NAME'
            }
        }
    }
}
