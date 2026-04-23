/* TECHOPRINT 2026 - ENG MAIN */
/* Splash: 2 seconds, then dashboard */

window.addEventListener('DOMContentLoaded', function() {
    // Show splash for 2 seconds
    setTimeout(function() {
        var splash = document.getElementById('splashScreen');
        if (splash) splash.style.display = 'none';
        
        var dashboard = document.getElementById('dashboardSection');
        if (dashboard) dashboard.style.display = 'block';
    }, 2000);
    
    // Init I18n
    if (window.I18n && I18n.init) I18n.init();
});
