/* TECHOPRINT 2026 - APP INIT */
/* Emergency startup function */

function initApp() {
    console.log('[TECHOPRINT 2026] INITIALIZING...');
    
    // Hide splash immediately
    var splash = document.getElementById('splashScreen');
    if (splash) {
        splash.style.display = 'none';
    }
    
    // Show dashboard
    var portal = document.getElementById('masterPortal');
    var app = document.getElementById('app');
    
    if (portal) portal.style.display = 'none';
    if (app) app.style.display = 'block';
    
    // Init i18n
    if (window.I18n) {
        I18n.set('ar');
    }
    
    console.log('[TECHOPRINT 2026] READY');
}

// Start immediately
document.addEventListener('DOMContentLoaded', initApp);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initApp, 100);
}
