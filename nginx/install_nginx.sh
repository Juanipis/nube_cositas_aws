#!/bin/bash

# Nginx Installation and Configuration Script for Ubuntu EC2
# Todo App with Markdown Support

echo "🌐 Installing and configuring Nginx for Todo App"
echo "================================================"

# Update package list
echo "📦 Updating package list..."
sudo apt update

# Install Nginx
echo "🔧 Installing Nginx..."
sudo apt install -y nginx

# Check if installation was successful
if ! command -v nginx &> /dev/null; then
    echo "❌ Error: Nginx installation failed"
    exit 1
fi

echo "✅ Nginx installed successfully"
nginx -v

# Create backup of default configuration
echo "💾 Creating backup of default configuration..."
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)

# Copy our configuration
echo "📝 Copying our Nginx configuration..."
sudo cp nginx.conf /etc/nginx/nginx.conf

# Create log directory if it doesn't exist
sudo mkdir -p /var/log/nginx

# Set proper permissions for the web directory
echo "🔐 Setting proper permissions..."
sudo chown -R $USER:www-data /home/ubuntu/nube_cositas_aws/front
sudo chmod -R 755 /home/ubuntu/nube_cositas_aws/front

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration test passed"
else
    echo "❌ Error: Nginx configuration test failed"
    echo "Please check the configuration file"
    exit 1
fi

# Enable and start Nginx
echo "🚀 Starting Nginx service..."
sudo systemctl enable nginx
sudo systemctl restart nginx

# Check if Nginx is running
if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running successfully"
else
    echo "❌ Error: Nginx failed to start"
    sudo systemctl status nginx
    exit 1
fi

# Configure firewall (if ufw is enabled)
if sudo ufw status | grep -q "Status: active"; then
    echo "🔥 Configuring firewall..."
    sudo ufw allow 'Nginx Full'
    sudo ufw allow 80
    sudo ufw allow 443
    echo "✅ Firewall configured for Nginx"
fi

# Display status
echo ""
echo "🎉 Nginx installation and configuration completed!"
echo ""
echo "📋 Summary:"
echo "   • Nginx is serving your Todo App from: /home/ubuntu/nube_cositas_aws/front"
echo "   • Frontend accessible at: http://52.91.168.59"
echo "   • API proxy to backend: 172.31.84.188:8000"
echo "   • Configuration file: /etc/nginx/nginx.conf"
echo "   • Log files: /var/log/nginx/"
echo ""
echo "🔧 Next steps:"
echo "   1. Ensure your backend is running on 172.31.84.188:8000"
echo "   2. Update your backend CORS settings to allow 52.91.168.59"
echo "   3. Test the application at http://52.91.168.59"
echo "   4. Monitor logs: sudo tail -f /var/log/nginx/access.log"
echo ""
echo "📝 Useful commands:"
echo "   • Restart Nginx: sudo systemctl restart nginx"
echo "   • Check status: sudo systemctl status nginx"
echo "   • Test config: sudo nginx -t"
echo "   • View logs: sudo tail -f /var/log/nginx/error.log" 