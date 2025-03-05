/*
  # Fix Admin Function and Policies

  1. Changes
    - Drop existing admin function and dependent policies with CASCADE
    - Recreate admin check function with improved security
    - Recreate admin policies
    - Set admin status for specific user

  2. Security
    - Secure admin check function with SECURITY DEFINER
    - Proper RLS policies for admin access
*/

-- Drop existing function and its dependencies
DROP FUNCTION IF EXISTS is_admin() CASCADE;

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

-- Recreate admin policies for profiles
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

-- Recreate admin policies for snippets
CREATE POLICY "Admins can view all snippets"
  ON snippets
  FOR SELECT
  TO authenticated
  USING (is_admin() = true);

CREATE POLICY "Admins can update all snippets"
  ON snippets
  FOR UPDATE
  TO authenticated
  USING (is_admin() = true);

CREATE POLICY "Admins can delete all snippets"
  ON snippets
  FOR DELETE
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