// ===== TECHNO-CONTROL ADMIN LOGIN v6 - ANY ADMIN USER =====

const SUPABASE_URL = 'https://rqzsokvhgjlftkouhphb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY';

// Clear old sessions
localStorage.removeItem('adminToken');
localStorage.removeItem('adminUser');

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername')?.value?.trim() || '';
        const password = document.getElementById('adminPassword')?.value?.trim() || '';
        
        if (!username || !password) {
            showError('أدخل اسم المستخدم وكلمة المرور');
            return;
        }
        
        console.log('🔵 Login attempt:', username);
        
        // === PRIORITY 1: HARDCODE for 'admin' user ===
        if (username === 'admin' && password === 'technoprint2024') {
            localStorage.setItem('adminToken', 'owner-session-2024');
            localStorage.setItem('adminUser', JSON.stringify({
                username: 'admin',
                role: 'admin',
                name: 'المالك',
                isAdmin: true,
                isOwner: true
            }));
            window.location.href = 'admin-dashboard.html';
            return;
        }
        
        // === PRIORITY 2: CHECK DATABASE FOR ANY ADMIN USER ===
        try {
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
            console.log('📋 DB Response:', users);
            
            if (!users || users.length === 0) {
                showError('المستخدم غير موجود');
                return;
            }
            
            const user = users[0];
            console.log('👤 User found:', user.username, '| Role:', user.role);
            
            // Verify password
            if (user.password !== password) {
                showError('كلمة المرور غير صحيحة');
                return;
            }
            
            // CHECK IF ROLE IS 'admin' - ANY ADMIN USER WORKS!
            if (user.role === 'admin') {
                console.log('✅ Admin role confirmed for:', user.username);
                
                localStorage.setItem('adminToken', 'db-admin-session-' + user.id);
                localStorage.setItem('adminUser', JSON.stringify({
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    name: 'مدير النظام',
                    isAdmin: true,
                    isOwner: false
                }));
                
                console.log('🚀 Redirecting to dashboard...');
                window.location.href = 'admin-dashboard.html';
            } else {
                showError(`ليس لديك صلاحية - دورك: ${user.role || 'غير محدد'}`);
            }
            
        } catch (err) {
            console.error('❌ Error:', err);
            showError('خطأ في الاتصال - حاول لاحقاً');
        }
    });
});

function showError(msg) {
    const el = document.getElementById('loginError');
    if (el) {
        el.textContent = msg;
        el.style.display = 'block';
        setTimeout(() => el.style.display = 'none', 5000);
    }
}