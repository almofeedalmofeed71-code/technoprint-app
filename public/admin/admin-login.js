// ===== TECHNO-CONTROL ADMIN LOGIN SCRIPT v3 =====
// SERVER-SIDE AUTH with Supabase Role Check

const SUPABASE_URL = 'https://rqzsokvhgjlftkouhphb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY';

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
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
    }
}

// Handle login
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername')?.value?.trim() || '';
        const password = document.getElementById('adminPassword')?.value?.trim() || '';
        
        if (!username || !password) {
            showError(loginError, 'الرجاء إدخال اسم المستخدم وكلمة المرور');
            return;
        }
        
        console.log('🔵 Login attempt:', username);
        
        // Method 1: Hardcoded admin (for immediate access)
        if (username === 'admin' && password === 'technoprint2024') {
            console.log('✅ Hardcoded admin bypass');
            
            localStorage.setItem('adminToken', 'admin-session-2024-technoprint');
            localStorage.setItem('adminUser', JSON.stringify({
                username: 'admin',
                role: 'admin',
                name: 'مدير النظام',
                isAdmin: true,
                isLoggedIn: true
            }));
            
            window.location.href = 'admin-dashboard.html';
            return;
        }
        
        // Method 2: Check Supabase for role='admin'
        try {
            console.log('📤 Checking Supabase for role...');
            
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/profiles?username=eq.${encodeURIComponent(username)}&select=id,username,password,role`,
                {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    }
                }
            );
            
            const users = await res.json();
            
            if (!users || users.length === 0) {
                showError(loginError, 'اسم المستخدم غير موجود');
                return;
            }
            
            const user = users[0];
            
            // Verify password
            if (user.password !== password) {
                showError(loginError, 'كلمة المرور غير صحيحة');
                return;
            }
            
            // Check if role is admin
            if (user.role !== 'admin') {
                showError(loginError, 'ليس لديك صلاحية الدخول للوحة التحكم');
                return;
            }
            
            console.log('✅ DB Admin role verified');
            
            // Set session
            localStorage.setItem('adminToken', 'admin-session-db-' + user.id);
            localStorage.setItem('adminUser', JSON.stringify({
                id: user.id,
                username: user.username,
                role: user.role,
                isAdmin: true,
                isLoggedIn: true
            }));
            
            window.location.href = 'admin-dashboard.html';
            
        } catch (err) {
            console.error('❌ Login error:', err);
            showError(loginError, 'خطأ في الاتصال - حاول مرة أخرى');
        }
    });
});

function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        setTimeout(() => element.style.display = 'none', 5000);
    }
}