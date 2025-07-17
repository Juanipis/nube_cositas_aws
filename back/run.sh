#!/bin/bash

# Backend Run Script
echo "🚀 Starting Backend Server..."

# Load environment variables if .env exists
if [ -f .env ]; then
    echo "📋 Loading environment variables from .env..."
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded"
else
    echo "⚠️  No .env file found, using default configuration"
    echo "🔧 Using default DATABASE_URL: postgresql://todouser:todopass@localhost:5432/todoapp"
fi

# Set default values if not provided
HOST=${HOST:-0.0.0.0}
PORT=${PORT:-8000}

echo "🌐 Starting server on http://${HOST}:${PORT}..."
echo "📝 API documentation will be available at http://${HOST}:${PORT}/docs"
echo "📝 Press Ctrl+C to stop the server"
echo ""

# Start the FastAPI server using Poetry
poetry run uvicorn main:app --host $HOST --port $PORT --reload 