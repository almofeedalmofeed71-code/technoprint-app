// ===== TECHNO-CONTROL ADMIN LOGIN SCRIPT =====

const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginScreen = document.getElementById('loginScreen');

// Check if already logged in
const adminToken = localStorage.getItem('adminToken');
if (adminToken) {
    window.location.href = 'admin-dashboard.html';
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    
    if (!username || !password) {
        showError('الرجاء إدخال اسم المستخدم وكلمة المرور');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUser', JSON.stringify(data.user));
            window.location.href = 'admin-dashboard.html';
        } else {
            showError(data.message || 'بيانات الدخول غير صحيحة');
        }
    } catch (error) {
        // For demo purposes, allow fallback authentication
        if (username === 'admin' && password === 'technoprint2024') {
            localStorage.setItem('adminToken', 'demo-token');
            localStorage.setItem('adminUser', JSON.stringify({ 
                username: 'admin', 
                role: 'super_admin',
                name: 'مدير النظام'
            }));
            window.location.href = 'admin-dashboard.html';
        } else {
            showError('خطأ في الاتصال بالخادم');
        }
    }
});

function showError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
    setTimeout(() => {
        loginError.style.display = 'none';
    }, 5000);
}