-- Add partner role to the existing app_role enum
ALTER TYPE app_role ADD VALUE 'partner';

-- Create partners table for partner-specific information
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  company_name TEXT,
  company_logo_url TEXT,
  partnership_type TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Create policies for partners table
CREATE POLICY "Partners can view their own profile" 
ON public.partners 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Partners can update their own profile" 
ON public.partners 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Partners can insert their own profile" 
ON public.partners 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all partners" 
ON public.partners 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_partners_updated_at
BEFORE UPDATE ON public.partners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();