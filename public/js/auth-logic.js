// ===== TECHNO-PRINT AUTH LOGIC - ROLES & REWARDS VERSION =====
// Session: localStorage → technoprintSession

// Session Keys
const SESSION_KEY = 'technoprintSession';
const USER_KEY = 'technoprintUser';

// Supabase Config
const SUPABASE_URL = 'https://avabozirwdefwtabywqo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YWJvemlyd2RlZnd0YWJ5d3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjM1NDQsImV4cCI6MjA5MjQzOTU0NH0.boDU0pXR1MGYiJXF1Jos-w0uehKCCZHsKgxHP7nbQVY';

// Welcome gift amount
const WELCOME_PAGES = 1000;
const WELCOME_BALANCE = 0; // Balance is 0, only pages are gifted

// Check if user is already logged in (Session Persistence)
function checkExistingSession() {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
        try {
            const userData = JSON.parse(session);
            if (userData && userData.username) {
                // User is logged in
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

// LOGIN with Username + Password
async function login(username, password) {
    if (!username || !password) {
        showAuthError('الرجاء إدخال اسم المستخدم وكلمة المرور');
        return false;
    }

    try {
        // Query Supabase profiles table with username
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/profiles?username=eq.${encodeURIComponent(username)}&select=*`,
            {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        const users = await response.json();

        if (!Array.isArray(users) || users.length === 0) {
            showAuthError('❌ المستخدم غير موجود');
            return false;
        }

        const user = users[0];

        // Simple password check (in production, use proper auth)
        if (password.length >= 4) {
            // Create session
            const sessionData = {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                phone: user.phone,
                governorate: user.governorate,
                role: user.role || 'student',
                balance: user.balance_iqd || 0,
                pages: user.pages_count || 0,
                loginTime: new Date().toISOString()
            };

            // Save session to localStorage
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
            localStorage.setItem(USER_KEY, JSON.stringify(sessionData));

            // Update wallet UI
            updateWalletUI(sessionData.balance, sessionData.pages);
            
            // Success - stay on home page
            closeModal('loginModal');
            showToast('مرحباً بك ' + (sessionData.fullName || sessionData.username));
            return true;
        } else {
            showAuthError('كلمة المرور غير صحيحة');
            return false;
        }

    } catch (e) {
        console.error('Login error:', e);
        showAuthError('حدث خطأ أثناء تسجيل الدخول');
        return false;
    }
}

// REGISTER with Role Selection + Welcome Gift
async function register(formData) {
    const { fullName, username, password, phone, address, governorate, role } = formData;

    if (!fullName || !username || !password || !phone || !role) {
        showAuthError('الرجاء ملء جميع الحقول المطلوبة');
        return false;
    }

    if (password.length < 6) {
        showAuthError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return false;
    }

    try {
        // Check if username already exists
        const checkResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/profiles?username=eq.${encodeURIComponent(username)}&select=id`,
            {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        const existing = await checkResponse.json();
        if (Array.isArray(existing) && existing.length > 0) {
            showAuthError('❌ اسم المستخدم موجود مسبقاً');
            return false;
        }

        // Create new user profile with WELCOME GIFT
        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        const profileData = {
            id: userId,
            username: username,
            full_name: fullName,
            phone: phone,
            address: address || '',
            governorate: governorate || '',
            role: role, // Student, Teacher, Designer, Library Owner
            balance_iqd: WELCOME_BALANCE,
            pages_count: WELCOME_PAGES, // WELCOME GIFT!
            created_at: new Date().toISOString()
        };

        const insertResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/profiles`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(profileData)
            }
        );

        if (insertResponse.ok) {
            // Auto-login after registration
            const sessionData = {
                id: userId,
                username: username,
                fullName: fullName,
                phone: phone,
                governorate: governorate || '',
                role: role,
                balance: WELCOME_BALANCE,
                pages: WELCOME_PAGES,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
            localStorage.setItem(USER_KEY, JSON.stringify(sessionData));

            // Close registration modal
            closeModal('registerModal');
            
            // Show CINEMATIC WELCOME POPUP
            showWelcomeGift(sessionData.fullName, sessionData.pages);
            
            // Update wallet UI
            updateWalletUI(WELCOME_BALANCE, WELCOME_PAGES);
            
            return true;
        } else {
            showAuthError('فشل في إنشاء الحساب');
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
        setTimeout(() => {
            errorEl.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

// Update Wallet UI with real database values
function updateWalletUI(balance, pages) {
    const balanceEl = document.getElementById('walletBalanceDisplay') || document.querySelector('.wallet-balance');
    const pagesEl = document.getElementById('walletPagesDisplay') || document.querySelector('.wallet-pages');
    const walletModalBalance = document.getElementById('walletModalBalance');
    const walletModalPages = document.getElementById('walletModalPages');
    
    if (balanceEl) balanceEl.textContent = (balance || 0).toLocaleString() + ' IQD';
    if (pagesEl) pagesEl.textContent = (pages || 0).toLocaleString() + ' صفحة';
    if (walletModalBalance) walletModalBalance.textContent = (balance || 0).toLocaleString() + ' IQD';
    if (walletModalPages) walletModalPages.textContent = (pages || 0).toLocaleString() + ' صفحة';
}

// Sync wallet from database
async function syncWalletFromDatabase() {
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=balance_iqd,pages_count`,
            {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            }
        );
        
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            const dbUser = data[0];
            user.balance = dbUser.balance_iqd || 0;
            user.pages = dbUser.pages_count || 0;
            
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
            updateWalletUI(user.balance, user.pages);
        }
    } catch (e) {
        console.error('Wallet sync error:', e);
    }
}

// CINEMATIC WELCOME POPUP
function showWelcomeGift(userName, pages) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'welcomeOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.95);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.5s ease;
    `;
    
    overlay.innerHTML = `
        <style>
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
            @keyframes shimmer {
                0% { background-position: -200% center; }
                100% { background-position: 200% center; }
            }
            @keyframes confetti {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
            .welcome-content {
                text-align: center;
                animation: scaleIn 0.8s ease 0.3s both;
            }
            .welcome-logo {
                font-size: 80px;
                color: #D4AF37;
                margin-bottom: 20px;
                animation: pulse 2s infinite;
            }
            .welcome-title {
                font-size: 32px;
                color: #D4AF37;
                margin-bottom: 10px;
                text-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
            }
            .welcome-name {
                font-size: 24px;
                color: #fff;
                margin-bottom: 30px;
            }
            .welcome-gift-box {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid #D4AF37;
                border-radius: 20px;
                padding: 30px 50px;
                margin: 20px auto;
                max-width: 400px;
                animation: pulse 1.5s infinite;
            }
            .welcome-gift-icon {
                font-size: 60px;
                margin-bottom: 15px;
            }
            .welcome-gift-text {
                font-size: 18px;
                color: #ccc;
                margin-bottom: 15px;
            }
            .welcome-gift-amount {
                font-size: 48px;
                color: #D4AF37;
                font-weight: bold;
                background: linear-gradient(90deg, #D4AF37, #F4D03F, #D4AF37);
                background-size: 200% auto;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: shimmer 3s linear infinite;
            }
            .welcome-gift-label {
                font-size: 14px;
                color: #888;
                margin-top: 5px;
            }
            .welcome-btn {
                background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
                color: #000;
                border: none;
                padding: 15px 50px;
                font-size: 18px;
                border-radius: 30px;
                cursor: pointer;
                margin-top: 30px;
                font-weight: bold;
                transition: all 0.3s;
            }
            .welcome-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 0 30px rgba(212, 175, 55, 0.5);
            }
            .confetti {
                position: absolute;
                width: 10px;
                height: 10px;
                background: #D4AF37;
                animation: confetti 3s ease-out forwards;
            }
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
    
    // Auto-close after 10 seconds if user doesn't click
    setTimeout(() => {
        const existingOverlay = document.getElementById('welcomeOverlay');
        if (existingOverlay) {
            closeWelcomePopup();
        }
    }, 10000);
}

// Create confetti effect
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

// Close welcome popup
function closeWelcomePopup() {
    const overlay = document.getElementById('welcomeOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// Update UI with user info
function updateUserUI() {
    const user = getCurrentUser();
    if (user) {
        const userNameEl = document.getElementById('userName');
        const loginBtn = document.querySelector('.login-btn');
        const registerBtn = document.querySelector('.register-btn');

        if (userNameEl) userNameEl.textContent = user.fullName || user.username;

        // Hide login/register buttons
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        
        // Update wallet
        updateWalletUI(user.balance, user.pages);
        
        // Sync from database
        syncWalletFromDatabase();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check session on load
    if (checkExistingSession()) {
        const user = getCurrentUser();
        console.log('Welcome back, ' + (user?.fullName || user?.username));
        updateUserUI();
    }
    
    // Poll wallet every 30 seconds
    setInterval(syncWalletFromDatabase, 30000);
});

// Export functions
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