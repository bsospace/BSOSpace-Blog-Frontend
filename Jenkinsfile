pipeline {
    agent any
    environment {
        GIT_URL = 'https://github.com/BSO-Space/BSOSpace-Blog-Frontend'
        DOCKER_COMPOSE_FILE = ''
        DOCKER_IMAGE_TAG = ''
        APP_PORT = ''
        STACK_NAME = ''
        SLACK_CHANNEL = '#jenkins-notifications'
    }
    stages {
        stage('Setup Environment') {
            steps {
                script {
                    def branchName = env.GIT_BRANCH?.replaceFirst('origin/', '')

                    if (branchName ==~ /^pre-.*/) {
                        APP_PORT = '3002'
                        DOCKER_IMAGE_TAG = "pre-production-${branchName}-${BUILD_NUMBER}"
                        DOCKER_COMPOSE_FILE = 'docker-compose.pre.yml'
                        STACK_NAME = "bso-blog-pre"
                        echo "Setting up Pre-Production Environment: ${branchName}"
                    } else if (branchName == 'develop') {
                        APP_PORT = '3000'
                        DOCKER_IMAGE_TAG = "develop-${BUILD_NUMBER}"
                        DOCKER_COMPOSE_FILE = 'docker-compose.develop.yml'
                        STACK_NAME = "bso-blog-develop"
                        echo "Setting up Development Environment: ${branchName}"
                    } else if (branchName == 'main') {
                        APP_PORT = '9009'
                        DOCKER_IMAGE_TAG = "production-${BUILD_NUMBER}"
                        DOCKER_COMPOSE_FILE = 'docker-compose.prod.yml'
                        STACK_NAME = "bso-blog-production"
                        echo "Setting up Production Environment: ${branchName}"
                    } else {
                        echo "Skipping deployment setup. Only scanning for branch: ${branchName}"
                    }

                    echo "APP_PORT is set to ${APP_PORT}"
                    echo "DOCKER_IMAGE_TAG is set to ${DOCKER_IMAGE_TAG}"
                    echo "Using Docker Compose file: ${DOCKER_COMPOSE_FILE}"
                    echo "STACK_NAME is set to ${STACK_NAME}"
                }
            }
            post {
                always {
                    slackSend channel: "${SLACK_CHANNEL}", color: '#FFA500', message: "Environment setup completed for branch: ${env.GIT_BRANCH}"
                }
            }
        }

        stage('Checkout & Pulling') {
            steps {
                script {
                    sh 'git config --global user.name "bso.jenkins"'
                    sh 'git config --global user.email "bso.jenkins@bsospace.com"'

                    checkout([$class: 'GitSCM',
                              branches: [[name: "${env.GIT_BRANCH}"]],
                              userRemoteConfigs: [[url: "${GIT_URL}"]]])

                    sh "git checkout ${env.GIT_BRANCH?.replaceFirst('origin/', '')}"
                    sh "git pull origin ${env.GIT_BRANCH?.replaceFirst('origin/', '')}"

                    def lastCommitAuthor = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
                    def lastCommitMessage = sh(script: "git log -1 --pretty=format:'%s'", returnStdout: true).trim()

                    echo "Last Commit Author: ${lastCommitAuthor}"
                    echo "Last Commit Message: ${lastCommitMessage}"

                    env.LAST_COMMIT_AUTHOR = lastCommitAuthor
                    env.LAST_COMMIT_MESSAGE = lastCommitMessage
                }
            }
            post {
                always {
                    slackSend channel: "${SLACK_CHANNEL}", color: '#FFA500', message: "Git checkout and pulling completed for branch: ${env.GIT_BRANCH}"
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    sh 'npm install'
                }
            }
            post {
                always {
                    slackSend channel: "${SLACK_CHANNEL}", color: '#00BFFF', message: "Dependencies installation completed for branch: ${env.GIT_BRANCH}"
                }
            }
        }

        stage('Testing with Jest') {
            steps {
                script {
                    sh 'npm test'
                }
            }
            post {
                always {
                    slackSend channel: "${SLACK_CHANNEL}", color: '#00BFFF', message: "Jest testing completed for branch: ${env.GIT_BRANCH}"
                }
            }
        }

        stage('Code Analysis') {
            steps {
                withCredentials([string(credentialsId: 'bso-space-app', variable: 'SONAR_TOKEN')]) {
                    script {
                        def branchName = env.GIT_BRANCH?.replaceFirst('origin/', '')
                        def sonarResult = sh(
                            script: """
                                npm install sonar-scanner
                                npx sonar-scanner \
                                -Dsonar.projectKey=bso-space-app \
                                -Dsonar.host.url=http://sonarqube-dso-demo:9000 \
                                -Dsonar.login=$SONAR_TOKEN \
                                -Dsonar.branch.name=${branchName}
                            """,
                            returnStatus: true
                        )

                        if (sonarResult != 0) {
                            error "SonarQube analysis failed. Halting deployment."
                        } else {
                            echo "SonarQube analysis passed successfully."
                        }
                    }
                }
            }
            post {
                always {
                    def statusColor = currentBuild.result == 'SUCCESS' ? '#36A64F' : '#FF0000'
                    slackSend channel: "${SLACK_CHANNEL}", color: statusColor, message: "SonarQube analysis completed for branch: ${env.GIT_BRANCH}"
                }
            }
        }

        stage('Docker Build & Deploy') {
            when {
                expression {
                    def branchName = env.GIT_BRANCH?.replaceFirst('origin/', '')
                    return (branchName == 'main' || branchName == 'develop' || branchName ==~ /^pre-.*/)
                }
            }
            steps {
                script {
                    sh """
                    docker-compose -p ${STACK_NAME} -f ${DOCKER_COMPOSE_FILE} build --no-cache --build-arg DOCKER_IMAGE_TAG=${DOCKER_IMAGE_TAG}
                    docker-compose -p ${STACK_NAME} -f ${DOCKER_COMPOSE_FILE} up -d
                    """
                }
            }
            post {
                always {
                    slackSend channel: "${SLACK_CHANNEL}", color: '#00FF00', message: "Docker build and deployment completed for branch: ${env.GIT_BRANCH}"
                }
            }
        }
    }
    post {
        always {
            echo 'Pipeline finished'
            slackSend channel: "${SLACK_CHANNEL}", color: '#00FF00', message: """
                *Pipeline Finished*: ${env.JOB_NAME} [#${env.BUILD_NUMBER}]
                *Status*: ${currentBuild.currentResult}
                *Branch*: ${env.GIT_BRANCH}
                *Last Commit By*: ${env.LAST_COMMIT_AUTHOR}
                *Commit Message*: ${env.LAST_COMMIT_MESSAGE}
            """
        }
        success {
            echo 'Pipeline success'
            slackSend channel: "${SLACK_CHANNEL}", color: '#36A64F', message: """
                *Pipeline Success*: ${env.JOB_NAME} [#${env.BUILD_NUMBER}]
                *Branch*: ${env.GIT_BRANCH}
                *Last Commit By*: ${env.LAST_COMMIT_AUTHOR}
                *Commit Message*: ${env.LAST_COMMIT_MESSAGE}
            """
        }
        failure {
            echo 'Pipeline error'
            slackSend channel: "${SLACK_CHANNEL}", color: '#FF0000', message: """
                *Pipeline Failed*: ${env.JOB_NAME} [#${env.BUILD_NUMBER}]
                *Branch*: ${env.GIT_BRANCH}
                *Last Commit By*: ${env.LAST_COMMIT_AUTHOR}
                *Commit Message*: ${env.LAST_COMMIT_MESSAGE}
            """
        }
    }
}
