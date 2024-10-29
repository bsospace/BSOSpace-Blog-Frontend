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
                        error("This pipeline only supports main, develop, or pre-* branches. Current branch: ${branchName}")
                    }

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
                    sh 'git config --global user.name "bso.jenkins"'
                    sh 'git config --global user.email "bso.jenkins@bsospace.com"'
                    checkout([$class: 'GitSCM', branches: [[name: "${env.GIT_BRANCH}"]], userRemoteConfigs: [[url: "${GIT_URL}"]]])
                    sh "git checkout ${env.GIT_BRANCH?.replaceFirst('origin/', '')}"
                    sh "git pull origin ${env.GIT_BRANCH?.replaceFirst('origin/', '')}"
                    def lastCommitAuthor = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
                    def lastCommitMessage = sh(script: "git log -1 --pretty=format:'%s'", returnStdout: true).trim()
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

        stage('Quality Gate') {
            steps {
                withCredentials([string(credentialsId: 'bso-space-app', variable: 'SONAR_TOKEN')]) {
                    script {
                        def response = sh(
                            script: "curl -s -u ${SONAR_TOKEN}: https://sonarqube.bsospace.com/api/qualitygates/project_status?projectKey=bso-space-app",
                            returnStdout: true
                        ).trim()
                        def qualityGate = new groovy.json.JsonSlurper().parseText(response)
                        env.QUALITY_GATE_STATUS = qualityGate?.projectStatus?.status ?: "UNKNOWN"

                        def qualitySummary = "Quality Gate Status: ${env.QUALITY_GATE_STATUS}\n"
                        qualityGate?.projectStatus?.conditions.each { condition ->
                            qualitySummary += "Metric: ${condition.metricKey}, Status: ${condition.status}, " +
                                              "Actual: ${condition.actualValue}, Threshold: ${condition.errorThreshold}\n"
                        }
                        echo qualitySummary
                        env.QUALITY_SUMMARY = qualitySummary

                        if (env.QUALITY_GATE_STATUS != 'OK') {
                            error "Quality Gate failed with status: ${env.QUALITY_GATE_STATUS}"
                        }
                    }
                }
            }
        }

        stage('Docker Build & Deploy') {
            when {
                expression {
                    return currentBuild.result == null || currentBuild.result == 'SUCCESS'
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
            script {
                // กำหนดสีสำหรับข้อความแจ้งเตือนตามผลลัพธ์ของ Pipeline
                def color = currentBuild.currentResult == 'SUCCESS' ? '#36A64F' : '#FF0000'

                // จัดเตรียมข้อมูล Quality Gate Summary
                def qualityGateSummary = env.QUALITY_GATE_STATUS == 'OK' ? "*Quality Gate*: ✅ *Passed*" : "*Quality Gate*: ❌ *Failed*"
                if (env.QUALITY_SUMMARY) {
                    // ปรับข้อความให้ดูเป็นระเบียบด้วย bullet points
                    qualityGateSummary += "\n" + env.QUALITY_SUMMARY.split("\n").collect { line ->
                        line.startsWith("Metric:") ? "🔹 ${line}" : line
                    }.join("\n")
                } else {
                    qualityGateSummary += "\n_No detailed Quality Gate Summary available_"
                }

                // ส่งข้อความไปยัง Slack โดยจัดรูปแบบให้สวยงามและอ่านง่ายขึ้น
                slackSend channel: "${SLACK_CHANNEL}", color: color, message: """
                    *📈 Pipeline Report for ${env.JOB_NAME}* [#${env.BUILD_NUMBER}]
                    *😎 Status*: ${currentBuild.currentResult == 'SUCCESS' ? "✅ *Success*" : "❌ *Failed*"}
                    *🌿 Branch*: ${env.GIT_BRANCH}
                    *💪 Last Commit By*: ${env.LAST_COMMIT_AUTHOR}
                    *📄 Commit Message*: _${env.LAST_COMMIT_MESSAGE}_

                    *🔍 Quality Gate Summary:*
                    ```
                    ${qualityGateSummary}
                    ```
                """
            }
        }
    }
}
