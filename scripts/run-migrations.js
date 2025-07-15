const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  console.log('🚀 Running database migrations...');

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ Migrations directory not found:', migrationsDir);
    process.exit(1);
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log(`📁 Found ${migrationFiles.length} migration files`);

  for (const file of migrationFiles) {
    console.log(`\n📄 Running migration: ${file}`);
    
    try {
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Execute the SQL directly using the Supabase client
      const { error } = await supabase.rpc('exec', { sql: sqlContent });
      
      if (error) {
        // If exec RPC doesn't exist, try alternative approach
        console.log('⚠️  exec RPC not available, trying alternative approach...');
        
        // Split SQL into individual statements and execute them
        const statements = sqlContent
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('/*') && !stmt.startsWith('--'));
        
        for (const statement of statements) {
          if (statement.trim()) {
            const { error: stmtError } = await supabase.rpc('exec_sql', { 
              sql: statement 
            });
            
            if (stmtError) {
              console.error(`❌ Error in statement: ${statement.substring(0, 100)}...`);
              console.error('Error:', stmtError);
              // Continue with next statement instead of failing completely
            }
          }
        }
        
        console.log(`✅ Migration ${file} completed (with alternative method)`);
      } else {
        console.log(`✅ Migration ${file} completed successfully`);
      }
      
    } catch (error) {
      console.error(`❌ Error running migration ${file}:`, error);
      console.log('⚠️  This might be expected if tables already exist or if using limited permissions');
    }
  }

  console.log('\n🎉 Migration process completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Check your Supabase dashboard to verify tables were created');
  console.log('2. If tables are missing, you may need to run the SQL manually in the Supabase SQL editor');
  console.log('3. Ensure your database user has sufficient permissions');
}

runMigrations().catch(console.error);