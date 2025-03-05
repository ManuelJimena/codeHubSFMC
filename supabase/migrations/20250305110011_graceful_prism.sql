/*
  # Fix Admin Policies and Functions

  1. Changes
    - Drop existing admin function and recreate it
    - Update admin policies with proper checks
    - Ensure admin status is properly set

  2. Security
    - Secure admin check function
    - Proper RLS policies for admin access
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS is_admin();

-- Create a more secure admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  _is_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO _is_admin
  FROM profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(_is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Recreate admin policies
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin() = true);

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin() = true);

-- Ensure admin user has proper permissions
DO $$ 
BEGIN
  UPDATE profiles
  SET is_admin = true
  WHERE email = 'manuel.jimena29@gmail.com'
  AND NOT is_admin;

  -- Verify the update
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE email = 'manuel.jimena29@gmail.com' 
    AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Failed to set admin status';
  END IF;
END $$;