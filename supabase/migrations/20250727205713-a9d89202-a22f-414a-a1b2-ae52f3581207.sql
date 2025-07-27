-- Create the new admin user account
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'Kandiyams_2000@yahoo.com',
  crypt('iL0v3u!&82', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"first_name": "Dale", "last_name": "Norris", "full_name": "Dale Norris"}'::jsonb
);

-- Create admin accounts table to manage multiple admins
CREATE TABLE IF NOT EXISTS public.admin_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  project_id text NOT NULL DEFAULT 'iwitty-hair',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can view all admin accounts"
ON public.admin_accounts
FOR SELECT
USING (
  auth.email() = 'tyronenorris@gmail.com' OR 
  auth.email() = 'Kandiyams_2000@yahoo.com'
);

CREATE POLICY "Super admin can manage admin accounts"
ON public.admin_accounts
FOR ALL
USING (auth.email() = 'tyronenorris@gmail.com')
WITH CHECK (auth.email() = 'tyronenorris@gmail.com');

-- Insert existing admin accounts
INSERT INTO public.admin_accounts (user_id, email, full_name, project_id) 
SELECT id, email, 'Mental Stamina', 'iwitty-hair' 
FROM auth.users 
WHERE email = 'tyronenorris@gmail.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.admin_accounts (user_id, email, full_name, project_id)
SELECT id, email, 'Dale Norris', 'iwitty-hair' 
FROM auth.users 
WHERE email = 'Kandiyams_2000@yahoo.com'
ON CONFLICT (email) DO NOTHING;

-- Create updated_at trigger
CREATE TRIGGER update_admin_accounts_updated_at
  BEFORE UPDATE ON public.admin_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check if user is admin for iwitty-hair
CREATE OR REPLACE FUNCTION public.is_iwitty_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_accounts 
    WHERE email = auth.email() 
    AND project_id = 'iwitty-hair' 
    AND is_active = true
  )
$$;