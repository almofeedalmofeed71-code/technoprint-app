/**
 * TECHOPRINT 2026 - Complete Supabase Integration
 * Matches full schema: profiles, orders, transactions
 */

const SUPABASE_URL = 'https://avabozirwdefwtabywqo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YWJvemlyd2RlZnd0YWJ5d3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjM1NDQsImV4cCI6MjA5MjQzOTU0NH0.boDU0pXR1MGYiJXF1Jos-w0uehKCCZHsKgxHP7nbQVY';

// Supabase REST API Helper
async function supabaseRequest(table, method, body, filters = '') {
    const url = `${SUPABASE_URL}/rest/v1/${table}${filters}`;
    
    console.log(`📡 ${method} ${table}:`, body || '');
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': method === 'POST' ? 'return=representation' : ''
            },
            body: body ? JSON.stringify(body) : undefined
        });
        
        const text = await response.text();
        console.log(`📥 Response ${response.status}:`, text.substring(0, 200));
        
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
        
        return { status: response.status, data, error: null };
    } catch (err) {
        console.error('❌ Request error:', err);
        return { status: 0, data: null, error: err.message };
    }
}

// Auth Module
const Auth = {
    // Register - maps to FULL profiles schema
    async register(formData) {
        const { username, password, phone, governorate, address, category } = formData;
        
        console.log('🔵 Registration attempt:', formData);
        
        // Validate all 6 required fields
        if (!username || !password || !phone || !governorate || !address || !category) {
            alert('❌ جميع الحقول الستة مطلوبة!');
            return false;
        }
        
        try {
            // Check if username exists
            const check = await supabaseRequest(
                'profiles',
                'GET',
                null,
                `?username=eq.${encodeURIComponent(username)}&select=id`
            );
            
            if (check.data && check.data.length > 0) {
                alert('❌ اسم المستخدم موجود مسبقاً!');
                return false;
            }
            
            // Create profile with ALL schema columns
            const profileData = {
                username: username,
                password: password,
                phone: phone,
                governorate: governorate,
                address: address,
                category: category,
                role: 'user', // Default role
                balance: 0,
                status: 'active',
                created_at: new Date().toISOString()
            };
            
            console.log('📤 Creating profile:', profileData);
            
            const result = await supabaseRequest('profiles', 'POST', profileData);
            
            if (result.status === 201 || result.status === 200) {
                alert('✅ تم إنشاء الحساب بنجاح!\n🎁 هدية: 1000 صفحة مجانية');
                closeModal('registerModal');
                openModal('loginModal');
                
                // Log to transactions
                await this.logTransaction(result.data?.id || 'new_user', 'welcome_bonus', 1000, 'صفحة', '🎁 هدية تسجيل');
                
                return true;
            } else {
                const errorMsg = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
                alert('❌ فشل التسجيل: ' + errorMsg);
                return false;
            }
        } catch (err) {
            console.error('❌ Registration error:', err);
            alert('❌ خطأ في الاتصال');
            return false;
        }
    },
    
    // Login - maps to FULL profiles schema
    async login(username, password) {
        console.log('🔵 Login attempt:', username);
        
        if (!username || !password) {
            alert('❌ أدخل اسم المستخدم وكلمة المرور');
            return false;
        }
        
        try {
            const result = await supabaseRequest(
                'profiles',
                'GET',
                null,
                `?username=eq.${encodeURIComponent(username)}&select=*`
            );
            
            if (!result.data || result.data.length === 0) {
                alert('❌ المستخدم غير موجود');
                return false;
            }
            
            const user = result.data[0];
            
            // Verify password
            if (user.password !== password) {
                alert('❌ كلمة المرور غير صحيحة');
                return false;
            }
            
            // Store user session
            const session = {
                id: user.id,
                username: user.username,
                phone: user.phone,
                governorate: user.governorate,
                address: user.address,
                category: user.category,
                role: user.role || 'user',
                balance: user.balance || 0,
                status: user.status || 'active'
            };
            
            localStorage.setItem('technoprintSession', JSON.stringify(session));
            
            // Show welcome message
            const roleName = user.role === 'admin' ? 'مدير' : user.role === 'user' ? 'مستخدم' : '';
            alert(`🎉 مرحباً ${user.username}!${roleName ? ` (${roleName})` : ''}\n💰 الرصيد: ${user.balance || 0} IQD`);
            
            closeModal('loginModal');
            
            // If admin, show admin tools
            if (user.role === 'admin') {
                this.showAdminTools();
            }
            
            return true;
        } catch (err) {
            console.error('❌ Login error:', err);
            alert('❌ خطأ في تسجيل الدخول');
            return false;
        }
    },
    
    // Log transaction (for welcome bonus, etc.)
    async logTransaction(userId, type, amount, unit, description) {
        await supabaseRequest('transactions', 'POST', {
            user_id: userId,
            type: type,
            amount: amount,
            unit: unit,
            description: description,
            created_at: new Date().toISOString()
        });
    },
    
    // Show admin tools if logged in as admin
    showAdminTools() {
        const adminBtn = document.getElementById('adminPortalBtn');
        if (adminBtn) adminBtn.style.display = 'block';
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
    // Create new order
    async create(userId, serviceType, serviceName, price) {
        console.log('📦 Creating order:', { userId, serviceType, serviceName, price });
        
        const result = await supabaseRequest('orders', 'POST', {
            user_id: userId,
            service_type: serviceType,
            service_name: serviceName,
            price: price || 0,
            status: 'pending',
            created_at: new Date().toISOString()
        });
        
        if (result.status === 201 || result.status === 200) {
            alert('✅ تم تقديم الطلب بنجاح!');
            return true;
        } else {
            alert('❌ فشل الطلب: ' + JSON.stringify(result.data));
            return false;
        }
    },
    
    // Get user orders
    async getUserOrders(userId) {
        const result = await supabaseRequest(
            'orders',
            'GET',
            null,
            `?user_id=eq.${userId}&order=created_at.desc`
        );
        
        return result.data || [];
    },
    
    // Get all orders (admin only)
    async getAllOrders() {
        const result = await supabaseRequest(
            'orders',
            'GET',
            null,
            '?order=created_at.desc'
        );
        
        return result.data || [];
    },
    
    // Update order status
    async updateStatus(orderId, newStatus) {
        const result = await supabaseRequest(
            'orders',
            'PATCH',
            { status: newStatus, updated_at: new Date().toISOString() },
            `?id=eq.${orderId}`
        );
        
        return result.status === 200 || result.status === 204;
    }
};

// Wallet Module
const Wallet = {
    // Get balance
    async getBalance(userId) {
        const result = await supabaseRequest(
            'profiles',
            'GET',
            null,
            `?id=eq.${userId}&select=balance`
        );
        
        return result.data?.[0]?.balance || 0;
    },
    
    // Add funds (deposit)
    async deposit(userId, amount) {
        const current = await this.getBalance(userId);
        const newBalance = current + amount;
        
        const result = await supabaseRequest(
            'profiles',
            'PATCH',
            { balance: newBalance },
            `?id=eq.${userId}`
        );
        
        if (result.status === 200 || result.status === 204) {
            // Log transaction
            await supabaseRequest('transactions', 'POST', {
                user_id: userId,
                type: 'deposit',
                amount: amount,
                description: 'إيداع رصيد',
                created_at: new Date().toISOString()
            });
            
            alert('✅ تم إيداع ' + amount + ' IQD');
            return true;
        }
        
        return false;
    },
    
    // Withdraw
    async withdraw(userId, amount) {
        const current = await this.getBalance(userId);
        
        if (current < amount) {
            alert('❌ الرصيد غير كافي!');
            return false;
        }
        
        const newBalance = current - amount;
        
        const result = await supabaseRequest(
            'profiles',
            'PATCH',
            { balance: newBalance },
            `?id=eq.${userId}`
        );
        
        if (result.status === 200 || result.status === 204) {
            await supabaseRequest('transactions', 'POST', {
                user_id: userId,
                type: 'withdraw',
                amount: -amount,
                description: 'سحب رصيد',
                created_at: new Date().toISOString()
            });
            
            alert('✅ تم سحب ' + amount + ' IQD');
            return true;
        }
        
        return false;
    }
};

// Make available globally
window.Auth = Auth;
window.Orders = Orders;
window.Wallet = Wallet;

// Load session on page load
document.addEventListener('DOMContentLoaded', () => {
    const user = Auth.isLoggedIn();
    if (user) {
        console.log('✅ User logged in:', user.username);
        
        if (user.role === 'admin') {
            Auth.showAdminTools();
        }
    }
});