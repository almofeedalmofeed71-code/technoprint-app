/* TECHOPRINT 2026 - APP INIT */
/* Master Startup */

function initApp() {
    console.log('[TECHOPRINT 2026] INITIALIZING...');
    
    // Hide splash
    var splash = document.getElementById('splashScreen');
    if (splash) splash.style.display = 'none';
    
    // Show dashboard
    var portal = document.getElementById('masterPortal');
    var app = document.getElementById('app');
    if (portal) portal.style.display = 'none';
    if (app) app.style.display = 'block';
    
    // Init all engines
    if (window.I18n) I18n.init();
    if (window.Nav) Nav.init();
    if (window.Slider) Slider.init();
    if (window.Auth) Auth.init();
    
    console.log('[TECHOPRINT 2026] READY');
}

// Start
document.addEventListener('DOMContentLoaded', initApp);
