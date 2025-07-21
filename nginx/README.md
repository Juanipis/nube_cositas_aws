# Nginx Configuration for Todo App with Markdown

## 🌐 Overview

This directory contains a complete Nginx configuration for deploying your Todo App with markdown support. The setup includes:

- **Static file serving** for the frontend from `~/nube_cositas_aws/front`
- **Reverse proxy** to backend API on `172.31.84.188:8000`
- **Security headers** and rate limiting
- **CORS configuration** for cross-origin requests
- **Gzip compression** for optimal performance
- **SSL-ready configuration** for future HTTPS setup

## 📋 Architecture

```
Internet → AWS EC2 (52.91.168.59)
    ↓
Nginx (Port 80)
    ├── / → Static Frontend Files (/home/ubuntu/nube_cositas_aws/front)
    ├── /todos → Backend Proxy (172.31.84.188:8000)
    ├── /config → Backend Proxy (172.31.84.188:8000)
    └── /health → Backend Proxy (172.31.84.188:8000)
```

## 🚀 Quick Deployment

### Option 1: Automated Deployment (Recommended)
```bash
cd nginx/
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Step-by-Step
```bash
# 1. Install and configure Nginx
cd nginx/
chmod +x install_nginx.sh
./install_nginx.sh

# 2. Configure backend for production
cd ../back/
cp env.production .env

# 3. Configure frontend for production
cd ../front/
cp config.production.js config.js

# 4. Start backend
cd ../back/
poetry run uvicorn main:app --host 0.0.0.0 --port 8000 &

# 5. Access your app
# Open http://52.91.168.59 in your browser
```

## 📁 Files in this Directory

- **`nginx.conf`** - Complete Nginx configuration
- **`install_nginx.sh`** - Nginx installation and setup script
- **`deploy.sh`** - Complete automated deployment script
- **`README.md`** - This documentation

## 🔧 Configuration Details

### Frontend Serving
- **Location**: `/home/ubuntu/nube_cositas_aws/front`
- **Static assets**: Cached for 1 year with immutable headers
- **HTML files**: No caching to ensure updates are served immediately
- **Fallback**: All routes fall back to `index.html` for SPA behavior

### Backend Proxy
- **Target**: `172.31.84.188:8000`
- **Endpoints proxied**:
  - `/todos/*` - Todo CRUD operations
  - `/config` - Dynamic configuration
  - `/health` - Health check
  - `/api/*` - Alternative API prefix (strips `/api` before forwarding)

### Security Features
- **Rate limiting**: 10 requests/second for API, 30 requests/second for static files
- **Security headers**: XSS protection, content type sniffing prevention
- **CORS headers**: Properly configured for frontend-backend communication
- **Hidden files protection**: Denies access to `.` files and backup files

### Performance Optimizations
- **Gzip compression**: Enabled for text files, CSS, JS, JSON
- **Keepalive connections**: Maintains persistent connections to backend
- **Efficient file serving**: Uses `sendfile` for optimal static file delivery

## 🌍 Environment Configurations

### Production Configuration
- **Frontend URL**: `http://52.91.168.59`
- **Backend API**: Proxied through Nginx (no direct access needed)
- **CORS Origins**: Includes public IP and localhost for development

### Files Updated for Production
1. **`back/env.production`** - Backend environment with correct CORS settings
2. **`front/config.production.js`** - Frontend configured for relative API URLs

## 🔍 Monitoring and Troubleshooting

### Log Files
```bash
# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Backend logs (if using deployment script)
tail -f ~/nube_cositas_aws/logs/backend.log
```

### Service Management
```bash
# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Test Nginx configuration
sudo nginx -t

# Reload Nginx configuration (without restart)
sudo systemctl reload nginx
```

### Testing Endpoints
```bash
# Test frontend
curl http://52.91.168.59/

# Test backend proxy
curl http://52.91.168.59/health
curl http://52.91.168.59/config

# Test API endpoints
curl http://52.91.168.59/todos
```

## 🐛 Common Issues and Solutions

### 1. Nginx Permission Errors
```bash
# Fix file permissions
sudo chown -R ubuntu:www-data /home/ubuntu/nube_cositas_aws/front
sudo chmod -R 755 /home/ubuntu/nube_cositas_aws/front
```

### 2. Backend Connection Issues
```bash
# Check if backend is running
curl http://172.31.84.188:8000/health

# Check backend logs
tail -f ~/nube_cositas_aws/logs/backend.log
```

### 3. CORS Errors
- Ensure `CORS_ORIGINS` in backend includes `http://52.91.168.59`
- Check browser console for specific CORS error messages
- Verify Nginx is adding correct CORS headers

### 4. Static Files Not Loading
```bash
# Check file permissions
ls -la /home/ubuntu/nube_cositas_aws/front/

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## 🔒 Security Considerations

### Current Security Features
- Rate limiting to prevent abuse
- Security headers to prevent XSS and other attacks
- Hidden file protection
- Server tokens disabled

### Recommended Additional Security
1. **SSL/TLS Certificate**: Set up HTTPS with Let's Encrypt
2. **Firewall**: Configure UFW to only allow necessary ports
3. **Fail2ban**: Install fail2ban for brute force protection
4. **Regular Updates**: Keep Nginx and system packages updated

### Setting Up SSL (Optional)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal (already configured with certbot)
sudo systemctl status certbot.timer
```

## 📊 Performance Tuning

### For High Traffic
1. Increase worker connections in `nginx.conf`
2. Adjust rate limiting based on your needs
3. Enable browser caching for longer periods
4. Consider adding a CDN for static assets

### Backend Scaling
```bash
# Run multiple backend instances (with load balancing)
# Update upstream block in nginx.conf:
upstream backend {
    server 172.31.84.188:8000;
    server 172.31.84.188:8001;  # Additional instance
    keepalive 32;
}
```

## 🎯 Next Steps

### Immediate
1. Test the complete application at `http://52.91.168.59`
2. Create some todos with markdown content
3. Monitor logs for any issues

### Future Enhancements
1. **HTTPS Setup**: Configure SSL certificate for secure connections
2. **Domain Name**: Set up a custom domain name
3. **Monitoring**: Add application monitoring (Prometheus/Grafana)
4. **Backup**: Set up automated backups for database and configurations
5. **CDN**: Consider CloudFront for global content delivery

## 📞 Support

### Quick Health Checks
```bash
# Check all services
sudo systemctl status nginx
ps aux | grep uvicorn
curl http://52.91.168.59/health

# View recent logs
sudo tail -20 /var/log/nginx/error.log
tail -20 ~/nube_cositas_aws/logs/backend.log
```

### Configuration Files Locations
- **Nginx Config**: `/etc/nginx/nginx.conf`
- **Backend Config**: `~/nube_cositas_aws/back/.env`
- **Frontend Config**: `~/nube_cositas_aws/front/config.js`

---

## 🎉 Congratulations!

Your Todo App with markdown support is now deployed with a professional Nginx setup! 

**Access your application**: http://52.91.168.59

The setup provides:
- ✅ High-performance static file serving
- ✅ Secure reverse proxy to your backend
- ✅ Production-ready configuration
- ✅ Comprehensive monitoring and logging
- ✅ Room for future scaling and enhancements 