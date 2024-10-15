pipeline{
    agent any
    environment{
        APP_PORT='3000'
        GIT_URL='https://github.com/BSO-Space/bso-space-blog'
    }
    parameters {
        string(name: 'BRANCH_NAME', defaultValue: 'main', description: 'Branch name for the build')
        string(name: 'DOCKER_TAG', defaultValue: 'latest', description: 'Docker image tag')
    }
    stages{
        stage("Checkout & Pulling"){
            steps{
                script{
                    git branch: "${params.BRANCH_NAME}", url: "${GIT_URL}"
                    if ("${params.BRANCH_NAME}" != "main") {
                        error("This pipeline only runs on the main branch. Current branch: ${params.BRANCH_NAME}")
                    }
                    sh "git pull origin ${params.BRANCH_NAME}"
                }
            }
            post{
                always{
                    echo "In Processing"
                }
                success{
                    echo "Successful"
                }
                failure{
                    echo "Failed"
                }
            }
        }

        stage("Install Dependencies"){
            steps{
                script{
                    sh 'npm install'
                }
            }
        }
        stage("Testing with Jest"){
            steps{
                script{
                    sh 'npm test'
                }
            }
        }
        stage("Code analysis"){
            steps{
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
        stage("Docker deployment"){
            steps{
                sh 'docker-compose up -d --build'
            }
        }
        }
    post{
        always{
            echo "Pipline finished"
        }
        success{
            echo "Pipline success"
        }
        failure{
            echo "Pipline error"
        }
    }
}