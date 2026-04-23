/* TECHOPRINT 2026 - ENG NAVIGATION */
/* Button Clicks & Page Transitions ONLY */

const Nav = {
    current: 'dashboard',
    pages: ['dashboard', 'wallet', 'library', 'orders', 'tracking', 'designer'],
    
    init() {
        this.bindNav();
        this.bindBottom();
        this.go('dashboard');
    },
    
    go(page) {
        if (!this.pages.includes(page)) return;
        this.current = page;
        this.updateNav();
        this.updateBottom();
        this.renderPage();
    },
    
    renderPage() {
        const el = document.getElementById('pageContent');
        if (!el) return;
        
        const html = {
            dashboard: `<div class="dashboard-container" style="padding:20px;">
                <h2 style="color:var(--gold-royal);font-family:'Amiri';margin-bottom:20px;">${I18n.t('common.welcome')} - TECHOPRINT 2026</h2>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;">
                    <div class="glass-panel" style="padding:25px;text-align:center;cursor:pointer;" onclick="Nav.go('wallet')">
                        <div style="font-size:2rem;">💰</div><h3>${I18n.t('wallet.balance')}</h3>
                        <p style="color:var(--text-secondary);">${(Auth.currentUser?.balance || 0).toLocaleString()} IQD</p>
                    </div>
                    <div class="glass-panel" style="padding:25px;text-align:center;cursor:pointer;" onclick="Nav.go('library')">
                        <div style="font-size:2rem;">📚</div><h3>${I18n.t('nav.library')}</h3>
                    </div>
                    <div class="glass-panel" style="padding:25px;text-align:center;cursor:pointer;" onclick="Nav.go('orders')">
                        <div style="font-size:2rem;">📦</div><h3>${I18n.t('nav.orders')}</h3>
                    </div>
                </div></div>`,
            wallet: `<div style="padding:20px;">
                <h2 style="color:var(--gold-royal);font-family:'Amiri';margin-bottom:20px;">${I18n.t('wallet.balance')}</h2>
                <div class="glass-panel" style="padding:30px;text-align:center;">
                    <h1 style="font-size:2.5rem;color:var(--gold-royal);">${(Auth.currentUser?.balance || 0).toLocaleString()} IQD</h1>
                </div>
                <div style="display:flex;gap:15px;justify-content:center;margin-top:20px;">
                    <button class="portal-btn" onclick="openModal('depositModal')"><i class="fas fa-plus"></i> ${I18n.t('wallet.deposit')}</button>
                    <button class="portal-btn" onclick="openModal('withdrawModal')"><i class="fas fa-minus"></i> ${I18n.t('wallet.withdraw')}</button>
                </div></div>`,
            library: `<div style="padding:20px;"><h2 style="color:var(--gold-royal);font-family:'Amiri';">${I18n.t('nav.library')}</h2><p style="margin-top:20px;color:var(--text-secondary);">قريباً...</p></div>`,
            orders: `<div style="padding:20px;"><h2 style="color:var(--gold-royal);font-family:'Amiri';">${I18n.t('nav.orders')}</h2><p style="margin-top:20px;color:var(--text-secondary);">قريباً...</p></div>`,
            tracking: `<div style="padding:20px;"><h2 style="color:var(--gold-royal);font-family:'Amiri';">تتبع الطلب</h2></div>`,
            designer: `<div style="padding:20px;"><h2 style="color:var(--gold-royal);font-family:'Amiri';">المصممون</h2></div>`
        };
        
        el.innerHTML = html[this.current] || '';
        const title = document.getElementById('pageTitle');
        if (title) title.textContent = I18n.t(`nav.${this.current}`) || 'TECHOPRINT';
    },
    
    updateNav() {
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.classList.toggle('active', item.dataset.page === this.current);
        });
    },
    
    updateBottom() {
        document.querySelectorAll('.bottom-nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.onclick?.toString().includes(this.current));
        });
    },
    
    bindNav() {
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.style.cursor = 'pointer';
            item.onclick = () => this.go(item.dataset.page);
        });
    },
    
    bindBottom() {
        document.querySelectorAll('.bottom-nav-item').forEach(btn => {
            btn.style.cursor = 'pointer';
            const fn = btn.getAttribute('onclick') || '';
            const m = fn.match(/navigateTo\('(\w+)'\)/);
            if (m) btn.onclick = () => this.go(m[1]);
        });
    }
};

window.Nav = Nav;
window.navigateTo = (p) => Nav.go(p);
