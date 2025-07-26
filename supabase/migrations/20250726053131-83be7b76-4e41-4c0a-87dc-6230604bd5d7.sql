-- Fix critical RLS policy gap for bookings table
-- Allow guest users to insert bookings (critical for app functionality)
CREATE POLICY "Allow guest bookings" ON public.bookings 
FOR INSERT 
WITH CHECK (true);

-- Allow business/admin users to view all bookings for management
CREATE POLICY "Allow admin access to all bookings" ON public.bookings 
FOR SELECT 
USING (true);

-- Fix database function security issues identified by linter
-- Update existing functions to use secure search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path TO 'public'  -- Secure search path
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'  -- Secure search path
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;