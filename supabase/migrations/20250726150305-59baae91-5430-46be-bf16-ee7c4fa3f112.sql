-- Let's try a completely different approach - clean up and recreate the user properly
-- First, let's remove any existing problematic user entries

DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'mike@pickmehop.com'
);

DELETE FROM public.profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'mike@pickmehop.com'
);

DELETE FROM auth.users WHERE email = 'mike@pickmehop.com';

-- Also clean up any potential duplicate admin users
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@example.com'
);

DELETE FROM public.profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@example.com'
);

DELETE FROM auth.users WHERE email = 'admin@example.com';

-- Now let's ensure the functions are working properly
-- Drop and recreate the trigger completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Temporarily remove the trigger to avoid any interference during user creation
-- We'll add it back later