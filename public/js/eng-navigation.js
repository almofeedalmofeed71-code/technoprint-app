/* TECHOPRINT 2026 - ENG NAVIGATION */
/* FORCE ALERT ON EVERY BUTTON CLICK */

const Nav = {
    current: 'dashboard',
    init() {
        console.log('[NAV] Navigation ready');
    },
    go(page) {
        this.current = page;
        const alerts = {
            orders: '📦 My Orders - Coming Soon!',
            wallet: '💰 Wallet - Coming Soon!',
            library: '📚 Library - Coming Soon!',
            tracking: '📍 Order Tracking - Coming Soon!',
            printing: '🖨️ Printing Service - Coming Soon!',
            support: '🔧 Support Center - Coming Soon!',
            teacher: '👨‍🏫 Teacher Portal - Coming Soon!',
            inks: '🎨 Inks & Supplies - Coming Soon!',
            settings: '⚙️ Settings - Coming Soon!',
            dashboard: '🏠 Dashboard'
        };
        window.alert(alerts[page] || page + ' - Coming Soon!');
    }
};

window.Nav = Nav;
window.navigateTo = function(p) { Nav.go(p); };

// DIRECT onClick handlers for ALL buttons
window.showNotification = function() {
    window.alert('🔔 You have 3 new notifications!\n\n• New order received\n• Payment confirmed\n• Print job completed');
};

window.openModal = function(id) {
    var modal = document.getElementById(id);
    if (modal) modal.style.display = 'flex';
};

window.closeModal = function(id) {
    var modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
};

window.toggleRegister = function() {
    var login = document.getElementById('loginModal');
    var reg = document.getElementById('registerModal');
    if (login) login.style.display = login.style.display === 'flex' ? 'none' : 'flex';
    if (reg) reg.style.display = reg.style.display === 'flex' ? 'none' : 'flex';
};

window.handleRegister = function(form) {
    window.alert('Registration form submitted!');
    return false;
};

window.showMainDashboard = function() {
    window.alert('🎓 Welcome to Student Portal!');
    var portal = document.getElementById('masterPortal');
    var app = document.getElementById('app');
    if (portal) portal.style.display = 'none';
    if (app) app.style.display = 'block';
};
