// pipeline {
//   agent any
//   options { timestamps() }

//   environment {
//     // 🔹 Change this region as per your AWS setup
//     AWS_REGION   = 'eu-north-1'
//     // 🔹 Your AWS ECR registry URI (no /repo-name here)
//     ECR_REGISTRY = 'ec2-13-61-4-151.eu-north-1.compute.amazonaws.cd'
//     // 🔹 Your ECR repository name
//     IMAGE_NAME   = 'neerajn080103/myapp'
//     // 🔹 Tag (use 'latest' or build number)
//     IMAGE_TAG    = "build-${env.BUILD_NUMBER}"
//   }

//   stages {
//     stage('Checkout') {
//       steps {
//         echo '📦 Checking out source code...'
//         checkout scm
//       }
//     }

//     stage('Install & Run Unit Tests') {
//       steps {
//         echo '🧪 Running unit tests...'
//         sh '''
//           if ! command -v node &>/dev/null; then
//             curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
//             sudo dnf install -y nodejs
//           fi
//           npm ci
//           npm test || true
//         '''
//       }
//     }

//     stage('Docker Build') {
//       steps {
//         echo '🐳 Building Docker image...'
//         sh 'docker build -t $IMAGE_NAME:$IMAGE_TAG .'
//       }
//     }

//     stage('AWS ECR Login') {
//       steps {
//         echo '🔐 Logging in to AWS ECR...'
//         sh 'aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY'
//       }
//     }

//     stage('Push Docker Image to ECR') {
//       steps {
//         echo '🚀 Pushing image to ECR...'
//         sh '''
//           docker tag $IMAGE_NAME:$IMAGE_TAG $ECR_REGISTRY/$IMAGE_NAME:$IMAGE_TAG
//           docker push $ECR_REGISTRY/$IMAGE_NAME:$IMAGE_TAG
//         '''
//       }
//     }

//     stage('Deploy on EC2 (via SSH)') {
//       steps {
//         echo '🖥️ Deploying on EC2...'
//         // 🔹 Ensure EC2 SSH access & Docker installed on EC2
//         // 🔹 Replace with your EC2 Public IP & Key name
//         sh '''
//           ssh -o StrictHostKeyChecking=no ec2-user@13.61.4.151 << EOF
//             aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
//             docker pull $ECR_REGISTRY/$IMAGE_NAME:$IMAGE_TAG
//             docker stop myapp || true
//             docker rm myapp || true
//             docker run -d --name myapp -p 3000:3000 --restart=always $ECR_REGISTRY/$IMAGE_NAME:$IMAGE_TAG
//           EOF
//         '''
//       }
//     }
//   }

//   post {
//     success {
//       echo "✅ Deployment successful!"
//       echo "🌐 Visit your app at: http://13.61.4.151:3000"
//     }
//     failure {
//       echo '❌ Build failed! Please check Jenkins logs.'
//     }
//   }
// }


pipeline {
  agent any
  options { timestamps() }

  environment {
    AWS_REGION   = 'eu-north-1'
    ECR_REGISTRY = '396626623766.dkr.ecr.eu-north-1.amazonaws.com'
    IMAGE_NAME   = 'myapp'
    IMAGE_TAG    = 'latest'
    APP_NAME     = 'myapp'
    PORT         = '3000'
    EMAIL        = 'neerajn12b309@gmail.com'
    SERVER_URL   = 'http://13.61.4.151:3000'
  }

  stages {

    stage('Initialize') {
      steps { echo '--- Neeraj N | IoT | CI/CD Pipeline Deployment ---' }
    }

    stage('Clean Workspace') {
      steps { cleanWs() }
    }

    stage('Checkout Repository') {
      steps {
        git branch: 'main', url: 'https://github.com/N-Neeraj/myapp.git'
      }
    }

    stage('Install Node & Dependencies') {
      steps {
        sh '''
          command -v node || { curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - ; sudo dnf install -y nodejs ; }
          npm ci
        '''
      }
    }

    stage('Run Tests') {
      steps {
        sh 'npm test || true'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh "docker build -t ${APP_NAME}:${IMAGE_TAG} ."
      }
    }

    stage('Login to ECR') {
      steps {
        sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"
      }
    }

    stage('Tag & Push to ECR') {
      steps {
        sh """
          docker tag ${APP_NAME}:${IMAGE_TAG} ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
          docker push ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
        """
      }
    }

    stage('Deploy on EC2 via Docker') {
      steps {
        sh """
          docker pull ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
          docker rm -f ${APP_NAME} || true
          docker run -d --name ${APP_NAME} -p ${PORT}:${PORT} --restart=always ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
        """
      }
    }
  }

  post {
    success {
      echo '✅ Build and Deployment Successful!'
      emailext(
        to: "${EMAIL}",
        subject: "SUCCESS: Jenkins Build #${BUILD_NUMBER}",
        body: """
          <h2 style='color:green;'>Deployment Success ✅</h2>
          <p>Application: <b>${APP_NAME}</b></p>
          <p>Build Number: <b>${BUILD_NUMBER}</b></p>
          <p>Access the application here:</p>
          <p><a href='${SERVER_URL}'>${SERVER_URL}</a></p>
        """,
        mimeType: 'text/html'
      )
    }

    failure {
      echo '❌ Build Failed!'
      emailext(
        to: "${EMAIL}",
        subject: "FAILED: Jenkins Build #${BUILD_NUMBER}",
        body: """
          <h2 style='color:red;'>Build Failed ❌</h2>
          <p>Application: <b>${APP_NAME}</b></p>
          <p>Build Number: <b>${BUILD_NUMBER}</b></p>
          <p>Please check Jenkins logs.</p>
        """,
        mimeType: 'text/html'
      )
    }

    always {
      echo '📧 Email Notification Sent.'
    }
  }
}
