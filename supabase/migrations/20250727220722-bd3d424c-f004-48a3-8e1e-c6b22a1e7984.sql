-- Reset password for the second admin user
-- This will allow them to sign in with the provided credentials

-- First, let's update the user's auth record to ensure it's properly configured
UPDATE auth.users 
SET 
  email_confirmed_at = now(),
  phone_confirmed_at = null,
  confirmed_at = now(),
  email_change = '',
  email_change_token_new = '',
  email_change_token_current = '',
  raw_app_meta_data = '{"provider": "email", "providers": ["email"]}',
  raw_user_meta_data = '{"full_name": "Dale Norris"}'
WHERE email = 'Kandiyams_2000@yahoo.com';

-- We cannot directly set passwords via SQL for security reasons
-- The user will need to use the password reset flow or be created properly through the auth system