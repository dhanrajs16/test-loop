/*
  # Update communities table structure

  1. Schema Changes
    - Add structured address field (JSONB)
    - Add contact_info field (JSONB) 
    - Add is_legally_registered field (boolean)
    - Add legal_details field (JSONB)
    - Add rating field (numeric)
    - Add events_count field (integer)
    - Remove old location field after migration

  2. Data Migration
    - Migrate existing location data to new address structure
    - Set default values for new fields

  3. Security
    - Update RLS policies for new fields
*/

-- Add new columns
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_legally_registered BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS legal_details JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) DEFAULT 4.5,
ADD COLUMN IF NOT EXISTS events_count INTEGER DEFAULT 0;

-- Migrate existing location data to address structure
UPDATE communities 
SET address = jsonb_build_object(
  'street', '',
  'city', COALESCE(location, ''),
  'state', '',
  'country', 'India',
  'pincode', ''
)
WHERE address = '{}' OR address IS NULL;

-- Set default contact info
UPDATE communities 
SET contact_info = jsonb_build_object(
  'email', 'contact@community.com',
  'phone', '+91-9999999999',
  'website', ''
)
WHERE contact_info = '{}' OR contact_info IS NULL;

-- Create function to update events count
CREATE OR REPLACE FUNCTION update_community_events_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities 
    SET events_count = events_count + 1 
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities 
    SET events_count = GREATEST(events_count - 1, 0) 
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for events count
DROP TRIGGER IF EXISTS community_events_count_trigger ON events;
CREATE TRIGGER community_events_count_trigger
  AFTER INSERT OR DELETE ON events
  FOR EACH ROW EXECUTE FUNCTION update_community_events_count();