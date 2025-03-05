/*
  # API Keys Management System

  1. New Tables
    - `api_keys`
      - `id` (uuid, primary key)
      - `key_name` (text, unique)
      - `key_value` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `api_keys` table
    - Add policies for admin management and authenticated user read access
    - Add trigger for updating updated_at timestamp

  3. Functions
    - Create update_updated_at_column() function for timestamp management
*/

-- Create the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text UNIQUE NOT NULL,
  key_value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage API keys" ON api_keys
  FOR ALL
  TO authenticated
  USING (is_admin() = true)
  WITH CHECK (is_admin() = true);

CREATE POLICY "Authenticated users can read API keys" ON api_keys
  FOR SELECT
  TO authenticated
  USING (true);

-- Create trigger for updating updated_at
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();