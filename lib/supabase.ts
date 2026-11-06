import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cxhcrjipxmbolyywxube.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aGNyamlweG1ib2x5eXd4dWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwMDMyMzAsImV4cCI6MjEwOTU3OTIzMH0.0OZLldLoP5RIWD85vm6sDtoj-IoQCpmpbqnTo89Q9-s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
