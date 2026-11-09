#!/bin/bash

# Backend CORS Setup Script
echo "🔧 Configurando CORS del backend..."

# Create .env file with permissive CORS
cat > .env << 'EOF'
# Backend Configuration - Simple Development Setup
DATABASE_URL=postgresql://todouser:todopass@172.31.84.125:5432/todoapp

# CORS Configuration - Allow all origins for development
CORS_ORIGINS=*

# Server Configuration
HOST=0.0.0.0
PORT=8000

# Environment
ENVIRONMENT=development
EOF

echo "✅ Archivo .env creado con configuración CORS permisiva"

# Stop any running backend
echo "🛑 Deteniendo backend anterior..."
pkill -f "uvicorn.*main:app" || echo "No hay procesos anteriores"

# Create logs directory
mkdir -p ../logs

# Start backend with new configuration
echo "🚀 Iniciando backend con CORS configurado..."
nohup poetry run uvicorn main:app --host 0.0.0.0 --port 8000 > ../logs/backend.log 2>&1 &
BACKEND_PID=$!

echo "✅ Backend iniciado con PID: $BACKEND_PID"

# Wait a moment
sleep 3

# Test backend
echo "🧪 Probando backend..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend funcionando correctamente"
    curl http://localhost:8000/health
    echo ""
    echo "📋 CORS configurado para permitir todos los orígenes"
else
    echo "❌ Error al iniciar backend"
    echo "📝 Revisando logs..."
    tail -10 ../logs/backend.log
fi 