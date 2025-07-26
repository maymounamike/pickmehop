-- Create custom admin account for mike@pickmehop.com
DO $$
DECLARE
    admin_user_id uuid;
    admin_exists boolean := false;
BEGIN
    -- Check if admin user already exists
    SELECT EXISTS(
        SELECT 1 FROM auth.users WHERE email = 'mike@pickmehop.com'
    ) INTO admin_exists;
    
    -- Create admin user if doesn't exist
    IF NOT admin_exists THEN
        admin_user_id := gen_random_uuid();
        
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            confirmation_token,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            admin_user_id,
            'authenticated',
            'authenticated',
            'mike@pickmehop.com',
            crypt('PickMeHop123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"first_name": "Mike", "last_name": "Admin"}',
            false,
            '',
            ''
        );

        -- Create admin profile
        INSERT INTO public.profiles (id, first_name, last_name)
        VALUES (admin_user_id, 'Mike', 'Admin')
        ON CONFLICT (id) DO NOTHING;

        -- Assign admin role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Custom admin user created successfully';
    ELSE
        RAISE NOTICE 'Admin user with this email already exists';
    END IF;

END $$;