-- Fix security issue: Set search_path for update_iwitty_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_iwitty_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path TO 'public';