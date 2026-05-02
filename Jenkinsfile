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
    SONAR_INCLUSIONS = 'src/hooks/useChallenge.js,src/i18n/index.js,src/pages/Frontoffice/auth/context/authContextUtils.js,src/pages/Frontoffice/battles/types/battle.types.js,src/pages/Frontoffice/leaderboard/utils/leaderboardUtils.js,src/pages/Frontoffice/speedchallenge/data/speedChallengeProblems.js,src/services/apiClient.js,src/services/communityService.js,src/services/cookieUtils.js,src/services/diagnosticsCollector.js,src/services/dicebear.js'
    DOCKER_IMAGE_NAME = 'salemdiber/algo-arena-frontend'
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
            sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=${SONAR_PROJECT_KEY} -Dsonar.projectName=\"${SONAR_PROJECT_NAME}\" -Dsonar.sources=src -Dsonar.inclusions=${SONAR_INCLUSIONS} -Dsonar.tests=src -Dsonar.test.inclusions=src/**/__tests__/**/*.test.mjs -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info"
          }
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 10, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: false
        }
      }
    }

    stage('Docker build and push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh '''
          echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
          
          docker build -t docker.io/salemdiber/algo-arena-frontend:$BUILD_NUMBER .
          docker tag docker.io/salemdiber/algo-arena-frontend:$BUILD_NUMBER docker.io/salemdiber/algo-arena-frontend:latest
          
          docker push docker.io/salemdiber/algo-arena-frontend:$BUILD_NUMBER
          docker push docker.io/salemdiber/algo-arena-frontend:latest
          '''
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