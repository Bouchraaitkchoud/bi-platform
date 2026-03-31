#!/bin/bash
# setup.sh - Initial project setup script

echo "🚀 BI Platform - Initial Setup"
echo "=============================="

# Step 1: Check prerequisites
echo "✓ Checking prerequisites..."
command -v node &> /dev/null || { echo "Node.js is required but not installed."; exit 1; }
command -v python &> /dev/null || { echo "Python is required but not installed."; exit 1; }
command -v docker &> /dev/null || { echo "Docker is required but not installed."; exit 1; }
command -v pnpm &> /dev/null || { echo "Installing pnpm..."; npm install -g pnpm; }

# Step 2: Install Poetry if not installed
if ! command -v poetry &> /dev/null; then
    echo "✓ Installing Poetry..."
    curl -sSL https://install.python-poetry.org | python3 -
    export PATH="$HOME/.local/bin:$PATH"
fi

# Step 3: Install backend dependencies
echo "✓ Installing backend dependencies..."
cd apps/api
poetry install
cd ../..

# Step 4: Install frontend dependencies
echo "✓ Installing frontend dependencies..."
cd apps/web
pnpm install
cd ../..

# Step 5: Install root dependencies
echo "✓ Installing root dependencies..."
pnpm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a .env file from .env.example"
echo "2. Start Docker services: pnpm docker:up"
echo "3. Run database migrations: pnpm db:migrate"
echo "4. Start development servers: pnpm dev"
echo ""
echo "Access the application at http://localhost:3000"
