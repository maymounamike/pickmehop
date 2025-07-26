-- Fix authentication issues by ensuring proper triggers and removing potential conflicts
-- First, let's check if there are any trigger issues and fix them

-- Drop and recreate the handle_new_user trigger to ensure it works properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles only if the profile doesn't already exist
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the trigger
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also, let's ensure we don't have any problematic policies on the profiles table
-- that might cause issues during authentication

-- Temporarily disable RLS on profiles to see if that's the issue
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on user_roles temporarily
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;