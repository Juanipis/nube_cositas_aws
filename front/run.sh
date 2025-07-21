#!/bin/bash

# Frontend Run Script - Simple Static Server with Dynamic Backend Configuration
echo "🌐 Starting Todo App Frontend..."
echo "================================"

# Function to validate IP address
validate_ip() {
    local ip=$1
    if [[ $ip =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Ask for backend IP
echo "🔧 Configuration Required:"
echo ""
while true; do
    read -p "📡 Enter your backend IP address (e.g., 44.204.83.247): " BACKEND_IP
    
    if validate_ip "$BACKEND_IP"; then
        break
    else
        echo "❌ Invalid IP address format. Please try again."
    fi
done

# Ask for backend port (with default)
read -p "🔌 Enter backend port [8000]: " BACKEND_PORT
BACKEND_PORT=${BACKEND_PORT:-8000}

# Ask for frontend port (with default)
read -p "🌐 Enter frontend port [3000]: " FRONTEND_PORT
FRONTEND_PORT=${FRONTEND_PORT:-3000}

echo ""
echo "📋 Configuration Summary:"
echo "   • Backend API: http://$BACKEND_IP:$BACKEND_PORT"
echo "   • Frontend Server: http://localhost:$FRONTEND_PORT"
echo ""

# Create dynamic configuration
echo "📝 Creating configuration..."
cat > config.js << EOF
// Dynamic Frontend Configuration
window.ENV = {
  // Direct connection to backend API
  API_BASE_URL: "http://$BACKEND_IP:$BACKEND_PORT",
  
  // Configuration
  ENVIRONMENT: "production",
  BACKEND_IP: "$BACKEND_IP",
  BACKEND_PORT: "$BACKEND_PORT",
  
  // Initialize configuration
  async init() {
    try {
      console.log('🌐 Initializing Todo App...');
      console.log('📡 Backend API URL:', this.API_BASE_URL);
      
      // Test backend connection
      const response = await fetch(`${this.API_BASE_URL}/health`);
      if (response.ok) {
        console.log('✅ Backend connection successful');
        const healthData = await response.json();
        console.log('🔧 Backend Status:', healthData);
      } else {
        console.warn('⚠️  Backend health check failed');
        console.warn('Please ensure your backend is running on ' + this.API_BASE_URL);
      }
    } catch (error) {
      console.warn('⚠️  Could not reach backend:', error.message);
      console.warn('Please ensure your backend is running on ' + this.API_BASE_URL);
    }
  },

  // Get API URL
  getEnvApiUrl() {
    return this.API_BASE_URL;
  }
};

// Initialize configuration when the script loads
window.ENV.init();
EOF

echo "✅ Configuration created successfully"

# Test backend connection
echo "🧪 Testing backend connection..."
if curl -s --connect-timeout 5 "http://$BACKEND_IP:$BACKEND_PORT/health" > /dev/null; then
    echo "✅ Backend is responding at http://$BACKEND_IP:$BACKEND_PORT"
else
    echo "⚠️  Warning: Cannot reach backend at http://$BACKEND_IP:$BACKEND_PORT"
    echo "   Make sure your backend is running before accessing the frontend"
fi

echo ""
echo "🚀 Starting frontend server..."
echo "================================"
echo "📱 Frontend will be available at: http://localhost:$FRONTEND_PORT"
echo "🔗 Backend API configured for: http://$BACKEND_IP:$BACKEND_PORT"
echo ""
echo "📝 Press Ctrl+C to stop the server"
echo ""

# Start the http-server
http-server . -p $FRONTEND_PORT -c-1 --cors -o 