-- Migrate existing appointment from appointments table to iwitty_appointments table
INSERT INTO public.iwitty_appointments (
  id,
  client_id,
  style_id,
  appointment_date,
  appointment_time,
  price_quote,
  estimated_duration,
  special_requests,
  admin_comments,
  status,
  confirmation_sent,
  created_at,
  updated_at
)
SELECT 
  id,
  client_id,
  style_id,
  appointment_date,
  appointment_time,
  price_quote,
  estimated_duration,
  special_requests,
  admin_comments,
  status,
  confirmation_sent,
  created_at,
  updated_at
FROM public.appointments
WHERE client_id = '245109e8-32b3-4bf7-92bb-73ccec90df28'
ON CONFLICT (id) DO NOTHING;