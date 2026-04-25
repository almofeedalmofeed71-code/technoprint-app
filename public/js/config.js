/**
 * TECHOPRINT 2026 - Configuration Module
 * All API keys and configuration in one place
 */

const CONFIG = {
    // Supabase Configuration
    SUPABASE_URL: 'https://avabozirwdefwtabywqo.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YWJvemlyd2RlZnd0YWJ5d3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjM1NDQsImV4cCI6MjA5MjQzOTU0NH0.boDU0pXR1MGYiJXF1Jos-w0uehKCCZHsKgxHP7nbQVY',
    
    // API Base
    API_BASE: '/api',
    
    // Session Key
    SESSION_KEY: 'technoprintSession',
    
    // App Version
    VERSION: '3.0'
};

// Export for modules
window.TECHNO_CONFIG = CONFIG;