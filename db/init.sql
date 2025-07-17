-- Database Initialization Script
-- This script creates the database and user for the Todo application

-- Connect to PostgreSQL as superuser first, then run this script

-- Create the database
CREATE DATABASE todoapp;

-- Create the user
CREATE USER todouser WITH PASSWORD 'todopass';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON DATABASE todoapp TO todouser;

-- Connect to the todoapp database
\c todoapp;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO todouser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO todouser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO todouser;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO todouser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO todouser;

-- Create a simple test to verify the setup
SELECT 'Database setup completed successfully!' as message; 