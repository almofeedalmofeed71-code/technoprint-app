/**
 * TECHOPRINT 2026 - Supabase Client
 * Official @supabase/supabase-js with proper Realtime setup
 */

// Supabase Config - EXACT VALUES FROM USER
const SUPABASE_URL = 'https://avabozirwdefwtabywqo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YWJvemlyd2RlZnd0YWJ5d3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjM1NDQsImV4cCI6MjA5MjQzOTU0NH0.boDU0pXR1MGYiJXF1Jos-w0uehKCCZHsKgxHP7nbQVY';

// Create Supabase client
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});

module.exports = supabase;