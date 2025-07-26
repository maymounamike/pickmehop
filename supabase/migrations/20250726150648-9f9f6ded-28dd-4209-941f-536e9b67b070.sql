-- Assign admin role to mike@pickmehop.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'mike@pickmehop.com'
ON CONFLICT (user_id, role) DO NOTHING;