/**
 * TECHNO-CONTROL INIT
 * Contains: init() — runs last after all modules
 */

async function init() {
    console.log('🚀 TECHNO-CONTROL initializing...');

    if (!window.checkAuth()) return;

    window.updateConnectionStatus('connecting');

    try {
        await window.initSupabaseClient();
    } catch(err) {
        console.error('❌ Supabase init failed:', err);
        window.updateConnectionStatus('error');
        window.showToast('❌ فشل الاتصال بقاعدة البيانات');
        return;
    }

    var dashboard = document.getElementById('adminDashboard');
    var boot = document.getElementById('bootScreen');
    if (dashboard) dashboard.style.display = 'block';
    if (boot) boot.style.display = 'none';

    window.showToast('🔄 جاري تحميل البيانات...');

    await window.loadAllData();

    window.setupNavigation();

    window.startRealtimeListener();
    window.startDataSync();

    window.updateTime();
    setInterval(window.updateTime, 60000);

    window.updateConnectionStatus('connected');

    window.showToast('✅ لوحة التحكم جاهزة');

    window.STATE.isInitialized = true;
    console.log('✅ TECHNO-CONTROL ready');
}

window.init = init;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.init);
} else {
    window.init();
}