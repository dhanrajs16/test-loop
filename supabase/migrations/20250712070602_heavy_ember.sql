/*
  # Enhance Events Table for Payment and Guest Support

  1. Changes
    - Add `price` column for event pricing
    - Add `allow_guests` column for guest management
    - Add `max_guests_per_registration` column for guest limits
    - Add `payment_info` column for payment details (JSON)

  2. Security
    - Maintain existing RLS policies
*/

-- Add payment-related columns to events table
DO $$
BEGIN
  -- Add price column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'price'
  ) THEN
    ALTER TABLE events ADD COLUMN price decimal(10,2) DEFAULT 0;
  END IF;

  -- Add allow_guests column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'allow_guests'
  ) THEN
    ALTER TABLE events ADD COLUMN allow_guests boolean DEFAULT true;
  END IF;

  -- Add max_guests_per_registration column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'max_guests_per_registration'
  ) THEN
    ALTER TABLE events ADD COLUMN max_guests_per_registration integer DEFAULT 4;
  END IF;

  -- Add payment_info column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'payment_info'
  ) THEN
    ALTER TABLE events ADD COLUMN payment_info jsonb;
  END IF;
END $$;