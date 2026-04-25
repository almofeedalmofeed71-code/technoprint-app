/**
 * TECHOPRINT 2026 - Direct Supabase Connection (No Server)
 * Connects FRONTEND directly to Supabase - NO LOCALHOST!
 */

(function() {
    // Load Supabase SDK immediately
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = initClient;
    script.onerror = initClient; // Continue even if CDN fails
    document.head.appendChild(script);
})();

// EXACT Supabase Config from User
const SUPABASE_URL = 'https://avabozirwdefwtabywqo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YWJvemlyd2RlZnd0YWJ5d3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjM1NDQsImV4cCI6MjA5MjQzOTU0NH0.boDU0pXR1MGYiJXF1Jos-w0uehKCCZHsKgxHP7nbQVY';

let supabase = null;

function initClient() {
    console.log('🔵 Initializing Supabase connection...');
    console.log('📡 URL:', SUPABASE_URL);
    console.log('🔑 Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
    
    // Check if SDK loaded
    if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase SDK loaded successfully');
        
        // Test connection immediately
        testConnection();
    } else {
        // Fallback: Use REST API directly
        console.log('⚠️ SDK not loaded, using REST API fallback');
        supabase = createRestClient();
    }
}

function createRestClient() {
    // Fallback REST client
    return {
        from: (table) => ({
            select: (cols) => ({
                eq: (col, val) => ({
                    select: async () => {
                        const url = `${SUPABASE_URL}/rest/v1/${table}?${col}=eq.${encodeURIComponent(val)}&select=${cols}`;
                        const res = await fetch(url, {
                            headers: { 
                                'apikey': SUPABASE_ANON_KEY,
                                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                            }
                        });
                        const data = await res.json();
                        return { data, error: res.ok ? null : data };
                    }
                })
            }),
            insert: async (data) => {
                const url = `${SUPABASE_URL}/rest/v1/${table}`;
                const res = await fetch(url, {
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
                return { data: text ? JSON.parse(text) : null, error: res.ok ? null : text };
            }
        })
    };
}

async function testConnection() {
    try {
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        if (error) {
            console.error('❌ Connection test failed:', error);
            alert('❌ فشل الاتصال بالسيرفر');
        } else {
            console.log('✅ Connection SUCCESS! Data:', data);
            alert('✅ الاتصال بالسيرفر ناجح!');
        }
    } catch (err) {
        console.error('❌ Connection error:', err);
    }
}

// Auth Module - Direct Supabase Connection
const Auth = {
    async register(formData) {
        const { username, password, phone, governorate, address, category } = formData;
        
        console.log('🔵 Registration:', formData);
        
        if (!username || !password || !phone || !governorate || !address || !category) {
            alert('❌ جميع الحقول الستة مطلوبة!');
            return false;
        }
        
        try {
            // Check if username exists
            const { data: existing } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', username)
                .maybeSingle();
            
            if (existing) {
                alert('❌ اسم المستخدم موجود!');
                return false;
            }
            
            // Create profile with EXACT column names
            const profile = {
                username: username,
                password: password,
                phone: phone,
                governorate: governorate,
                address: address,
                category: category,
                role: 'user',
                balance_iqd: 0,
                pages_count: 1000,
                status: 'active',
                created_at: new Date().toISOString()
            };
            
            console.log('📤 Inserting:', profile);
            
            const { data, error } = await supabase
                .from('profiles')
                .insert(profile)
                .select()
                .single();
            
            console.log('📥 Result:', data, error);
            
            if (error) {
                alert('❌ فشل التسجيل: ' + error.message);
                return false;
            }
            
            alert('✅ تم إنشاء الحساب بنجاح!\n🎁 هدية: 1000 صفحة مجانية');
            closeModal('registerModal');
            openModal('loginModal');
            return true;
            
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
            const { data: users, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', username)
                .maybeSingle();
            
            if (error) {
                alert('❌ خطأ: ' + error.message);
                return false;
            }
            
            if (!users) {
                alert('❌ المستخدم غير موجود');
                return false;
            }
            
            if (users.password !== password) {
                alert('❌ كلمة المرور غير صحيحة');
                return false;
            }
            
            // Save session
            localStorage.setItem('technoprintSession', JSON.stringify({
                id: users.id,
                username: users.username,
                phone: users.phone,
                governorate: users.governorate,
                address: users.address,
                category: users.category,
                role: users.role || 'user',
                balance_iqd: users.balance_iqd || 0,
                pages_count: users.pages_count || 0
            }));
            
            alert(`🎉 مرحباً ${users.username}!\n💰 الرصيد: ${users.balance_iqd || 0} IQD`);
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

// Init on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ TECHOPRINT 2026 Ready');
    console.log('📡 Connecting to:', SUPABASE_URL);
});