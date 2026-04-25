// ===== TECHNO-CONTROL - DEBUG LOGIN =====

const SUPABASE_URL = 'https://rqzsokvhgjlftkouhphb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY';

// DEBUG: Log which Supabase project is being used
console.log('🔍 DIAGNOSTIC 1: Supabase URL');
console.log('Full URL:', SUPABASE_URL);
console.log('Project ID:', SUPABASE_URL.split('.')[0].split('//')[1]);
console.log('Starting with: rqzsokvhgjlftkouhphb =', SUPABASE_URL.includes('rqzsokvhgjlftkouhphb'));

// CLEAR EVERYTHING
localStorage.clear();

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    if (!form) {
        console.log('❌ Form not found!');
        return;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername')?.value?.trim() || '';
        const password = document.getElementById('adminPassword')?.value?.trim() || '';
        
        console.log('🔵 DEBUG 2: Login attempt');
        console.log('Username entered:', username);
        console.log('Password length:', password.length);
        
        if (!username || !password) {
            alert('أدخل الاسم وكلمة المرور');
            return;
        }
        
        // HARDCODE BYPASS
        if (username === 'admin' && password === 'technoprint2024') {
            console.log('✅ Hardcode bypass - admin account');
            localStorage.setItem('adminToken', 'owner-2024');
            localStorage.setItem('adminUser', JSON.stringify({ username: 'admin', role: 'admin', isAdmin: true }));
            window.location.href = 'admin-dashboard.html';
            return;
        }
        
        // CHECK DATABASE
        console.log('🔍 DEBUG 3: Fetching from Supabase...');
        const fetchUrl = `${SUPABASE_URL}/rest/v1/profiles?username=eq.${encodeURIComponent(username)}&select=*`;
        console.log('Fetch URL:', fetchUrl);
        
        try {
            console.log('📡 Sending fetch request...');
            const res = await fetch(fetchUrl, { 
                headers: { 
                    'apikey': SUPABASE_ANON_KEY, 
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}` 
                } 
            });
            
            console.log('📥 Response status:', res.status);
            console.log('📥 Response OK:', res.ok);
            
            const users = await res.json();
            
            console.log('📥 DEBUG 4: Full response from Supabase');
            console.log('Response type:', typeof users);
            console.log('Is array?:', Array.isArray(users));
            console.log('Array length:', users?.length);
            console.log('Full response:', JSON.stringify(users, null, 2));
            
            if (!users || users.length === 0) {
                console.log('❌ DIAGNOSTIC: Empty array [] returned!');
                console.log('❌ User NOT FOUND in database');
                alert('المستخدم غير موجود في قاعدة البيانات');
                return;
            }
            
            const user = users[0];
            console.log('👤 User found:', user.username);
            console.log('   Role:', user.role);
            console.log('   ID:', user.id);
            
            if (user.password !== password) {
                console.log('❌ Password mismatch!');
                alert('كلمة المرور غير صحيحة');
                return;
            }
            
            if (user.role === 'admin') {
                console.log('✅ Role is admin - GRANTING ACCESS');
                localStorage.setItem('adminToken', 'admin-db-' + user.id);
                localStorage.setItem('adminUser', JSON.stringify({ 
                    id: user.id,
                    username: user.username, 
                    role: user.role, 
                    isAdmin: true 
                }));
                window.location.href = 'admin-dashboard.html';
            } else {
                console.log('❌ Role is NOT admin:', user.role);
                alert('ليس لديك صلاحية الدخول. دورك: ' + user.role);
            }
            
        } catch (err) {
            console.error('❌ DEBUG 5: ERROR occurred!');
            console.error('Error name:', err.name);
            console.error('Error message:', err.message);
            alert('خطأ في الاتصال: ' + err.message);
        }
    });
});

// DEBUG: Test connection on page load
window.testConnection = async function() {
    console.log('🧪 Running connection test...');
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        console.log('✅ Connection test result:', res.status, res.ok ? 'OK' : 'FAILED');
    } catch (e) {
        console.error('❌ Connection test failed:', e.message);
    }
};

// Run test
console.log('🧪 Starting debug mode...');
testConnection();