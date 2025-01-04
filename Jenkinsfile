pipeline {
    agent any

    environment {
        GIT_URL = 'https://github.com/bsospace/BSOSpace-Blog-Frontend'
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
                    switch (env.BRANCH_NAME) {
                        case 'develop':
                            env.ENVIRONMENT = 'development'
                            env.ENV_FILE_CREDENTIAL = 'blog-dev-env-file'
                            break
                        case ~(/release\/.*/):
                            env.ENVIRONMENT = 'staging'
                            env.ENV_FILE_CREDENTIAL = 'blog-staging-env-file'
                            break
                        case 'main':
                            env.ENVIRONMENT = 'production'
                            env.ENV_FILE_CREDENTIAL = 'blog-prod-env-file'
                            break
                        default:
                            env.ENVIRONMENT = 'other'
                            echo "Branch ${env.BRANCH_NAME} is not for deployment. Running Build and Test stages only."
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
                    def branchName = env.BRANCH_NAME?.replaceFirst('origin/', '')

                    switch (branchName) {
                        case ~/^pre-.*/:
                            APP_PORT = '3002'
                            DOCKER_IMAGE_TAG = "pre-production-${branchName}-${BUILD_NUMBER}"
                            DOCKER_COMPOSE_FILE = 'docker-compose.pre.yml'
                            STACK_NAME = "bso-blog-pre"
                            break
                        case 'develop':
                            APP_PORT = '3000'
                            DOCKER_IMAGE_TAG = "develop-${BUILD_NUMBER}"
                            DOCKER_COMPOSE_FILE = 'docker-compose.develop.yml'
                            STACK_NAME = "bso-blog-develop"
                            break
                        case 'main':
                            APP_PORT = '9009'
                            DOCKER_IMAGE_TAG = "production-${BUILD_NUMBER}"
                            DOCKER_COMPOSE_FILE = 'docker-compose.prod.yml'
                            STACK_NAME = "bso-blog-production"
                            break
                        default:
                            error("Unsupported branch: ${branchName}")
                    }

                    echo "APP_PORT=${APP_PORT}, DOCKER_IMAGE_TAG=${DOCKER_IMAGE_TAG}, STACK_NAME=${STACK_NAME}, DOCKER_COMPOSE_FILE=${DOCKER_COMPOSE_FILE}"
                }
            }
        }

        stage('Checkout & Pull') {
            steps {
                script {
                    checkout scm: [$class: 'GitSCM', 
                                  branches: [[name: env.BRANCH_NAME]], 
                                  userRemoteConfigs: [[url: GIT_URL]]]

                    def branch = env.BRANCH_NAME.replaceFirst('origin/', '')
                    sh "git checkout ${branch} && git pull origin ${branch}"

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
            script {
                def color = (currentBuild.result == 'SUCCESS') ? '#36A64F' : '#FF0000'
                slackSend(channel: SLACK_CHANNEL, color: color, message: """
                    *Pipeline Report*
                    *Job*: ${env.JOB_NAME} [#${env.BUILD_NUMBER}]
                    *Status*: ${currentBuild.result}
                    *Branch*: ${env.BRANCH_NAME}
                    *Author*: ${env.LAST_COMMIT_AUTHOR}
                    *Commit Message*: ${env.LAST_COMMIT_MESSAGE}
                """)
            }
        }
    }
}
