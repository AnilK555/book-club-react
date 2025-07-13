# Docker Setup for Book Club Application

This document provides detailed instructions for running the Book Club application using Docker.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 1.29 or higher)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd book-club-react
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Application: http://localhost:3001
   - MongoDB: mongodb://localhost:27017

## Docker Services

### book-club-app
- **Image**: Built from local Dockerfile
- **Port**: 3001
- **Environment Variables**:
  - `MONGODB_URI=mongodb://mongodb:27017/bookclub`
  - `JWT_SECRET=my-secret-key`
- **Dependencies**: mongodb service

### mongodb
- **Image**: mongo:7.0
- **Port**: 27017
- **Data Persistence**: mongodb_data volume

## Docker Commands

```bash
# Build and start services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop services
docker-compose down

# View logs
docker-compose logs

# View specific service logs
docker-compose logs book-club-app
docker-compose logs mongodb

# Rebuild specific service
docker-compose build book-club-app

# Remove all containers and volumes
docker-compose down -v
```

## Environment Variables

The Docker setup uses the following environment variables (configured in docker-compose.yml):

- `MONGODB_URI`: Connection string for MongoDB service
- `JWT_SECRET`: Secret key for JWT authentication
- `PORT`: Server port (defaults to 3001)

## Data Persistence

MongoDB data is persisted using a Docker volume named `mongodb_data`. This ensures your data survives container restarts.

## Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using port 3001
   lsof -i :3001
   
   # Kill process if needed
   kill -9 <PID>
   ```

2. **Build failures**
   ```bash
   # Clean build
   docker-compose down
   docker system prune -f
   docker-compose up --build
   ```

3. **Database connection issues**
   ```bash
   # Check if MongoDB is running
   docker-compose ps
   
   # View MongoDB logs
   docker-compose logs mongodb
   ```

## Development with Docker

For development, you might want to mount your source code:

```yaml
# Add to docker-compose.yml under book-club-app service
volumes:
  - .:/app
  - /app/node_modules
```

This allows you to make changes without rebuilding the container.
