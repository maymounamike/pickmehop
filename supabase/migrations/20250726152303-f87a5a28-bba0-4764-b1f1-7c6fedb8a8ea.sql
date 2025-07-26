-- CRITICAL SECURITY FIXES

-- 1. Re-enable RLS on profiles table (CRITICAL)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Re-enable RLS on user_roles table (CRITICAL) 
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Drop and recreate secure policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Secure profile policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 4. Secure user_roles policies to prevent privilege escalation
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Only allow users to view their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id);

-- Only allow admins to view all roles
CREATE POLICY "Admins can view all roles" 
ON public.user_roles FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only allow admins to manage roles, but prevent self-demotion
CREATE POLICY "Admins can manage other user roles" 
ON public.user_roles FOR ALL 
USING (
  has_role(auth.uid(), 'admin'::app_role) AND 
  (user_id != auth.uid() OR role != 'admin'::app_role)
);

-- 5. Strengthen booking policies - remove overly permissive admin access
DROP POLICY IF EXISTS "Allow admin access to all bookings" ON public.bookings;

-- Replace with more restrictive admin policy
CREATE POLICY "Admins can manage bookings through proper channels" 
ON public.bookings FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. Add audit trigger for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log role changes for security monitoring
  RAISE LOG 'Role change: user_id=%, old_role=%, new_role=%, changed_by=%', 
    COALESCE(OLD.user_id, NEW.user_id),
    OLD.role,
    NEW.role,
    auth.uid();
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit trigger
DROP TRIGGER IF EXISTS audit_user_roles_changes ON public.user_roles;
CREATE TRIGGER audit_user_roles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_role_changes();

-- 7. Add function to safely create admin users (for future use)
CREATE OR REPLACE FUNCTION public.create_admin_user(target_user_id uuid)
RETURNS void AS $$
BEGIN
  -- Only existing admins can create new admins
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only administrators can create admin users';
  END IF;
  
  -- Prevent duplicate admin roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE LOG 'Admin user created: user_id=%, created_by=%', target_user_id, auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;