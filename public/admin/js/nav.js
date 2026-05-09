/**
 * TECHNO-CONTROL NAVIGATION
 * Contains: switchSection, setupNavigation, toggleMobileMenu, logout, showToast, updateConnectionStatus, updateTime, formatNumber
 */

function formatNumber(num) {
    if (num == null || isNaN(num)) return '0';
    return parseInt(num).toLocaleString('ar-IQ');
}

function showToast(message) {
    try {
        var el = document.getElementById('toast');
        if (!el) {
            console.log('Toast:', message);
            return;
        }
        el.textContent = message;
        el.style.display = 'block';
        el.classList.add('show');
        setTimeout(function() {
            el.classList.remove('show');
            setTimeout(function() {
                el.style.display = 'none';
            }, 300);
        }, 3500);
    } catch(e) {
        console.log('Toast:', message);
    }
}

function updateConnectionStatus(status) {
    var el = document.getElementById('connectionStatus');
    if (!el) return;

    var statusMap = {
        connecting: { icon: '🔄', text: 'جاري الاتصال...', color: '#f39c12' },
        connected:  { icon: '✅', text: 'متصل',            color: '#2ecc71' },
        error:      { icon: '❌', text: 'خطأ في الاتصال',  color: '#e74c3c' }
    };

    var s = statusMap[status] || statusMap.connecting;
    el.innerHTML = '<span style="color:' + s.color + '">' + s.icon + '</span> ' + s.text;
}

function updateTime() {
    var el = document.getElementById('currentTime');
    if (el) {
        el.textContent = new Date().toLocaleTimeString('ar-IQ', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

function checkAuth() {
    var token = localStorage.getItem('adminToken') || localStorage.getItem('hseenop33');
    if (!token) {
        window.location.href = 'admin-login.html';
        return false;
    }
    try {
        var ud = localStorage.getItem('adminUser');
        if (ud) {
            var adminUser = JSON.parse(ud);
        }
    } catch(e) {}
    return true;
}

function switchSection(id) {
    window.STATE.currentSection = id;

    var sections = document.querySelectorAll('.section-panel');
    for (var i = 0; i < sections.length; i++) {
        sections[i].classList.remove('active');
    }

    var target = document.getElementById(id);
    if (target) target.classList.add('active');

    var navItems = document.querySelectorAll('.nav-item');
    for (var j = 0; j < navItems.length; j++) {
        navItems[j].classList.remove('active');
    }

    var activeNav = document.querySelector('.nav-item[data-section="' + id + '"]');
    if (activeNav) activeNav.classList.add('active');

    var titles = {
        dashboard: 'لوحة التحكم',
        users: 'قاعدة البيانات',
        services: 'إدارة الخدمات',
        orders: 'الطلبات',
        tasks: 'المهام',
        wallet: 'المحفظة',
        gifts: 'الإرسال',
        design: 'الألوان',
        texts: 'النصوص',
        ads: 'الإعلانات',
        broadcast: 'الإشعارات',
        messages: 'الرسائل',
        settings: 'إعدادات التطبيق',
        radar: 'رادار المستخدمين',
        printing: 'وحدة الطباعة'
    };

    var titleEl = document.getElementById('sectionTitle');
    if (titleEl) titleEl.textContent = titles[id] || id;
}

function toggleMobileMenu() {
    var sidebar = document.getElementById('adminSidebar');
    var overlay = document.getElementById('sidebarOverlay');

    if (sidebar) sidebar.classList.toggle('mobile-open');
    if (overlay) overlay.classList.toggle('active');
}

function logout() {
    if (window.STATE.syncInterval) clearInterval(window.STATE.syncInterval);
    if (window.STATE.realtimeChannel && window.supabaseClient()) {
        window.supabaseClient().removeChannel(window.STATE.realtimeChannel);
    }
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('hseenop33');
    window.location.href = 'admin-login.html';
}

function setupNavigation() {
    var navItems = document.querySelectorAll('.nav-item');
    for (var i = 0; i < navItems.length; i++) {
        navItems[i].addEventListener('click', function() {
            var sec = this.getAttribute('data-section');
            if (sec) switchSection(sec);
            if (window.innerWidth <= 768) toggleMobileMenu();
        });
    }

    var logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

window.formatNumber = formatNumber;
window.showToast = showToast;
window.updateConnectionStatus = updateConnectionStatus;
window.updateTime = updateTime;
window.checkAuth = checkAuth;
window.switchSection = switchSection;
window.toggleMobileMenu = toggleMobileMenu;
window.logout = logout;
window.setupNavigation = setupNavigation;