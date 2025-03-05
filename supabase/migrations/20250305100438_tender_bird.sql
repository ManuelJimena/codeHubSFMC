/*
  # Set admin user
  
  Updates the specified user to have admin privileges.

  1. Changes
    - Sets is_admin = true for the specified user email
*/

-- Set admin user (using DO block for safety)
DO $$
BEGIN
  UPDATE profiles 
  SET is_admin = true 
  WHERE email = 'manuel.jimena29@gmail.com';
END $$;