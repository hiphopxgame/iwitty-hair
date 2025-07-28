-- Create iwitty-hair specific tables with proper isolation

-- 1. Create iwitty_profiles table (replaces braiding_profiles)
CREATE TABLE public.iwitty_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  email text,
  address text,
  city text,
  state text DEFAULT 'Oregon',
  zip_code text,
  hair_type text,
  allergies text,
  preferred_contact text DEFAULT 'email',
  UNIQUE(user_id)
);

-- 2. Create iwitty_hair_styles table
CREATE TABLE public.iwitty_hair_styles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  base_price numeric,
  duration_hours integer DEFAULT 3,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. Create iwitty_appointments table
CREATE TABLE public.iwitty_appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  style_id uuid REFERENCES public.iwitty_hair_styles(id),
  appointment_date date NOT NULL,
  appointment_time time without time zone NOT NULL,
  price_quote numeric,
  estimated_duration integer DEFAULT 3,
  confirmation_sent boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  special_requests text,
  admin_comments text,
  status text NOT NULL DEFAULT 'pending'
);

-- 4. Create iwitty_portfolio_images table
CREATE TABLE public.iwitty_portfolio_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  style_id uuid REFERENCES public.iwitty_hair_styles(id),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  client_name text,
  completion_date date,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 5. Create iwitty_admin_accounts table
CREATE TABLE public.iwitty_admin_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Enable RLS on all tables
ALTER TABLE public.iwitty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iwitty_hair_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iwitty_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iwitty_portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iwitty_admin_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for iwitty_profiles
CREATE POLICY "Users can view their own iwitty profile" ON public.iwitty_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own iwitty profile" ON public.iwitty_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own iwitty profile" ON public.iwitty_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all iwitty profiles" ON public.iwitty_profiles
FOR ALL USING (auth.email() = 'tyronenorris@gmail.com');

-- Create RLS policies for iwitty_hair_styles
CREATE POLICY "Anyone can view iwitty hair styles" ON public.iwitty_hair_styles
FOR SELECT USING (true);

CREATE POLICY "Admin can manage iwitty hair styles" ON public.iwitty_hair_styles
FOR ALL USING (auth.email() = 'tyronenorris@gmail.com');

-- Create RLS policies for iwitty_appointments
CREATE POLICY "Clients can view their own iwitty appointments" ON public.iwitty_appointments
FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Clients can create iwitty appointments" ON public.iwitty_appointments
FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own pending iwitty appointments" ON public.iwitty_appointments
FOR UPDATE USING (auth.uid() = client_id AND status = 'pending');

CREATE POLICY "Admin can manage all iwitty appointments" ON public.iwitty_appointments
FOR ALL USING (auth.email() = 'tyronenorris@gmail.com');

-- Create RLS policies for iwitty_portfolio_images
CREATE POLICY "Anyone can view iwitty portfolio images" ON public.iwitty_portfolio_images
FOR SELECT USING (true);

CREATE POLICY "Admin can manage iwitty portfolio images" ON public.iwitty_portfolio_images
FOR ALL USING (auth.email() = 'tyronenorris@gmail.com');

-- Create RLS policies for iwitty_admin_accounts
CREATE POLICY "Admin can manage iwitty admin accounts" ON public.iwitty_admin_accounts
FOR ALL USING (auth.email() = 'tyronenorris@gmail.com');

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_iwitty_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_iwitty_profiles_updated_at
BEFORE UPDATE ON public.iwitty_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_iwitty_updated_at_column();

CREATE TRIGGER update_iwitty_appointments_updated_at
BEFORE UPDATE ON public.iwitty_appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_iwitty_updated_at_column();

CREATE TRIGGER update_iwitty_portfolio_images_updated_at
BEFORE UPDATE ON public.iwitty_portfolio_images
FOR EACH ROW
EXECUTE FUNCTION public.update_iwitty_updated_at_column();

CREATE TRIGGER update_iwitty_admin_accounts_updated_at
BEFORE UPDATE ON public.iwitty_admin_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_iwitty_updated_at_column();

-- Create iwitty admin function
CREATE OR REPLACE FUNCTION public.is_iwitty_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.iwitty_admin_accounts 
    WHERE LOWER(email) = LOWER(auth.email()) 
    AND is_active = true
  )
$$;

-- Create user profile trigger for iwitty project
CREATE OR REPLACE FUNCTION public.handle_new_iwitty_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only create profile for the admin or if explicitly for iwitty project
  IF NEW.email = 'tyronenorris@gmail.com' THEN
    INSERT INTO public.iwitty_profiles (user_id, first_name, last_name, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'first_name', SPLIT_PART(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
      NEW.email
    );
    
    -- Also create admin account
    INSERT INTO public.iwitty_admin_accounts (user_id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for new iwitty users
CREATE TRIGGER on_auth_user_created_iwitty
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_iwitty_user();