-- Fix portfolio images by updating URLs to proper Supabase storage URLs
-- First, let's update the existing portfolio images to use proper storage URLs

UPDATE public.portfolio_images 
SET image_url = 'https://vtknmauyvmuaryttnenx.supabase.co/storage/v1/object/public/portfolio/box-braids-young.jpg'
WHERE image_url = '/src/assets/box-braids-young.jpg';

UPDATE public.portfolio_images 
SET image_url = 'https://vtknmauyvmuaryttnenx.supabase.co/storage/v1/object/public/portfolio/cornrows-mature.jpg'
WHERE image_url = '/src/assets/cornrows-mature.jpg';

UPDATE public.portfolio_images 
SET image_url = 'https://vtknmauyvmuaryttnenx.supabase.co/storage/v1/object/public/portfolio/senegalese-twists.jpg'
WHERE image_url = '/src/assets/senegalese-twists.jpg';

UPDATE public.portfolio_images 
SET image_url = 'https://vtknmauyvmuaryttnenx.supabase.co/storage/v1/object/public/portfolio/french-braids.jpg'
WHERE image_url = '/src/assets/french-braids.jpg';