/**
 * TECHNO-CONTROL REALTIME
 * Contains: startRealtimeListener, startDataSync
 */

function startRealtimeListener() {
    var client = window.supabaseClient();
    if (!client) {
        console.log('⚠️ Realtime: Supabase not ready, skipping');
        return;
    }

    var channel = client.channel('admin-dashboard-realtime');

    channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, function(payload) {
            console.log('📊 profiles changed:', payload);
            window.loadAllData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, function(payload) {
            console.log('📋 orders changed:', payload);
            window.loadAllData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, function(payload) {
            console.log('🛠️ services changed:', payload);
            window.loadAllData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, function(payload) {
            console.log('⚙️ app_settings changed:', payload);
            window.renderSettingsPanel();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ads' }, function(payload) {
            console.log('📢 ads changed:', payload);
            window.loadAllData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, function(payload) {
            console.log('✅ tasks changed:', payload);
            window.loadAllData();
        })
        .subscribe(function(status) {
            console.log('📡 Realtime status:', status);
        });

    window.STATE.realtimeChannel = channel;
}

function startDataSync() {
    if (window.STATE.syncInterval) clearInterval(window.STATE.syncInterval);

    window.STATE.syncInterval = setInterval(function() {
        if (window.STATE.isLoading || !window.supabaseClient()) return;

        window.loadAllData().catch(function(err) {
            console.error('❌ Sync error:', err);
        });
    }, window.CONFIG.SYNC_INTERVAL || 60000);
}

window.startRealtimeListener = startRealtimeListener;
window.startDataSync = startDataSync;