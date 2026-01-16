-- Add content column to activities table to store email body
ALTER TABLE activities ADD COLUMN IF NOT EXISTS content TEXT;
