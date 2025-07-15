/*
  # Enhance Event Attendees Table for Guest and Payment Support

  1. Changes
    - Add `guest_count` column for number of guests
    - Add `total_amount` column for total payment amount
    - Add `payment_status` column for payment tracking
    - Add `payment_method` column for payment method used
    - Add `payment_reference` column for transaction reference

  2. Security
    - Maintain existing RLS policies
*/

-- Add guest and payment columns to event_attendees table
DO $$
BEGIN
  -- Add guest_count column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_attendees' AND column_name = 'guest_count'
  ) THEN
    ALTER TABLE event_attendees ADD COLUMN guest_count integer DEFAULT 0;
  END IF;

  -- Add total_amount column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_attendees' AND column_name = 'total_amount'
  ) THEN
    ALTER TABLE event_attendees ADD COLUMN total_amount decimal(10,2) DEFAULT 0;
  END IF;

  -- Add payment_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_attendees' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE event_attendees ADD COLUMN payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed'));
  END IF;

  -- Add payment_method column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_attendees' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE event_attendees ADD COLUMN payment_method text;
  END IF;

  -- Add payment_reference column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_attendees' AND column_name = 'payment_reference'
  ) THEN
    ALTER TABLE event_attendees ADD COLUMN payment_reference text;
  END IF;
END $$;