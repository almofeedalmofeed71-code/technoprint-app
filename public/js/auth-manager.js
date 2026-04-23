/**
 * TECHOPRINT 2026 - AUTH MANAGER
 * Registration, Login, Header Buttons, Wallet Functions
 */

// ==================== HEADER BUTTON HANDLERS ====================
window.openWallet = () => Router.navigate('wallet');

window.openProfile = () => {
    if (APP_STATE.user) {
        showToast(window.i18n.t('messages.profileOpened') || 'مرحباً ' + APP_STATE.user.full_name, 'info');
    } else {
        showLoginModal();
    }
};

window.openNotifications = () => {
    showToast(window.i18n.t('messages.noNotifications') || 'لا توجد إشعارات جديدة', 'info');
};

window.showDepositModal = () => {
    if (!APP_STATE.user) {
        showLoginModal();
        showToast(window.i18n.t('auth.loginRequired') || 'يرجى تسجيل الدخول أولاً', 'warning');
        return;
    }
    document.getElementById('depositModal').style.display = 'flex';
};

window.showWithdrawModal = () => {
    if (!APP_STATE.user) {
        showLoginModal();
        showToast(window.i18n.t('auth.loginRequired') || 'يرجى تسجيل الدخول أولاً', 'warning');
        return;
    }
    document.getElementById('withdrawModal').style.display = 'flex';
};

// ==================== MODAL HELPERS ====================
window.closeModal = (modalId) => {
    document.getElementById(modalId).style.display = 'none';
};

window.openRegisterPage = () => {
    document.getElementById('registerPage').style.display = 'flex';
    document.getElementById('loginModal').style.display = 'none';
    window.i18n.reload();
};

window.closeRegisterPage = () => {
    document.getElementById('registerPage').style.display = 'none';
};

window.showLoginModal = () => {
    document.getElementById('loginModal').style.display = 'flex';
    window.i18n.reload();
};

// ==================== REGISTRATION ====================
window.handleRegister = async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('registerError');
    errorEl.style.display = 'none';
    
    const fullName = document.getElementById('regFullName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const address = document.getElementById('regAddress').value.trim();
    const role = document.getElementById('regRole').value;
    
    if (!username || username.length < 3) {
        errorEl.textContent = '⚠️ اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
        errorEl.style.display = 'block';
        return;
    }
    
    if (password !== confirmPassword) {
        errorEl.textContent = '⚠️ كلمة المرور غير متطابقة!';
        errorEl.style.display = 'block';
        return;
    }
    
    if (phone && !/^7[0-9]{9}$/.test(phone)) {
        errorEl.textContent = '⚠️ رقم الهاتف يجب أن يبدأ بـ 7 ويتكون من 10 أرقام';
        errorEl.style.display = 'block';
        return;
    }
    
    try {
        const res = await apiCall('auth/signup', 'POST', { 
            username, password, full_name: fullName, phone: '+964' + phone, address, role 
        });
        
        if (res.error) {
            errorEl.textContent = '⚠️ ' + res.error;
            errorEl.style.display = 'block';
        } else {
            showToast(window.i18n.t('messages.registerSuccess'), 'success');
            closeRegisterPage();
            showLoginModal();
        }
    } catch (err) {
        errorEl.textContent = '⚠️ حدث خطأ في الاتصال';
        errorEl.style.display = 'block';
    }
};

// ==================== LOGIN ====================
window.handleLogin = async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('loginError');
    errorEl.style.display = 'none';
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    try {
        const res = await apiCall('auth/login', 'POST', { email, password });
        
        if (res.error) {
            errorEl.textContent = '⚠️ ' + res.error;
            errorEl.style.display = 'block';
        } else {
            APP_STATE.token = res.token;
            APP_STATE.user = res.user;
            localStorage.setItem('techoprint_token', res.token);
            localStorage.setItem('techoprint_user', JSON.stringify(res.user));
            
            showToast(window.i18n.t('messages.loginSuccess'), 'success');
            closeModal('loginModal');
            openPortal('student');
            
            document.getElementById('userName').textContent = res.user.full_name || 'مستخدم';
            document.getElementById('userRole').textContent = window.i18n.getRoleName(res.user.role);
        }
    } catch (err) {
        errorEl.textContent = '⚠️ حدث خطأ في الاتصال';
        errorEl.style.display = 'block';
    }
};
