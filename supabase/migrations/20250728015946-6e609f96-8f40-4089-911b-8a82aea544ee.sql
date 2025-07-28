-- Add foreign key constraint from iwitty_appointments to iwitty_profiles
ALTER TABLE public.iwitty_appointments 
ADD CONSTRAINT fk_iwitty_appointments_client_profile 
FOREIGN KEY (client_id) REFERENCES public.iwitty_profiles(user_id);