# Configuración de Grupos de Seguridad AWS para Todo App

## 🚀 Configuración Rápida

### 1. Ejecutar Script de Configuración
```bash
# En tu máquina local
chmod +x configure.sh
./configure.sh
```

Selecciona opción `2) AWS VPC deployment` e ingresa:
- Backend EC2 IP: `172.31.84.125`
- Frontend EC2 IP: `172.31.81.41`
- Database IP: `172.31.84.125` (o la IP de tu instancia de PostgreSQL)

### 2. Copiar Configuración al Backend
```bash
# Copiar archivo .env generado al backend EC2
scp back/.env ec2-user@172.31.84.125:/home/ec2-user/todo-app/back/

# Copiar archivos del frontend al frontend EC2
scp -r front/* ec2-user@172.31.81.41:/var/www/html/
```

## Arquitectura del Despliegue
- **Backend EC2**: 172.31.84.125 (Puerto 8000)
- **Frontend EC2**: 172.31.81.41 (Puerto 80/8080)
- **PostgreSQL**: 172.31.84.125 (Puerto 5432)

## 1. Grupo de Seguridad del Backend (172.31.84.125)

### Reglas de Entrada (Inbound Rules)

| Tipo     | Protocolo | Puerto | Origen            | Descripción                    |
|----------|-----------|--------|-------------------|--------------------------------|
| HTTP     | TCP       | 8000   | 172.31.81.41/32   | Frontend API access            |
| HTTP     | TCP       | 8000   | Tu-IP-Pública/32  | Swagger/API docs access        |
| SSH      | TCP       | 22     | Tu-IP-Pública/32  | Admin SSH access               |
| Custom   | TCP       | 5432   | 172.31.84.125/32  | PostgreSQL local access        |

### Reglas de Salida (Outbound Rules)
- **All traffic**: 0.0.0.0/0 (para actualizaciones del sistema, instalaciones, etc.)

## 2. Grupo de Seguridad del Frontend (172.31.81.41)

### Reglas de Entrada (Inbound Rules)

| Tipo     | Protocolo | Puerto | Origen            | Descripción                    |
|----------|-----------|--------|-------------------|--------------------------------|
| HTTP     | TCP       | 80     | 0.0.0.0/0         | Web access (si usas nginx)     |
| HTTP     | TCP       | 8080   | Tu-IP-Pública/32  | Dev server access              |
| SSH      | TCP       | 22     | Tu-IP-Pública/32  | Admin SSH access               |

### Reglas de Salida (Outbound Rules)
- **All traffic**: 0.0.0.0/0

## 3. Variables de Entorno

### Backend (.env)
Las siguientes variables se configuran automáticamente con el script:

```env
# Database
DATABASE_URL=postgresql://todouser:todopass@172.31.84.125:5432/todoapp

# CORS - Se configura automáticamente basado en IPs
CORS_ORIGINS=http://172.31.81.41,http://172.31.81.41:80,http://172.31.81.41:8080

# Backend configuration
BACKEND_HOST=172.31.84.125
BACKEND_PORT=8000
BACKEND_PROTOCOL=http

# Environment
ENVIRONMENT=production
```

### Frontend (config.js)
El frontend obtiene la configuración dinámicamente del endpoint `/config`:

```javascript
// Configuración automática desde el backend
window.ENV.API_BASE_URL // Se configura automáticamente
```

## 4. URLs de Acceso

- **API Backend**: http://172.31.84.125:8000
- **Config Endpoint**: http://172.31.84.125:8000/config
- **Swagger UI**: http://172.31.84.125:8000/docs
- **Frontend**: http://172.31.81.41

## 5. Comandos para Verificar Conectividad

### Verificar Configuración Dinámica
```bash
# Verificar endpoint de configuración
curl http://172.31.84.125:8000/config

# Debería retornar:
{
  "apiBaseUrl": "http://172.31.84.125:8000",
  "environment": "production",
  "version": "1.0.0"
}
```

### Verificar CORS
```bash
curl -H "Origin: http://172.31.81.41" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://172.31.84.125:8000/todos
```

### Verificar Health Check
```bash
curl http://172.31.84.125:8000/health
```

## 6. Cambiar Configuración

### Para cambiar IPs o configuración:

1. **Ejecutar script de reconfiguración**:
   ```bash
   ./configure.sh
   ```

2. **O editar manualmente**:
   ```bash
   # Editar variables de entorno
   nano back/.env
   
   # Reiniciar backend
   cd back && ./run.sh
   ```

3. **Verificar cambios**:
   ```bash
   curl http://NEW_BACKEND_IP:8000/config
   ```

## 7. Troubleshooting

### Error de CORS
- ✅ Las origins se configuran automáticamente desde `.env`
- ✅ Verificar que `CORS_ORIGINS` tenga la IP correcta del frontend
- ✅ Reiniciar el backend después de cambios en `.env`

### Error de Conexión
- ✅ Verificar que el endpoint `/config` responda
- ✅ Verificar que las variables de entorno estén cargadas
- ✅ Verificar grupos de seguridad

### Frontend no se conecta
- ✅ Verificar que el frontend pueda acceder a `/config`
- ✅ Revisar la consola del navegador para errores
- ✅ Verificar que `config.js` se haya actualizado

## 8. Ventajas del Sistema Basado en Variables de Entorno

✅ **Flexibilidad**: Cambiar IPs sin modificar código
✅ **Seguridad**: Configuración sensible en `.env`
✅ **Portabilidad**: Mismo código para diferentes entornos
✅ **Automatización**: Script de configuración automatizada
✅ **Mantenimiento**: Configuración centralizada 