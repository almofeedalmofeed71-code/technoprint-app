/* TECHOPRINT 2026 - AUTH LOGIC MODULE */
/* Centralized Authentication - FIXED BINDING */

const AuthLogic = {
    currentUser: null,
    
    init() {
        this.loadSession();
        this.bindForms();
        this.updateUI();
        console.log('[AUTH] Logic initialized');
    },
    
    loadSession() {
        const saved = localStorage.getItem('techprint-user');
        if (saved) {
            try {
                this.currentUser = JSON.parse(saved);
            } catch (e) {
                localStorage.removeItem('techprint-user');
            }
        }
    },
    
    saveSession() {
        if (this.currentUser) {
            localStorage.setItem('techprint-user', JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem('techprint-user');
        }
        this.updateUI();
    },
    
    login(email, password) {
        // Demo login
        this.currentUser = {
            id: Date.now(),
            email: email,
            name: email.split('@')[0],
            role: 'student',
            balance: 100000
        };
        this.saveSession();
        return true;
    },
    
    logout() {
        this.currentUser = null;
        this.saveSession();
        showPortal();
    },
    
    register(data) {
        this.currentUser = {
            id: Date.now(),
            email: data.email || 'user@example.com',
            name: data.fullName,
            username: data.username,
            phone: data.phone,
            address: data.address,
            role: data.role || 'student',
            balance: 0,
            createdAt: new Date().toISOString()
        };
        this.saveSession();
        return true;
    },
    
    isLoggedIn() {
        return !!this.currentUser;
    },
    
    updateBalance(amount) {
        if (this.currentUser) {
            this.currentUser.balance = (this.currentUser.balance || 0) + amount;
            this.saveSession();
        }
    },
    
    updateUI() {
        const user = this.currentUser;
        const userNameEl = document.getElementById('userName');
        const userRoleEl = document.getElementById('userRole');
        const headerBalanceEl = document.getElementById('headerBalance');
        const studentBalanceEl = document.getElementById('studentBalance');
        
        if (user) {
            if (userNameEl) userNameEl.textContent = user.name || user.username || 'المستخدم';
            if (userRoleEl) userRoleEl.textContent = user.role === 'admin' ? 'أدمن' : user.role === 'teacher' ? 'معلم' : 'طالب';
            const balance = (user.balance || 0).toLocaleString() + ' IQD';
            if (headerBalanceEl) headerBalanceEl.textContent = balance;
            if (studentBalanceEl) studentBalanceEl.textContent = balance;
        }
    },
    
    bindForms() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.style.cursor = 'pointer';
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail')?.value;
                const password = document.getElementById('loginPassword')?.value;
                if (this.login(email, password)) {
                    closeModal('loginModal');
                    showMainDashboard();
                }
            });
        }
        
        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.style.cursor = 'pointer';
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const data = {
                    fullName: document.getElementById('regFullName')?.value,
                    username: document.getElementById('regUsername')?.value,
                    phone: document.getElementById('regPhone')?.value,
                    address: document.getElementById('regAddress')?.value,
                    role: document.getElementById('regRole')?.value
                };
                if (this.register(data)) {
                    closeRegisterPage();
                    showMainDashboard();
                }
            });
        }
    }
};

// Global exports
window.AuthLogic = AuthLogic;
window.handleLogin = (e) => { e.preventDefault(); return AuthLogic.login(document.getElementById('loginEmail')?.value, document.getElementById('loginPassword')?.value); };
window.handleRegister = (e) => { e.preventDefault(); return AuthLogic.register({}); };
