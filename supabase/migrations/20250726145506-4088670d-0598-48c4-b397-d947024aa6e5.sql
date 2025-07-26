-- Create admin and test driver accounts
-- First check if admin user already exists and create if not
DO $$
DECLARE
    admin_user_id uuid;
    driver_user_id uuid;
    admin_exists boolean := false;
    driver_exists boolean := false;
BEGIN
    -- Check if admin user already exists
    SELECT EXISTS(
        SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
    ) INTO admin_exists;
    
    -- Check if driver user already exists
    SELECT EXISTS(
        SELECT 1 FROM auth.users WHERE email = 'driver@example.com'
    ) INTO driver_exists;
    
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
            'admin@example.com',
            crypt('admin123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"first_name": "Admin", "last_name": "User"}',
            false,
            '',
            ''
        );

        -- Create admin profile
        INSERT INTO public.profiles (id, first_name, last_name)
        VALUES (admin_user_id, 'Admin', 'User')
        ON CONFLICT (id) DO NOTHING;

        -- Assign admin role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Admin user created successfully';
    ELSE
        RAISE NOTICE 'Admin user already exists';
    END IF;
    
    -- Create test driver user if doesn't exist
    IF NOT driver_exists THEN
        driver_user_id := gen_random_uuid();
        
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
            driver_user_id,
            'authenticated',
            'authenticated',
            'driver@example.com',
            crypt('driver123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"first_name": "John", "last_name": "Driver"}',
            false,
            '',
            ''
        );

        -- Create driver profile
        INSERT INTO public.profiles (id, first_name, last_name, phone)
        VALUES (driver_user_id, 'John', 'Driver', '+1234567890')
        ON CONFLICT (id) DO NOTHING;

        -- Create driver record
        INSERT INTO public.drivers (
            user_id, 
            license_number, 
            vehicle_make, 
            vehicle_model, 
            vehicle_year, 
            vehicle_license_plate, 
            phone, 
            is_active
        ) VALUES (
            driver_user_id,
            'DL123456789',
            'Toyota',
            'Camry',
            2020,
            'ABC-123',
            '+1234567890',
            true
        );

        -- Assign driver role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (driver_user_id, 'driver')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Driver user created successfully';
    ELSE
        RAISE NOTICE 'Driver user already exists';
    END IF;

END $$;