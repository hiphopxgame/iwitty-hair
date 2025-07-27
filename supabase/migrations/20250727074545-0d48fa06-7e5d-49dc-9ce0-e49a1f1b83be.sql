-- Add project identifier to braiding_profiles
ALTER TABLE public.braiding_profiles 
ADD COLUMN project_id TEXT NOT NULL DEFAULT 'iwitty-hair';

-- Update existing profiles to have the correct project_id
UPDATE public.braiding_profiles 
SET project_id = 'iwitty-hair';

-- Update RLS policies to restrict access to iwitty-hair users only
DROP POLICY IF EXISTS "Users can create their own profile" ON public.braiding_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.braiding_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.braiding_profiles;
DROP POLICY IF EXISTS "Admin can manage all profiles" ON public.braiding_profiles;

-- Recreate policies with project restriction
CREATE POLICY "Users can create their own iwitty-hair profile" 
ON public.braiding_profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND project_id = 'iwitty-hair'
);

CREATE POLICY "Users can update their own iwitty-hair profile" 
ON public.braiding_profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  AND project_id = 'iwitty-hair'
);

CREATE POLICY "Users can view their own iwitty-hair profile" 
ON public.braiding_profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND project_id = 'iwitty-hair'
);

CREATE POLICY "Admin can manage iwitty-hair profiles" 
ON public.braiding_profiles 
FOR ALL 
USING (
  auth.email() = 'tyronenorris@gmail.com'
  AND project_id = 'iwitty-hair'
);

-- Update appointments policies to restrict to iwitty-hair users
DROP POLICY IF EXISTS "Clients can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Clients can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Clients can update their own pending appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admin can manage all appointments" ON public.appointments;

-- Recreate appointment policies with project restriction
CREATE POLICY "iwitty-hair clients can create appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (
  auth.uid() = client_id 
  AND EXISTS (
    SELECT 1 FROM braiding_profiles 
    WHERE user_id = auth.uid() 
    AND project_id = 'iwitty-hair'
  )
);

CREATE POLICY "iwitty-hair clients can view their own appointments" 
ON public.appointments 
FOR SELECT 
USING (
  auth.uid() = client_id 
  AND EXISTS (
    SELECT 1 FROM braiding_profiles 
    WHERE user_id = auth.uid() 
    AND project_id = 'iwitty-hair'
  )
);

CREATE POLICY "iwitty-hair clients can update their own pending appointments" 
ON public.appointments 
FOR UPDATE 
USING (
  auth.uid() = client_id 
  AND status = 'pending'
  AND EXISTS (
    SELECT 1 FROM braiding_profiles 
    WHERE user_id = auth.uid() 
    AND project_id = 'iwitty-hair'
  )
);

CREATE POLICY "Admin can manage iwitty-hair appointments" 
ON public.appointments 
FOR ALL 
USING (auth.email() = 'tyronenorris@gmail.com');

-- Update portfolio_images policies to be iwitty-hair specific
DROP POLICY IF EXISTS "Anyone can view portfolio images" ON public.portfolio_images;
DROP POLICY IF EXISTS "Admin can manage portfolio images" ON public.portfolio_images;

-- Add project_id to portfolio_images if not exists
ALTER TABLE public.portfolio_images 
ADD COLUMN IF NOT EXISTS project_id TEXT NOT NULL DEFAULT 'iwitty-hair';

-- Update existing portfolio images
UPDATE public.portfolio_images 
SET project_id = 'iwitty-hair';

CREATE POLICY "Anyone can view iwitty-hair portfolio images" 
ON public.portfolio_images 
FOR SELECT 
USING (project_id = 'iwitty-hair');

CREATE POLICY "Admin can manage iwitty-hair portfolio images" 
ON public.portfolio_images 
FOR ALL 
USING (
  auth.email() = 'tyronenorris@gmail.com'
  AND project_id = 'iwitty-hair'
);

-- Update hair_styles policies to be iwitty-hair specific
DROP POLICY IF EXISTS "Anyone can view hair styles" ON public.hair_styles;
DROP POLICY IF EXISTS "Admin can manage hair styles" ON public.hair_styles;

-- Add project_id to hair_styles if not exists
ALTER TABLE public.hair_styles 
ADD COLUMN IF NOT EXISTS project_id TEXT NOT NULL DEFAULT 'iwitty-hair';

-- Update existing hair styles
UPDATE public.hair_styles 
SET project_id = 'iwitty-hair';

CREATE POLICY "Anyone can view iwitty-hair hair styles" 
ON public.hair_styles 
FOR SELECT 
USING (project_id = 'iwitty-hair');

CREATE POLICY "Admin can manage iwitty-hair hair styles" 
ON public.hair_styles 
FOR ALL 
USING (
  auth.email() = 'tyronenorris@gmail.com'
  AND project_id = 'iwitty-hair'
);

-- Update the user creation trigger to only create profiles for iwitty-hair
DROP TRIGGER IF EXISTS on_auth_user_created_braiding ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_braiding_user();

-- Create function that only creates profiles for iwitty-hair users (admin-managed)
CREATE OR REPLACE FUNCTION public.handle_new_braiding_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile if this is the admin creating the user for iwitty-hair
  -- Or if user email contains iwitty-hair domain (if you have one)
  IF NEW.email = 'tyronenorris@gmail.com' OR NEW.email LIKE '%@iwitty-hair.%' THEN
    INSERT INTO public.braiding_profiles (user_id, first_name, last_name, project_id)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'first_name', SPLIT_PART(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
      'iwitty-hair'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created_braiding
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_braiding_user();