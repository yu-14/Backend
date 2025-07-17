import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase configuration missing. Please click "Connect to Supabase" in the top right corner.');
  console.warn('   The server will start but database operations will fail until configured.');
}

// Create Supabase client with service role key for backend operations
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null;

// Test database connection
export async function testConnection() {
  if (!supabase) {
    console.log('❌ Database not configured - please set up Supabase connection');
    return false;
  }
  
  try {
    const { data, error } = await supabase.from('tasks').select('count').limit(1);
    if (error) {
      console.error('Database connection failed:', error);
      return false;
    }
    console.log('✅ Database connected successfully');
    return true;
  } catch (err) {
    console.error('Database connection error:', err);
    return false;
  }
}