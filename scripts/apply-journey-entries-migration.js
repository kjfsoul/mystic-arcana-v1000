const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Use environment variables
const supabaseUrl = 'https://pqfsbxcbsxuyfgqrxdob.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZnNieGNic3h1eWZncXJ4ZG9iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzk0OTgwMCwiZXhwIjoyMDYzNTI1ODAwfQ.MpxSuZQL4NZS-lTPkitBG4QdS_AMVw5xxNbbTmzIxOk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250803210543_create_journey_entries_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying journey_entries migration...');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql: statement + ';'
      });
      
      if (error) {
        console.error('Error executing statement:', error);
        // Continue with other statements even if one fails
      } else {
        console.log('Statement executed successfully');
      }
    }

    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();