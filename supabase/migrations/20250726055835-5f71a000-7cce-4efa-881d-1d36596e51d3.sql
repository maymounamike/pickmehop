-- Create user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'driver', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Create drivers table for additional driver information
CREATE TABLE public.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    license_number TEXT,
    vehicle_make TEXT,
    vehicle_model TEXT,
    vehicle_year INTEGER,
    vehicle_license_plate TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on drivers
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Add driver_id column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN driver_id UUID REFERENCES public.drivers(id),
ADD COLUMN assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN assigned_by UUID REFERENCES auth.users(id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for drivers
CREATE POLICY "Drivers can view their own profile" 
ON public.drivers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Drivers can update their own profile" 
ON public.drivers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all drivers" 
ON public.drivers 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all drivers" 
ON public.drivers 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Update bookings RLS policies for driver assignment
CREATE POLICY "Drivers can view their assigned bookings" 
ON public.bookings 
FOR SELECT 
USING (
    driver_id IN (
        SELECT id FROM public.drivers WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all bookings" 
ON public.bookings 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for drivers updated_at
CREATE TRIGGER update_drivers_updated_at
BEFORE UPDATE ON public.drivers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();