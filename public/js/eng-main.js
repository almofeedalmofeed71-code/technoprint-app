/* TECHOPRINT 2026 - ENG MAIN */
/* Splash: 2 seconds exactly */

window.addEventListener('DOMContentLoaded', function() {
    // 2 SECOND TIMER - exact
    setTimeout(function() {
        document.getElementById('splash').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
    }, 2000);
    
    // Init
    if (window.I18n && I18n.init) I18n.init();
});
