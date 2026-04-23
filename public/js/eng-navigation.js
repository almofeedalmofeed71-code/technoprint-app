/* TECHOPRINT 2026 - ENG NAVIGATION */
/* Working button events */

const Nav = {
    current: 'dashboard',
    screens: ['dashboard', 'wallet', 'library', 'orders', 'tracking', 'printing', 'support', 'teacher', 'inks'],
    
    init() {
        console.log('[NAV] Navigation ready');
    },
    
    go(page) {
        if (!this.screens.includes(page)) {
            console.log('[NAV] Unknown page:', page);
            return;
        }
        this.current = page;
        console.log('[NAV] Going to:', page);
        alert('Navigating to: ' + page);
    }
};

window.Nav = Nav;
window.navigateTo = (p) => Nav.go(p);
