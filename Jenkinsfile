pipeline {
    agent any

    environment {
        DISCORD_WEBHOOK = credentials('discord-webhook')
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
                            env.DOCKER_COMPOSE_FILE = 'docker-compose.develop.yml'
                            break
                        case ~/^release\/.*/:
                            env.ENVIRONMENT = 'staging'
                            env.ENV_FILE_CREDENTIAL = 'blog-staging-env-file'
                            env.DOCKER_COMPOSE_FILE = 'docker-compose.pre.yml'
                            break
                        case 'main':
                            env.ENVIRONMENT = 'production'
                            env.ENV_FILE_CREDENTIAL = 'blog-prod-env-file'
                            env.DOCKER_COMPOSE_FILE = 'docker-compose.prod.yml'
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
                def color = (currentBuild.result == 'SUCCESS') ? 65280 : 16711680
                def status = (currentBuild.result == 'SUCCESS') ? 'Success' : 'Failure'

                // debug discord webhhok
                echo "DISCORD_WEBHOOK: ${env.DISCORD_WEBHOOK}"
                def payload = [
                    content: null,
                    embeds: [[
                        title: "Pipeline Report",
                        description: """
                            **Job**: ${env.JOB_NAME} [#${env.BUILD_NUMBER}]\n
                            **Status**: ${status}\n
                            **Branch**: ${env.BRANCH_NAME ?: 'unknown'}\n
                            **Author**: ${env.LAST_COMMIT_AUTHOR ?: 'unknown'}\n
                            **Commit Message**: ${env.LAST_COMMIT_MESSAGE ?: 'unknown'}
                        """,
                        color: color
                    ]]
                ]
                httpRequest(
                    url: env.DISCORD_WEBHOOK,
                    httpMode: 'POST',
                    contentType: 'APPLICATION_JSON',
                    requestBody: groovy.json.JsonOutput.toJson(payload)
                )
            }
        }
    }
}
