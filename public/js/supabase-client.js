/**
 * TECHOPRINT 2026 - Supabase Client-Side Integration
 * Uses ANON key directly from browser (RLS disabled)
 */

const SUPABASE_URL = 'https://avabozirwdefwtabywqo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YWJvemlyd2RlZnd0YWJ5d3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjM1NDQsImV4cCI6MjA5MjQzOTU0NH0.boDU0pXR1MGYiJXF1Jos-w0uehKCCZHsKgxHP7nbQVY';

// Simplified Supabase REST API client
const supabase = {
    from: (table) => ({
        select: (columns = '*') => ({
            eq: (col, val) => ({
                select: async () => {
                    const res = await fetch(
                        `${SUPABASE_URL}/rest/v1/${table}?${col}=eq.${encodeURIComponent(val)}&select=${columns}`,
                        {
                            headers: {
                                'apikey': SUPABASE_ANON_KEY,
                                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                            }
                        }
                    );
                    return { data: await res.json(), error: null };
                }
            })
        }),
        insert: async (data) => {
            try {
                const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(data)
                });
                
                const text = await res.text();
                console.log('📥 Supabase Response:', res.status, text.substring(0, 300));
                
                if (res.status === 201 || res.status === 200) {
                    return { data: JSON.parse(text), error: null };
                } else {
                    return { data: null, error: text };
                }
            } catch (err) {
                console.error('❌ Supabase Error:', err);
                return { data: null, error: err.message };
            }
        }
    })
};

// Auth module
const Auth = {
    API_URL: '/api/auth',
    user: null,
    
    // Register with 6 mandatory fields - DIRECT SUPABASE
    async register(data) {
        const { username, password, phone, governorate, address, category } = data;
        
        console.log('🔵 Registration attempt:', data);
        
        if (!username || !password || !phone || !governorate || !address || !category) {
            alert('❌ جميع الحقول المطلوبة: المستخدم، كلمة المرور، الهاتف، المحافظة، العنوان، الفئة');
            return false;
        }
        
        try {
            // First check if username exists
            const { data: existing } = await supabase.from('profiles').select('id').eq('username', username);
            
            if (existing && existing.length > 0) {
                alert('❌ اسم المستخدم موجود مسبقاً!');
                return false;
            }
            
            // Create new profile
            const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            const profileData = {
                id: userId,
                username: username,
                full_name: username,
                password: password,
                phone: phone,
                address: address,
                governorate: governorate,
                category: category,
                balance_iqd: 0,
                pages_count: 1000,
                status: 'active',
                created_at: new Date().toISOString()
            };
            
            console.log('📤 Inserting profile:', profileData);
            
            const result = await supabase.from('profiles').insert(profileData);
            
            if (result.error) {
                alert('❌ خطأ في إنشاء الحساب: ' + result.error);
                console.error('Registration failed:', result.error);
                return false;
            }
            
            alert('✅ تم إنشاء الحساب بنجاح!\n🎁 هدية تسجيل: 1000 صفحة مجانية');
            closeModal('registerModal');
            openModal('loginModal');
            return true;
            
        } catch (err) {
            console.error('❌ Registration error:', err);
            alert('❌ خطأ في الاتصال: ' + err.message);
            return false;
        }
    },
    
    // Login using USERNAME - DIRECT SUPABASE
    async login(username, password) {
        console.log('🔵 Login attempt for:', username);
        
        if (!username || !password) {
            alert('❌ الرجاء إدخال اسم المستخدم وكلمة المرور');
            return false;
        }
        
        try {
            const { data: users } = await supabase.from('profiles').select('*').eq('username', username);
            
            if (!users || users.length === 0) {
                alert('❌ المستخدم غير موجود');
                return false;
            }
            
            const user = users[0];
            
            if (user.password !== password) {
                alert('❌ كلمة المرور غير صحيحة');
                return false;
            }
            
            // Store in localStorage
            localStorage.setItem('technoprintUser', JSON.stringify({
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                phone: user.phone,
                balance: user.balance_iqd || 0,
                pages: user.pages_count || 0,
                governorate: user.governorate,
                category: user.category
            }));
            
            alert('🎉 مرحباً ' + user.full_name + '!\n💰 الرصيد: ' + (user.balance_iqd || 0) + ' IQD\n📄 الصفحات: ' + (user.pages_count || 0));
            
            closeModal('loginModal');
            Auth.updateUI();
            
            return true;
            
        } catch (err) {
            console.error('❌ Login error:', err);
            alert('❌ خطأ في الاتصال: ' + err.message);
            return false;
        }
    },
    
    // Update wallet display
    updateUI() {
        const user = Auth.isLoggedIn();
        if (user) {
            const balanceEl = document.getElementById('headerBalance');
            if (balanceEl) {
                balanceEl.textContent = (user.balance || 0).toLocaleString() + ' IQD';
            }
        }
    },
    
    // Check if logged in
    isLoggedIn() {
        const stored = localStorage.getItem('technoprintUser');
        return stored ? JSON.parse(stored) : null;
    },
    
    // Logout
    logout() {
        localStorage.removeItem('technoprintUser');
        alert('تم تسجيل الخروج');
        location.reload();
    }
};

window.Auth = Auth;

// Load user on page load
document.addEventListener('DOMContentLoaded', () => {
    const user = Auth.isLoggedIn();
    if (user) {
        Auth.updateUI();
    }
});