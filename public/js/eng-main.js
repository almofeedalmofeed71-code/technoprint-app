/* TECHOPRINT 2026 - ENG MAIN */
/* Splash: 2 seconds exactly */

window.addEventListener('DOMContentLoaded', function() {
    // 2 SECOND TIMER - exact
    setTimeout(function() {
        var splash = document.getElementById('splash');
        var dashboard = document.getElementById('dashboard');
        if (splash)    splash.style.display    = 'none';
        if (dashboard) dashboard.style.display = 'block';
    }, 2000);
    
    // Init
    if (window.I18n && I18n.init) I18n.init();
});