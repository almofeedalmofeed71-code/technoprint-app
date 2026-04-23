/* TECHOPRINT 2026 - AUTH LOGIC MODULE */
/* Centralized Authentication System */

const AuthLogic = {
    currentUser: null,
    
    init() {
        this.loadSession();
        this.bindAuthForms();
        console.log('[AUTH] Logic initialized');
    },
    
    loadSession() {
        const saved = localStorage.getItem('techprint-user');
        if (saved) {
            try {
                this.currentUser = JSON.parse(saved);
                this.updateUI();
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
        // Simulated login - integrate with backend
        const user = {
            id: Date.now(),
            email: email,
            name: email.split('@')[0],
            role: 'student',
            balance: 0
        };
        this.currentUser = user;
        this.saveSession();
        return true;
    },
    
    logout() {
        this.currentUser = null;
        this.saveSession();
        showPortal();
    },
    
    register(data) {
        const user = {
            id: Date.now(),
            email: data.email,
            name: data.fullName,
            username: data.username,
            phone: data.phone,
            address: data.address,
            role: data.role || 'student',
            balance: 0,
            createdAt: new Date().toISOString()
        };
        this.currentUser = user;
        this.saveSession();
        return true;
    },
    
    isLoggedIn() {
        return !!this.currentUser;
    },
    
    getUser() {
        return this.currentUser;
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
        const profileImageEl = document.getElementById('profileImage');
        
        if (user && userNameEl) {
            userNameEl.textContent = user.name || user.username || 'المستخدم';
            userRoleEl.textContent = user.role === 'admin' ? 'أدمن' : user.role === 'teacher' ? 'معلم' : 'طالب';
            headerBalanceEl.textContent = (user.balance || 0).toLocaleString() + ' IQD';
            profileImageEl.innerHTML = `<span>👤</span>`;
        }
    },
    
    bindAuthForms() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                if (this.login(email, password)) {
                    closeModal('loginModal');
                    showMainDashboard();
                }
            });
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const data = {
                    fullName: document.getElementById('regFullName').value,
                    username: document.getElementById('regUsername').value,
                    password: document.getElementById('regPassword').value,
                    phone: document.getElementById('regPhone').value,
                    address: document.getElementById('regAddress').value,
                    role: document.getElementById('regRole').value
                };
                if (this.register(data)) {
                    closeRegisterPage();
                    showMainDashboard();
                }
            });
        }
    }
};

// Export to global
window.AuthLogic = AuthLogic;
window.initAuth = () => AuthLogic.init();
window.handleLogin = (e) => { e.preventDefault(); return AuthLogic.login(document.getElementById('loginEmail').value, document.getElementById('loginPassword').value); };
window.handleRegister = (e) => { e.preventDefault(); return AuthLogic.register({ email: document.getElementById('regEmail')?.value || 'temp@temp.com', fullName: document.getElementById('regFullName').value, username: document.getElementById('regUsername').value, phone: document.getElementById('regPhone').value, address: document.getElementById('regAddress').value, role: document.getElementById('regRole').value }); };
