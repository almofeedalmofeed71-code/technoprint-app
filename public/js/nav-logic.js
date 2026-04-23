/* TECHOPRINT 2026 - NAV LOGIC MODULE */
/* Centralized Navigation System */

const NavLogic = {
    currentPage: 'dashboard',
    pages: {},
    
    init() {
        this.loadPages();
        this.bindNavEvents();
        this.bindBottomNav();
        console.log('[NAV] Logic initialized');
    },
    
    loadPages() {
        this.pages = {
            'dashboard': { title: 'nav.dashboard', icon: '🏛️', render: () => this.renderDashboard() },
            'wallet': { title: 'nav.wallet', icon: '💰', render: () => this.renderWallet() },
            'library': { title: 'nav.library', icon: '📚', render: () => this.renderLibrary() },
            'orders': { title: 'nav.orders', icon: '📦', render: () => this.renderOrders() },
            'transfer': { title: 'nav.transfer', icon: '🔄', render: () => this.renderTransfer() },
            'tracking': { title: 'nav.tracking', icon: '📍', render: () => this.renderTracking() },
            'designer': { title: 'nav.designer', icon: '🎨', render: () => this.renderDesigner() },
            'support': { title: 'nav.support', icon: '🎫', render: () => this.renderSupport() }
        };
    },
    
    navigate(page) {
        if (!this.pages[page]) return;
        this.currentPage = page;
        this.updateActiveNav();
        this.updatePageTitle();
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            pageContent.innerHTML = '';
            this.pages[page].render();
        }
        this.updateBottomNav();
    },
    
    updateActiveNav() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-page') === this.currentPage);
        });
    },
    
    updatePageTitle() {
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            const page = this.pages[this.currentPage];
            if (page && page.title) {
                const trans = window.I18nEngine?.get(page.title);
                pageTitle.textContent = trans || page.title;
            }
        }
    },
    
    updateBottomNav() {
        document.querySelectorAll('.bottom-nav-item').forEach(btn => {
            const onclick = btn.getAttribute('onclick');
            btn.classList.toggle('active', onclick?.includes(this.currentPage));
        });
    },
    
    bindNavEvents() {
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                if (page) this.navigate(page);
            });
        });
    },
    
    bindBottomNav() {
        document.querySelectorAll('.bottom-nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const onclick = btn.getAttribute('onclick');
                if (onclick?.includes('navigateTo')) {
                    const match = onclick.match(/navigateTo\('(\w+)'\)/);
                    if (match) this.navigate(match[1]);
                }
            });
        });
    },
    
    // Page Renderers
    renderDashboard() {
        const content = document.getElementById('pageContent');
        if (content) {
            content.innerHTML = `
                <div class="dashboard-container">
                    <h2>مرحباً بك في TECHOPRINT 2026</h2>
                    <div class="dashboard-grid">
                        <div class="stat-card" onclick="NavLogic.navigate('wallet')">
                            <span class="stat-icon">💰</span>
                            <span class="stat-label">الرصيد</span>
                            <span class="stat-value">${AuthLogic?.currentUser?.balance || 0} IQD</span>
                        </div>
                        <div class="stat-card" onclick="NavLogic.navigate('library')">
                            <span class="stat-icon">📚</span>
                            <span class="stat-label">المكتبة</span>
                            <span class="stat-value">تصفح الكتب</span>
                        </div>
                        <div class="stat-card" onclick="NavLogic.navigate('orders')">
                            <span class="stat-icon">📦</span>
                            <span class="stat-label">طلباتي</span>
                            <span class="stat-value">تتبع الطلبات</span>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    
    renderWallet() {
        const content = document.getElementById('pageContent');
        if (content) {
            content.innerHTML = `
                <div class="wallet-container">
                    <h2>المحفظة</h2>
                    <div class="balance-card">
                        <span>الرصيد الحالي</span>
                        <span class="big-balance">${(AuthLogic?.currentUser?.balance || 0).toLocaleString()} IQD</span>
                    </div>
                    <div class="wallet-actions">
                        <button class="action-btn gold" onclick="openModal('depositModal')">
                            <i class="fas fa-plus-circle"></i> إيداع
                        </button>
                        <button class="action-btn" onclick="openModal('withdrawModal')">
                            <i class="fas fa-minus-circle"></i> سحب
                        </button>
                    </div>
                </div>
            `;
        }
    },
    
    renderLibrary() {
        const content = document.getElementById('pageContent');
        if (content) content.innerHTML = '<div class="library-container"><h2>المكتبة</h2><p>قريباً...</p></div>';
    },
    
    renderOrders() {
        const content = document.getElementById('pageContent');
        if (content) content.innerHTML = '<div class="orders-container"><h2>الطلبات</h2><p>قريباً...</p></div>';
    },
    
    renderTransfer() {
        const content = document.getElementById('pageContent');
        if (content) content.innerHTML = '<div class="transfer-container"><h2>التحويل</h2><p>قريباً...</p></div>';
    },
    
    renderTracking() {
        const content = document.getElementById('pageContent');
        if (content) content.innerHTML = '<div class="tracking-container"><h2>تتبع الطلب</h2><div id="trackingMap" style="height:400px;border-radius:12px;"></div></div>';
        setTimeout(() => { if (typeof initMap === 'function') initMap(); }, 100);
    },
    
    renderDesigner() {
        const content = document.getElementById('pageContent');
        if (content) content.innerHTML = '<div class="designer-container"><h2>المصممون</h2><p>قريباً...</p></div>';
    },
    
    renderSupport() {
        const content = document.getElementById('pageContent');
        if (content) content.innerHTML = '<div class="support-container"><h2>الدعم</h2><p>قريباً...</p></div>';
    }
};

// Export to global
window.NavLogic = NavLogic;
window.initNavigation = () => NavLogic.init();
window.navigateTo = (page) => NavLogic.navigate(page);
