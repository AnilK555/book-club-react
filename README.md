# Book Club React Application

A full-stack book club management application built with React, Express.js, and MongoDB.

## How to Install, Run, and Test

### Install
```bash
git clone <repository-url>
cd book-club-react
npm install
```

### Setup Environment
Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/bookclub
JWT_SECRET=your-secret-key
```

### Run
```bash
# Start backend
npm run server:dev

# Start frontend (new terminal)
npm run dev
```

### Test
```bash
# Run tests
npm test

# Lint code
npm run lint

```

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
