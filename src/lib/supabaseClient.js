import { createClient } from '@supabase/supabase-js';

// Access environment variables securely
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that the variables exist
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);