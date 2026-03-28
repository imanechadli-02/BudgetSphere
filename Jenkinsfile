pipeline {
    agent any

    environment {
        DB_PASSWORD = credentials('budgetsphere-db-password')
        JWT_SECRET  = credentials('budgetsphere-jwt-secret')
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test Backend') {
            steps {
                dir('Backend') {
                    sh './mvnw test'
                }
            }
            post {
                always {
                    junit 'Backend/target/surefire-reports/*.xml'
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir('Backend') {
                    sh './mvnw package -DskipTests'
                }
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Docker Backend') {
                    steps {
                        sh 'docker build -t budgetsphere-backend ./Backend'
                    }
                }
                stage('Docker Frontend') {
                    steps {
                        sh 'docker build -t budgetsphere-frontend ./FrontEnd'
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker-compose down || true'
                sh 'docker-compose up -d'
            }
        }
    }

    post {
        success {
            echo 'Pipeline réussi ✅'
        }
        failure {
            echo 'Pipeline échoué ❌'
        }
    }
}
