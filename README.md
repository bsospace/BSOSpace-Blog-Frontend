# BSO Space Blog Frontend

[![Code Smells](https://sonarqube.bsospace.com/api/project_badges/measure?project=bso-blog&metric=code_smells&token=sqb_510dbd5acec52221843e4c7db5b534331c6ef6b6)](https://sonarqube.bsospace.com/dashboard?id=bso-blog) [![Lines of Code](https://sonarqube.bsospace.com/api/project_badges/measure?project=bso-blog&metric=ncloc&token=sqb_510dbd5acec52221843e4c7db5b534331c6ef6b6)](https://sonarqube.bsospace.com/dashboard?id=bso-blog) [![Quality Gate Status](https://sonarqube.bsospace.com/api/project_badges/measure?project=bso-blog&metric=alert_status&token=sqb_510dbd5acec52221843e4c7db5b534331c6ef6b6)](https://sonarqube.bsospace.com/dashboard?id=bso-blog) [![Security Rating](https://sonarqube.bsospace.com/api/project_badges/measure?project=bso-blog&metric=security_rating&token=sqb_510dbd5acec52221843e4c7db5b534331c6ef6b6)](https://sonarqube.bsospace.com/dashboard?id=bso-blog)

Welcome to the **BSO Space Blog** repository! This open-source project is part of the **BSO Space** platform, a collaborative blog designed specifically for Software Engineering students to share insights, learnings, and projects with a wider audience. This repository contains the frontend code for the BSO Space Blog.

## Table of Contents
- [BSO Space Blog Frontend](#bso-space-blog-frontend)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Tech Stack](#tech-stack)
  - [Features](#features)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Build for Production](#build-for-production)
  - [Contributing](#contributing)
  - [CI/CD Pipeline](#cicd-pipeline)
  - [Testing](#testing)
  - [Code Quality](#code-quality)
  - [License](#license)

## Project Overview

The BSO Space Blog provides a seamless platform where Software Engineering students can post articles, browse through others' content, and engage with the community. This frontend application, built with **Next.js**, interfaces with a backend service using **Prisma** and **PostgreSQL**.

**Live Site:** [https://blog.bsospace.com](https://blog.bsospace.com)

## Tech Stack

- **Frontend Framework:** Next.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **CI/CD Pipeline:** Jenkins
- **Testing Framework:** Jest
- **Code Scanning:** SonarQube
- **Deployment:** Docker

## Features

- **User-Friendly Interface:** Designed with students in mind, the interface is intuitive and responsive.
- **Article Management:** Easily create, edit, and publish articles.
- **Community Engagement:** Read and comment on articles posted by other students.
- **Dashboard for Statistics:** Access statistics related to article views, user engagement, and more.

## Getting Started

To get a local copy up and running, follow these steps:

### Prerequisites

- **Node.js** (v14 or above recommended)
- **Yarn** (optional but recommended for dependency management)
- **Docker** (optional, for containerized development)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/BSO-Space/BSOSpace-Blog-Frontend.git
   cd BSOSpace-Blog-Frontend
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env.local` file at the root of the project and add the necessary environment variables (API endpoints, database credentials, etc.).

4. **Start the development server:**
   ```bash
   yarn dev
   # or
   npm run dev
   ```

   The app should now be running on [http://localhost:3000](http://localhost:3000).

### Build for Production

To build the project for production, run:

```bash
yarn build
# or
npm run build
```

## Contributing

Contributions are welcome! To contribute to this open-source project:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/YourFeature`.
3. Make changes and test thoroughly.
4. Commit your changes: `git commit -m 'Add new feature'`.
5. Push to your branch: `git push origin feature/YourFeature`.
6. Open a pull request.

Please ensure all contributions align with the **Code of Conduct** and follow the project's **Coding Standards**.

## CI/CD Pipeline

This project uses **Jenkins** for Continuous Integration and Continuous Deployment. Upon a pull request, the pipeline performs the following:

- **Testing:** Runs tests with Jest.
- **Code Scanning:** Scans code for potential issues using SonarQube.
- **Deployment:** If all tests pass and no issues are found, the latest code is automatically deployed using Docker.

## Testing

We use **Jest** for unit and integration tests to ensure code reliability and functionality. To run tests locally:

```bash
yarn test
# or
npm test
```

## Code Quality

**SonarQube** is integrated into our CI/CD pipeline to maintain high code quality. All code must pass SonarQube checks before merging.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
