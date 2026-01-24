# 🌍 SustainaTour - Adaptive Tourism Management Platform

A production-ready web application for intelligent tourism management that balances visitor inflows with ecological sustainability, infrastructure capacity, and community wellbeing.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ LTS
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sustainatour
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Docker services (PostgreSQL & Redis)**
   ```bash
   npm run docker:up
   ```

5. **Set up the database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

6. **Start development servers**
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 📁 Project Structure

```
sustainatour/
├── backend/              # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Auth, RBAC, validation
│   │   ├── utils/       # Helpers
│   │   └── server.ts    # Entry point
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
├── frontend/             # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/       # Route components
│   │   ├── components/  # Reusable UI
│   │   ├── hooks/       # Custom hooks
│   │   ├── lib/         # API client
│   │   └── styles/      # Global styles
│   └── package.json
├── docker-compose.yml
├── .env.example
└── package.json
```

## 👥 User Roles & Permissions

1. **SUPER_ADMIN** - Full system access
2. **DESTINATION_ADMIN** - Manage assigned destinations
3. **STAFF** - Entry verification, capacity updates
4. **ANALYST** - Read-only analytics access
5. **COMMUNITY_REP** - Community impact metrics
6. **TOURIST** - Browse and book destinations

## 🔑 Default Login Credentials

After seeding the database:

- **Super Admin**: `admin@sustainatour.com` / `admin123`
- **Destination Admin**: `admin.ooty@sustainatour.com` / `admin123`
- **Staff**: `staff@sustainatour.com` / `staff123`
- **Tourist**: `tourist@example.com` / `tourist123`

## 🛠️ Available Scripts

### Root
- `npm run dev` - Start both frontend and backend
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers

### Backend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests

### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🎨 Tech Stack

### Frontend
- React 18.2 + TypeScript
- Vite
- TailwindCSS + shadcn/ui
- React Router v6
- TanStack Query (React Query)
- Zustand (State Management)
- Recharts (Data Visualization)

### Backend
- Node.js 20 + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Redis
- JWT Authentication
- bcrypt for password hashing

## 📊 Key Features

- ✅ Role-Based Access Control (RBAC)
- ✅ Real-time Capacity Monitoring
- ✅ Intelligent Booking System
- ✅ QR Code Entry Passes
- ✅ Dynamic Pricing Engine
- ✅ Analytics Dashboard
- ✅ Environmental Impact Tracking
- ✅ Community Transparency Portal

## 🔒 Security

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation
- SQL injection prevention (Prisma ORM)
- XSS protection

## 📚 API Documentation

API documentation available at: `http://localhost:3000/api-docs` (when running)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

## 🚀 Deployment

See `deployment-guide.md` for detailed production deployment instructions.

## 📝 License

MIT License - see LICENSE file for details

## 👨‍💻 Development Team

Built with ❤️ by the SustainaTour Team

## 🤝 Contributing

Contributions welcome! Please read `CONTRIBUTING.md` first.

---

**Version:** 1.0.0  
**Last Updated:** January 2026
