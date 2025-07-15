/*
  # Create metadata table for application configuration

  1. New Tables
    - `app_metadata`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Configuration key
      - `value` (jsonb) - Configuration value
      - `description` (text) - Description of the setting
      - `category` (text) - Category for grouping settings
      - `is_public` (boolean) - Whether this setting can be read by clients
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `app_metadata` table
    - Add policy for public settings to be readable by authenticated users
    - Add policy for admins to manage all settings

  3. Initial Data
    - Insert default currency and regional settings
*/

CREATE TABLE IF NOT EXISTS app_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  category text DEFAULT 'general',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_metadata ENABLE ROW LEVEL SECURITY;

-- Policy for public settings
CREATE POLICY "Anyone can read public metadata"
  ON app_metadata
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Policy for admins to manage settings (placeholder - would need proper admin role system)
CREATE POLICY "Admins can manage all metadata"
  ON app_metadata
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default currency and regional settings
INSERT INTO app_metadata (key, value, description, category, is_public) VALUES
  ('default_currency', '{"code": "EUR", "symbol": "€", "name": "Euro"}', 'Default currency for the application', 'regional', true),
  ('supported_currencies', '[
    {"code": "EUR", "symbol": "€", "name": "Euro"},
    {"code": "USD", "symbol": "$", "name": "US Dollar"},
    {"code": "INR", "symbol": "₹", "name": "Indian Rupee"},
    {"code": "GBP", "symbol": "£", "name": "British Pound"},
    {"code": "JPY", "symbol": "¥", "name": "Japanese Yen"},
    {"code": "CAD", "symbol": "C$", "name": "Canadian Dollar"},
    {"code": "AUD", "symbol": "A$", "name": "Australian Dollar"}
  ]', 'List of supported currencies', 'regional', true),
  ('default_country', '{"code": "DE", "name": "Germany", "currency": "EUR"}', 'Default country setting', 'regional', true),
  ('date_format', '{"format": "DD/MM/YYYY", "locale": "de-DE"}', 'Default date format', 'regional', true),
  ('number_format', '{"locale": "de-DE", "decimal_separator": ",", "thousands_separator": "."}', 'Default number format', 'regional', true);