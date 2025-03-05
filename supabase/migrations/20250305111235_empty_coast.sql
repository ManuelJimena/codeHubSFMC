/*
  # Fix Admin Function and Policies

  1. Changes
    - Drop existing admin function and dependent policies with CASCADE
    - Recreate admin check function with improved security
    - Recreate admin policies
    - Ensure admin user exists before setting admin status

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

-- Ensure admin user exists and has proper permissions
DO $$ 
DECLARE
  admin_exists boolean;
BEGIN
  -- Check if the admin user exists
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE email = 'manuel.jimena29@gmail.com'
  ) INTO admin_exists;

  -- Only proceed if the user exists
  IF admin_exists THEN
    UPDATE profiles
    SET is_admin = true
    WHERE email = 'manuel.jimena29@gmail.com'
    AND NOT is_admin;
  END IF;
END $$;