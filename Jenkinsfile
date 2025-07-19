pipeline {
    agent any

    environment {
        DISCORD_WEBHOOK = credentials('discord-webhook')
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
                            env.DOCKER_COMPOSE_FILE = ''
                            env.ENV_FILE_CREDENTIAL = 'blog-dev-env-file'
                    }
                }
            }
        }

        stage('Setup .env') {
            steps {
                script {
                    withCredentials([file(credentialsId: env.ENV_FILE_CREDENTIAL, variable: 'SECRET_ENV_FILE')]) {
                        sh "cp $SECRET_ENV_FILE .env"
                    }
                }
            }
        }

        stage('Checkout & Pull') {
            steps {
                script {
                    checkout scm
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    sh 'npm ci'
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    sh 'npm run build'
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

        stage("Run SonarQube") {
            environment {
                scannerHome = tool 'SonarQube-Scanner';
            }
            steps {
                withSonarQubeEnv('SonarQube-Scanner') {  
                    sh """
                        ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=bso-blog \
                            -Dsonar.sources=. \
                    """
                }
            }
        }

        stage('Build & Deploy Docker') {
            when {
                expression { env.ENVIRONMENT != 'other' && env.DOCKER_COMPOSE_FILE?.trim() }
            }
            steps {
                script {
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
                def color = (currentBuild.result == 'SUCCESS') ? 3066993 : 15158332
                def status = (currentBuild.result == 'SUCCESS') ? '✅ Success' : '❌ Failure'
                def timestamp = new Date().format("yyyy-MM-dd'T'HH:mm:ss'Z'", TimeZone.getTimeZone('UTC'))

                def payload = [
                    content: null,
                    embeds: [[
                        title: "🚀 Pipeline Execution Report For BSO Blog Front-end",
                        description: "Pipeline execution details below:",
                        color: color,
                        thumbnail: [
                            url: "https://raw.githubusercontent.com/bsospace/assets/refs/heads/main/LOGO/LOGO%20WITH%20CIRCLE.ico"
                        ],
                        fields: [
                            [name: "Job", value: "${env.JOB_NAME} [#${env.BUILD_NUMBER}]", inline: true],
                            [name: "Status", value: status, inline: true],
                            [name: "Branch", value: "${env.BRANCH_NAME ?: 'unknown'}", inline: true]
                        ],
                        footer: [
                            text: "Pipeline executed at",
                            icon_url: "https://raw.githubusercontent.com/bsospace/assets/refs/heads/main/LOGO/LOGO%20WITH%20CIRCLE.ico"
                        ],
                        timestamp: timestamp
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