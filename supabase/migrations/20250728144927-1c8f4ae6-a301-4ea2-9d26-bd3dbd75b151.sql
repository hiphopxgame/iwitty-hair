-- Update portfolio images to use local paths for self-hosting
UPDATE public.portfolio_images 
SET image_url = '/portfolio/box-braids-young.jpg'
WHERE image_url LIKE '%box-braids-young.jpg%';

UPDATE public.portfolio_images 
SET image_url = '/portfolio/cornrows-mature.jpg'
WHERE image_url LIKE '%cornrows-mature.jpg%';

UPDATE public.portfolio_images 
SET image_url = '/portfolio/senegalese-twists.jpg'
WHERE image_url LIKE '%senegalese-twists.jpg%';

UPDATE public.portfolio_images 
SET image_url = '/portfolio/french-braids.jpg'
WHERE image_url LIKE '%french-braids.jpg%';