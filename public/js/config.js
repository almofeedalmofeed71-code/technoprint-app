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
    VERSION: '3.0',
    
    // Dynamic Settings (loaded from server)
    SETTINGS: null,
    SERVICES: []
};

// Load settings from server
async function loadAppSettings() {
    try {
        const res = await fetch(CONFIG.API_BASE + '/settings');
        CONFIG.SETTINGS = await res.json();
        
        // Apply dynamic CSS variables
        if (CONFIG.SETTINGS) {
            const root = document.documentElement;
            if (CONFIG.SETTINGS.primaryColor) {
                root.style.setProperty('--gold-royal', CONFIG.SETTINGS.primaryColor);
            }
            if (CONFIG.SETTINGS.secondaryColor) {
                root.style.setProperty('--bg-dark', CONFIG.SETTINGS.secondaryColor);
            }
            if (CONFIG.SETTINGS.appName) {
                document.title = CONFIG.SETTINGS.appName + ' 2026';
            }
        }
        
        return CONFIG.SETTINGS;
    } catch (e) {
        console.error('Failed to load settings:', e);
        return null;
    }
}

// Load services from server
async function loadServices() {
    try {
        const res = await fetch(CONFIG.API_BASE + '/services');
        CONFIG.SERVICES = await res.json();
        return CONFIG.SERVICES;
    } catch (e) {
        console.error('Failed to load services:', e);
        return [];
    }
}

// Export for modules
window.TECHNO_CONFIG = CONFIG;
window.loadAppSettings = loadAppSettings;
window.loadServices = loadServices;
