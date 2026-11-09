#!/bin/bash

# Database Run Script - Initialize the database
echo "🗄️  Initializing Todo Database..."

# Check if PostgreSQL is running
if ! sudo systemctl is-active --quiet postgresql; then
    echo "❌ PostgreSQL is not running. Please start it first:"
    echo "   sudo systemctl start postgresql"
    exit 1
fi

echo "📋 Creating database and user..."

# Run the initialization script
if sudo -u postgres psql -f init.sql; then
    echo "✅ Database initialization completed successfully!"
    echo ""
    echo "📊 Database Details:"
    echo "   • Database: todoapp"
    echo "   • User: todouser"
    echo "   • Password: todopass"
    echo "   • Host: localhost"
    echo "   • Port: 5432"
    echo ""
    echo "🔗 Connection string:"
    echo "   postgresql://todouser:todopass@localhost:5432/todoapp"
    echo ""
    echo "🔧 You can now start the backend server!"
else
    echo "❌ Database initialization failed!"
    echo "💡 Common issues:"
    echo "   • Database or user might already exist"
    echo "   • PostgreSQL service might not be running"
    echo "   • Insufficient permissions"
    echo ""
    echo "🛠️  To reset the database, you can run:"
    echo "   sudo -u postgres psql -c 'DROP DATABASE IF EXISTS todoapp;'"
    echo "   sudo -u postgres psql -c 'DROP USER IF EXISTS todouser;'"
    echo "   Then run this script again."
    exit 1
fi 