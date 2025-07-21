#!/bin/bash

# Database Migration Runner
# Adds content column to existing todos table

echo "🔄 Running database migration: Add content column to todos table"
echo "================================================"

# Load environment variables if .env exists in parent directory
if [ -f "../back/.env" ]; then
    echo "📋 Loading environment variables from ../back/.env..."
    export $(cat ../back/.env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded"
else
    echo "⚠️  No .env file found in ../back/, using default configuration"
    echo "🔧 Using default DATABASE_URL: postgresql://todouser:todopass@localhost:5432/todoapp"
    export DATABASE_URL="postgresql://todouser:todopass@localhost:5432/todoapp"
fi

echo ""
echo "🗄️  Database URL: ${DATABASE_URL}"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql command not found"
    echo "   Please install PostgreSQL client tools"
    exit 1
fi

# Test database connection
echo "🔌 Testing database connection..."
if psql "${DATABASE_URL}" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Error: Cannot connect to database"
    echo "   Please check your database connection and credentials"
    exit 1
fi

echo ""

# Run the migration
echo "🚀 Running migration script..."
echo "================================================"

if psql "${DATABASE_URL}" -f migration_add_content.sql; then
    echo "================================================"
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📋 Summary of changes:"
    echo "   • Added 'content' column to 'todos' table"
    echo "   • Column type: TEXT (nullable)"
    echo "   • Existing todos will have empty content"
    echo ""
    echo "🎉 Your database is now ready for markdown content!"
else
    echo "❌ Migration failed!"
    echo "   Please check the error messages above"
    exit 1
fi 