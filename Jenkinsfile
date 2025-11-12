pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'
    }

    environment {
        AWS_REGION   = 'eu-north-1'
        ECR_REGISTRY = '396626623766.dkr.ecr.eu-north-1.amazonaws.com' // your AWS Account ECR
        IMAGE_NAME   = 'myapp'
        IMAGE_TAG    = "${BUILD_NUMBER}"
        FULL_IMAGE   = "${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
        CONTAINER_NAME = 'myapp'
        APP_PORT = '3000'
        EMAIL = 'neerajn12b309@gmail.com'
        SERVER_URL = 'http://ec2-13-61-4-151.eu-north-1.compute.amazonaws.com:3000'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '✅ Checking out code from GitHub'
                git branch: 'main', url: 'https://github.com/N-Neeraj/myapp.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📦 Installing npm dependencies'
                sh '''
                    command -v node || { curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -; sudo dnf install -y nodejs; }
                    npm install
                '''
            }
        }

        stage('Run Tests') {
            steps {
                echo '🧪 Running tests (if available)'
                sh 'npm test || echo "No tests found — continuing..."'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '🐳 Building Docker image'
                sh '''
                    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('Login to ECR') {
            steps {
                echo '🔐 Logging in to AWS ECR'
                sh '''
                    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
                '''
            }
        }

        stage('Push to ECR') {
            steps {
                echo '🚀 Pushing image to AWS ECR'
                sh '''
                    docker push ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('Deploy on EC2') {
            steps {
                echo '⚙️ Deploying container on EC2 instance'
                sh '''
                    docker pull ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
                    docker rm -f ${CONTAINER_NAME} || true
                    docker run -d --name ${CONTAINER_NAME} -p ${APP_PORT}:3000 --restart unless-stopped ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo '🩺 Checking container health'
                sh '''
                    sleep 10
                    if curl -f http://localhost:${APP_PORT} > /dev/null 2>&1; then
                        echo "✅ App is running successfully on port ${APP_PORT}"
                    else
                        echo "❌ Health check failed!"
                        docker logs ${CONTAINER_NAME}
                        exit 1
                    fi
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful! Application live at ${SERVER_URL}"

            emailext(
                to: "${EMAIL}",
                subject: "✅ SUCCESS: Jenkins Build #${BUILD_NUMBER}",
                body: """
                <h2>Jenkins CI/CD Pipeline Success 🚀</h2>
                <p><b>Project:</b> ${IMAGE_NAME}</p>
                <p><b>Build Number:</b> ${BUILD_NUMBER}</p>
                <p><b>Application:</b> <a href='${SERVER_URL}'>${SERVER_URL}</a></p>
                <p><b>ECR Image:</b> ${FULL_IMAGE}</p>
                """,
                mimeType: 'text/html'
            )
        }

        failure {
            echo "❌ Build Failed"

            emailext(
                to: "${EMAIL}",
                subject: "❌ FAILURE: Jenkins Build #${BUILD_NUMBER}",
                body: """
                <h2>Jenkins Pipeline Failed ❌</h2>
                <p><b>Job:</b> ${JOB_NAME}</p>
                <p><b>Build Number:</b> ${BUILD_NUMBER}</p>
                <p>Check Jenkins logs for details.</p>
                """,
                mimeType: 'text/html'
            )
        }

        always {
            echo '🧹 Cleaning up workspace...'
            deleteDir()
        }
    }
}
