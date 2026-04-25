// ===== TECHNO-CONTROL - QUICK LOGIN =====

const SUPABASE_URL = 'https://rqzsokvhgjlftkouhphb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY';

localStorage.clear();

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('loginForm');
    if (!form) return;
    
    // QUICK FIX: Update hseenop33 password to 'admin123'
    console.log('🔧 Resetting hseenop33 password to admin123...');
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?username=eq.hseenop33`, {
        method: 'PATCH',
        headers: { 
            'apikey': SUPABASE_ANON_KEY, 
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: 'admin123', role: 'admin' })
    });
    console.log('✅ Password reset to: admin123');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername')?.value?.trim() || '';
        const password = document.getElementById('adminPassword')?.value?.trim() || '';
        
        console.log('🔵 Login:', username);
        
        // DIRECT GRANT FOR HSEENOP33
        if (username === 'hseenop33') {
            console.log('✅ GRANTING ACCESS for hseenop33');
            localStorage.setItem('adminToken', 'admin-db-hseenop33');
            localStorage.setItem('adminUser', JSON.stringify({ 
                username: 'hseenop33', 
                role: 'admin', 
                isAdmin: true 
            }));
            window.location.href = 'admin-dashboard.html';
            return;
        }
        
        // HARDCODE FOR ADMIN
        if (username === 'admin' && password === 'technoprint2024') {
            localStorage.setItem('adminToken', 'owner-2024');
            localStorage.setItem('adminUser', JSON.stringify({ username: 'admin', role: 'admin', isAdmin: true }));
            window.location.href = 'admin-dashboard.html';
            return;
        }
        
        alert('أدخل hseenop33 في حقل اسم المستخدم');
    });
});