-- Create admin user and test driver accounts
-- First, let's create an admin user
DO $$
DECLARE
    admin_user_id uuid;
    driver_user_id uuid;
BEGIN
    -- Create admin user in auth.users (this will be your login)
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
        gen_random_uuid(),
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
    ) RETURNING id INTO admin_user_id;

    -- Create admin profile
    INSERT INTO public.profiles (id, first_name, last_name)
    VALUES (admin_user_id, 'Admin', 'User');

    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin');

    -- Create test driver user
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
        gen_random_uuid(),
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
    ) RETURNING id INTO driver_user_id;

    -- Create driver profile
    INSERT INTO public.profiles (id, first_name, last_name, phone)
    VALUES (driver_user_id, 'John', 'Driver', '+1234567890');

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
    VALUES (driver_user_id, 'driver');

END $$;