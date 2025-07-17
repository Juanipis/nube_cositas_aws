# Todo Web Application

A full-stack web application with a modern frontend, FastAPI backend, and PostgreSQL database.

## 📁 Project Structure

```
├── front/          # Frontend (HTML/CSS/JavaScript)
├── back/           # Backend (FastAPI with SQLAlchemy)
├── db/             # Database setup and initialization
└── README.md       # This file
```

## 🚀 Quick Start (Ubuntu)

### 1. Database Setup

```bash
cd db
sudo ./install.sh    # Install PostgreSQL
./run.sh             # Initialize database
```

### 2. Backend Setup

```bash
cd ../back
./install.sh         # Install Python, Poetry, and dependencies
./run.sh             # Start FastAPI server (http://localhost:8000)
```

### 3. Frontend Setup

```bash
cd ../front
./install.sh         # Install Node.js and http-server
./run.sh             # Start frontend server (http://localhost:3000)
```

## 📋 Features

- **Frontend**: Modern, responsive Todo application
- **Backend**: RESTful API with automatic documentation
- **Database**: PostgreSQL with proper ORM integration
- **Environment**: Configurable through environment variables

## 🔧 Configuration

### Frontend Environment (`front/.env`)

```bash
API_BASE_URL=http://localhost:8000
```

### Backend Environment (`back/.env`)

```bash
DATABASE_URL=postgresql://todouser:todopass@localhost:5432/todoapp
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
HOST=0.0.0.0
PORT=8000
```

## 📚 API Documentation

Once the backend is running, visit:

- **Interactive docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🏗️ API Endpoints

| Method | Endpoint      | Description         |
| ------ | ------------- | ------------------- |
| GET    | `/todos`      | List all todos      |
| POST   | `/todos`      | Create a new todo   |
| GET    | `/todos/{id}` | Get a specific todo |
| PUT    | `/todos/{id}` | Update a todo       |
| DELETE | `/todos/{id}` | Delete a todo       |
| GET    | `/health`     | Health check        |

## 🛠️ Development

### Frontend

- **Technology**: Vanilla HTML/CSS/JavaScript
- **Server**: http-server (lightweight static file server)
- **Port**: 3000

### Backend

- **Framework**: FastAPI
- **ORM**: SQLAlchemy 2.0
- **Package Manager**: Poetry
- **Port**: 8000

### Database

- **Database**: PostgreSQL
- **User**: todouser
- **Password**: todopass
- **Database**: todoapp

## 📁 Detailed File Structure

```
front/
├── index.html      # Main HTML page
├── style.css       # Styling
├── script.js       # Frontend logic
├── config.js       # Environment configuration
├── install.sh      # Installation script
└── run.sh          # Run script

back/
├── main.py         # FastAPI application
├── models.py       # SQLAlchemy models
├── schemas.py      # Pydantic schemas
├── crud.py         # Database operations
├── database.py     # Database configuration
├── pyproject.toml  # Poetry configuration
├── env.example     # Environment variables template
├── install.sh      # Installation script
└── run.sh          # Run script

db/
├── init.sql        # Database initialization script
├── install.sh      # PostgreSQL installation
└── run.sh          # Database setup script
```

## 🔍 Troubleshooting

### Backend Issues

- **Database connection failed**: Ensure PostgreSQL is running and credentials are correct
- **Port already in use**: Change PORT in backend `.env` file
- **Poetry not found**: Run `source ~/.bashrc` after installation

### Frontend Issues

- **API calls fail**: Check if backend is running and API_BASE_URL is correct
- **CORS errors**: Ensure frontend URL is in backend CORS_ORIGINS

### Database Issues

- **Database already exists**: Use the reset commands shown in db/run.sh
- **Permission denied**: Ensure PostgreSQL service is running

## 🌐 Production Deployment

1. **Security**: Change default passwords and database credentials
2. **Environment**: Set appropriate environment variables for production
3. **Reverse Proxy**: Use nginx or similar for production serving
4. **SSL**: Configure HTTPS certificates
5. **Database**: Use managed PostgreSQL service or secure self-hosted setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
