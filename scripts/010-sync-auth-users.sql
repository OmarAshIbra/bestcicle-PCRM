-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, phone, gender, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(new.raw_user_meta_data->>'role', 'sales_rep'),
    COALESCE(new.phone, new.raw_user_meta_data->>'phone'),
    COALESCE(new.raw_user_meta_data->>'gender', 'other'),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

-- Trigger to call the function on new user insertion
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Optional: Backfill existing users if needed (careful with duplicates)
-- INSERT INTO public.users (id, email, full_name, role, phone, gender, avatar_url)
-- SELECT 
--   id, 
--   email, 
--   COALESCE(raw_user_meta_data->>'full_name', 'User'),
--   COALESCE(raw_user_meta_data->>'role', 'sales_rep'),
--   COALESCE(phone, raw_user_meta_data->>'phone'),
--   COALESCE(raw_user_meta_data->>'gender', 'other'),
--   raw_user_meta_data->>'avatar_url'
-- FROM auth.users
-- ON CONFLICT (id) DO NOTHING;
