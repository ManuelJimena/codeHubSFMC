/*
  # Set admin user and update profiles table

  1. Changes
    - Set is_admin flag for specific user
    - Add admin-specific RLS policies
  
  2. Security
    - Only the specified email gets admin access
    - Add policies for admin operations
*/

-- Set admin user
UPDATE profiles 
SET is_admin = true 
WHERE email = 'manuel.jimena29@gmail.com';

-- Add admin-specific policies
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