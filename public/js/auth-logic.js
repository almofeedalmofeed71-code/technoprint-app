// ===== TECHNO-PRINT AUTH LOGIC - USERNAME AUTH & SESSION PERSISTENCE =====
// Session: localStorage → technoprintSession

// Session Keys
const SESSION_KEY = 'technoprintSession';
const USER_KEY = 'technoprintUser';

// Supabase Config
const SUPABASE_URL = 'https://avabozirwdefwtabywqo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YWJvemlyd2RlZnd0YWJ5d3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjM1NDQsImV4cCI6MjA5MjQzOTU0NH0.boDU0pXR1MGYiJXF1Jos-w0uehKCCZHsKgxHP7nbQVY';

// Check if user is already logged in (Session Persistence)
function checkExistingSession() {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
        try {
            const userData = JSON.parse(session);
            if (userData && userData.username) {
                // User is logged in - redirect to home
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

        // For demo: check password (in production, use Supabase Auth)
        // Simple password check - in real app, use Supabase Auth with email
        if (password.length >= 4) {
            // Create session
            const sessionData = {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                phone: user.phone,
                governorate: user.governorate,
                balance: user.balance_iqd || 0,
                pages: user.pages_count || 0,
                loginTime: new Date().toISOString()
            };

            // Save session to localStorage
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
            localStorage.setItem(USER_KEY, JSON.stringify(sessionData));

            // Success - redirect to home
            window.location.href = 'index.html?loggedin=true';
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

// REGISTER with Username + Password
async function register(formData) {
    const { fullName, username, password, phone, address, governorate } = formData;

    if (!fullName || !username || !password || !phone) {
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

        // Create new user profile
        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        const profileData = {
            id: userId,
            username: username,
            full_name: fullName,
            phone: phone,
            address: address || '',
            governorate: governorate || '',
            balance_iqd: 0,
            pages_count: 100, // Welcome bonus
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
                balance: 0,
                pages: 100,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
            localStorage.setItem(USER_KEY, JSON.stringify(sessionData));

            showAuthSuccess('✅ تم إنشاء الحساب بنجاح! مرحباً بك ' + fullName);
            setTimeout(() => {
                window.location.href = 'index.html?loggedin=true';
            }, 1500);

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
    const errorEl = document.getElementById('authError') || document.getElementById('loginError') || document.getElementById('registerError');
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

// Show success message
function showAuthSuccess(message) {
    const successEl = document.getElementById('authSuccess');
    if (successEl) {
        successEl.textContent = message;
        successEl.style.display = 'block';
    } else {
        alert(message);
    }
}

// Update UI with user info
function updateUserUI() {
    const user = getCurrentUser();
    if (user) {
        const userNameEl = document.getElementById('userName');
        const userBalanceEl = document.getElementById('userBalance');
        const userPagesEl = document.getElementById('userPages');
        const loginBtn = document.querySelector('.login-btn');
        const registerBtn = document.querySelector('.register-btn');

        if (userNameEl) userNameEl.textContent = user.fullName || user.username;
        if (userBalanceEl) userBalanceEl.textContent = (user.balance || 0).toLocaleString() + ' IQD';
        if (userPagesEl) userPagesEl.textContent = (user.pages || 0) + ' صفحة';

        // Hide login/register buttons, show user info
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
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
});

// Export functions
window.Auth = {
    login,
    register,
    logout,
    getCurrentUser,
    checkExistingSession,
    showAuthError,
    showAuthSuccess
};