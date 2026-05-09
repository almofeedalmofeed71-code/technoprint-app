// ===== TECHNO-CONTROL - ADMIN LOGIN =====

const SUPABASE_URL = 'https://rqzsokvhgjlftkouhphb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY';

// NEW ADMIN CREDENTIALS
const ADMIN_USER = 'hseenop9090';
const ADMIN_PASS = 'op3120879';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const errorEl = document.getElementById('loginError');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('adminUsername')?.value?.trim();
            const password = document.getElementById('adminPassword')?.value?.trim();
            
            if (username === ADMIN_USER && password === ADMIN_PASS) {
                localStorage.setItem('adminToken', 'hseenop9090-authenticated');
                localStorage.setItem('adminUser', JSON.stringify({
                    username: ADMIN_USER,
                    role: 'admin',
                    isAdmin: true
                }));
                window.location.href = 'admin-dashboard.html';
            } else {
                if (errorEl) errorEl.textContent = 'اسم المستخدم او كلمة المرور غير صحيحة';
            }
        });
    }
    
    // Check if already logged in
    const token = localStorage.getItem('adminToken');
    if (token === 'hseenop9090-authenticated') {
        window.location.href = 'admin-dashboard.html';
    }
});
