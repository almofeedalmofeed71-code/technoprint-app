/**
 * TECHNO-CONTROL CONFIG + STATE v15
 * ══════════════════════════════════
 */

const CONFIG = {
    SUPABASE_URL:      'https://rqzsokvhgjlftkouhphb.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY',
    SYNC_INTERVAL:     60000,
    RETRY_DELAY:       100,
    MAX_RETRIES:       100,
    REALTIME:          false
};

const STATE = {
    users:           [],
    services:        [],
    orders:          [],
    ads:             [],
    notifications:   [],
    messages:        [],
    tasks:           [],
    settings:        [],
    currentSection:  'dashboard',
    syncInterval:    null,
    realtimeChannel: null,
    isLoading:       false,
    isInitialized:   false,
    errors:          []
};

window.CONFIG = CONFIG;
window.STATE  = STATE;

console.log('✅ config.js loaded — URL:', CONFIG.SUPABASE_URL);