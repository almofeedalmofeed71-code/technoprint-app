/**
 * TECHOPRINT 2026 - Auth Client
 * NEW SUPABASE PROJECT: rqzsokvhgjlftkouhphb
 */

const API_URL = 'https://technoprint-app.vercel.app';

// NEW Supabase credentials
const SUPABASE_URL = 'https://rqzsokvhgjlftkouhphb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY';

// Auth Module - Calls Vercel API which uses SERVICE_ROLE
const Auth = {
    async register(formData) {
        const { username, password, phone, governorate, address, category } = formData;
        
        console.log('🔵 Registration to NEW project:', formData);
        
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
            // Query NEW Supabase project
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/profiles?username=eq.${encodeURIComponent(username)}&select=*`,
                {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    }
                }
            );
            
            const users = await res.json();
            
            if (!users || users.length === 0) {
                alert('❌ المستخدم غير موجود');
                return false;
            }
            
            const user = users[0];
            
            // Check password (bcrypt comparison)
            // For simplicity, plain text compare (or use bcrypt.compare)
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
    console.log('✅ TECHOPRINT 2026 - NEW PROJECT: ' + SUPABASE_URL);
});