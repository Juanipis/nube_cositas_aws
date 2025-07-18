#!/bin/bash

# Configuration Script for Todo App
# This script helps configure environment variables for different deployment scenarios

set -e

echo "🔧 Todo App Configuration Script"
echo "================================"

# Function to create .env file
create_env_file() {
    local env_type=$1
    local backend_ip=$2
    local frontend_ip=$3
    local db_ip=$4
    
    echo "📝 Creating .env file for $env_type deployment..."
    
    if [ "$env_type" = "local" ]; then
        cp back/env.local back/.env
        echo "✅ Created local development .env file"
    elif [ "$env_type" = "aws" ]; then
        cat > back/.env << EOF
# AWS VPC Configuration
DATABASE_URL=postgresql://todouser:todopass@${db_ip}:5432/todoapp

# CORS Configuration
CORS_ORIGINS=http://${frontend_ip},http://${frontend_ip}:80,http://${frontend_ip}:8080

# Server Configuration
HOST=0.0.0.0
PORT=8000

# Frontend Configuration
FRONTEND_HOST=${frontend_ip}
FRONTEND_PORT=80
FRONTEND_PROTOCOL=http

# Backend Configuration
BACKEND_HOST=${backend_ip}
BACKEND_PORT=8000
BACKEND_PROTOCOL=http

# Environment
ENVIRONMENT=production
EOF
        echo "✅ Created AWS VPC .env file"
    fi
}

# Function to update frontend config
update_frontend_config() {
    local backend_ip=$1
    
    echo "📝 Updating frontend configuration..."
    
    # Create a simple config that points to the backend
    cat > front/config.js << EOF
// Environment configuration for frontend
window.ENV = {
  API_BASE_URL: "http://${backend_ip}:8000",
  
  // Initialize configuration
  async init() {
    try {
      // Try to get dynamic configuration from backend
      const response = await fetch(\`\${this.API_BASE_URL}/config\`);
      if (response.ok) {
        const config = await response.json();
        this.API_BASE_URL = config.apiBaseUrl;
        console.log('Using dynamic API URL:', this.API_BASE_URL);
      }
    } catch (error) {
      console.warn('Using static API URL:', this.API_BASE_URL);
    }
  }
};

// Initialize configuration when the script loads
window.ENV.init();
EOF
    
    echo "✅ Updated frontend configuration"
}

# Main menu
echo ""
echo "Select deployment type:"
echo "1) Local development"
echo "2) AWS VPC deployment" 
echo "3) Custom configuration"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🏠 Setting up local development..."
        create_env_file "local"
        update_frontend_config "localhost"
        echo ""
        echo "✅ Local development setup complete!"
        echo "📋 Next steps:"
        echo "   1. Start PostgreSQL locally"
        echo "   2. Run 'cd back && ./run.sh' to start backend"
        echo "   3. Open front/index.html in browser"
        ;;
    2)
        echo ""
        read -p "Enter Backend EC2 IP (e.g., 172.31.84.125): " backend_ip
        read -p "Enter Frontend EC2 IP (e.g., 172.31.81.41): " frontend_ip
        read -p "Enter Database IP (default: same as backend): " db_ip
        
        # Use backend IP as default for database if not provided
        db_ip=${db_ip:-$backend_ip}
        
        create_env_file "aws" "$backend_ip" "$frontend_ip" "$db_ip"
        update_frontend_config "$backend_ip"
        
        echo ""
        echo "✅ AWS VPC setup complete!"
        echo "📋 Configuration created for:"
        echo "   - Backend: $backend_ip:8000"
        echo "   - Frontend: $frontend_ip"
        echo "   - Database: $db_ip:5432"
        echo ""
        echo "📋 Next steps:"
        echo "   1. Copy .env file to backend EC2"
        echo "   2. Configure security groups as documented"
        echo "   3. Start backend with './run.sh'"
        echo "   4. Deploy frontend files to frontend EC2"
        ;;
    3)
        echo ""
        echo "🛠️  Custom configuration selected"
        echo "Please edit back/env.example and copy to back/.env"
        echo "Please edit front/config.js with your backend URL"
        ;;
    *)
        echo "❌ Invalid option selected"
        exit 1
        ;;
esac

echo ""
echo "🎉 Configuration complete!" 