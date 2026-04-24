// ===== TECHNO-PRINT AUTH LOGIC - SERVER-API LINKED VERSION =====
// Session: localStorage → technoprintSession

// Session Keys
const SESSION_KEY = 'technoprintSession';
const USER_KEY = 'technoprintUser';

// Server API Base
const API_BASE = ''; // Use relative path - server handles all

// Welcome gift
const WELCOME_PAGES = 1000;
const WELCOME_BALANCE = 0;

// Check if user is already logged in
function checkExistingSession() {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
        try {
            const userData = JSON.parse(session);
            if (userData && userData.username) {
                return true;
            }
        } catch (e) {
            localStorage.removeItem(SESSION_KEY);
        }
    }
    return false;
}

// Get current user
function getCurrentUser() {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
        try {
            return JSON.parse(session);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// LOGIN via Server API (USERNAME AUTH - NO EMAIL)
async function login(username, password) {
    if (!username || !password) {
        showAuthError('الرجاء إدخال اسم المستخدم وكلمة المرور');
        return false;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showAuthError(data.error || 'فشل تسجيل الدخول');
            return false;
        }

        if (data.success && data.user) {
            const sessionData = {
                id: data.user.id,
                username: data.user.username,
                fullName: data.user.full_name,
                phone: data.user.phone || '',
                governorate: data.user.governorate || '',
                role: data.user.role || 'student',
                category: data.user.category || '',
                balance: data.user.balance || 0,
                pages: data.user.pages || 0,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
            localStorage.setItem(USER_KEY, JSON.stringify(sessionData));

            updateWalletUI(sessionData.balance, sessionData.pages);
            closeModal('loginModal');
            showToast('مرحباً بك ' + (sessionData.fullName || sessionData.username));
            return true;
        } else {
            showAuthError(data.error || 'بيانات الدخول غير صحيحة');
            return false;
        }

    } catch (e) {
        console.error('Login error:', e);
        showAuthError('حدث خطأ أثناء تسجيل الدخول');
        return false;
    }
}

// REGISTER via Server API (USERNAME AUTH - NO EMAIL)
async function register(formData) {
    const { fullName, username, password, phone, address, governorate, role, category } = formData;

    if (!fullName || !username || !password || !phone || !category) {
        showAuthError('الرجاء ملء جميع الحقول المطلوبة');
        return false;
    }

    if (password.length < 6) {
        showAuthError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return false;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password,
                full_name: fullName,
                phone,
                address,
                governorate,
                role,
                category
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showAuthError(data.error || 'فشل في إنشاء الحساب');
            return false;
        }

        if (data.success && data.user) {
            const sessionData = {
                id: data.user.id,
                username: data.user.username,
                fullName: data.user.full_name,
                phone: data.user.phone,
                governorate: data.user.governorate || '',
                role: data.user.role || 'student',
                category: data.user.category,
                balance: data.user.balance || 0,
                pages: data.user.pages || 0,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
            localStorage.setItem(USER_KEY, JSON.stringify(sessionData));

            closeModal('registerModal');
            showWelcomeGift(sessionData.fullName, sessionData.pages);
            updateWalletUI(sessionData.balance, sessionData.pages);
            
            return true;
        } else {
            showAuthError(data.error || 'فشل في إنشاء الحساب');
            return false;
        }

    } catch (e) {
        console.error('Registration error:', e);
        showAuthError('حدث خطأ أثناء إنشاء الحساب');
        return false;
    }
}

// LOGOUT
function logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = 'index.html';
}

// Show error message
function showAuthError(message) {
    const errorEl = document.getElementById('authError') || document.getElementById('registerError');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        setTimeout(() => { errorEl.style.display = 'none'; }, 5000);
    } else {
        alert(message);
    }
}

// Update Wallet UI
function updateWalletUI(balance, pages) {
    const balanceEl = document.getElementById('walletBalanceDisplay');
    const pagesEl = document.getElementById('walletPagesDisplay');
    
    if (balanceEl) balanceEl.textContent = (balance || 0).toLocaleString() + ' IQD';
    if (pagesEl) pagesEl.textContent = (pages || 0).toLocaleString() + ' صفحة';
}

// Sync wallet from server
async function syncWalletFromDatabase() {
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        const response = await fetch(`/api/wallet/${user.id}`);
        const data = await response.json();
        
        if (data.balance !== undefined) {
            user.balance = data.balance;
            user.pages = data.pages;
            
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
            updateWalletUI(user.balance, user.pages);
        }
    } catch (e) {
        console.error('Wallet sync error:', e);
    }
}

// CINEMATIC WELCOME POPUP
function showWelcomeGift(userName, pages) {
    const overlay = document.createElement('div');
    overlay.id = 'welcomeOverlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.95); z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        animation: fadeIn 0.5s ease;
    `;
    
    overlay.innerHTML = `
        <style>
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
            @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
            @keyframes confetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
            .welcome-content { text-align: center; animation: scaleIn 0.8s ease 0.3s both; }
            .welcome-logo { font-size: 80px; color: #D4AF37; margin-bottom: 20px; animation: pulse 2s infinite; }
            .welcome-title { font-size: 32px; color: #D4AF37; margin-bottom: 10px; }
            .welcome-name { font-size: 24px; color: #fff; margin-bottom: 30px; }
            .welcome-gift-box { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border: 2px solid #D4AF37; border-radius: 20px; padding: 30px 50px; margin: 20px auto; max-width: 400px; animation: pulse 1.5s infinite; }
            .welcome-gift-icon { font-size: 60px; margin-bottom: 15px; }
            .welcome-gift-text { font-size: 18px; color: #ccc; margin-bottom: 15px; }
            .welcome-gift-amount { font-size: 48px; color: #D4AF37; font-weight: bold; background: linear-gradient(90deg, #D4AF37, #F4D03F, #D4AF37); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s linear infinite; }
            .welcome-gift-label { font-size: 14px; color: #888; margin-top: 5px; }
            .welcome-btn { background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #000; border: none; padding: 15px 50px; font-size: 18px; border-radius: 30px; cursor: pointer; margin-top: 30px; font-weight: bold; transition: all 0.3s; }
            .welcome-btn:hover { transform: scale(1.05); box-shadow: 0 0 30px rgba(212, 175, 55, 0.5); }
            .confetti { position: absolute; width: 10px; height: 10px; animation: confetti 3s ease-out forwards; }
        </style>
        <div class="welcome-content">
            <div class="welcome-logo">🎉</div>
            <div class="welcome-title">أهلاً بك في تكنوبرنت!</div>
            <div class="welcome-name">${userName || 'صديقي'}</div>
            <div class="welcome-gift-box">
                <div class="welcome-gift-icon">🎁</div>
                <div class="welcome-gift-text">لقد حصلت على هدية ترحيبية</div>
                <div class="welcome-gift-amount">${pages.toLocaleString()}</div>
                <div class="welcome-gift-label">صفحة طباعة مجانية</div>
            </div>
            <button class="welcome-btn" onclick="closeWelcomePopup()">🚀 ابدأ الآن</button>
        </div>
        ${createConfetti()}
    `;
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        const existingOverlay = document.getElementById('welcomeOverlay');
        if (existingOverlay) closeWelcomePopup();
    }, 10000);
}

function createConfetti() {
    let confettiHTML = '';
    const colors = ['#D4AF37', '#F4D03F', '#fff', '#E63946', '#2ECC71'];
    for (let i = 0; i < 50; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        confettiHTML += `<div class="confetti" style="left:${left}%;top:-20px;background:${color};animation-delay:${delay}s;"></div>`;
    }
    return confettiHTML;
}

function closeWelcomePopup() {
    const overlay = document.getElementById('welcomeOverlay');
    if (overlay) overlay.remove();
}

// Update UI
function updateUserUI() {
    const user = getCurrentUser();
    if (user) {
        const loginBtn = document.querySelector('.login-btn');
        const registerBtn = document.querySelector('.register-btn');

        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        updateWalletUI(user.balance, user.pages);
        syncWalletFromDatabase();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (checkExistingSession()) {
        const user = getCurrentUser();
        console.log('Welcome back, ' + (user?.fullName || user?.username));
        updateUserUI();
    }
    setInterval(syncWalletFromDatabase, 30000);
});

// Toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#D4AF37;color:#000;padding:15px 30px;border-radius:25px;font-weight:bold;z-index:99999;animation:slideUp 0.3s ease';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Export
window.Auth = {
    login,
    register,
    logout,
    getCurrentUser,
    checkExistingSession,
    showAuthError,
    updateUserUI,
    updateWalletUI,
    syncWalletFromDatabase,
    closeWelcomePopup,
    WELCOME_PAGES
};