/* TECHOPRINT 2026 - ENG AUTH */
/* Authentication Logic ONLY */

const Auth = {
    currentUser: null,
    
    init() {
        const saved = localStorage.getItem('tp-user');
        if (saved) {
            try { this.currentUser = JSON.parse(saved); } 
            catch { localStorage.removeItem('tp-user'); }
        }
        this.bindForms();
        this.updateUI();
    },
    
    save() {
        if (this.currentUser) localStorage.setItem('tp-user', JSON.stringify(this.currentUser));
        else localStorage.removeItem('tp-user');
        this.updateUI();
    },
    
    login(email, password) {
        this.currentUser = { id: Date.now(), email, name: email.split('@')[0], role: 'student', balance: 100000 };
        this.save();
        return true;
    },
    
    logout() {
        this.currentUser = null;
        this.save();
        showPortal();
    },
    
    register(data) {
        this.currentUser = { id: Date.now(), ...data, role: 'student', balance: 0, createdAt: new Date().toISOString() };
        this.save();
        return true;
    },
    
    updateBalance(amount) {
        if (this.currentUser) { this.currentUser.balance = (this.currentUser.balance || 0) + amount; this.save(); }
    },
    
    updateUI() {
        const u = this.currentUser;
        const el = (id) => document.getElementById(id);
        if (u) {
            if (el('userName')) el('userName').textContent = u.name || 'المستخدم';
            if (el('userRole')) el('userRole').textContent = u.role === 'admin' ? 'أدمن' : 'طالب';
            const bal = (u.balance || 0).toLocaleString() + ' IQD';
            if (el('headerBalance')) el('headerBalance').textContent = bal;
            if (el('studentBalance')) el('studentBalance').textContent = bal;
        }
    },
    
    bindForms() {
        const lf = document.getElementById('loginForm');
        if (lf) {
            lf.onsubmit = (e) => { e.preventDefault(); this.login(document.getElementById('loginEmail')?.value, document.getElementById('loginPassword')?.value) && (closeModal('loginModal'), showMainDashboard()); };
        }
        const rf = document.getElementById('registerForm');
        if (rf) {
            rf.onsubmit = (e) => { e.preventDefault(); this.register({}); closeRegisterPage(); showMainDashboard(); };
        }
    }
};

window.Auth = Auth;
