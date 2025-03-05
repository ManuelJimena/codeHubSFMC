/*
  # Setup Admin Role and Policies

  1. Changes
    - Add function to check admin status
    - Update specific user to be admin
    - Add admin policies (with safety checks)

  2. Security
    - Function to verify admin status
    - Safe policy creation with IF NOT EXISTS checks
*/

-- Function to check if a user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update specific user to be admin
DO $$ 
BEGIN
  UPDATE profiles
  SET is_admin = true
  WHERE email = 'manuel.jimena29@gmail.com';
END $$;

-- Safely add admin policies
DO $$ 
BEGIN
  -- Check and create admin read policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Admins can read all profiles'
  ) THEN
    CREATE POLICY "Admins can read all profiles"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (is_admin());
  END IF;

  -- Check and create admin update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Admins can update all profiles'
  ) THEN
    CREATE POLICY "Admins can update all profiles"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (is_admin());
  END IF;
END $$;