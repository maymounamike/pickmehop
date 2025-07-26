-- Fix security warnings from previous migration

-- 1. Fix search_path for audit_role_changes function
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- Log role changes for security monitoring
  RAISE LOG 'Role change: user_id=%, old_role=%, new_role=%, changed_by=%', 
    COALESCE(OLD.user_id, NEW.user_id),
    OLD.role,
    NEW.role,
    auth.uid();
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 2. Fix search_path for create_admin_user function
CREATE OR REPLACE FUNCTION public.create_admin_user(target_user_id uuid)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
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
$$;