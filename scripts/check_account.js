import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('email', 'admin@example.com');
  console.log('Data:', JSON.stringify(data, null, 2));
  if (error) console.error('Error:', error);
})();
