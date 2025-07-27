-- Fix the is_iwitty_admin function to be case-insensitive
CREATE OR REPLACE FUNCTION public.is_iwitty_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_accounts 
    WHERE LOWER(email) = LOWER(auth.email()) 
    AND project_id = 'iwitty-hair' 
    AND is_active = true
  )
$$;