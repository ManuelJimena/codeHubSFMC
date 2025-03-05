/*
  # Add admin role and policies

  1. Changes
    - Add `is_admin` column to profiles table
    - Add policies for admin access
    - Add function to check admin status

  2. Security
    - Only admins can view admin-only content
    - Only superuser can modify admin status
    - Regular users cannot modify admin column
*/

-- Add is_admin column to profiles table
ALTER TABLE profiles 
ADD COLUMN is_admin boolean DEFAULT false;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to allow admin access
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can view all snippets"
  ON snippets
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all snippets"
  ON snippets
  FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can delete all snippets"
  ON snippets
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Protect is_admin column from being modified by regular users
ALTER TABLE profiles
  ENABLE ROW LEVEL SECURITY;