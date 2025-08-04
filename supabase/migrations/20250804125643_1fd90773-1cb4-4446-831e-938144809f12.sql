-- Create phone_verifications table for SMS authentication
CREATE TABLE public.phone_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies for phone_verifications
CREATE POLICY "Service role can manage phone verifications" 
ON public.phone_verifications 
FOR ALL 
USING (true);

-- Create index for performance
CREATE INDEX idx_phone_verifications_phone ON public.phone_verifications(phone);
CREATE INDEX idx_phone_verifications_expires ON public.phone_verifications(expires_at);

-- Create admin_2fa table for two-factor authentication
CREATE TABLE public.admin_2fa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  backup_codes TEXT[], 
  enabled BOOLEAN DEFAULT false,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.admin_2fa ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_2fa
CREATE POLICY "Admins can manage their own 2FA" 
ON public.admin_2fa 
FOR ALL 
USING (auth.uid() = user_id AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Super admins can view all 2FA settings" 
ON public.admin_2fa 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger for admin_2fa
CREATE TRIGGER update_admin_2fa_updated_at
BEFORE UPDATE ON public.admin_2fa
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add phone column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    END IF;
END $$;

-- Create improved user management functions
CREATE OR REPLACE FUNCTION public.get_user_with_roles(user_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'user_id', p.id,
        'first_name', p.first_name,
        'last_name', p.last_name,
        'phone', p.phone,
        'roles', COALESCE(
            (SELECT array_agg(ur.role::text) 
             FROM user_roles ur 
             WHERE ur.user_id = p.id), 
            ARRAY[]::text[]
        ),
        'driver_profile', COALESCE(
            (SELECT json_build_object(
                'vehicle_make', d.vehicle_make,
                'vehicle_model', d.vehicle_model,
                'license_number', d.license_number,
                'is_active', d.is_active
            ) FROM drivers d WHERE d.user_id = p.id),
            NULL
        ),
        'partner_profile', COALESCE(
            (SELECT json_build_object(
                'company_name', pt.company_name,
                'partnership_type', pt.partnership_type,
                'commission_rate', pt.commission_rate,
                'is_active', pt.is_active
            ) FROM partners pt WHERE pt.user_id = p.id),
            NULL
        )
    ) INTO result
    FROM profiles p
    WHERE p.id = user_id_param;
    
    RETURN result;
END;
$$;