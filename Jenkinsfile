pipeline {
    agent any
    environment {
        APP_PORT = ''
        GIT_URL = 'https://github.com/BSO-Space/BSOSpace-Blog-Frontend'
        DOCKER_NAME = ''
    }
    stages {
        stage('Setup Environment') {
            steps {
                script {
                    // Use the branch from GitHub push (GIT_BRANCH)
                    def branchName = env.GIT_BRANCH?.replaceFirst('origin/', '')

                    // Match any branch starting with "pre-" including "pre-production"
                    if (branchName ==~ /^pre-.*/) {
                        APP_PORT = '3002'
                        DOCKER_NAME = "pre-${branchName}"
                    } else if (branchName == 'develop') {
                        APP_PORT = '3000'
                        DOCKER_NAME = 'develop'
                    } else if (branchName == 'main') {
                        APP_PORT = '9009'
                        DOCKER_NAME = 'default'
                    } else {
                        error("This pipeline only supports main, develop, or pre-* branches. Current branch: ${branchName}")
                    }
                }
            }
        }

        stage('Checkout & Pulling') {
            steps {
                script {
                    // Checkout the branch that triggered the push
                    checkout([$class: 'GitSCM',
                              branches: [[name: "${env.GIT_BRANCH}"]],
                              userRemoteConfigs: [[url: "${GIT_URL}"]]])

                    // Confirm the correct branch and set upstream tracking
                    sh "git checkout ${env.GIT_BRANCH?.replaceFirst('origin/', '')}"
                    sh "git branch --set-upstream-to=origin/${env.GIT_BRANCH?.replaceFirst('origin/', '')}"

                    // Pull the latest changes from the remote branch
                    sh "git pull origin ${env.GIT_BRANCH?.replaceFirst('origin/', '')}"
                }
            }
            post {
                always {
                    echo "In Processing"
                }
                success {
                    echo "Successful"
                }
                failure {
                    echo "Failed"
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    sh 'npm install'
                }
            }
        }
        stage('Testing with Jest') {
            steps {
                script {
                    sh 'npm test'
                }
            }
        }
        stage('Code Analysis') {
            steps {
                withCredentials([string(credentialsId: 'bso-space-app', variable: 'SONAR_TOKEN')]) {
                    sh '''
                        npm install sonar-scanner
                        npx sonar-scanner \
                        -Dsonar.projectKey=bso-space-app \
                        -Dsonar.host.url=http://sonarqube-dso-demo:9000 \
                        -Dsonar.login=$SONAR_TOKEN
                    '''
                }
            }
        }
        stage('Docker Deployment') {
            steps {
                script {
                    // Use environment variables in Docker Compose
                    sh """
                    APP_PORT=${APP_PORT} DOCKER_NAME=${DOCKER_NAME} docker-compose up -d --build
                    """
                }
            }
        }
    }
    post {
        always {
            echo 'Pipeline finished'
        }
        success {
            echo 'Pipeline success'
        }
        failure {
            echo 'Pipeline error'
        }
    }
}
