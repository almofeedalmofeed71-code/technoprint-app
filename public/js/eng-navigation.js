/* TECHOPRINT 2026 - ENG NAVIGATION */
/* 9-SCREEN ARCHITECTURE - Each Screen Unique */

const Nav = {
    current: 'dashboard',
    screens: ['dashboard', 'wallet', 'library', 'orders', 'tracking', 'student', 'teacher', 'maintenance', 'printing', 'inks'],
    
    init() {
        this.bindNav();
        this.bindBottom();
        this.go('dashboard');
    },
    
    go(page) {
        if (!this.screens.includes(page)) return;
        this.current = page;
        this.updateNav();
        this.updateBottom();
        this.renderPage();
    },
    
    renderPage() {
        const el = document.getElementById('pageContent');
        if (!el) return;
        
        const pages = {
            dashboard: `<div style="padding:20px;">
                <h2 style="color:var(--gold-royal);font-family:'Amiri';margin-bottom:20px;">Welcome - TECHOPRINT 2026</h2>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;">
                    <div class="glass-panel" style="padding:25px;text-align:center;cursor:pointer;" onclick="Nav.go('wallet')">
                        <div style="font-size:2rem;">💰</div><h3>Wallet</h3>
                        <p style="color:var(--text-secondary);">${(Auth.currentUser?.balance || 0).toLocaleString()} IQD</p>
                    </div>
                    <div class="glass-panel" style="padding:25px;text-align:center;cursor:pointer;" onclick="Nav.go('library')">
                        <div style="font-size:2rem;">📚</div><h3>Library</h3>
                    </div>
                    <div class="glass-panel" style="padding:25px;text-align:center;cursor:pointer;" onclick="Nav.go('orders')">
                        <div style="font-size:2rem;">📦</div><h3>Orders</h3>
                    </div>
                </div></div>`,
            
            wallet: `<div style="padding:20px;">
                <h2 style="color:var(--gold-royal);font-family:'Amiri';margin-bottom:20px;">Wallet</h2>
                <div class="glass-panel" style="padding:30px;text-align:center;margin-bottom:20px;">
                    <h1 style="font-size:2.5rem;color:var(--gold-royal);">${(Auth.currentUser?.balance || 0).toLocaleString()} IQD</h1>
                </div>
                <div style="display:flex;gap:15px;justify-content:center;">
                    <button class="portal-btn" onclick="openModal('depositModal')"><i class="fas fa-plus"></i> Deposit</button>
                    <button class="portal-btn" onclick="openModal('withdrawModal')"><i class="fas fa-minus"></i> Withdraw</button>
                </div></div>`,
            
            library: `<div style="padding:20px;"><h2 style="color:var(--gold-royal);font-family:'Amiri';margin-bottom:20px;">Library</h2><div class="glass-panel" style="padding:40px;text-align:center;"><p style="color:var(--text-muted);">Coming Soon</p></div></div>`,
            
            orders: `<div style="padding:20px;"><h2 style="color:var(--gold-royal);font-family:'Amiri';margin-bottom:20px;">Orders</h2><div class="glass-panel" style="padding:40px;text-align:center;"><p style="color:var(--text-muted);">Coming Soon</p></div></div>`,
            
            tracking: `<div style="padding:20px;"><h2 style="color:var(--gold-royal);font-family:'Amiri';margin-bottom:20px;">Track Order</h2><div class="glass-panel" style="padding:40px;text-align:center;"><p style="color:var(--text-muted);">Coming Soon</p></div></div>`,
            
            student: `<div class="student-portal">
                <button class="back-btn" onclick="Nav.go('dashboard')"><i class="fas fa-arrow-right"></i> Back</button>
                <div class="portal-header"><h2>Student Portal</h2></div>
                <div class="service-grid">
                    <div class="service-card" onclick="Nav.go('orders')"><div class="service-icon">📦</div><p class="service-title">My Orders</p></div>
                    <div class="service-card" onclick="Nav.go('wallet')"><div class="service-icon">💰</div><p class="service-title">Wallet</p></div>
                    <div class="service-card" onclick="Nav.go('library')"><div class="service-icon">📚</div><p class="service-title">Library</p></div>
                    <div class="service-card" onclick="Nav.go('tracking')"><div class="service-icon">📍</div><p class="service-title">Track</p></div>
                    <div class="service-card" onclick="Nav.go('printing')"><div class="service-icon">🖨️</div><p class="service-title">Printing</p></div>
                    <div class="service-card" onclick="Nav.go('maintenance')"><div class="service-icon">🔧</div><p class="service-title">Support</p></div>
                </div></div>`,
            
            teacher: `<div class="student-portal">
                <button class="back-btn" onclick="Nav.go('dashboard')"><i class="fas fa-arrow-right"></i> Back</button>
                <div class="portal-header"><h2>Teacher Portal</h2></div>
                <div class="glass-panel" style="padding:40px;text-align:center;"><p style="color:var(--text-muted);">Coming Soon</p></div></div>`,
            
            maintenance: `<div class="student-portal">
                <button class="back-btn" onclick="Nav.go('dashboard')"><i class="fas fa-arrow-right"></i> Back</button>
                <div class="portal-header"><h2>Maintenance</h2></div>
                <div class="glass-panel" style="padding:40px;text-align:center;"><p style="color:var(--text-muted);">Coming Soon</p></div></div>`,
            
            printing: `<div class="student-portal">
                <button class="back-btn" onclick="Nav.go('dashboard')"><i class="fas fa-arrow-right"></i> Back</button>
                <div class="portal-header"><h2>Printing</h2></div>
                <div class="glass-panel" style="padding:40px;text-align:center;"><p style="color:var(--text-muted);">Coming Soon</p></div></div>`,
            
            inks: `<div class="student-portal">
                <button class="back-btn" onclick="Nav.go('dashboard')"><i class="fas fa-arrow-right"></i> Back</button>
                <div class="portal-header"><h2>Inks</h2></div>
                <div class="glass-panel" style="padding:40px;text-align:center;"><p style="color:var(--text-muted);">Coming Soon</p></div></div>`
        };
        
        el.innerHTML = pages[this.current] || '';
        const title = document.getElementById('pageTitle');
        if (title) title.textContent = this.current.charAt(0).toUpperCase() + this.current.slice(1);
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
