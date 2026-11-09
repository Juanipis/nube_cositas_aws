# Todo App Frontend - Simple Setup

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd front/
chmod +x install.sh
./install.sh
```

### 2. Start Frontend
```bash
chmod +x run.sh
./run.sh
```

You'll be prompted to enter:
- **Backend IP address** (e.g., `44.204.83.247`)
- **Backend port** (default: `8000`)
- **Frontend port** (default: `3000`)

### 3. Access Your App
Open your browser to `http://localhost:3000` (or the port you specified)

## 🔧 What It Does

### Install Script (`install.sh`)
- Installs Node.js and npm
- Installs `http-server` for serving static files
- No complex configuration needed

### Run Script (`run.sh`)
- Asks for your backend IP dynamically
- Creates configuration file automatically
- Tests backend connection
- Starts static file server
- Opens browser automatically

## 📱 Features

- **Dynamic Configuration**: No need to edit config files manually
- **Connection Testing**: Automatically tests if backend is reachable
- **Simple Setup**: Just two scripts to run
- **Cross-Platform**: Works on any system with bash

## 🔍 Troubleshooting

### Backend Connection Issues
If you see connection warnings:
1. Make sure your backend is running on the specified IP:port
2. Check if the backend allows CORS from your frontend
3. Verify firewall settings allow the connection

### Port Already in Use
If the frontend port is busy:
- Stop the script with `Ctrl+C`
- Run `./run.sh` again and choose a different port

### Cannot Reach Backend
- Verify the backend IP and port are correct
- Test manually: `curl http://YOUR_BACKEND_IP:8000/health`
- Ensure backend CORS allows your frontend origin

## 💡 Tips

- The script remembers your configuration in `config.js`
- You can edit `config.js` manually if needed
- Use `Ctrl+C` to stop the frontend server
- The `-o` flag automatically opens your browser

## 🎯 Example Usage

```bash
# Install (one time only)
./install.sh

# Run and configure
./run.sh
# Enter: 44.204.83.247 (backend IP)
# Enter: 8000 (backend port) 
# Enter: 3000 (frontend port)

# Access: http://localhost:3000
```

That's it! Simple and straightforward. 🎉 