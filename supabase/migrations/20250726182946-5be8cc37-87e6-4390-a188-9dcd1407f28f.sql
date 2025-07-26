-- Fix the missing profile and reset driver to pending status
-- This user has driver role and driver record but no profile

-- First, let's set the driver back to inactive (pending approval)
UPDATE drivers 
SET is_active = false 
WHERE user_id = '7705ecde-c6e2-4537-a3be-03622a473337';

-- Create the missing profile (we'll use placeholder data since we don't have the original signup info)
INSERT INTO profiles (id, first_name, last_name, created_at, updated_at)
VALUES (
  '7705ecde-c6e2-4537-a3be-03622a473337',
  'Driver', 
  'Pending',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;