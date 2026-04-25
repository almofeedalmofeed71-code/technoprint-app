/**
 * TECHOPRINT 2026 - Auth Client
 * Calls Vercel API routes (which use SERVICE_ROLE_KEY)
 */

const API_URL = 'https://technoprint-app.vercel.app';

// Auth Module - Through Server
const Auth = {
    async register(formData) {
        const { username, password, phone, governorate, address, category } = formData;
        
        console.log('🔵 Registration:', formData);
        
        if (!username || !password || !phone || !governorate || !address || !category) {
            alert('❌ جميع الحقول الستة مطلوبة!');
            return false;
        }
        
        try {
            console.log('📤 Sending to /api/register...');
            
            const res = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, phone, governorate, address, category })
            });
            
            const result = await res.json();
            console.log('📥 Response:', result);
            
            if (result.success) {
                alert('✅ تم إنشاء الحساب بنجاح!\n🎁 هدية: 1000 صفحة مجانية');
                closeModal('registerModal');
                openModal('loginModal');
                return true;
            } else {
                alert('❌ ' + (result.error || 'فشل التسجيل'));
                return false;
            }
        } catch (err) {
            console.error('❌ Error:', err);
            alert('❌ خطأ في الاتصال');
            return false;
        }
    },
    
    async login(username, password) {
        console.log('🔵 Login:', username);
        
        if (!username || !password) {
            alert('❌ أدخل الاسم وكلمة المرور');
            return false;
        }
        
        try {
            // For now, use direct Supabase query for login
            const res = await fetch(
                `https://avabozirwdefwtabywqo.supabase.co/rest/v1/profiles?username=eq.${encodeURIComponent(username)}&select=*`,
                {
                    headers: {
                        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YWJvemlyd2RlZnd0YWJ5d3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjM1NDQsImV4cCI6MjA5MjQzOTU0NH0.boDU0pXR1MGYiJXF1Jos-w0uehKCCZHsKgxHP7nbQVY',
                        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YWJvemlyd2RlZnd0YWJ5d3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjM1NDQsImV4cCI6MjA5MjQzOTU0NH0.boDU0pXR1MGYiJXF1Jos-w0uehKCCZHsKgxHP7nbQVY'
                    }
                }
            );
            
            const users = await res.json();
            
            if (!users || users.length === 0) {
                alert('❌ المستخدم غير موجود');
                return false;
            }
            
            const user = users[0];
            
            if (user.password !== password) {
                alert('❌ كلمة المرور غير صحيحة');
                return false;
            }
            
            // Save session
            localStorage.setItem('technoprintSession', JSON.stringify({
                id: user.id,
                username: user.username,
                phone: user.phone,
                governorate: user.governorate,
                address: user.address,
                category: user.category,
                role: user.role || 'user',
                balance_iqd: user.balance_iqd || 0,
                pages_count: user.pages_count || 0
            }));
            
            alert(`🎉 مرحباً ${user.username}!\n💰 الرصيد: ${user.balance_iqd || 0} IQD`);
            closeModal('loginModal');
            return true;
            
        } catch (err) {
            console.error('❌ Error:', err);
            alert('❌ خطأ في الدخول');
            return false;
        }
    },
    
    isLoggedIn() {
        const s = localStorage.getItem('technoprintSession');
        return s ? JSON.parse(s) : null;
    },
    
    logout() {
        localStorage.removeItem('technoprintSession');
        alert('تم الخروج');
        location.reload();
    }
};

window.Auth = Auth;

// Init
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ TECHOPRINT 2026 Ready');
});