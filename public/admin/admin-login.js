// ===== TECHNO-CONTROL - PERMANENT BYPASS FOR HSEENOP33 =====

const SUPABASE_URL = 'https://rqzsokvhgjlftkouhphb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY';

localStorage.clear();

document.addEventListener('DOMContentLoaded', async () => {
    // AUTO LOGIN for hseenop33
    const hardcodedUsername = 'hseenop33';
    const hardcodedPassword = 'admin123';
    
    console.log('🔵 Quick login for:', hardcodedUsername);
    
    localStorage.setItem('adminToken', 'admin-db-hseenop33');
    localStorage.setItem('adminUser', JSON.stringify({
        username: hardcodedUsername,
        role: 'admin',
        isAdmin: true
    }));
    
    window.location.href = 'admin-dashboard.html';
});