/**
 * TECHOPRINT 2026 - Auth Client v2.0
 * Professional Registration & Login with Validation
 * NEW SUPABASE PROJECT: rqzsokvhgjlftkouhphb
 */

const API_URL = 'https://technoprint-app.vercel.app';

// NEW Supabase credentials
const SUPABASE_URL = 'https://rqzsokvhgjlftkouhphb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY';

// Auth Module - Clean Professional Code
const Auth = {
    // Validate phone number (must start with 7)
    validatePhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (!cleaned.startsWith('7')) {
            alert('❌ الرقم يجب أن يبدأ بـ 7');
            return false;
        }
        return true;
    },
    
    // Register with professional validation
    async register(formData) {
        const { username, password, phone, governorate, address, category } = formData;
        
        console.log('🔵 Registration:', formData);
        
        // Validate all 6 required fields
        if (!username || !password || !phone || !governorate || !address || !category) {
            alert('❌ جميع الحقول مطلوبة!');
            return false;
        }
        
        // Validate phone starts with 7
        if (!this.validatePhone(phone)) {
            return false;
        }
        
        try {
            // Send to server (api/register.js uses SERVICE_ROLE_KEY)
            const res = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, phone, governorate, address, category })
            });
            
            const result = await res.json();
            console.log('📥 Response:', result);
            
            if (result.success) {
                // ✅ SUCCESS - IMMEDIATELY save to localStorage and redirect!
                alert('✅ تم إنشاء الحساب بنجاح!\n🎁 هدية: 1000 صفحة مجانية\n🎉 جاري الدخول تلقائياً...');
                
                // Save session IMMEDIATELY (no need for re-login)
                const session = {
                    id: result.user?.id || crypto.randomUUID(),
                    username: username,
                    phone: phone,
                    governorate: governorate,
                    address: address,
                    category: category,
                    role: 'user',
                    balance_iqd: 0,
                    pages_count: 1000
                };
                
                localStorage.setItem('technoprintSession', JSON.stringify(session));
                console.log('✅ Session saved:', session);
                
                // Close modal and redirect
                closeModal('registerModal');
                this.redirectToDashboard();
                
                return true;
            } else {
                // ❌ Check for duplicate (username or phone)
                if (result.error && result.error.includes('exists')) {
                    alert('❌ هذا المستخدم أو الرقم مسجل مسبقاً');
                } else {
                    alert('❌ ' + (result.error || 'فشل التسجيل'));
                }
                return false;
            }
        } catch (err) {
            console.error('❌ Error:', err);
            alert('❌ خطأ في الاتصال');
            return false;
        }
    },
    
    // Login with username (type="text" already set in HTML)
    async login(username, password) {
        console.log('🔵 Login:', username);
        
        if (!username || !password) {
            alert('❌ أدخل اسم المستخدم وكلمة المرور');
            return false;
        }
        
        try {
            // Query Supabase directly
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
            
            // Verify password (bcrypt comparison would be better, but keeping simple for now)
            if (user.password !== password) {
                alert('❌ كلمة المرور غير صحيحة');
                return false;
            }
            
            // Save session to localStorage
            const session = {
                id: user.id,
                username: user.username,
                phone: user.phone,
                governorate: user.governorate,
                address: user.address,
                category: user.category,
                role: user.role || 'user',
                balance_iqd: user.balance_iqd || 0,
                pages_count: user.pages_count || 0
            };
            
            localStorage.setItem('technoprintSession', JSON.stringify(session));
            
            alert(`🎉 مرحباً ${user.username}!\n💰 الرصيد: ${user.balance_iqd || 0} IQD\n📄 الصفحات: ${user.pages_count || 0}`);
            
            closeModal('loginModal');
            
            // Redirect to dashboard
            this.redirectToDashboard();
            
            return true;
            
        } catch (err) {
            console.error('❌ Error:', err);
            alert('❌ خطأ في الدخول');
            return false;
        }
    },
    
    // Redirect to dashboard after successful login
    redirectToDashboard() {
        console.log('✅ Redirecting to dashboard...');
        // Show user dashboard section
        const dashboardSection = document.getElementById('dashboardSection');
        if (dashboardSection) {
            // Hide all sections first
            document.querySelectorAll('.dashboard-section').forEach(s => s.style.display = 'none');
            // Show dashboard
            dashboardSection.style.display = 'block';
        }
        // Update header to show logged in state
        this.updateHeaderState();
    },
    
    // Update header based on login state
    updateHeaderState() {
        const user = this.isLoggedIn();
        if (user) {
            const adminBtn = document.getElementById('adminPortalBtn');
            if (adminBtn && user.role === 'admin') {
                adminBtn.style.display = 'block';
            }
        }
    },
    
    // Check if logged in
    isLoggedIn() {
        const s = localStorage.getItem('technoprintSession');
        return s ? JSON.parse(s) : null;
    },
    
    // Fetch fresh user profile from Supabase
    async fetchUserProfile() {
        const session = this.isLoggedIn();
        if (!session || !session.id) {
            console.log('❌ No session to fetch profile');
            return null;
        }
        
        try {
            console.log('📤 Fetching profile for user:', session.id);
            
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/profiles?id=eq.${session.id}&select=*`,
                {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    }
                }
            );
            
            const users = await res.json();
            
            if (!users || users.length === 0) {
                console.log('❌ User not found in database');
                return null;
            }
            
            const user = users[0];
            console.log('📥 Profile fetched:', user);
            
            // Update localStorage with fresh data
            const updatedSession = {
                id: user.id,
                username: user.username,
                phone: user.phone,
                governorate: user.governorate,
                address: user.address,
                category: user.category,
                role: user.role || 'user',
                balance_iqd: user.balance_iqd || 0,
                pages_count: user.pages_count || 0
            };
            
            localStorage.setItem('technoprintSession', JSON.stringify(updatedSession));
            
            // Update UI
            this.updateDashboardUI(updatedSession);
            
            return updatedSession;
            
        } catch (err) {
            console.error('❌ Error fetching profile:', err);
            return null;
        }
    },
    
    // Update dashboard UI with user data
    updateDashboardUI(user) {
        // Update balance
        const balanceEl = document.getElementById('userBalance');
        if (balanceEl) balanceEl.textContent = `${user.balance_iqd || 0} IQD`;
        
        // Update pages
        const pagesEl = document.getElementById('userPages');
        if (pagesEl) pagesEl.textContent = `${user.pages_count || 0}`;
        
        // Update category
        const categoryEl = document.getElementById('userCategory');
        if (categoryEl) categoryEl.textContent = user.category || 'مستخدم';
        
        // Update username
        const usernameEl = document.getElementById('userName');
        if (usernameEl) usernameEl.textContent = user.username;
        
        console.log('✅ Dashboard UI updated');
    },
    
    // Logout
    logout() {
        localStorage.removeItem('technoprintSession');
        alert('تم الخروج');
        location.reload();
    }
};

window.Auth = Auth;

// Init on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ TECHOPRINT 2026 v2.0 - Professional Auth Ready');
    
    // Check if user is already logged in
    const user = Auth.isLoggedIn();
    if (user) {
        console.log('✅ User logged in:', user.username);
        Auth.updateHeaderState();
        
        // Fetch fresh profile from Supabase on page load
        await Auth.fetchUserProfile();
    }
});
