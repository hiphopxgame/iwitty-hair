-- Add trigger to automatically create braiding profiles when users sign up
CREATE OR REPLACE FUNCTION public.handle_new_braiding_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.braiding_profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created_braiding
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_braiding_user();

-- For existing users, create profiles (if any exist)
INSERT INTO public.braiding_profiles (user_id, first_name, last_name)
SELECT 
  id,
  COALESCE(raw_user_meta_data ->> 'first_name', SPLIT_PART(email, '@', 1)),
  COALESCE(raw_user_meta_data ->> 'last_name', '')
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM braiding_profiles)
ON CONFLICT (user_id) DO NOTHING;