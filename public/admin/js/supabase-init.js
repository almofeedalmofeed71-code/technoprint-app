/**
 * TECHNO-CONTROL SUPABASE INIT
 * Contains only: initSupabaseClient() + retry loop
 * Uses window.CONFIG
 */

let supabase = null;

function initSupabaseClient() {
    return new Promise(function(resolve, reject) {
        var attempts = 0;

        function tryInit() {
            attempts++;

            var lib = window.supabase;

            if (lib && typeof lib.createClient === 'function') {
                try {
                    var createClient = lib.createClient;
                    supabase = createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_ANON_KEY);
                    console.log('✅ Supabase client created successfully');
                    resolve(supabase);
                } catch (e) {
                    console.error('❌ createClient threw error:', e);
                    reject(e);
                }
            } else if (attempts < window.CONFIG.MAX_RETRIES) {
                console.log('⏳ Waiting for Supabase library... attempt ' + attempts + '/' + window.CONFIG.MAX_RETRIES);
                setTimeout(tryInit, window.CONFIG.RETRY_DELAY);
            } else {
                reject(new Error('❌ Supabase library not available after maximum retries'));
            }
        }

        tryInit();
    });
}

window.supabaseClient = function() { return supabase; };
window.getSupabaseClient = function() { return supabase; };
window.isSupabaseReady = function() { return supabase !== null; };