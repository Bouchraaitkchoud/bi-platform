# BI Platform - Self-Service Business Intelligence Platform

A modern, self-service BI platform built with:
- **Frontend**: Next.js 16, React 19, TailwindCSS, ShadCN UI
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Infrastructure**: Docker Compose, Redis, MinIO

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+
- Docker & Docker Compose
- pnpm (install with `npm install -g pnpm`)

### Development Setup

1. **Clone and setup**
```bash
git clone <repository>
cd bi-platform
cp .env.example .env
```

2. **Start services with Docker**
```bash
pnpm docker:up
```

3. **Run migrations**
```bash
pnpm db:migrate
```

4. **Start development servers**
```bash
# Terminal 1 - All servers
pnpm dev

# Or separate terminals
pnpm dev:api    # Backend on http://localhost:8000
pnpm dev:web    # Frontend on http://localhost:3000
```

### Access Points
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **PostgreSQL**: localhost:5432

## 📋 Project Structure

```
bi-platform/
├── apps/
│   ├── web/          # Next.js Frontend
│   └── api/          # FastAPI Backend
├── packages/
│   ├── shared-types/ # Shared TypeScript types
│   └── eslint-config/# ESLint configuration
├── docker-compose.yml
├── .env.example
└── package.json      # Root workspace config
```

## 🛠 Available Commands

### Development
```bash
pnpm dev              # Start all services
pnpm dev:api          # Start API only
pnpm dev:web          # Start Web only
```

### Docker
```bash
pnpm docker:up        # Start all containers
pnpm docker:down      # Stop all containers
pnpm docker:logs      # View logs
pnpm docker:build     # Rebuild images
```

### Database
```bash
pnpm db:migrate       # Run migrations
pnpm db:makemigrations "description"  # Create new migration
```

### Testing & Linting
```bash
pnpm test             # Run all tests
pnpm test:api         # Test API
pnpm test:web         # Test Web
pnpm lint             # Lint all code
pnpm format           # Format all code
```

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🔐 Environment Variables

Copy `.env.example` to `.env` and update values:
```bash
POSTGRES_PASSWORD=your_password
SECRET_KEY=your_secret_key
BACKEND_CORS_ORIGINS=http://localhost:3000
```

## 🚀 Features

- User authentication with JWT
- Data import (CSV, Excel, JSON)
- Interactive data visualization
- Dashboard creation and sharing
- Real-time collaboration
- Role-based access control

## 📝 License

MIT
