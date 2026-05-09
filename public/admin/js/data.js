/**
 * TECHNO-CONTROL DATA LOADER
 * Contains: loadAllData
 * Uses window.STATE, window.supabaseClient()
 * Calls window.renderAll() at end
 */

async function loadAllData() {
    var client = window.supabaseClient();
    if (!client) {
        console.log('⚠️ loadAllData: client not ready');
        return;
    }

    if (window.STATE.isLoading) return;
    window.STATE.isLoading = true;

    try {
        var promProfiles = client.from('profiles').select('*').order('created_at', { ascending: false });
        var promServices = client.from('services').select('*').order('order_index', { ascending: true });
        var promOrders   = client.from('orders').select('*').order('created_at', { ascending: false });
        var promAds     = client.from('ads').select('*').order('created_at', { ascending: false });
        var promNotifs   = client.from('notifications').select('*').order('created_at', { ascending: false });
        var promMsgs    = client.from('messages').select('*').order('created_at', { ascending: false });
        var promTasks   = client.from('tasks').select('*').order('created_at', { ascending: false });
        var promSettings = client.from('app_settings').select('*');

        var results = await Promise.all([
            promProfiles, promServices, promOrders, promAds,
            promNotifs, promMsgs, promTasks, promSettings
        ]);

        window.STATE.users         = results[0].data || [];
        window.STATE.services      = results[1].data || [];
        window.STATE.orders        = results[2].data || [];
        window.STATE.ads          = results[3].data || [];
        window.STATE.notifications = results[4].data || [];
        window.STATE.messages     = results[5].data || [];
        window.STATE.tasks        = results[6].data || [];
        window.STATE.settings     = results[7].data || [];

        if (results[0].error) console.error('profiles:', results[0].error);
        if (results[1].error) console.error('services:', results[1].error);
        if (results[2].error) console.error('orders:', results[2].error);
        if (results[3].error) console.error('ads:', results[3].error);
        if (results[4].error) console.error('notifications:', results[4].error);
        if (results[5].error) console.error('messages:', results[5].error);
        if (results[6].error) console.error('tasks:', results[6].error);
        if (results[7].error) console.error('app_settings:', results[7].error);

        console.log('✅ Data loaded:', {
            users: window.STATE.users.length,
            services: window.STATE.services.length,
            orders: window.STATE.orders.length,
            ads: window.STATE.ads.length,
            tasks: window.STATE.tasks.length,
            settings: window.STATE.settings.length
        });

        window.renderAll();

    } catch(err) {
        console.error('❌ loadAllData error:', err);
        window.STATE.errors.push(err.message);
    } finally {
        window.STATE.isLoading = false;
    }
}

window.loadAllData = loadAllData;