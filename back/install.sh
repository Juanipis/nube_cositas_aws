#!/bin/bash

# Backend Installation Script for Ubuntu
echo "🚀 Installing Backend Dependencies..."

# Update package list
sudo apt update

# Install Python 3.9+ and pip
echo "🐍 Installing Python and pip..."
sudo apt install -y python3 python3-pip python3-venv

# Verify Python installation
echo "✅ Python version: $(python3 --version)"

# Install Poetry
echo "📦 Installing Poetry..."
curl -sSL https://install.python-poetry.org | python3 -

# Add Poetry to PATH
export PATH="$HOME/.local/bin:$PATH"
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc

# Verify Poetry installation
if command -v poetry &> /dev/null; then
    echo "✅ Poetry version: $(poetry --version)"
else
    echo "⚠️  Poetry installation might need PATH refresh. Please run 'source ~/.bashrc' and try again."
fi

# Install project dependencies
echo "📚 Installing project dependencies..."
poetry install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ Created .env file from template"
    echo "📋 Please edit .env file to configure your database connection"
else
    echo "ℹ️  .env file already exists"
fi

echo "🎉 Backend installation completed!"
echo ""
echo "📋 Next steps:"
echo "   1. Ensure PostgreSQL is installed and running"
echo "   2. Create database and user as specified in .env"
echo "   3. Edit .env file with your database credentials"
echo "   4. Run './run.sh' to start the backend server" 