#!/bin/bash

# Script para actualizar configuración a API directa
echo "🔄 Actualizando configuración para API directa..."
echo "================================================"

# Ir al directorio del proyecto
cd /home/ubuntu/nube_cositas_aws

# 1. Actualizar configuración del backend
echo "🔧 Actualizando configuración del backend..."
cd back/
cp env.production .env
echo "✅ Backend configurado para API directa en 44.204.83.247:8000"

# 2. Matar procesos existentes del backend
echo "🛑 Deteniendo backend anterior..."
pkill -f "uvicorn.*main:app" || echo "No hay procesos anteriores"

# 3. Crear directorio de logs si no existe
mkdir -p ../logs

# 4. Iniciar backend con nueva configuración
echo "🚀 Iniciando backend con nueva configuración..."
nohup poetry run uvicorn main:app --host 0.0.0.0 --port 8000 > ../logs/backend.log 2>&1 &
BACKEND_PID=$!

echo "✅ Backend iniciado con PID: $BACKEND_PID"

# 5. Esperar un momento para que arranque
sleep 3

# 6. Verificar que el backend está funcionando
echo "🧪 Verificando backend..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend respondiendo correctamente"
    curl http://localhost:8000/health
else
    echo "⚠️  Backend no responde, revisando logs..."
    tail -10 ../logs/backend.log
fi

echo ""
echo "🎉 Configuración actualizada!"
echo "================================================"
echo "📡 Frontend: Conectará a http://44.204.83.247:8000"
echo "🔧 Backend: Ejecutándose en puerto 8000"
echo "📝 Logs: tail -f /home/ubuntu/nube_cositas_aws/logs/backend.log"
echo ""
echo "🌐 Ahora puedes acceder a tu aplicación desde el navegador"
echo "   y debería conectarse directamente a la API" 