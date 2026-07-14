import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
  const { data, error } = await supabase.from('accounts').select('*');
  if (error) {
    console.error('Error fetching accounts:', error);
  } else {
    console.log('Accounts:', JSON.stringify(data, null, 2));
  }
})();
