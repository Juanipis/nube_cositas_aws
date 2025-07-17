#!/bin/bash

# Frontend Installation Script for Ubuntu
echo "🚀 Installing Frontend Dependencies..."

# Update package list
sudo apt update

# Install Node.js and npm
echo "📦 Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install http-server globally for serving static files
echo "🌐 Installing http-server..."
sudo npm install -g http-server

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
# Frontend Environment Variables
API_BASE_URL=http://localhost:8000
EOL
    echo "✅ Created .env file with default values"
else
    echo "ℹ️  .env file already exists"
fi

echo "🎉 Frontend installation completed!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env file to configure your API endpoint"
echo "   2. Run './run.sh' to start the frontend server" 