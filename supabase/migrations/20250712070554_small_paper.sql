/*
  # Add Community Invitations Table

  1. New Tables
    - `community_invitations`
      - `id` (uuid, primary key)
      - `community_id` (uuid, foreign key to communities)
      - `invited_by` (uuid, foreign key to users)
      - `invited_email` (text)
      - `invited_user_id` (uuid, foreign key to users, nullable)
      - `status` (text, enum: pending/accepted/declined/expired)
      - `role` (text, enum: admin/moderator/member)
      - `invitation_token` (text, unique)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `community_invitations` table
    - Add policies for reading own invitations
    - Add policies for admins to create invitations
    - Add policies for users to update their invitations
*/

-- Create community_invitations table
CREATE TABLE IF NOT EXISTS community_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  invited_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  role text DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  invitation_token text UNIQUE DEFAULT gen_random_uuid()::text,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE community_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own invitations"
  ON community_invitations
  FOR SELECT
  TO authenticated
  USING (invited_email = auth.email() OR invited_user_id = auth.uid());

CREATE POLICY "Community admins can create invitations"
  ON community_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = invited_by AND
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = community_invitations.community_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Users can update their own invitations"
  ON community_invitations
  FOR UPDATE
  TO authenticated
  USING (invited_email = auth.email() OR invited_user_id = auth.uid());