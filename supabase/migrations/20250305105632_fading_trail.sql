/*
  # Add admin role management

  1. Changes
    - Add RLS policy for admin users
    - Add function to check admin status
    - Update existing admin user

  2. Security
    - Enable RLS on profiles table
    - Add policies for admin access
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

-- Add admin policies
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin());