import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://htmuqzrdqplvuvpcxveu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bXVxenJkcXBsdnV2cGN4dmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjkyNjIsImV4cCI6MjA3MzY0NTI2Mn0.yXngf0SYH5kzuAHUPhprh3wYxw7C8gyUSiKIlfVI7u4';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
