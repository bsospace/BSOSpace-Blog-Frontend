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
                    def branchName = env.GIT_BRANCH?.replaceFirst('origin/', '')

                    // Set APP_PORT and DOCKER_NAME based on the branch name
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

                    // Set pull strategy to merge and pull the latest changes
                    sh """
                    git config pull.rebase false  # set merge as default
                    git pull origin ${env.GIT_BRANCH?.replaceFirst('origin/', '')}
                    """
                }
            }
            post {
                always {
                    echo "In Processing"
                }
                success {
                    echo "Successfully checked out and pulled branch: ${env.GIT_BRANCH}"
                }
                failure {
                    echo "Failed to checkout or pull the branch"
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    sh 'npm install --silent'
                }
            }
        }

        stage('Testing with Jest') {
            steps {
                script {
                    sh 'npm test --silent'
                }
            }
        }

        stage('Code Analysis') {
            steps {
                withCredentials([string(credentialsId: 'bso-space-app', variable: 'SONAR_TOKEN')]) {
                    sh '''
                        npm install sonar-scanner --silent
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
                    APP_PORT=${APP_PORT} DOCKER_NAME=${DOCKER_NAME} docker-compose up -d --build || { echo 'Docker deployment failed'; exit 1; }
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
