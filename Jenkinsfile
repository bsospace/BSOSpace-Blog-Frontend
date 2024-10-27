pipeline {
    agent any
    environment {
        APP_PORT = ''
        GIT_URL = 'https://github.com/BSO-Space/BSOSpace-Blog-Frontend'
        DOCKER_NAME = ''
        DOCKER_COMPOSE_FILE = ''
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
                        DOCKER_COMPOSE_FILE = 'docker-compose.pre.yml'
                        echo "Setting up Pre-Production Environment: ${branchName}"
                    } else if (branchName == 'develop') {
                        APP_PORT = '3000'
                        DOCKER_NAME = 'develop-bso-space-blog'
                        DOCKER_COMPOSE_FILE = 'docker-compose.develop.yml'
                        echo "Setting up Development Environment: ${branchName}"
                    } else if (branchName == 'main') {
                        APP_PORT = '9009'
                        DOCKER_NAME = 'production-bso-space-blog'
                        DOCKER_COMPOSE_FILE = 'docker-compose.prod.yml'
                        echo "Setting up Production Environment: ${branchName}"
                    } else {
                        error("This pipeline only supports main, develop, or pre-* branches. Current branch: ${branchName}")
                    }

                    // Display the set environment variables
                    echo "APP_PORT is set to ${APP_PORT}"
                    echo "DOCKER_NAME is set to ${DOCKER_NAME}"
                    echo "Using Docker Compose file: ${DOCKER_COMPOSE_FILE}"
                }
            }
        }

        stage('Checkout & Pulling') {
            steps {
                script {
                    // Set Git user configuration
                    sh 'git config --global user.name "bso.jenkins"'
                    sh 'git config --global user.email "bso.jenkins@bsospace.com"'

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
            script {
                // Deploy using the selected Docker Compose file
                sh """
                APP_PORT=${APP_PORT} DOCKER_NAME=${DOCKER_NAME} docker-compose -f ${DOCKER_COMPOSE_FILE} build --no-cache
                APP_PORT=${APP_PORT} DOCKER_NAME=${DOCKER_NAME} docker-compose -f ${DOCKER_COMPOSE_FILE} up -d
                """
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
