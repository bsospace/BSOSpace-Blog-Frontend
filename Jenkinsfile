pipeline {
    agent any
    environment {
        APP_PORT = ''
        GIT_URL = 'https://github.com/BSO-Space/BSOSpace-Blog-Frontend'
        DOCKER_NAME = ''
    }
    parameters {
        string(name: 'BRANCH_NAME', defaultValue: 'main', description: 'Branch name for the build')
        string(name: 'DOCKER_TAG', defaultValue: 'latest', description: 'Docker image tag')
    }
    stages {
        stage('Setup Environment') {
            steps {
                script {
                    if (params.BRANCH_NAME ==~ /^pre-release.*/) {
                        APP_PORT = '3002'
                        DOCKER_NAME = "pre-${params.BRANCH_NAME}"
                    } else if (params.BRANCH_NAME == 'develop') {
                        APP_PORT = '3000'
                        DOCKER_NAME = 'develop'
                    } else if (params.BRANCH_NAME == 'main') {
                        APP_PORT = '9009'
                        DOCKER_NAME = 'default'
                    } else {
                        error("This pipeline only supports main, develop, or pre-release branches. Current branch: ${params.BRANCH_NAME}")
                    }
                }
            }
        }
       stage('Checkout & Pulling') {
        steps {
            script {
                checkout([$class: 'GitSCM',
                        branches: [[name: "${params.BRANCH_NAME}"]],
                        userRemoteConfigs: [[url: "${GIT_URL}"]]])


                sh "git checkout ${params.BRANCH_NAME}"
                sh "git pull origin ${params.BRANCH_NAME}"
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
            steps {
                script {
                    // Use environment variables in Docker Compose
                    sh """
                    APP_PORT=${APP_PORT} DOCKER_NAME=${DOCKER_NAME} docker-compose up -d --build
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
