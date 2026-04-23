/**
 * TECHOPRINT 2026 - NAVIGATION LOGIC
 * Gate Clicks, Portal Navigation, Language Switching
 */

// ==================== PORTAL FUNCTIONS ====================
// GUEST ACCESS: Allow browsing without login
window.switchPortalLanguage = (lang) => {
    window.i18n.setLanguage(lang);
    window.i18n.applyLanguage(lang);
    
    document.querySelectorAll('.portal-lang-switcher .lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) btn.classList.add('active');
    });
    
    document.querySelectorAll('[data-i18n-portal]').forEach(el => {
        const key = el.getAttribute('data-i18n-portal');
        const translation = window.i18n.t('portal.' + key) || el.textContent;
        el.textContent = translation;
    });
};

window.openPortal = (role) => {
    const masterPortal = document.getElementById('masterPortal');
    const app = document.getElementById('app');
    if (masterPortal) masterPortal.style.display = 'none';
    if (app) app.style.display = 'grid';
    
    const roleRoutes = {
        'student': 'library', 'teacher': 'library', 'designer': 'designer',
        'publisher': 'library', 'library': 'library', 'ai': 'admin-dashboard',
        'delivery': 'admin-delivery', 'admin': 'admin-dashboard', 'guest': 'dashboard'
    };
    
    Router.navigate(roleRoutes[role] || 'dashboard');
    showToast(window.i18n.t('messages.welcome'), 'success');
};

window.showPortal = () => {
    const masterPortal = document.getElementById('masterPortal');
    const app = document.getElementById('app');
    if (masterPortal) masterPortal.style.display = 'flex';
    if (app) app.style.display = 'none';
};

// REQUIRE LOGIN ONLY ON ACTION (Order/Buy/Upload)
window.requireLogin = (callback) => {
    if (APP_STATE.user) {
        callback?.();
    } else {
        showLoginModal();
        showToast(window.i18n.t('auth.loginRequiredForOrder'), 'info');
    }
};

// ==================== HORIZONTAL SCROLL ====================
window.initPortalHorizontalScroll = () => {
    const container = document.getElementById('portalsGrid');
    if (container) {
        container.classList.add('horizontal-scroll-section');
        container.style.display = 'flex';
        container.style.flexDirection = 'row';
        container.style.overflowX = 'auto';
        container.style.scrollSnapType = 'x mandatory';
        container.style.gap = '20px';
        container.style.padding = '20px';
        
        const cards = container.querySelectorAll('.portal-card');
        cards.forEach(card => {
            card.style.minWidth = '320px';
            card.style.maxWidth = '350px';
            card.style.flexShrink = '0';
        });
    }
};

// ==================== NAVIGATION INITIALIZATION ====================
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            if (page) Router.navigate(page);
        });
    });
}
