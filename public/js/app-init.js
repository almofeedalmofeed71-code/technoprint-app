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

// Toggle between login and register modals
window.toggleRegister = function() {
    var login = document.getElementById('loginModal');
    var reg = document.getElementById('registerModal');
    if (login) login.style.display = login.style.display === 'flex' ? 'none' : 'flex';
    if (reg) reg.style.display = reg.style.display === 'flex' ? 'none' : 'flex';
};

// Handle registration
window.handleRegister = function(form) {
    var data = {
        fullName: form.fullName.value,
        username: form.username.value,
        email: form.email.value,
        phone: form.phone.value,
        governorate: form.governorate.value,
        address: form.address.value,
        password: form.password.value
    };
    Auth.register(data);
    return false;
};

// Start
document.addEventListener('DOMContentLoaded', initApp);
