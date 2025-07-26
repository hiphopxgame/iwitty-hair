-- Create hair braiding service database schema

-- Create profiles table for client information
CREATE TABLE public.braiding_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT DEFAULT 'Oregon',
  zip_code TEXT,
  hair_type TEXT,
  allergies TEXT,
  preferred_contact TEXT DEFAULT 'email',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create hair styles table
CREATE TABLE public.hair_styles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  base_price DECIMAL(10,2),
  duration_hours INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create portfolio images table
CREATE TABLE public.portfolio_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  style_id UUID REFERENCES public.hair_styles(id),
  client_name TEXT,
  completion_date DATE,
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.braiding_profiles(user_id),
  style_id UUID REFERENCES public.hair_styles(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  price_quote DECIMAL(10,2),
  special_requests TEXT,
  estimated_duration INTEGER DEFAULT 3,
  confirmation_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (status IN ('pending', 'quoted', 'confirmed', 'completed', 'cancelled'))
);

-- Enable RLS on all tables
ALTER TABLE public.braiding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hair_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for braiding_profiles
CREATE POLICY "Users can view their own profile"
ON public.braiding_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
ON public.braiding_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.braiding_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all profiles"
ON public.braiding_profiles FOR ALL
USING (auth.email() = 'tyronenorris@gmail.com');

-- RLS Policies for hair_styles (public read, admin write)
CREATE POLICY "Anyone can view hair styles"
ON public.hair_styles FOR SELECT
USING (true);

CREATE POLICY "Admin can manage hair styles"
ON public.hair_styles FOR ALL
USING (auth.email() = 'tyronenorris@gmail.com');

-- RLS Policies for portfolio_images (public read, admin write)
CREATE POLICY "Anyone can view portfolio images"
ON public.portfolio_images FOR SELECT
USING (true);

CREATE POLICY "Admin can manage portfolio images"
ON public.portfolio_images FOR ALL
USING (auth.email() = 'tyronenorris@gmail.com');

-- RLS Policies for appointments
CREATE POLICY "Clients can view their own appointments"
ON public.appointments FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Clients can create appointments"
ON public.appointments FOR INSERT
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own pending appointments"
ON public.appointments FOR UPDATE
USING (auth.uid() = client_id AND status = 'pending');

CREATE POLICY "Admin can manage all appointments"
ON public.appointments FOR ALL
USING (auth.email() = 'tyronenorris@gmail.com');

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_braiding_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.braiding_profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created_braiding
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_braiding_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_braiding_profiles_updated_at
  BEFORE UPDATE ON public.braiding_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_images_updated_at
  BEFORE UPDATE ON public.portfolio_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample hair styles
INSERT INTO public.hair_styles (name, description, base_price, duration_hours) VALUES
('Box Braids', 'Classic protective style with square-shaped parts', 180.00, 4),
('Goddess Braids', 'Larger, flowing braids with a bohemian feel', 150.00, 3),
('Cornrows', 'Traditional straight-back braided style', 80.00, 2),
('Dutch Braids', 'Inverted braids that sit on top of the head', 60.00, 1),
('French Braids', 'Classic overlapping braid technique', 50.00, 1),
('Tribal Braids', 'Thick, statement braids with intricate patterns', 200.00, 5),
('Senegalese Twists', 'Rope-like twists using synthetic hair', 160.00, 4),
('Passion Twists', 'Bohemian twisted style with textured hair', 170.00, 4),
('Lemon Braids', 'Small, defined braids in a geometric pattern', 140.00, 3),
('Knotless Braids', 'Gentle braiding technique without tight knots', 200.00, 5);

-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true);

-- Create storage policies for portfolio bucket
CREATE POLICY "Portfolio images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

CREATE POLICY "Admin can upload portfolio images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio' AND auth.email() = 'tyronenorris@gmail.com');

CREATE POLICY "Admin can update portfolio images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'portfolio' AND auth.email() = 'tyronenorris@gmail.com');

CREATE POLICY "Admin can delete portfolio images"
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolio' AND auth.email() = 'tyronenorris@gmail.com');