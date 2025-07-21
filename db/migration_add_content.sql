-- Migration: Add content column to todos table
-- Date: $(date)
-- Description: Adds a content column to store markdown content for todos

-- Add content column to todos table
ALTER TABLE todos ADD COLUMN content TEXT;

-- Update existing todos with empty content (optional: you can set default content)
UPDATE todos SET content = '' WHERE content IS NULL;

-- Add a comment to the column
COMMENT ON COLUMN todos.content IS 'Markdown content for the todo item';

-- Verify the migration
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'todos' AND column_name = 'content';

-- Display current table structure
\d todos; 