/**
 * TECHOPRINT 2026 - Supabase Browser Client
 * Uses @supabase/supabase-js for browser with Realtime enabled
 */

// Load Supabase JS SDK
(function() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = initSupabase;
    document.head.appendChild(script);
})();

// Supabase Config - EXACT VALUES FROM USER
const SUPABASE_URL = 'https://avabozirwdefwtabywqo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YWJvemlyd2RlZnd0YWJ5d3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjM1NDQsImV4cCI6MjA5MjQzOTU0NH0.boDU0pXR1MGYiJXF1Jos-w0uehKCCZHsKgxHP7nbQVY';

let supabase = null;

function initSupabase() {
    console.log('🔵 Initializing Supabase client...');
    
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            storageKey: 'technoprintSession'
        },
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    });
    
    console.log('✅ Supabase client initialized');
    console.log('📡 URL:', SUPABASE_URL);
    console.log('🔑 Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
    
    // Test connection
    testConnection();
    
    // Initialize Auth after client is ready
    initAuth();
}

async function testConnection() {
    try {
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        if (error) {
            console.error('❌ Connection test failed:', error);
        } else {
            console.log('✅ Connection to Supabase SUCCESS!');
            console.log('📊 Test query result:', data);
        }
    } catch (err) {
        console.error('❌ Connection error:', err);
    }
}

// Auth Module - using official Supabase client
const Auth = {
    // Register - EXACT column names
    async register(formData) {
        const { username, password, phone, governorate, address, category } = formData;
        
        console.log('🔵 Registration attempt:', formData);
        
        // Wait for client to be ready
        if (!supabase) {
            alert('❌ جاري تحميل الاتصال... حاول مرة أخرى');
            return false;
        }
        
        // Validate all 6 required fields
        if (!username || !password || !phone || !governorate || !address || !category) {
            alert('❌ جميع الحقول الستة مطلوبة!');
            return false;
        }
        
        try {
            // Check if username exists
            const { data: existing } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', username);
            
            if (existing && existing.length > 0) {
                alert('❌ اسم المستخدم موجود مسبقاً!');
                return false;
            }
            
            // Create profile with EXACT column names
            const profileData = {
                username: username,
                password: password,
                phone: phone,
                governorate: governorate,
                address: address,
                category: category,
                role: 'user',
                balance_iqd: 0,
                pages_count: 1000,
                status: 'active'
            };
            
            console.log('📤 Creating profile:', profileData);
            
            const { data, error } = await supabase
                .from('profiles')
                .insert(profileData)
                .select()
                .single();
            
            console.log('📥 Insert result:', data, error);
            
            if (error) {
                alert('❌ فشل التسجيل: ' + error.message);
                console.error('Registration error:', error);
                return false;
            }
            
            alert('✅ تم إنشاء الحساب بنجاح!\n🎁 هدية: 1000 صفحة مجانية');
            closeModal('registerModal');
            openModal('loginModal');
            return true;
            
        } catch (err) {
            console.error('❌ Registration error:', err);
            alert('❌ خطأ في الاتصال');
            return false;
        }
    },
    
    // Login - EXACT column names
    async login(username, password) {
        console.log('🔵 Login attempt:', username);
        
        if (!username || !password) {
            alert('❌ أدخل اسم المستخدم وكلمة المرور');
            return false;
        }
        
        if (!supabase) {
            alert('❌ جاري تحميل الاتصال... حاول مرة أخرى');
            return false;
        }
        
        try {
            const { data: users, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', username);
            
            if (error) {
                alert('❌ خطأ: ' + error.message);
                return false;
            }
            
            if (!users || users.length === 0) {
                alert('❌ المستخدم غير موجود');
                return false;
            }
            
            const user = users[0];
            
            // Verify password
            if (user.password !== password) {
                alert('❌ كلمة المرور غير صحيحة');
                return false;
            }
            
            // Store session
            const session = {
                id: user.id,
                username: user.username,
                phone: user.phone,
                governorate: user.governorate,
                address: user.address,
                category: user.category,
                role: user.role || 'user',
                balance_iqd: user.balance_iqd || 0,
                pages_count: user.pages_count || 0,
                status: user.status || 'active'
            };
            
            localStorage.setItem('technoprintSession', JSON.stringify(session));
            
            // Show welcome message
            const roleName = user.role === 'admin' ? 'مدير' : user.role === 'user' ? 'مستخدم' : '';
            alert(`🎉 مرحباً ${user.username}!${roleName ? ` (${roleName})` : ''}\n💰 الرصيد: ${user.balance_iqd || 0} IQD\n📄 الصفحات: ${user.pages_count || 0}`);
            
            closeModal('loginModal');
            
            // If admin, show admin tools
            if (user.role === 'admin') {
                const adminBtn = document.getElementById('adminPortalBtn');
                if (adminBtn) adminBtn.style.display = 'block';
            }
            
            return true;
            
        } catch (err) {
            console.error('❌ Login error:', err);
            alert('❌ خطأ في تسجيل الدخول');
            return false;
        }
    },
    
    // Check login status
    isLoggedIn() {
        const session = localStorage.getItem('technoprintSession');
        return session ? JSON.parse(session) : null;
    },
    
    // Logout
    logout() {
        localStorage.removeItem('technoprintSession');
        alert('تم تسجيل الخروج');
        location.reload();
    },
    
    // Get current user
    getUser() {
        return this.isLoggedIn();
    }
};

// Order Module
const Orders = {
    async create(userId, cardType, cardName, price) {
        console.log('📦 Creating order:', { userId, cardType, cardName, price });
        
        if (!supabase) {
            alert('❌ جاري تحميل الاتصال...');
            return false;
        }
        
        const { error } = await supabase.from('orders').insert({
            user_id: userId,
            card_type: cardType,
            card_name: cardName,
            price: price || 0,
            status: 'pending'
        });
        
        if (error) {
            alert('❌ فشل الطلب: ' + error.message);
            return false;
        }
        
        alert('✅ تم تقديم الطلب بنجاح!');
        return true;
    }
};

// Make available globally
window.Auth = Auth;
window.Orders = Orders;

// Initialize Auth when session is ready
function initAuth() {
    const user = Auth.isLoggedIn();
    if (user) {
        console.log('✅ User logged in:', user.username);
        
        if (user.role === 'admin') {
            const adminBtn = document.getElementById('adminPortalBtn');
            if (adminBtn) adminBtn.style.display = 'block';
        }
    }
}