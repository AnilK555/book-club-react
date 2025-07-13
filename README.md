# Book Club React Application

A full-stack book club management application built with React, Express.js, and MongoDB.

# Book Club React Application

A full-stack book club management application built with React, Express.js, and MongoDB.

## Prerequisites

Before running this application, make sure you have the following installed:
- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (if running locally) or access to MongoDB Atlas
- **Docker** and **Docker Compose** (for containerized setup)

## Setup Options

### Option 1: Local Development Setup

#### 1. Clone and Install
```bash
git clone <repository-url>
cd book-club-react
npm install
```

#### 2. Environment Setup
```bash
# Copy the environment template
cp .env.template .env

# Edit .env file with your values
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/bookclub
JWT_SECRET=your-secure-secret-key-here
PORT=3001
NODE_ENV=development
```

#### 3. Database Setup
Make sure MongoDB is running locally:
```bash
# On macOS with Homebrew
brew services start mongodb/brew/mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

#### 4. Run the Application
```bash
# Start backend server
npm run server:dev

# In a new terminal, start frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Option 2: Docker Setup (Recommended for consistency)

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd book-club-react
```

#### 2. Run with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

The application will be available at:
- Application: http://localhost:3001
- MongoDB: mongodb://localhost:27017

#### 3. Stop Docker Services
```bash
docker-compose down
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/bookclub` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secure-secret-key` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` or `production` |

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the MONGODB_URI in your `.env` file
   - For Docker: ensure the mongodb service is healthy

2. **Port Already in Use**
   - Change the PORT in your `.env` file
   - Kill any processes using the port: `lsof -ti:3001 | xargs kill -9`

3. **Dependencies Issues**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

4. **Docker Issues**
   - Ensure Docker is running
   - Try: `docker-compose down && docker-compose up --build`

## Architecture Decisions & Trade-offs

### Technology Choices

**Frontend: React + Vite + Tailwind**
- Fast development, modern tooling, utility-first CSS

**Backend: Express.js + MongoDB**
- Flexible schema, rapid development, JavaScript everywhere
**Authentication: JWT**
- Stateless, scalable, mobile-friendly

**State Management: Context API**
- Built into React, simple for small apps

### Key Design Decisions

1. **Service Layer Pattern** - Separated business logic from routes
2. **Component-Based Architecture** - Reusable UI components
3. **Custom Hooks** - Separated data logic from UI
4. **NoSQL Database** - Flexible book metadata structure
