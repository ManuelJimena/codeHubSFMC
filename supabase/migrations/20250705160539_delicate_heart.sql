/*
  # Add accessibility settings to user profiles

  1. Changes
    - Add `show_accessibility_menu` column to profiles table
    - Set default value to true (show by default)
    - Update existing users to show accessibility menu by default

  2. Security
    - Users can only update their own accessibility settings
    - Maintains existing RLS policies
*/

-- Add accessibility settings column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS show_accessibility_menu boolean DEFAULT true;

-- Update existing users to show accessibility menu by default
UPDATE profiles 
SET show_accessibility_menu = true 
WHERE show_accessibility_menu IS NULL;