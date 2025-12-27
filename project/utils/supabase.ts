import { createClient } from '@supabase/supabase-js';

// These would normally come from environment variables
// For demo purposes, using placeholder values
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchSOSHistory() {
  try {
    const { data, error } = await supabase
      .from('sos_alerts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.log('⚠ Cannot fetch history, loading offline data');
    throw error;
  }
}