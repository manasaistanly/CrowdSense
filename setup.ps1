#!/usr/bin/env pwsh
# SustainaTour Setup Script for Windows

Write-Host "🌍 SustainaTour - Setup Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Check Docker
Write-Host "1️⃣  Checking Docker..." -ForegroundColor Cyan
try {
    $dockerVersion = docker --version
    Write-Host "   ✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker not found. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check Node.js
Write-Host "2️⃣  Checking Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js not found. Please install Node.js 20+." -ForegroundColor Red
    exit 1
}

# Create .env from example if it doesn't exist
Write-Host "3️⃣  Setting up environment variables..." -ForegroundColor Cyan
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "   ✅ Created .env file" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  .env file already exists" -ForegroundColor Yellow
}

# Start Docker containers
Write-Host "4️⃣  Starting Docker containers..." -ForegroundColor Cyan
docker-compose up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ PostgreSQL and Redis containers started" -ForegroundColor Green
} else {
    Write-Host "   ❌ Failed to start Docker containers" -ForegroundColor Red
    exit 1
}

# Wait for PostgreSQL to be ready
Write-Host "5️⃣  Waiting for PostgreSQL to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
Write-Host "   ✅ PostgreSQL should be ready" -ForegroundColor Green

# Install root dependencies
Write-Host "6️⃣  Installing root dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Root dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ Failed to install root dependencies" -ForegroundColor Red
}

# Install backend dependencies
Write-Host "7️⃣  Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ Failed to install backend dependencies" -ForegroundColor Red
}

# Generate Prisma Client
Write-Host "8️⃣  Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Prisma Client generated" -ForegroundColor Green
} else {
    Write-Host "   ❌ Failed to generate Prisma Client" -ForegroundColor Red
}

# Run database migrations
Write-Host "9️⃣  Running database migrations..." -ForegroundColor Cyan
npx prisma migrate dev --name init
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Database migrations completed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Migration may have failed or already exists" -ForegroundColor Yellow
}

# Seed the database
Write-Host "🔟 Seeding database..." -ForegroundColor Cyan
npx prisma db seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Database seeded successfully" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Database seeding may have failed" -ForegroundColor Yellow
}

Set-Location ..

# Install frontend dependencies
Write-Host "1️⃣1️⃣  Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ Failed to install frontend dependencies" -ForegroundColor Red
}

Set-Location ..

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "Default Login Credentials:" -ForegroundColor Cyan
Write-Host "  Super Admin:  admin@sustainatour.com / admin123" -ForegroundColor White
Write-Host "  Staff:        staff@sustainatour.com / staff123" -ForegroundColor White
Write-Host "  Tourist:      tourist@example.com / tourist123" -ForegroundColor White
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Or start frontend and backend separately:" -ForegroundColor Cyan
Write-Host "  Terminal 1: cd backend && npm run dev" -ForegroundColor White
Write-Host "  Terminal 2: cd frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Backend:  http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
