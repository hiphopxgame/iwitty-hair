-- First create the user profile if it doesn't exist
INSERT INTO public.iwitty_profiles (
  user_id,
  first_name,
  last_name,
  email
)
VALUES (
  '245109e8-32b3-4bf7-92bb-73ccec90df28',
  'DC',
  'Guru',
  'dcwebguru@gmail.com'
)
ON CONFLICT (user_id) DO NOTHING;

-- Then migrate the appointment with the correct style mapping
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
  a.id,
  a.client_id,
  '2d3d6547-8f79-41ae-b024-30b82bdf455d', -- French Braids ID from iwitty_hair_styles
  a.appointment_date,
  a.appointment_time,
  a.price_quote,
  a.estimated_duration,
  a.special_requests,
  a.admin_comments,
  a.status,
  a.confirmation_sent,
  a.created_at,
  a.updated_at
FROM public.appointments a
WHERE a.client_id = '245109e8-32b3-4bf7-92bb-73ccec90df28'
ON CONFLICT (id) DO NOTHING;