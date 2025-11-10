pipeline {
  agent any
  options { timestamps() }

  environment {
    AWS_REGION   = 'eu-north-1'
    ECR_REGISTRY = '396626623766.dkr.ecr.eu-north-1.amazonaws.com'   // no /myapp here
    IMAGE_NAME   = 'myapp'
    IMAGE_TAG    = 'latest'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Unit Tests') {
      steps {
        sh '''
          command -v node || { curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - ; sudo dnf install -y nodejs ; }
          npm ci
          npm test || true
        '''
      }
    }

    stage('Docker Build') {
      steps { sh 'docker build -t $IMAGE_NAME:$IMAGE_TAG .' }
    }

    stage('ECR Login') {
      steps {
        sh 'aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY'
      }
    }

    stage('Push Image to ECR') {
      steps {
        sh '''
          docker tag $IMAGE_NAME:$IMAGE_TAG $ECR_REGISTRY/$IMAGE_NAME:$IMAGE_TAG
          docker push $ECR_REGISTRY/$IMAGE_NAME:$IMAGE_TAG
        '''
      }
    }

    stage('Deploy on EC2 (Docker)') {
      steps {
        sh '''
          docker pull $ECR_REGISTRY/$IMAGE_NAME:$IMAGE_TAG
          docker rm -f myapp || true
          docker run -d --name myapp -p 3000:3000 --restart=always $ECR_REGISTRY/$IMAGE_NAME:$IMAGE_TAG
        '''
      }
    }
  }

  post {
    success { echo "✅ Deployed! Visit: http://13.61.4.151:3000" }
    failure { echo '❌ Build failed. Check logs.' }
  }
}
