#!/bin/bash

# Database Installation Script for Ubuntu
echo "🗄️  Installing PostgreSQL Database..."

# Update package list
sudo apt update

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL service
echo "🚀 Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
echo "✅ PostgreSQL version: $(sudo -u postgres psql -c 'SELECT version();' | head -3 | tail -1)"

# Check if PostgreSQL is running
if sudo systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL service is running"
else
    echo "❌ PostgreSQL service failed to start"
    exit 1
fi

echo "🎉 PostgreSQL installation completed!"
echo ""
echo "📋 Next steps:"
echo "   1. Run './run.sh' to initialize the database"
echo "   2. The script will create the 'todoapp' database and 'todouser' user"
echo "   3. Default credentials: username=todouser, password=todopass"
echo ""
echo "🔐 Security note:"
echo "   - Change the default password in production"
echo "   - Configure PostgreSQL authentication as needed" 