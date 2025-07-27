-- Add admin_comments field to appointments table
ALTER TABLE public.appointments 
ADD COLUMN admin_comments TEXT;