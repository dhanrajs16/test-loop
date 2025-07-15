const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Please create a .env file with your Supabase credentials:');
  console.error('EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.error('');
  console.error('You can find these values in your Supabase project dashboard under Settings > API');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createExecSqlFunction() {
  console.log('🔧 Creating exec_sql function...');
  
  try {
    // Create the exec_sql function using direct SQL execution
    const { error } = await supabase.rpc('exec', {
      sql: `
        CREATE OR REPLACE FUNCTION public.exec_sql(sql_statement text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
            EXECUTE sql_statement;
        END;
        $$;
        ALTER FUNCTION public.exec_sql(text) OWNER TO supabase_admin;
        GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
      `
    });

    if (error) {
      console.log('⚠️  Could not create exec_sql function via RPC, this is expected in some setups');
      console.log('📝 Please manually create the exec_sql function in your Supabase SQL editor:');
      console.log(`
CREATE OR REPLACE FUNCTION public.exec_sql(sql_statement text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    EXECUTE sql_statement;
END;
$$;
ALTER FUNCTION public.exec_sql(text) OWNER TO supabase_admin;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
      `);
    } else {
      console.log('✅ exec_sql function created successfully');
    }
  } catch (error) {
    console.log('⚠️  Could not create exec_sql function automatically');
    console.log('📝 Please manually create it in your Supabase SQL editor');
  }
}

async function createTables() {
  // First try to create the exec_sql function
  await createExecSqlFunction();
  
  console.log('🚀 Setting up database tables...');

  try {
    // Create community_invitations table
    const { error: invitationsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (invitationsError) {
      console.error('❌ Error creating community_invitations table:', invitationsError);
    } else {
      console.log('✅ community_invitations table created successfully');
    }

    // Update events table to support payment info
    const { error: eventsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (eventsError) {
      console.error('❌ Error updating events table:', eventsError);
    } else {
      console.log('✅ events table updated successfully');
    }

    // Update event_attendees table to support guest count and payment
    const { error: attendeesError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (attendeesError) {
      console.error('❌ Error updating event_attendees table:', attendeesError);
    } else {
      console.log('✅ event_attendees table updated successfully');
    }

    console.log('🎉 Database setup completed!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

createTables();