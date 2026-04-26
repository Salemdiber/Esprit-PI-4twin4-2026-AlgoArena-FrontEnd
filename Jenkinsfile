pipeline {
  agent any

  options {
    timestamps()
  }

  tools {
    nodejs 'Node 18'
  }

  environment {
    SONAR_PROJECT_KEY = 'algo-arena-frontend'
    SONAR_PROJECT_NAME = 'AlgoArena Frontend'
    DOCKER_IMAGE_NAME = 'algo-arena-frontend'
    DOCKER_REGISTRY = 'docker.io'
    DOCKER_CREDENTIALS_ID = 'dockerhub-creds'
    CD_JOB_NAME = 'AlgoArena-Front-CD'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Test') {
      steps {
        sh 'npm test -- --runInBand --coverage'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('SonarQube analysis') {
      steps {
        script {
          def scannerHome = tool 'SonarScanner'
          withSonarQubeEnv('SonarQube') {
            sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=${SONAR_PROJECT_KEY} -Dsonar.projectName=${SONAR_PROJECT_NAME} -Dsonar.sources=src -Dsonar.tests=src -Dsonar.test.inclusions=src/**/__tests__/**/*.test.mjs -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info"
          }
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 10, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Docker build and push') {
      steps {
        script {
          def imageTag = "${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER}"

          docker.withRegistry("https://${env.DOCKER_REGISTRY}", env.DOCKER_CREDENTIALS_ID) {
            def image = docker.build(imageTag)
            image.push()
            image.push('latest')
          }
        }
      }
    }

    stage('Trigger CD') {
      steps {
        build job: env.CD_JOB_NAME, wait: false, parameters: [
          string(name: 'IMAGE_TAG', value: "${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER}"),
          string(name: 'IMAGE_LATEST', value: "${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE_NAME}:latest")
        ]
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: false
    }
  }
}