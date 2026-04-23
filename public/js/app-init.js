/* TECHOPRINT 2026 - APP INIT */
/* Splash Screen: 2 seconds, then show dashboard */

function initApp() {
    console.log('[TECHOPRINT 2026] INITIALIZING...');
    
    // Show splash for 2 seconds
    var splash = document.getElementById('splashScreen');
    
    // Init all engines
    if (window.I18n) I18n.init();
    if (window.Nav) Nav.init();
    if (window.Slider) Slider.init();
    if (window.Auth) Auth.init();
    
    // After 2 seconds, hide splash and show dashboard
    setTimeout(function() {
        if (splash) {
            splash.style.opacity = '0';
            splash.style.transition = 'opacity 0.5s ease';
            setTimeout(function() {
                splash.style.display = 'none';
            }, 500);
        }
        
        // Show dashboard
        var portal = document.getElementById('masterPortal');
        var app = document.getElementById('app');
        if (portal) portal.style.display = 'none';
        if (app) app.style.display = 'block';
        
        // Ensure dashboard section is visible
        var dashboard = document.getElementById('dashboardSection');
        if (dashboard) dashboard.style.display = 'block';
        
        console.log('[TECHOPRINT 2026] READY - Dashboard shown');
    }, 2000);
}

// Start
document.addEventListener('DOMContentLoaded', initApp);
