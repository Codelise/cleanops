const supabaseUrl = "https://sdodtoyvezabcahtnpvi.supabase.co";
const supabase_anon_key =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkb2R0b3l2ZXphYmNhaHRucHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NjUyNzIsImV4cCI6MjA4MjE0MTI3Mn0.TjEyaxlnqIob50bvhUAyIckzMenquVp16OG5klJ2ihY";

export const supabase = window.supabase.createClient(
  supabaseUrl,
  supabase_anon_key
);
