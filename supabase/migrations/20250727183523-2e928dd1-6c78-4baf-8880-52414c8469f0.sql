-- Fix function search_path mutable warnings and enable password protection

-- Fix all functions that are missing search_path
ALTER FUNCTION public.update_updated_at_column() SET search_path TO 'public';

ALTER FUNCTION public.update_pdxbus_updated_at_column() SET search_path TO 'public';

-- Enable leaked password protection
UPDATE auth.config 
SET value = 'true' 
WHERE parameter = 'password_enable_hibp';

-- If the parameter doesn't exist, insert it
INSERT INTO auth.config (parameter, value)
SELECT 'password_enable_hibp', 'true'
WHERE NOT EXISTS (
    SELECT 1 FROM auth.config WHERE parameter = 'password_enable_hibp'
);