pipeline {
    agent any

    environment {
        SLACK_CHANNEL = '#jenkins-notifications'
        APP_PORT = ''
        DOCKER_IMAGE_TAG = ''
        DOCKER_COMPOSE_FILE = ''
        STACK_NAME = ''
    }

    stages {

        stage('Determine Environment') {
            steps {
                script {
                    def branchName = env.BRANCH_NAME ?: 'unknown'
                    branchName = branchName.replaceFirst('origin/', '')

                    switch (branchName) {
                        case 'develop':
                            env.ENVIRONMENT = 'development'
                            env.ENV_FILE_CREDENTIAL = 'blog-dev-env-file'
                            break
                        case ~/^release\/.*/:
                            env.ENVIRONMENT = 'staging'
                            env.ENV_FILE_CREDENTIAL = 'blog-staging-env-file'
                            break
                        case 'main':
                            env.ENVIRONMENT = 'production'
                            env.ENV_FILE_CREDENTIAL = 'blog-prod-env-file'
                            break
                        default:
                            env.ENVIRONMENT = 'other'
                            echo "Branch ${branchName} is not for deployment. Running Build and Test stages only."
                    }
                }
            }
        }

        stage('Setup .env') {
            when {
                expression { env.ENVIRONMENT != 'other' }
            }
            steps {
                script {
                    withCredentials([file(credentialsId: env.ENV_FILE_CREDENTIAL, variable: 'SECRET_ENV_FILE')]) {
                        sh "cp $SECRET_ENV_FILE .env"
                        echo "Loaded environment file for ${env.ENVIRONMENT}."
                    }
                }
            }
        }

        stage('Setup Environment Variables') {
            steps {
                script {
                    def branchName = env.BRANCH_NAME ?: 'unknown'
                    branchName = branchName.replaceFirst('origin/', '')

                    switch (branchName) {
                        case ~/^pre-.*/:
                            env.DOCKER_COMPOSE_FILE = 'docker-compose.pre.yml'
                            break
                        case 'develop':
                            env.DOCKER_COMPOSE_FILE = 'docker-compose.develop.yml'
                            break
                        case 'main':
                            env.DOCKER_COMPOSE_FILE = 'docker-compose.prod.yml'
                            break
                        default:
                            echo "Branch ${branchName} is unsupported; using default Docker Compose file."
                    }
                }
            }
        }

        stage('Checkout & Pull') {
            steps {
                script {
                    checkout scm
                    env.LAST_COMMIT_AUTHOR = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
                    env.LAST_COMMIT_MESSAGE = sh(script: "git log -1 --pretty=format:'%s'", returnStdout: true).trim()
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

        stage('Run Tests') {
            steps {
                script {
                    sh 'npm test'
                }
            }
        }

        stage('Build & Deploy Docker') {
            when {
                expression { env.ENVIRONMENT != 'other' }
            }
            steps {
                script {
                    if (!env.DOCKER_COMPOSE_FILE) {
                        error("DOCKER_COMPOSE_FILE is not set. Aborting deployment.")
                    }
                    sh """
                        docker compose -f ${env.DOCKER_COMPOSE_FILE} build
                        docker compose -f ${env.DOCKER_COMPOSE_FILE} up -d
                    """
                }
            }
        }
    }

    post {
        always {
            script {
                def color = (currentBuild.result == 'SUCCESS') ? '#36A64F' : '#FF0000'
                slackSend(channel: SLACK_CHANNEL, color: color, message: """
                    *Pipeline Report*
                    *Job*: ${env.JOB_NAME} [#${env.BUILD_NUMBER}]
                    *Status*: ${currentBuild.result}
                    *Branch*: ${env.BRANCH_NAME ?: 'unknown'}
                    *Author*: ${env.LAST_COMMIT_AUTHOR ?: 'unknown'}
                    *Commit Message*: ${env.LAST_COMMIT_MESSAGE ?: 'unknown'}
                """)
            }
        }
    }
}
