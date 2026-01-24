# 🚀 Quick Start Guide

## Prerequisites

Ensure you have the following installed:
- ✅ Node.js 20 or higher
- ✅ Docker & Docker Compose
- ✅ Git

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 2. Start Docker Services

```bash
# Start PostgreSQL and Redis
npm run docker:up

# Check if containers are running
docker ps
```

You should see:
- `sustainatour_postgres` running on port 5432
- `sustainatour_redis` running on port 6379

### 3. Set Up the Database

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with sample data
npx prisma db seed
```

### 4. Start the Development Servers

Open TWO terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Backend will start on: http://localhost:3000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend will start on: http://localhost:5173

### 5. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api/v1
- **Health Check:** http://localhost:3000/health

## Default Login Credentials

After seeding the database, you can log in with:

### Super Admin
- **Email:** admin@sustainatour.com
- **Password:** admin123
- **Role:** Full system access

### Destination Admin (Ooty)
- **Email:** admin.ooty@sustainatour.com
- **Password:** admin123
- **Role:** Manage Ooty destinations

### Staff
- **Email:** staff@sustainatour.com
- **Password:** staff123
- **Role:** Entry verification, capacity updates

### Tourist
- **Email:** tourist@example.com
- **Password:** tourist123
- **Role:** Browse and book destinations

## API Testing

You can test the authentication:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sustainatour.com",
    "password": "admin123"
  }'
```

## Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart Docker containers
npm run docker:down
npm run docker:up
```

### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# Kill the process or change the port in .env
```

### Prisma Client Not Generated
```bash
cd backend
npx prisma generate
```

### Module Not Found
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. ✅ Explore the landing page at http://localhost:5173
2. ✅ Test the authentication API
3. ✅ Review the database schema in `backend/prisma/schema.prisma`
4. ✅ Check the seeded data in Prisma Studio:
   ```bash
   cd backend
   npx prisma studio
   ```
5. ✅ Start building additional features!

## Development Workflow

### Making Database Changes

```bash
cd backend

# 1. Modify schema.prisma
# 2. Create migration
npx prisma migrate dev --name your_migration_name

# 3. Generate new Prisma Client
npx prisma generate
```

### Viewing Database

```bash
cd backend
npx prisma studio
```

### Running Both Servers

From the root directory:
```bash
npm run dev
```

This will run both frontend and backend concurrently.

## Project Structure

```
sustainatour/
├── backend/              # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Auth, RBAC
│   │   └── utils/       # Helpers
│   └── prisma/
│       ├── schema.prisma
│       └── seed.ts
├── frontend/             # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/       # Route components
│   │   ├── components/  # Reusable UI
│   │   └── hooks/       # Custom hooks
└── docker-compose.yml
```

## Environment Variables

Important settings in `.env`:

```env
# Backend runs on this port
PORT=3000

# Frontend connects here
API_URL=http://localhost:3000

# Database connection
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/sustainatour

# JWT secrets (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

## Support

If you encounter any issues:
1. Check the logs in terminal
2. Review the troubleshooting section above
3. Ensure Docker is running
4. Verify all dependencies are installed

Happy coding! 🎉
