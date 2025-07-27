-- Create profiles for existing users (if any exist)
INSERT INTO public.braiding_profiles (user_id, first_name, last_name)
SELECT 
  id,
  COALESCE(raw_user_meta_data ->> 'first_name', SPLIT_PART(email, '@', 1)),
  COALESCE(raw_user_meta_data ->> 'last_name', '')
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM braiding_profiles)
ON CONFLICT (user_id) DO NOTHING;