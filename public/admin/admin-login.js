// ===== TECHNO-CONTROL ADMIN LOGIN - EMERGENCY BYPASS =====

// FORCE CLEAR old sessions
localStorage.removeItem('adminToken');
localStorage.removeItem('adminUser');

// Immediate check - if token exists and is owner session, go directly
const existingToken = localStorage.getItem('adminToken');
const existingUser = localStorage.getItem('adminUser');

if (existingToken === 'owner-session-2024' && existingUser) {
    window.location.href = 'admin-dashboard.html';
}

// MAIN LOGIN HANDLER
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    if (!form) {
        alert('Form not found!');
        return;
    }
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const usernameInput = document.getElementById('adminUsername');
        const passwordInput = document.getElementById('adminPassword');
        
        if (!usernameInput || !passwordInput) {
            alert('Input fields not found!');
            return;
        }
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        // === EMERGENCY BYPASS - FIRST PRIORITY ===
        if (username === 'admin' && password === 'technoprint2024') {
            localStorage.setItem('adminToken', 'owner-session-2024');
            localStorage.setItem('adminUser', JSON.stringify({
                username: 'admin',
                role: 'admin',
                name: 'المالك',
                isAdmin: true,
                isOwner: true,
                isLoggedIn: true
            }));
            window.location.href = 'admin-dashboard.html';
            return; // STOP HERE - NO OTHER CHECKS
        }
        
        // For other users - show error
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
            errorDiv.style.display = 'block';
        }
    });
});