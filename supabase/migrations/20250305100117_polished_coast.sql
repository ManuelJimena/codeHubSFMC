/*
  # Fix profiles table RLS policies

  1. Changes
    - Add policy to allow users to insert their own profile during signup
    - Ensure profile ID matches auth.uid()
  
  2. Security
    - Maintains existing RLS policies
    - Only allows users to create their own profile
    - Prevents unauthorized profile creation
*/

-- Enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add policy for profile creation during signup
CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Add policy for users to read any profile
CREATE POLICY "Users can read any profile"
  ON profiles
  FOR SELECT
  TO public
  USING (true);