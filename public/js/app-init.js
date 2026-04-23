/**
 * TECHOPRINT 2026 - APP INITIALIZATION
 * Global State, API Helper, Router, Startup
 */

// ==================== GLOBAL STATE ====================
window.APP_STATE = {
    currentLang: localStorage.getItem('techoprint_lang') || 'ar',
    user: JSON.parse(localStorage.getItem('techoprint_user') || 'null'),
    token: localStorage.getItem('techoprint_token') || null,
    balance: { IQD: 0, USD: 0 },
    usedTransferRefs: new Set()
};

// ==================== API HELPER ====================
window.apiCall = async function(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': window.APP_STATE.user?.id || ''
            }
        };
        if (body) options.body = JSON.stringify(body);
        const res = await fetch(`/api/${endpoint}`, options);
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return { error: err.message };
    }
};

// ==================== ROUTER ====================
window.Router = {
    routes: {
        'dashboard': () => loadDashboard(),
        'student': () => { if(window.StudentDashboard) window.StudentDashboard.render(); },
        'library': () => loadLibrary(),
        'orders': () => loadOrders(),
        'wallet': () => loadWallet(),
        'tracking': () => loadTracking(),
        'transfer': () => loadTransfer(),
        'support': () => loadSupport(),
        'designer': () => loadDesigner(),
        'admin-dashboard': () => AdminPortal?.renderDashboard?.(),
        'admin-users': () => AdminPortal?.renderUsers?.(),
        'admin-delivery': () => AdminPortal?.renderDelivery?.()
    },
    
    navigate(page) {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const activeNav = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (activeNav) activeNav.classList.add('active');
        
        const titles = {
            'dashboard': '🏛️ ' + window.i18n?.t('nav.dashboard'),
            'student': '🎓 ' + window.i18n?.t('portal.studentTitle'),
            'library': '📚 ' + window.i18n?.t('nav.library'),
            'orders': '📦 ' + window.i18n?.t('nav.orders'),
            'wallet': '💰 ' + window.i18n?.t('nav.wallet'),
            'tracking': '📍 ' + window.i18n?.t('nav.tracking'),
            'transfer': '🔄 ' + window.i18n?.t('nav.transfer'),
            'support': '🎫 ' + window.i18n?.t('nav.support'),
            'designer': '🎨 ' + window.i18n?.t('nav.designer'),
            'admin-dashboard': '👑 ' + window.i18n?.t('nav.adminDashboard'),
            'admin-users': '👥 ' + window.i18n?.t('nav.adminUsers'),
            'admin-delivery': '🚚 ' + window.i18n?.t('nav.adminDelivery')
        };
        
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = titles[page] || 'TECHOPRINT 2026';
        
        const handler = this.routes[page];
        if (handler) handler();
        else loadDashboard?.();
    }
};

// Aliases
window.navigateTo = (page) => window.Router?.navigate(page);
window.navigate = (page) => window.Router?.navigate(page);

// ==================== STARTUP SEQUENCE ====================
window.showMainDashboard = function() {
    const splash = document.getElementById('splashScreen');
    const preloader = document.getElementById('preloader');
    const masterPortal = document.getElementById('masterPortal');
    
    if (splash) {
        splash.style.animation = 'splashFadeOut 0.8s ease-in-out forwards';
        setTimeout(() => splash.style.display = 'none', 800);
    }
    
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.style.display = 'none', 300);
    }
    
    if (masterPortal) {
        masterPortal.style.display = 'flex';
    }
    
    // Apply language
    if (window.i18n?.applyLanguage) {
        window.i18n.applyLanguage(window.APP_STATE.currentLang);
    }
};

window.triggerStartup = function() {
    setTimeout(() => window.showMainDashboard(), 2500);
};
