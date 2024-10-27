pipeline {
    agent any
    environment {
        GIT_URL = 'https://github.com/BSO-Space/BSOSpace-Blog-Frontend'
        DOCKER_COMPOSE_FILE = ''
        DOCKER_IMAGE_TAG = ''
        APP_PORT = ''
    }
    stages {
        stage('Setup Environment') {
            steps {
                script {
                    // ระบุ branch ที่ใช้งาน
                    def branchName = env.GIT_BRANCH?.replaceFirst('origin/', '')

                    // กำหนดค่าตาม environment
                    if (branchName ==~ /^pre-.*/) {
                        APP_PORT = '3002'
                        DOCKER_IMAGE_TAG = "pre-production-${branchName}-${BUILD_NUMBER}"
                        DOCKER_COMPOSE_FILE = 'docker-compose.pre.yml'
                        echo "Setting up Pre-Production Environment: ${branchName}"
                    } else if (branchName == 'develop') {
                        APP_PORT = '3000'
                        DOCKER_IMAGE_TAG = "develop-${BUILD_NUMBER}"
                        DOCKER_COMPOSE_FILE = 'docker-compose.develop.yml'
                        echo "Setting up Development Environment: ${branchName}"
                    } else if (branchName == 'main') {
                        APP_PORT = '9009'
                        DOCKER_IMAGE_TAG = "production-${BUILD_NUMBER}"
                        DOCKER_COMPOSE_FILE = 'docker-compose.prod.yml'
                        echo "Setting up Production Environment: ${branchName}"
                    } else {
                        error("This pipeline only supports main, develop, or pre-* branches. Current branch: ${branchName}")
                    }

                    // แสดงค่าตัวแปรที่กำหนด
                    echo "APP_PORT is set to ${APP_PORT}"
                    echo "DOCKER_IMAGE_TAG is set to ${DOCKER_IMAGE_TAG}"
                    echo "Using Docker Compose file: ${DOCKER_COMPOSE_FILE}"
                }
            }
        }

        stage('Checkout & Pulling') {
            steps {
                script {
                    // ตั้งค่า Git configuration
                    sh 'git config --global user.name "bso.jenkins"'
                    sh 'git config --global user.email "bso.jenkins@bsospace.com"'

                    // Checkout branch ที่ถูกเรียกใช้งาน
                    checkout([$class: 'GitSCM',
                              branches: [[name: "${env.GIT_BRANCH}"]],
                              userRemoteConfigs: [[url: "${GIT_URL}"]]])

                    // ยืนยัน branch และ pull การเปลี่ยนแปลงล่าสุด
                    sh "git checkout ${env.GIT_BRANCH?.replaceFirst('origin/', '')}"
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

        stage('Docker Build & Deploy') {
            steps {
                script {
                    // กำหนดค่า image และ build โดยไม่ใช้ cache
                    sh """
                    docker-compose -f ${DOCKER_COMPOSE_FILE} build --no-cache --build-arg DOCKER_IMAGE_TAG=${DOCKER_IMAGE_TAG}
                    docker-compose -f ${DOCKER_COMPOSE_FILE} up -d
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
