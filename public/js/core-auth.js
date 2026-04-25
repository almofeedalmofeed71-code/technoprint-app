/**
 * TECHOPRINT 2026 - Core Authentication Module
 * All registration and login logic
 */

(function() {
    'use strict';
    
    // ===== SESSION MANAGEMENT =====
    const getSession = () => {
        const data = localStorage.getItem(TECHNO_CONFIG.SESSION_KEY);
        return data ? JSON.parse(data) : null;
    };
    
    const setSession = (user) => {
        localStorage.setItem(TECHNO_CONFIG.SESSION_KEY, JSON.stringify(user));
    };
    
    const clearSession = () => {
        localStorage.removeItem(TECHNO_CONFIG.SESSION_KEY);
    };
    
    // ===== TOAST =====
    const showToast = (msg) => {
        const t = document.getElementById('toast');
        if (!t) return;
        t.textContent = msg;
        t.style.display = 'block';
        setTimeout(() => t.style.display = 'none', 3000);
    };
    
    // ===== MODALS =====
    const openModal = (id) => document.getElementById(id)?.classList.add('active');
    const closeModal = (id) => document.getElementById(id)?.classList.remove('active');
    window.Auth.showRegister = () => openModal('registerModal');
    window.Auth.showLogin = () => openModal('loginModal');
    
    // ===== REGISTER =====
    async function handleRegister(formData) {
        const { username, password, phone, governorate, address, category } = formData;
        
        // Validation
        if (!username || !password || !phone || !governorate || !address || !category) {
            showToast('الرجاء ملء جميع الحقول المطلوبة');
            return { success: false, error: 'Missing fields' };
        }
        
        if (password.length < 6) {
            showToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return { success: false, error: 'Password too short' };
        }
        
        try {
            const res = await fetch(TECHNO_CONFIG.API_BASE + '/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await res.json();
            
            if (data.success && data.user) {
                setSession(data.user);
                closeModal('registerModal');
                showToast('🎉 تم إنشاء الحساب بنجاح!');
                return { success: true, user: data.user };
            } else {
                showToast(data.error || 'فشل التسجيل');
                return { success: false, error: data.error };
            }
        } catch (e) {
            showToast('حدث خطأ - حاول لاحقاً');
            return { success: false, error: 'Network error' };
        }
    }
    
    // ===== LOGIN =====
    async function handleLogin(username, password) {
        if (!username || !password) {
            showToast('الرجاء إدخال البيانات');
            return { success: false };
        }
        
        try {
            const res = await fetch(TECHNO_CONFIG.API_BASE + '/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await res.json();
            
            if (data.success && data.user) {
                setSession(data.user);
                closeModal('loginModal');
                showToast('مرحباً ' + data.user.username);
                return { success: true, user: data.user };
            } else {
                showToast(data.error || 'فشل تسجيل الدخول');
                return { success: false, error: data.error };
            }
        } catch (e) {
            showToast('حدث خطأ - حاول لاحقاً');
            return { success: false };
        }
    }
    
    // ===== LOGOUT =====
    function handleLogout() {
        clearSession();
        location.reload();
    }
    
    // ===== UPDATE UI =====
    function updateUI(user) {
        if (!user) return;
        
        document.getElementById('userName').textContent = user.username;
        document.getElementById('userRole').textContent = user.category || 'مستخدم';
        document.getElementById('welcomeName').textContent = user.username;
        document.getElementById('headerBalance').textContent = (user.balance || 0).toLocaleString();
        document.getElementById('statPages').textContent = (user.pages || 0).toLocaleString();
        document.getElementById('walletBalanceMain').textContent = (user.balance || 0).toLocaleString() + ' IQD';
        document.getElementById('walletPagesMain').textContent = (user.pages || 0).toLocaleString() + ' صفحة';
        
        document.getElementById('settingUsername').textContent = user.username;
        document.getElementById('settingPhone').textContent = user.phone || '-';
        document.getElementById('settingGov').textContent = user.governorate || '-';
        document.getElementById('settingCategory').textContent = user.category || '-';
    }
    
    // ===== WALLET SYNC =====
    async function syncWallet() {
        const session = getSession();
        if (!session) return;
        
        try {
            const res = await fetch(TECHNO_CONFIG.API_BASE + '/wallet/' + session.id);
            const data = await res.json();
            
            if (data.balance !== undefined) {
                session.balance = data.balance;
                session.pages = data.pages;
                setSession(session);
                updateUI(session);
            }
        } catch {}
    }
    
    // ===== INIT =====
    function init() {
        // Check session
        const session = getSession();
        if (session) updateUI(session);
        
        // Form handlers
        document.getElementById('registerForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegister({
                username: this.username.value.trim(),
                password: this.password.value,
                phone: this.phone.value.trim(),
                governorate: this.governorate.value,
                address: this.address.value.trim(),
                category: this.category.value
            }).then(result => {
                if (result.success && result.user) {
                    updateUI(result.user);
                }
            });
        });
        
        document.getElementById('loginForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('loginUsername')?.value?.trim();
            const password = document.getElementById('loginPassword')?.value;
            handleLogin(username, password).then(result => {
                if (result.success && result.user) {
                    updateUI(result.user);
                }
            });
        });
        
        // Auto-sync wallet every 30s
        setInterval(syncWallet, 30000);
    }
    
    // Export to window
    window.Auth = {
        getSession,
        setSession,
        handleRegister,
        handleLogin,
        handleLogout,
        updateUI,
        syncWallet,
        init,
        showRegister: () => openModal('registerModal'),
        showLogin: () => openModal('loginModal')
    };
    
    // Auto-init
    document.addEventListener('DOMContentLoaded', init);
    
})();