-- Remove the conflicting trigger for por_eve project
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;