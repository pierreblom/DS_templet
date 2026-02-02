
const supabaseUrl = 'https://nlnhnoymrnosmbfiofeu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sbmhub3ltcm5vc21iZmlvZmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTY4MDMsImV4cCI6MjA4NDQ3MjgwM30.yr8QkVBNV3rp-UX9GB4VhDGlGFcca2h_dkObXYrPC9M';

// Ensure supabase is available from the CDN
if (typeof supabase !== 'undefined') {
    window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
} else {
    console.error('Supabase library not loaded!');
}
