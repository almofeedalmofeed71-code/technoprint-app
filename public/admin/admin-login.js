// ===== TECHNO-CONTROL - SIMPLE LOGIN FOR HSEENOP33 =====

const SUPABASE_URL = 'https://rqzsokvhgjlftkouhphb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY';

// CLEAR EVERYTHING
localStorage.clear();

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername')?.value?.trim() || '';
        const password = document.getElementById('adminPassword')?.value?.trim() || '';
        
        if (!username || !password) {
            alert('أدخل الاسم وكلمة المرور');
            return;
        }
        
        // HARDCODE BYPASS FOR ADMIN
        if (username === 'admin' && password === 'technoprint2024') {
            localStorage.setItem('adminToken', 'owner-2024');
            localStorage.setItem('adminUser', JSON.stringify({ username: 'admin', role: 'admin', isAdmin: true }));
            window.location.href = 'admin-dashboard.html';
            return;
        }
        
        // CHECK DATABASE FOR hseenop33
        try {
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/profiles?username=eq.${encodeURIComponent(username)}&select=*`,
                { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
            );
            
            const users = await res.json();
            
            if (!users || users.length === 0) {
                alert('المستخدم غير موجود');
                return;
            }
            
            const user = users[0];
            
            if (user.password !== password) {
                alert('كلمة المرور غير صحيحة');
                return;
            }
            
            // ✅ IF ROLE IS ADMIN - GRANT ACCESS
            if (user.role === 'admin') {
                localStorage.setItem('adminToken', 'admin-db-' + user.id);
                localStorage.setItem('adminUser', JSON.stringify({ 
                    id: user.id,
                    username: user.username, 
                    role: user.role, 
                    isAdmin: true 
                }));
                window.location.href = 'admin-dashboard.html';
            } else {
                alert('ليس لديك صلاحية الدخول. دورك: ' + (user.role || 'غير محدد'));
            }
            
        } catch (err) {
            alert('خطأ في الاتصال');
        }
    });
});