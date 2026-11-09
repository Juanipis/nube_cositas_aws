#!/bin/bash

# Frontend Installation Script for Ubuntu - Simple Static Server
echo "🚀 Installing Frontend Dependencies..."

# Update package list
sudo apt update

# Install Node.js and npm (for http-server)
echo "📦 Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install http-server globally for serving static files
echo "🌐 Installing http-server..."
sudo npm install -g http-server

echo "🎉 Frontend installation completed!"
echo ""
echo "📋 What was installed:"
echo "   • Node.js and npm for JavaScript runtime"
echo "   • http-server for serving static files"
echo ""
echo "🔧 Next steps:"
echo "   1. Run './run.sh' to start the frontend server"
echo "   2. You'll be asked to specify your backend IP"
echo "   3. Access your app in the browser" 