pipeline {
    agent any
    environment {
        GIT_URL = 'https://github.com/BSO-Space/BSOSpace-Blog-Frontend'
        DOCKER_COMPOSE_FILE = ''
        DOCKER_IMAGE_TAG = ''
        APP_PORT = ''
        STACK_NAME = ''
        SLACK_CHANNEL = '#jenkins-notifications'
        branchName = '' // Define branchName as a global environment variable
    }
    stages {
        stage('Setup Environment') {
            steps {
                script {
                    // Determine if the build is triggered by a PR
                    def isPullRequest = env.CHANGE_ID != null
                    env.branchName = isPullRequest ? env.CHANGE_BRANCH : env.GIT_BRANCH?.replaceFirst('origin/', '')

                    // Ensure branchName is valid
                    if (!env.branchName) {
                        error("Unable to determine the branch name. Please check the Jenkins configuration.")
                    }

                    // Setup environment based on the branch
                    if (env.branchName ==~ /^pre-.*/) {
                        APP_PORT = '3002'
                        DOCKER_IMAGE_TAG = "pre-production-${env.branchName}-${BUILD_NUMBER}"
                        DOCKER_COMPOSE_FILE = 'docker-compose.pre.yml'
                        STACK_NAME = "bso-blog-pre"
                        echo "Setting up Pre-Production Environment: ${env.branchName}"
                    } else if (env.branchName == 'develop') {
                        APP_PORT = '3000'
                        DOCKER_IMAGE_TAG = "develop-${BUILD_NUMBER}"
                        DOCKER_COMPOSE_FILE = 'docker-compose.develop.yml'
                        STACK_NAME = "bso-blog-develop"
                        echo "Setting up Development Environment: ${env.branchName}"
                    } else if (env.branchName == 'main') {
                        APP_PORT = '9009'
                        DOCKER_IMAGE_TAG = "production-${BUILD_NUMBER}"
                        DOCKER_COMPOSE_FILE = 'docker-compose.prod.yml'
                        STACK_NAME = "bso-blog-production"
                        echo "Setting up Production Environment: ${env.branchName}"
                    } else if (isPullRequest) {
                        echo "Testing Pull Request: ${env.CHANGE_TITLE} (ID: ${env.CHANGE_ID})"
                    } else {
                        error("This pipeline only supports main, develop, pre-* branches, or PRs. Current branch: ${env.branchName}")
                    }

                    // Display assigned environment variables
                    echo "APP_PORT is set to ${APP_PORT}"
                    echo "DOCKER_IMAGE_TAG is set to ${DOCKER_IMAGE_TAG}"
                    echo "Using Docker Compose file: ${DOCKER_COMPOSE_FILE}"
                    echo "STACK_NAME is set to ${STACK_NAME}"
                }
            }
        }

        stage('Checkout & Pulling') {
            steps {
                script {
                    // Configure Git settings
                    sh 'git config --global user.name "bso.jenkins"'
                    sh 'git config --global user.email "bso.jenkins@bsospace.com"'

                    // Checkout branch or PR
                    checkout([$class: 'GitSCM',
                              branches: [[name: "${env.GIT_BRANCH}"]],
                              userRemoteConfigs: [[url: "${GIT_URL}"]]])

                    // Confirm branch or PR checkout and pull latest changes
                    sh "git checkout ${env.branchName}"
                    sh "git pull origin ${env.branchName}"

                    // Store commit information
                    def lastCommitAuthor = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
                    def lastCommitMessage = sh(script: "git log -1 --pretty=format:'%s'", returnStdout: true).trim()

                    // Log the last commit info
                    echo "Last Commit Author: ${lastCommitAuthor}"
                    echo "Last Commit Message: ${lastCommitMessage}"

                    // Store the commit info in environment variables
                    env.LAST_COMMIT_AUTHOR = lastCommitAuthor
                    env.LAST_COMMIT_MESSAGE = lastCommitMessage
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
                    script {
                        def sonarResult = sh(
                            script: '''
                                npm install sonar-scanner
                                npx sonar-scanner \
                                -Dsonar.projectKey=bso-space-app \
                                -Dsonar.host.url=http://sonarqube-dso-demo:9000 \
                                -Dsonar.login=$SONAR_TOKEN
                            ''',
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
        }

        stage('Docker Build & Deploy') {
            when {
                allOf {
                    expression {
                        // Deploy only if not a PR and the branch is main, develop, or pre-*
                        return (env.CHANGE_ID == null) &&
                               (env.branchName == 'main' || env.branchName == 'develop' || env.branchName ==~ /^pre-.*/)
                    }
                    expression {
                        // Deploy only if SonarQube passed
                        return currentBuild.result == null || currentBuild.result == 'SUCCESS'
                    }
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
        }
    }
    post {
        always {
            echo 'Pipeline finished'
            slackSend channel: "${SLACK_CHANNEL}", color: '#00FF00', message: """
                *Pipeline Finished*: ${env.JOB_NAME} [#${env.BUILD_NUMBER}]
                *Status*: ${currentBuild.currentResult}
                *Branch*: ${env.branchName}
                *Last Commit By*: ${env.LAST_COMMIT_AUTHOR}
                *Commit Message*: ${env.LAST_COMMIT_MESSAGE}
            """
        }
        success {
            echo 'Pipeline success'
            slackSend channel: "${SLACK_CHANNEL}", color: '#36A64F', message: """
                *Pipeline Success*: ${env.JOB_NAME} [#${env.BUILD_NUMBER}]
                *Branch*: ${env.branchName}
                *Last Commit By*: ${env.LAST_COMMIT_AUTHOR}
                *Commit Message*: ${env.LAST_COMMIT_MESSAGE}
            """
        }
        failure {
            echo 'Pipeline error'
            slackSend channel: "${SLACK_CHANNEL}", color: '#FF0000', message: """
                *Pipeline Failed*: ${env.JOB_NAME} [#${env.BUILD_NUMBER}]
                *Branch*: ${env.branchName}
                *Last Commit By*: ${env.LAST_COMMIT_AUTHOR}
                *Commit Message*: ${env.LAST_COMMIT_MESSAGE}
            """
        }
    }
}
