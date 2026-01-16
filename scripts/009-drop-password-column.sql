-- Drop password column from public.users to improve security
-- We rely on Supabase Auth (auth.users) for password storage.

ALTER TABLE public.users DROP COLUMN IF EXISTS password;
