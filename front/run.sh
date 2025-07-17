#!/bin/bash

# Frontend Run Script
echo "🌐 Starting Frontend Server..."

# Load environment variables if .env exists
if [ -f .env ]; then
    echo "📋 Loading environment variables from .env..."
    export $(cat .env | grep -v '^#' | xargs)
    
    # Update config.js with environment variables
    echo "🔧 Updating configuration..."
    cat > config.js << EOL
// Environment configuration for frontend
window.ENV = {
    API_BASE_URL: '${API_BASE_URL:-http://localhost:8000}'
};
EOL
    echo "✅ Configuration updated with API_BASE_URL: ${API_BASE_URL:-http://localhost:8000}"
else
    echo "⚠️  No .env file found, using default configuration"
fi

# Start the http-server
echo "🚀 Starting server on http://localhost:3000..."
echo "📝 Press Ctrl+C to stop the server"
echo ""

http-server . -p 3000 -c-1 --cors 