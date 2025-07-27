-- Fix function search_path mutable warnings for remaining functions

-- Fix handle_new_braiding_user function
CREATE OR REPLACE FUNCTION public.handle_new_braiding_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix any other functions that might be missing search_path
-- Let's also fix the format_service_name function
CREATE OR REPLACE FUNCTION public.format_service_name(service_slug text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN CASE service_slug
    WHEN 'used-tires' THEN 'Used Tires'
    WHEN 'new-tires' THEN 'New Tires'
    WHEN 'tire-repair' THEN 'Tire Repair'
    WHEN 'tire-installation' THEN 'Tire Installation'
    WHEN 'tire-rotation' THEN 'Tire Rotation'
    WHEN 'tire-balancing' THEN 'Tire Balancing'
    WHEN 'flat-tire-repair' THEN 'Flat Tire Repair'
    WHEN 'wheel-alignment' THEN 'Wheel Alignment'
    WHEN 'mobile-service' THEN 'Mobile Service'
    ELSE INITCAP(REPLACE(service_slug, '-', ' '))
  END;
END;
$function$;

-- Fix notify_admin_new_appointment function
CREATE OR REPLACE FUNCTION public.notify_admin_new_appointment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.oretir_admin_notifications (type, title, message, appointment_id)
  VALUES (
    'new_appointment',
    'New Appointment Request',
    'A new appointment has been requested by ' || NEW.customer_name || ' for ' || NEW.service_type || ' on ' || NEW.appointment_date,
    NEW.id
  );
  RETURN NEW;
END;
$function$;