-- Migrate existing data to the new iwitty-specific tables

-- 1. Migrate braiding_profiles to iwitty_profiles
INSERT INTO public.iwitty_profiles (
  user_id, first_name, last_name, phone, email, address, city, state, zip_code, 
  hair_type, allergies, preferred_contact, created_at, updated_at
)
SELECT 
  user_id, first_name, last_name, phone, email, address, city, state, zip_code,
  hair_type, allergies, preferred_contact, created_at, updated_at
FROM public.braiding_profiles
WHERE project_id = 'iwitty-hair';

-- 2. Migrate hair_styles to iwitty_hair_styles
INSERT INTO public.iwitty_hair_styles (name, description, base_price, duration_hours, created_at)
SELECT name, description, base_price, duration_hours, created_at
FROM public.hair_styles
WHERE project_id = 'iwitty-hair';

-- 3. Migrate appointments to iwitty_appointments (map style_id correctly)
INSERT INTO public.iwitty_appointments (
  client_id, style_id, appointment_date, appointment_time, price_quote, 
  estimated_duration, confirmation_sent, special_requests, admin_comments, 
  status, created_at, updated_at
)
SELECT 
  a.client_id,
  ihs.id as style_id,  -- Map to new iwitty_hair_styles table
  a.appointment_date,
  a.appointment_time,
  a.price_quote,
  a.estimated_duration,
  a.confirmation_sent,
  a.special_requests,
  a.admin_comments,
  a.status,
  a.created_at,
  a.updated_at
FROM public.appointments a
LEFT JOIN public.hair_styles hs ON a.style_id = hs.id
LEFT JOIN public.iwitty_hair_styles ihs ON hs.name = ihs.name
WHERE EXISTS (
  SELECT 1 FROM public.braiding_profiles bp 
  WHERE bp.user_id = a.client_id AND bp.project_id = 'iwitty-hair'
);

-- 4. Migrate portfolio_images to iwitty_portfolio_images
INSERT INTO public.iwitty_portfolio_images (
  style_id, title, description, image_url, client_name, completion_date,
  is_featured, display_order, created_at, updated_at
)
SELECT 
  ihs.id as style_id,  -- Map to new iwitty_hair_styles table
  pi.title,
  pi.description,
  pi.image_url,
  pi.client_name,
  pi.completion_date,
  pi.is_featured,
  pi.display_order,
  pi.created_at,
  pi.updated_at
FROM public.portfolio_images pi
LEFT JOIN public.hair_styles hs ON pi.style_id = hs.id
LEFT JOIN public.iwitty_hair_styles ihs ON hs.name = ihs.name
WHERE pi.project_id = 'iwitty-hair';

-- 5. Create admin account for existing admin user
INSERT INTO public.iwitty_admin_accounts (user_id, email, full_name, created_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data ->> 'full_name', u.email),
  u.created_at
FROM auth.users u
WHERE u.email = 'tyronenorris@gmail.com'
ON CONFLICT (user_id) DO NOTHING;