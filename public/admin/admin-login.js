// ===== TECHNO-CONTROL ADMIN LOGIN SCRIPT v2 =====
// LOCAL BYPASS - No Supabase Auth dependency

// Clear old localStorage on page load (prevent conflicts)
(function clearOldStorage() {
    const oldToken = localStorage.getItem('adminToken');
    const oldUser = localStorage.getItem('adminUser');
    
    // If token exists but old format, clear it
    if (oldToken && !oldToken.includes('admin-session')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        console.log('🧹 Cleared old auth tokens');
    }
})();

// Check if already logged in
const adminToken = localStorage.getItem('adminToken');
const adminUser = localStorage.getItem('adminUser');

if (adminToken && adminUser) {
    try {
        const userData = JSON.parse(adminUser);
        if (userData.isAdmin) {
            console.log('✅ Already logged in as admin');
            window.location.href = 'admin-dashboard.html';
            return;
        }
    } catch (e) {
        console.error('❌ Invalid admin user data');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
    }
}

// Handle login form
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    
    if (!loginForm) {
        console.log('❌ Login form not found');
        return;
    }
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername')?.value?.trim() || '';
        const password = document.getElementById('adminPassword')?.value?.trim() || '';
        
        if (!username || !password) {
            showError(loginError, 'الرجاء إدخال اسم المستخدم وكلمة المرور');
            return;
        }
        
        console.log('🔵 Login attempt:', username);
        
        // ✅ HARD LOCAL BYPASS - No server check
        if (username === 'admin' && password === 'technoprint2024') {
            console.log('✅ LOCAL BYPASS: Admin credentials accepted');
            
            // Set all required localStorage flags
            localStorage.setItem('adminToken', 'admin-session-2024-technoprint');
            localStorage.setItem('adminUser', JSON.stringify({
                username: 'admin',
                role: 'super_admin',
                name: 'مدير النظام',
                isAdmin: true,
                isLoggedIn: true,
                loginTime: new Date().toISOString()
            }));
            
            console.log('✅ localStorage set - Redirecting...');
            
            // Immediate redirect
            window.location.href = 'admin-dashboard.html';
            return;
        }
        
        // For other credentials - try API (optional)
        showError(loginError, 'اسم المستخدم أو كلمة المرور غير صحيحة');
    });
});

function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
    console.log('❌ Error:', message);
}