# Database Migration Guide

## Overview
This migration adds a `content` column to the existing `todos` table to support markdown content in your todo items.

## Migration Details
- **Migration File**: `migration_add_content.sql`
- **Purpose**: Add `content` TEXT column to `todos` table
- **Impact**: Existing todos will have `content` set to empty string
- **Backwards Compatible**: Yes

## Prerequisites
1. PostgreSQL client tools installed (`psql`)
2. Database server running and accessible
3. Proper environment configuration

## Running the Migration

### Option 1: Using the Migration Runner Script (Linux/macOS)
```bash
cd db/
./migration_runner.sh
```

### Option 2: Manual Execution (Windows/Cross-platform)
```bash
# Navigate to the db directory
cd db/

# Load your environment variables (adjust path as needed)
# For Linux/macOS:
source ../back/.env

# For Windows PowerShell:
Get-Content ../back/.env | ForEach-Object { 
    $name, $value = $_.split('='); 
    Set-Variable -Name $name -Value $value 
}

# Run the migration
psql $DATABASE_URL -f migration_add_content.sql

# Or if DATABASE_URL is not set, use connection parameters:
psql -h localhost -p 5432 -U todouser -d todoapp -f migration_add_content.sql
```

### Option 3: Using Docker (if database is containerized)
```bash
# If your PostgreSQL is running in Docker
docker exec -i your_postgres_container psql -U todouser -d todoapp < migration_add_content.sql
```

## Verification
After running the migration, verify it was successful:

```sql
-- Check if the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'todos' AND column_name = 'content';

-- View the updated table structure
\d todos;

-- Check existing todos (they should have content = NULL or '')
SELECT id, title, content, completed FROM todos LIMIT 5;
```

## Rollback (if needed)
If you need to rollback this migration:

```sql
-- Remove the content column
ALTER TABLE todos DROP COLUMN content;
```

## Troubleshooting

### Connection Issues
- Verify your `DATABASE_URL` or connection parameters
- Ensure PostgreSQL server is running
- Check firewall settings
- Verify user permissions

### Permission Issues
```sql
-- Grant necessary permissions (run as superuser)
GRANT ALL PRIVILEGES ON TABLE todos TO todouser;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO todouser;
```

### Column Already Exists
If you get an error that the column already exists:
```sql
-- Check if column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'todos' AND column_name = 'content';

-- If it exists, the migration has already been run
```

## Environment Configuration Examples

### Development (.env)
```bash
DATABASE_URL=postgresql://todouser:todopass@localhost:5432/todoapp
```

### Production
```bash
DATABASE_URL=postgresql://todouser:securepass@your-db-host:5432/todoapp
```

### AWS RDS Example
```bash
DATABASE_URL=postgresql://username:password@your-rds-endpoint.region.rds.amazonaws.com:5432/todoapp
```

## Post-Migration Steps
1. **Restart your backend application** to ensure it picks up the new schema
2. **Test the application** to ensure markdown functionality works
3. **Create a backup** of your updated database
4. **Update your documentation** to reflect the new markdown feature

## Support
If you encounter issues:
1. Check the error messages in the migration output
2. Verify database connectivity
3. Ensure proper permissions
4. Check PostgreSQL logs for detailed error information

---

**Note**: Always backup your database before running migrations in production! 