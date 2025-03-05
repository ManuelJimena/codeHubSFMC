/*
  # Fix Admin Setup and Permissions

  1. Changes
    - Drop and recreate is_admin function with proper security
    - Update RLS policies for admin access
    - Add trigger for automatic admin assignment
    - Fix admin user permissions

  2. Security
    - Secure admin check function
    - Proper RLS policies
    - Automatic admin role assignment
*/

-- Drop existing function and policies
DROP FUNCTION IF EXISTS is_admin() CASCADE;

-- Create a more secure admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Get the is_admin status directly from profiles
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function for automatic admin assignment
CREATE OR REPLACE FUNCTION handle_admin_user() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'manuel.jimena29@gmail.com' THEN
    NEW.is_admin := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new profiles
DROP TRIGGER IF EXISTS set_admin_user ON profiles;
CREATE TRIGGER set_admin_user
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_admin_user();

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

-- Update existing admin user if exists
UPDATE profiles 
SET is_admin = true 
WHERE email = 'manuel.jimena29@gmail.com';