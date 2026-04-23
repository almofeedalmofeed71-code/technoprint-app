/* TECHOPRINT 2026 - ENG NAVIGATION */
/* Working button events with Coming Soon popups */

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
        this.showComingSoon(page);
    },
    
    showComingSoon(page) {
        const pageNames = {
            wallet: 'Wallet',
            library: 'Library',
            orders: 'My Orders',
            tracking: 'Order Tracking',
            printing: 'Printing Service',
            support: 'Support Center',
            teacher: 'Teacher Portal',
            inks: 'Inks & Supplies',
            settings: 'Settings'
        };
        alert('Coming Soon: ' + (pageNames[page] || page));
    }
};

window.Nav = Nav;
window.navigateTo = (p) => Nav.go(p);
window.showNotification = () => alert('You have 3 new notifications');

// Coming Soon Modal function
window.showComingSoon = function(feature) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:99999;';
    modal.innerHTML = `
        <div style="background:#12121a;border:2px solid #D4AF37;border-radius:20px;padding:40px;text-align:center;max-width:350px;">
            <div style="font-size:3rem;margin-bottom:15px;">⏳</div>
            <h2 style="color:#D4AF37;font-family:'Amiri';margin:0 0 10px 0;">Coming Soon</h2>
            <p style="color:#fff;margin:0 0 20px 0;">${feature} is under development</p>
            <button onclick="this.closest('.modal').remove()" style="background:#D4AF37;color:#0a0a0f;border:none;padding:10px 30px;border-radius:25px;cursor:pointer;font-weight:600;">Close</button>
        </div>
    `;
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
};
