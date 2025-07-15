/*
  # Add community invitations table

  1. New Tables
    - `community_invitations`
      - `id` (uuid, primary key)
      - `community_id` (uuid, foreign key to communities)
      - `invited_by` (uuid, foreign key to users)
      - `invited_email` (text)
      - `invited_user_id` (uuid, optional foreign key to users if user exists)
      - `role` (text, admin/moderator/member)
      - `status` (text, pending/accepted/declined/expired)
      - `invitation_token` (text, unique)
      - `expires_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `community_invitations` table
    - Add policies for invitation management
*/

CREATE TABLE IF NOT EXISTS community_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  invited_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  invitation_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE community_invitations ENABLE ROW LEVEL SECURITY;

-- Community admins can create invitations
CREATE POLICY "Community admins can create invitations"
  ON community_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_members 
      WHERE community_id = community_invitations.community_id 
      AND user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Users can read invitations sent to them
CREATE POLICY "Users can read their invitations"
  ON community_invitations
  FOR SELECT
  TO authenticated
  USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR invited_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM community_members 
      WHERE community_id = community_invitations.community_id 
      AND user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Users can update invitation status
CREATE POLICY "Users can update invitation status"
  ON community_invitations
  FOR UPDATE
  TO authenticated
  USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR invited_user_id = auth.uid()
  )
  WITH CHECK (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR invited_user_id = auth.uid()
  );