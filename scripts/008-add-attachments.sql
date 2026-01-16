-- Add attachments column to activities table
-- We use JSONB to store an array of file objects: { name, url, size, type }
ALTER TABLE activities ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::JSONB;

-- Note: In a real app, you would also need to configure Storage bucket 'attachments'
-- and RLS policies for storage.objects.
