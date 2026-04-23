/* TECHOPRINT 2026 - ENG MAIN */
/* Splash Screen: 2 seconds, then show dashboard */

window.addEventListener('DOMContentLoaded', function() {
    // Splash screen logic
    var splash = document.getElementById('splashScreen');
    
    // Init modules
    if (window.I18n && I18n.init) I18n.init();
    
    // Show splash for 2 seconds
    setTimeout(function() {
        if (splash) {
            splash.style.opacity = '0';
            splash.style.transition = 'opacity 0.5s';
            setTimeout(function() {
                if (splash) splash.style.display = 'none';
            }, 500);
        }
        
        // Show dashboard
        var dashboard = document.getElementById('dashboardSection');
        if (dashboard) dashboard.style.display = 'block';
    }, 2000);
});
