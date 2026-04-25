/* TECHOPRINT 2026 - ENG AUTH */
/* Direct Supabase connection via server.js */

const Auth = {
    // Register with 6 mandatory fields
    async register(data) {
        const { username, password, phone, governorate, address, category } = data;
        
        console.log('🔵 Registration attempt:', data);
        
        if (!username || !password || !phone || !governorate || !address || !category) {
            alert('جميع الحقول المطلوبة: المستخدم، كلمة المرور، الهاتف، المحافظة، العنوان، الفئة');
            return false;
        }
        
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, phone, governorate, address, category })
            });
            
            const result = await res.json();
            console.log('📥 Server response:', result);
            
            if (result.success) {
                alert('تم إنشاء الحساب بنجاح! 🎉');
                // Close register modal and show login
                closeModal('registerModal');
                openModal('loginModal');
                return true;
            } else {
                alert(result.error || 'فشل في إنشاء الحساب');
                console.error('Registration failed:', result.error);
                return false;
            }
        } catch (err) {
            console.error('❌ Register error:', err);
            alert('خطأ في الاتصال - تأكد من الإنترنت');
            return false;
        }
    },
    
    // Login using USERNAME (no email)
    async login(username, password) {
        console.log('🔵 Login attempt for:', username);
        
        if (!username || !password) {
            alert('الرجاء إدخال اسم المستخدم وكلمة المرور');
            return false;
        }
        
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const result = await res.json();
            console.log('📥 Login response:', result);
            
            if (result.success && result.user) {
                // Store user in localStorage
                localStorage.setItem('technoprintUser', JSON.stringify(result.user));
                
                // Update wallet display
                this.updateWallet(result.user);
                
                // Close modal and redirect
                closeModal('loginModal');
                alert('مرحباً ' + result.user.full_name + '! 🎉');
                return true;
            } else {
                alert(result.error || 'فشل في تسجيل الدخول');
                return false;
            }
        } catch (err) {
            console.error('❌ Login error:', err);
            alert('خطأ في الاتصال');
            return false;
        }
    },
    
    // Update wallet display from stored user
    updateWallet(user) {
        if (!user) {
            const stored = localStorage.getItem('technoprintUser');
            user = stored ? JSON.parse(stored) : null;
        }
        
        if (user) {
            // Update header balance
            const balanceEl = document.getElementById('headerBalance');
            if (balanceEl) {
                balanceEl.textContent = (user.balance || 0).toLocaleString() + ' IQD';
            }
            
            // Update wallet modal if open
            const walletBalance = document.getElementById('walletBalance');
            if (walletBalance) {
                walletBalance.textContent = (user.balance || 0).toLocaleString() + ' IQD';
            }
            
            const walletPages = document.getElementById('walletPages');
            if (walletPages) {
                walletPages.textContent = (user.pages || 0).toLocaleString() + ' صفحة';
            }
        }
    },
    
    // Check if user is logged in
    isLoggedIn() {
        const stored = localStorage.getItem('technoprintUser');
        return stored ? JSON.parse(stored) : null;
    },
    
    // Logout
    logout() {
        localStorage.removeItem('technoprintUser');
        alert('تم تسجيل الخروج');
        location.reload();
    },
    
    // Get current user
    getUser() {
        return this.isLoggedIn();
    }
};

window.Auth = Auth;

// Load user on page load
document.addEventListener('DOMContentLoaded', () => {
    const user = Auth.isLoggedIn();
    if (user) {
        Auth.updateWallet(user);
    }
});