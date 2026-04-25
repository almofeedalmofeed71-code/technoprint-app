// ===== TECHNO-CONTROL ADMIN LOGIN SCRIPT v4 =====
// IMMEDIATE BYPASS - Owner Access Guaranteed

const API_URL = 'https://technoprint-app.vercel.app';

// Check if already logged in
const adminToken = localStorage.getItem('adminToken');
const adminUser = localStorage.getItem('adminUser');

if (adminToken && adminUser) {
    try {
        const userData = JSON.parse(adminUser);
        if (userData.isAdmin) {
            console.log('✅ Already logged in - redirecting to dashboard');
            window.location.href = 'admin-dashboard.html';
            return;
        }
    } catch (e) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
    }
}

// Handle login - IMMEDIATE BYPASS for owner
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    
    if (!loginForm) return;
    
    // ✅ IMMEDIATE BYPASS - Always work for owner
    const username = document.getElementById('adminUsername');
    const password = document.getElementById('adminPassword');
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const u = username?.value?.trim() || '';
        const p = password?.value?.trim() || '';
        
        if (!u || !p) {
            showError(loginError, 'أدخل اسم المستخدم وكلمة المرور');
            return;
        }
        
        console.log('🔵 Login attempt:', u);
        
        // ✅✅✅ IMMEDIATE BYPASS FOR OWNER
        if (u === 'admin' && p === 'technoprint2024') {
            console.log('✅✅✅ OWNER BYPASS - No DB check needed');
            
            // Set localStorage - IMMEDIATE ACCESS
            localStorage.setItem('adminToken', 'owner-session-2024');
            localStorage.setItem('adminUser', JSON.stringify({
                username: 'admin',
                role: 'admin',
                name: 'المالك',
                isAdmin: true,
                isLoggedIn: true,
                isOwner: true
            }));
            
            // Call admin-init API in background (optional - doesn't block login)
            fetch(`${API_URL}/api/admin-init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret: 'technoprint-admin-secret-2024' })
            }).then(r => r.json()).then(data => {
                console.log('📥 Admin init result:', data);
            }).catch(err => console.log('Admin init skipped:', err));
            
            console.log('🚀 Redirecting to dashboard...');
            window.location.href = 'admin-dashboard.html';
            return;
        }
        
        // For other credentials - show error
        showError(loginError, 'بيانات الدخول غير صحيحة');
    });
});

function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        setTimeout(() => element.style.display = 'none', 5000);
    }
}