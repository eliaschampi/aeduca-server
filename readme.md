# Aeduca Server

## Description

This is a Node.js server that connects to MongoDB and PostgreSQL. Both database services are running in Docker containers.

## Prerequisites

You need to have the following installed:

- Docker
- Docker Compose
- Aeduca Admin

## Setup

1. Clone the repository:

```bash
git clone git@github.com:aeduca/server.git
```

2. Navigate to the project directory:
   `cd server`

### _*Important:*_

The Docker container name is `serverunning`. Do not create other containers with the same name.

- _Before building the Docker image, make sure to run the PostgreSQL service first. We need to use the local IP of the PostgreSQL container. To obtain it, execute:_

```bash
ip -4 addr show docker0 | grep -Po 'inet \K[\d.]+'
```

- _do not forget change ip value in knexfile and the credentials_

### _*Important 2:*_

fill the _`.env`_ file with our credentials, look, the resources path is relative, so change it according with our
_Aeduca Admin_ path, then change your email credentials.

## Building the Docker Image

Build the Docker image using Docker Compose:

```bash
docker-compose build -t aulaserver .
```

## Running the Application

Start the application with Docker Compose:

```bash
docker-compose up -d
```

- _The server will be running at http://localhost:3000._

## Running Commands Inside the Container

You can execute commands such as npm run lint or npm run dev inside the Docker container using the docker exec command:

```bash
docker exec serverunning npm run lint
docker exec serverunning npm run prettier
```

Useful Docker Commands

1. to build code changes

```bash
docker compose restart app
```

2. to destroy my containers

```bash
docker compose down
```

3. Note. the image is aulaserver

```bash
docker rmi aulaserver
```

Thanks
