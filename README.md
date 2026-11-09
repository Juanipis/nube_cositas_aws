# Todo App - Sistema Completo con Configuración Dinámica

Una aplicación de tareas completa con frontend, backend (FastAPI), y base de datos PostgreSQL, optimizada para despliegues flexibles con configuración basada en variables de entorno.

## 🚀 Configuración Rápida

### Opción 1: Script Automático (Recomendado)

```bash
# Hacer ejecutable el script (en Linux/Mac)
chmod +x configure.sh

# Ejecutar configuración
./configure.sh
```

Selecciona:
- **1) Local development** - Para desarrollo local
- **2) AWS VPC deployment** - Para despliegue en AWS
- **3) Custom configuration** - Para configuración manual

### Opción 2: Configuración Manual

#### Para Desarrollo Local:
```bash
# Backend
cp back/env.local back/.env
cd back && ./run.sh

# Frontend - abrir front/index.html en el navegador
```

#### Para AWS VPC:
```bash
# Editar configuración
nano back/env.example
cp back/env.example back/.env

# Actualizar con tus IPs
BACKEND_HOST=172.31.84.125
FRONTEND_HOST=172.31.81.41
DATABASE_URL=postgresql://todouser:todopass@172.31.84.125:5432/todoapp
CORS_ORIGINS=http://172.31.81.41,http://172.31.81.41:80,http://172.31.81.41:8080
```

## 📁 Estructura del Proyecto

```
nube_cositas_aws/
├── back/                 # Backend FastAPI
│   ├── main.py          # Aplicación principal con endpoint /config
│   ├── models.py        # Modelos SQLAlchemy
│   ├── schemas.py       # Esquemas Pydantic
│   ├── crud.py          # Operaciones CRUD
│   ├── database.py      # Configuración DB
│   ├── env.example      # Variables de entorno para AWS
│   ├── env.local        # Variables de entorno para desarrollo
│   └── .env             # Configuración activa (generado)
├── front/               # Frontend estático
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   └── config.js        # Configuración dinámica
├── db/                  # Scripts PostgreSQL
├── configure.sh         # Script de configuración automática
└── AWS_SECURITY_GROUPS.md # Documentación AWS
```

## 🔧 Características del Sistema de Configuración

### ✅ Variables de Entorno Dinámicas
- Todo configurable desde `.env`
- Diferentes perfiles (local, AWS, custom)
- Sin hardcoding de IPs en el código

### ✅ Configuración Frontend Dinámica
- El frontend obtiene configuración del endpoint `/config`
- Configuración automática del API_BASE_URL
- Fallback a configuración estática si es necesario

### ✅ CORS Automático
- CORS configurado desde variables de entorno
- Soporte para múltiples orígenes
- Logs de configuración para debugging

### ✅ Endpoints de Configuración
- `GET /config` - Configuración dinámica para el frontend
- `GET /health` - Health check
- `GET /docs` - Documentación Swagger

## 🌐 Despliegue en AWS

### Configuración de IPs VPC
```env
# En tu .env
DATABASE_URL=postgresql://todouser:todopass@172.31.84.125:5432/todoapp
BACKEND_HOST=172.31.84.125
FRONTEND_HOST=172.31.81.41
CORS_ORIGINS=http://172.31.81.41,http://172.31.81.41:80,http://172.31.81.41:8080
```

### Grupos de Seguridad Requeridos

**Backend EC2 (172.31.84.125)**:
- Puerto 8000 desde Frontend IP (172.31.81.41/32)
- Puerto 8000 desde tu IP pública (para Swagger)
- Puerto 22 desde tu IP pública (SSH)

**Frontend EC2 (172.31.81.41)**:
- Puerto 80 desde 0.0.0.0/0 (acceso web)
- Puerto 22 desde tu IP pública (SSH)

Ver `AWS_SECURITY_GROUPS.md` para configuración detallada.

## 📋 Comandos de Verificación

### Verificar Configuración Dinámica
```bash
curl http://172.31.84.125:8000/config
```

### Verificar CORS
```bash
curl -H "Origin: http://172.31.81.41" \
     -X OPTIONS \
     http://172.31.84.125:8000/todos
```

### Verificar Health Check
```bash
curl http://172.31.84.125:8000/health
```

## 🛠️ Desarrollo

### Estructura de la API

**Endpoints disponibles:**
- `GET /` - Root endpoint
- `GET /config` - Configuración dinámica
- `GET /health` - Health check
- `GET /todos` - Listar todos
- `POST /todos` - Crear todo
- `GET /todos/{id}` - Obtener todo específico
- `PUT /todos/{id}` - Actualizar todo
- `DELETE /todos/{id}` - Eliminar todo
- `GET /docs` - Documentación Swagger

### Variables de Entorno Disponibles

```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# CORS
CORS_ORIGINS=http://origin1,http://origin2

# Server
HOST=0.0.0.0
PORT=8000

# Frontend Config
FRONTEND_HOST=frontend-ip
FRONTEND_PORT=80
FRONTEND_PROTOCOL=http

# Backend Config
BACKEND_HOST=backend-ip
BACKEND_PORT=8000
BACKEND_PROTOCOL=http

# Environment
ENVIRONMENT=development|production
```

## 🔄 Cambiar Configuración

### Para cambiar IPs o configuración:

1. **Ejecutar reconfiguración**:
   ```bash
   ./configure.sh
   ```

2. **O editar manualmente**:
   ```bash
   nano back/.env
   cd back && ./run.sh  # Reiniciar backend
   ```

3. **Verificar cambios**:
   ```bash
   curl http://NEW_IP:8000/config
   ```

## 🐛 Troubleshooting

### Error de CORS
- ✅ Verificar `CORS_ORIGINS` en `.env`
- ✅ Reiniciar backend después de cambios
- ✅ Verificar logs del servidor

### Frontend no conecta
- ✅ Verificar endpoint `/config`
- ✅ Revisar consola del navegador
- ✅ Verificar grupos de seguridad AWS

### Base de datos no conecta
- ✅ Verificar `DATABASE_URL`
- ✅ Confirmar PostgreSQL corriendo
- ✅ Verificar credenciales

## 📚 Tecnologías

- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Frontend**: HTML5, CSS3, JavaScript (vanilla)
- **Infrastructure**: AWS EC2, VPC
- **Configuration**: Environment variables, dynamic config

## 🎯 Próximos Pasos

- [ ] Implementar HTTPS con certificados SSL
- [ ] Agregar autenticación JWT
- [ ] Implementar testing automatizado
- [ ] Agregar Docker support
- [ ] CI/CD pipeline con GitHub Actions
