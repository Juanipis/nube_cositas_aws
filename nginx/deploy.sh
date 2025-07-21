#!/bin/bash

# Complete Deployment Script for Todo App with Nginx
# This script sets up the entire stack: Database, Backend, Frontend, and Nginx

set -e  # Exit on any error

echo "🚀 Todo App Complete Deployment with Nginx"
echo "=========================================="
echo ""

# Configuration
PUBLIC_IP="52.91.168.59"
BACKEND_IP="172.31.84.188"
BACKEND_PORT="8000"
PROJECT_DIR="/home/ubuntu/nube_cositas_aws"

echo "📋 Deployment Configuration:"
echo "   • Public IP: $PUBLIC_IP"
echo "   • Backend IP: $BACKEND_IP:$BACKEND_PORT"
echo "   • Project Directory: $PROJECT_DIR"
echo ""

# Check if we're in the right directory
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Error: Project directory $PROJECT_DIR not found"
    echo "Please ensure you're running this from the correct location"
    exit 1
fi

cd "$PROJECT_DIR"

# Step 1: Run Database Migration
echo "🗄️  Step 1: Running Database Migration"
echo "======================================"
cd db/
if [ -f "migration_add_content.sql" ]; then
    # Load environment variables
    if [ -f "../back/env.production" ]; then
        echo "📋 Loading production environment..."
        export $(cat ../back/env.production | grep -v '^#' | xargs)
    elif [ -f "../back/.env" ]; then
        echo "📋 Loading development environment..."
        export $(cat ../back/.env | grep -v '^#' | xargs)
    fi
    
    echo "🔄 Running database migration..."
    if psql "${DATABASE_URL}" -f migration_add_content.sql; then
        echo "✅ Database migration completed"
    else
        echo "⚠️  Database migration failed or already applied"
    fi
else
    echo "⚠️  Migration file not found, skipping..."
fi
cd ..

# Step 2: Configure Backend for Production
echo ""
echo "🔧 Step 2: Configuring Backend for Production"
echo "============================================="
cd back/

# Copy production environment
if [ -f "env.production" ]; then
    cp env.production .env
    echo "✅ Production environment configured"
else
    echo "⚠️  Production environment file not found"
fi

# Install dependencies if needed
if [ -f "pyproject.toml" ]; then
    echo "📦 Installing backend dependencies..."
    poetry install
    echo "✅ Backend dependencies installed"
fi

cd ..

# Step 3: Configure Frontend for Production
echo ""
echo "🎨 Step 3: Configuring Frontend for Production"
echo "=============================================="
cd front/

# Replace config.js with production version
if [ -f "config.production.js" ]; then
    cp config.production.js config.js
    echo "✅ Frontend configured for production"
else
    echo "⚠️  Production frontend config not found"
fi

cd ..

# Step 4: Install and Configure Nginx
echo ""
echo "🌐 Step 4: Installing and Configuring Nginx"
echo "==========================================="
cd nginx/

# Make install script executable
chmod +x install_nginx.sh

# Run Nginx installation
./install_nginx.sh

cd ..

# Step 5: Start Backend Service
echo ""
echo "🔄 Step 5: Starting Backend Service"
echo "=================================="
cd back/

# Kill any existing backend processes
echo "🛑 Stopping any existing backend processes..."
pkill -f "uvicorn.*main:app" || true

# Start backend in background
echo "🚀 Starting backend service..."
nohup poetry run uvicorn main:app --host 0.0.0.0 --port $BACKEND_PORT > ../logs/backend.log 2>&1 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "✅ Backend started successfully (PID: $BACKEND_PID)"
    echo "📝 Backend logs: tail -f $PROJECT_DIR/logs/backend.log"
else
    echo "❌ Backend failed to start"
    exit 1
fi

cd ..

# Step 6: Final Verification
echo ""
echo "🧪 Step 6: Verifying Deployment"
echo "==============================="

# Create logs directory if it doesn't exist
mkdir -p logs

# Test backend directly
echo "Testing backend connection..."
if curl -s "http://$BACKEND_IP:$BACKEND_PORT/health" > /dev/null; then
    echo "✅ Backend health check passed"
else
    echo "⚠️  Backend health check failed"
fi

# Test Nginx
echo "Testing Nginx..."
if curl -s "http://localhost/" > /dev/null; then
    echo "✅ Nginx serving frontend successfully"
else
    echo "⚠️  Nginx test failed"
fi

# Test proxy
echo "Testing Nginx proxy to backend..."
if curl -s "http://localhost/config" > /dev/null; then
    echo "✅ Nginx proxy to backend working"
else
    echo "⚠️  Nginx proxy test failed"
fi

# Final status
echo ""
echo "🎉 Deployment Completed!"
echo "======================="
echo ""
echo "📡 Access your Todo App:"
echo "   • Frontend: http://$PUBLIC_IP"
echo "   • API Health: http://$PUBLIC_IP/health"
echo "   • API Config: http://$PUBLIC_IP/config"
echo ""
echo "📊 Service Status:"
echo "   • Backend PID: $BACKEND_PID"
echo "   • Backend Logs: tail -f $PROJECT_DIR/logs/backend.log"
echo "   • Nginx Status: sudo systemctl status nginx"
echo "   • Nginx Logs: sudo tail -f /var/log/nginx/access.log"
echo ""
echo "🔧 Management Commands:"
echo "   • Restart Backend: cd $PROJECT_DIR/back && poetry run uvicorn main:app --host 0.0.0.0 --port $BACKEND_PORT"
echo "   • Restart Nginx: sudo systemctl restart nginx"
echo "   • View Backend Logs: tail -f $PROJECT_DIR/logs/backend.log"
echo "   • View Nginx Logs: sudo tail -f /var/log/nginx/error.log"
echo ""
echo "🎯 Next Steps:"
echo "   1. Open http://$PUBLIC_IP in your browser"
echo "   2. Test creating todos with markdown content"
echo "   3. Monitor logs for any issues"
echo "   4. Set up SSL certificate for HTTPS (optional)"
echo ""

# Save deployment info
cat > deployment_info.txt << EOF
Todo App Deployment Information
Generated: $(date)

Configuration:
- Public IP: $PUBLIC_IP
- Backend IP: $BACKEND_IP:$BACKEND_PORT
- Project Directory: $PROJECT_DIR

URLs:
- Frontend: http://$PUBLIC_IP
- API Health: http://$PUBLIC_IP/health
- API Config: http://$PUBLIC_IP/config

Process Information:
- Backend PID: $BACKEND_PID
- Backend Log: $PROJECT_DIR/logs/backend.log

Services:
- Nginx: Active
- Backend: Running (PID: $BACKEND_PID)
EOF

echo "📄 Deployment information saved to: deployment_info.txt" 