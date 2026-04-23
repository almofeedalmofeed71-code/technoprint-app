/* TECHOPRINT 2026 - NAV LOGIC MODULE */
/* Centralized Navigation - FIXED BINDING */

const NavLogic = {
    currentPage: 'dashboard',
    
    init() {
        this.bindNavEvents();
        this.bindBottomNav();
        this.navigate('dashboard');
        console.log('[NAV] Logic initialized');
    },
    
    navigate(page) {
        this.currentPage = page;
        this.updateActiveNav();
        this.updatePageTitle();
        this.updateBottomNav();
        
        const content = document.getElementById('pageContent');
        if (content) {
            this.renderPage(page, content);
        }
    },
    
    renderPage(page, content) {
        switch(page) {
            case 'dashboard':
                content.innerHTML = `
                    <div class="dashboard-container" style="padding:20px;">
                        <h2 style="color:var(--gold-royal);font-family:'Amiri';margin-bottom:20px;">مرحباً بك في TECHOPRINT 2026</h2>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;">
                            <div class="glass-panel" style="padding:25px;text-align:center;cursor:pointer;" onclick="NavLogic.navigate('wallet')">
                                <div style="font-size:2rem;">💰</div>
                                <h3>المحفظة</h3>
                                <p style="color:var(--text-secondary);">${(window.AuthLogic?.currentUser?.balance || 0).toLocaleString()} IQD</p>
                            </div>
                            <div class="glass-panel" style="padding:25px;text-align:center;cursor:pointer;" onclick="NavLogic.navigate('library')">
                                <div style="font-size:2rem;">📚</div>
                                <h3>المكتبة</h3>
                                <p style="color:var(--text-secondary);">تصفح الكتب</p>
                            </div>
                            <div class="glass-panel" style="padding:25px;text-align:center;cursor:pointer;" onclick="NavLogic.navigate('orders')">
                                <div style="font-size:2rem;">📦</div>
                                <h3>طلباتي</h3>
                                <p style="color:var(--text-secondary);">تتبع الطلبات</p>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'wallet':
                content.innerHTML = `
                    <div class="wallet-container" style="padding:20px;">
                        <h2 style="color:var(--gold-royal);font-family:'Amiri';margin-bottom:20px;">المحفظة</h2>
                        <div class="glass-panel" style="padding:30px;text-align:center;margin-bottom:20px;">
                            <p>الرصيد الحالي</p>
                            <h1 style="font-size:2.5rem;color:var(--gold-royal);">${(window.AuthLogic?.currentUser?.balance || 0).toLocaleString()} IQD</h1>
                        </div>
                        <div style="display:flex;gap:15px;justify-content:center;">
                            <button class="portal-btn gold" onclick="openModal('depositModal')"><i class="fas fa-plus-circle"></i> إيداع</button>
                            <button class="portal-btn" onclick="openModal('withdrawModal')"><i class="fas fa-minus-circle"></i> سحب</button>
                        </div>
                    </div>
                `;
                break;
            case 'library':
                content.innerHTML = `<div style="padding:20px;"><h2 style="color:var(--gold-royal);font-family:'Amiri';">المكتبة</h2><p style="color:var(--text-secondary);margin-top:20px;">قريباً...</p></div>`;
                break;
            case 'orders':
                content.innerHTML = `<div style="padding:20px;"><h2 style="color:var(--gold-royal);font-family:'Amiri';">الطلبات</h2><p style="color:var(--text-secondary);margin-top:20px;">قريباً...</p></div>`;
                break;
            case 'tracking':
                content.innerHTML = `<div style="padding:20px;"><h2 style="color:var(--gold-royal);font-family:'Amiri';">تتبع الطلب</h2><div id="trackingMap" style="height:400px;border-radius:12px;margin-top:20px;background:rgba(26,26,31,0.5);"></div></div>`;
                break;
            case 'designer':
                content.innerHTML = `<div style="padding:20px;"><h2 style="color:var(--gold-royal);font-family:'Amiri';">المصممون</h2><p style="color:var(--text-secondary);margin-top:20px;">قريباً...</p></div>`;
                break;
            default:
                content.innerHTML = `<div style="padding:20px;"><h2 style="color:var(--gold-royal);font-family:'Amiri';">الصفحة</h2></div>`;
        }
    },
    
    updateActiveNav() {
        document.querySelectorAll('.nav-item').forEach(item => {
            const page = item.getAttribute('data-page');
            if (page) {
                item.classList.toggle('active', page === this.currentPage);
            }
        });
    },
    
    updatePageTitle() {
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            const titles = {
                'dashboard': 'لوحة التحكم',
                'wallet': 'المحفظة',
                'library': 'المكتبة',
                'orders': 'الطلبات',
                'tracking': 'تتبع الطلب',
                'designer': 'المصممون'
            };
            pageTitle.textContent = titles[this.currentPage] || 'TECHOPRINT';
        }
    },
    
    updateBottomNav() {
        document.querySelectorAll('.bottom-nav-item').forEach(btn => {
            const onclick = btn.getAttribute('onclick') || '';
            btn.classList.toggle('active', onclick.includes(this.currentPage));
        });
    },
    
    bindNavEvents() {
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                if (page) this.navigate(page);
            });
        });
    },
    
    bindBottomNav() {
        document.querySelectorAll('.bottom-nav-item').forEach(btn => {
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', () => {
                const onclick = btn.getAttribute('onclick') || '';
                const match = onclick.match(/navigateTo\('(\w+)'\)/);
                if (match) this.navigate(match[1]);
            });
        });
    }
};

// Export
window.NavLogic = NavLogic;
window.navigateTo = (page) => NavLogic.navigate(page);
