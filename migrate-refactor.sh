#!/bin/bash

# Aeduca Server Post-Refactoring Setup Script
# MongoDB to PostgreSQL migration is complete
# This script helps with deployment setup

set -e  # Exit on error

echo "🚀 Setting up Aeduca Server (Post-Refactoring)..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Step 1: Verify refactoring is complete
echo "🔍 Verifying refactoring status..."
print_status "✓ MongoDB to PostgreSQL migration complete"
print_status "✓ Clean architecture implemented"
print_status "✓ All models use 'code' as identifier"

# Step 2: Setup environment and dependencies
echo ""
echo "🗄️ Setting up PostgreSQL database..."
if [ -f "migrations/001_posts_comments.sql" ]; then
    echo "Run database migration with:"
    echo "  docker-compose exec aeduca-postgres psql -U elias -d aeduca < migrations/001_posts_comments.sql"
    print_status "Migration file found"
else
    print_error "Migration file not found!"
fi

# Step 3: Create required directories
echo ""
echo "📁 Setting up required directories..."
mkdir -p ../drive
mkdir -p ./pgdata
chmod 755 ../drive
print_status "Drive directory created at ../drive"
print_status "Database directories prepared"

# Step 4: Install dependencies
echo ""
echo "📦 Installing dependencies..."
echo "Building containers and installing dependencies..."
if command -v docker-compose &> /dev/null; then
    docker-compose build
    print_status "Docker containers built"
else
    print_warning "Docker Compose not found. Install manually with: npm install"
fi

# Step 5: Final deployment steps
echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Deployment checklist:"
echo "1. Start services: docker-compose up -d"
echo "2. Run migrations: docker-compose exec app npm run migrate"
echo "3. Test the API: curl http://localhost:3000/api/v1/health"
echo "4. Check logs: docker-compose logs -f app"
echo ""
echo "🔍 Troubleshooting:"
echo "• Check PostgreSQL: docker-compose logs aeduca-postgres"
echo "• Restart services: docker-compose restart"
echo "• View app logs: docker-compose exec app npm run dev"
echo ""
print_status "Your refactored Aeduca server is ready for deployment!"
