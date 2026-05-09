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
            localStorage.setItem('technoprintSessionExpiry', 
                Date.now() + (7 * 24 * 60 * 60 * 1000));
            
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
        const expiry = localStorage.getItem('technoprintSessionExpiry');
        if (!s) return null;
        if (expiry && Date.now() > parseInt(expiry)) {
            localStorage.removeItem('technoprintSession');
            localStorage.removeItem('technoprintSessionExpiry');
            return null;
        }
        localStorage.setItem('technoprintSessionExpiry',
            Date.now() + (7 * 24 * 60 * 60 * 1000));
        try { return JSON.parse(s); } catch(e) { return null; }
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

// ══════════════════════════════════════════════
//  DATABASE OBJECT — Live Supabase data
// ══════════════════════════════════════════════
const DB = {

  async getServices() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/services?status=eq.active&order=order_index.asc&select=*`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      const data = await res.json();
      console.log('✅ services loaded:', data.length);
      return data || [];
    } catch(e) { console.warn('⚠️ getServices:', e); return []; }
  },

  async getSettings() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/app_settings?select=key,value`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      const rows = await res.json();
      const map = {};
      (rows || []).forEach(function(r) {
        // --- التعديل المطلوب هنا ---
        map[r.key] = String(r.value ?? '').replace(/^"|"$/g, '');
      });
      console.log('✅ settings loaded:', Object.keys(map).length);
      return map;
    } catch(e) { console.warn('⚠️ getSettings:', e); return {}; }
  },

  async getAds() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/ads?is_active=eq.true&order=created_at.desc&select=*`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      const data = await res.json();
      console.log('✅ ads loaded:', data.length);
      return data || [];
    } catch(e) { console.warn('⚠️ getAds:', e); return []; }
  },

  async getNotifications() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/notifications?order=created_at.desc&limit=10&select=*`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      return await res.json() || [];
    } catch(e) { return []; }
  },

  async refreshUserBalance() {
    const session = Auth.isLoggedIn();
    if (!session?.id) return;
    const fresh = await Auth.fetchUserProfile();
    if (fresh) Auth.updateDashboardUI(fresh);
  },

  applySettings(settings) {
    if (!settings || !Object.keys(settings).length) return;

    // ① اسم التطبيق
    const appName = settings['app_name'];
    if (appName) {
      document.title = appName;
      document.querySelectorAll('.brand-name').forEach(el => el.textContent = appName);
    }

    // ② رسالة الترحيب
    const welcome = settings['welcome_message'];
    if (welcome) {
      document.querySelectorAll('.welcome-message, #welcomeMessage, [data-welcome]')
        .forEach(el => el.textContent = welcome);
    }

    // ③ اللون الذهبي
    const gold = settings['app_color_gold'];
    if (gold) {
      document.documentElement.style.setProperty('--gold-color', gold);
      document.documentElement.style.setProperty('--admin-gold', gold);
    }

    // ④ وضع الصيانة
    if (settings['maintenance_mode'] === 'true') {
      document.body.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                    height:100vh;background:#000;color:#D4AF37;font-family:Amiri,serif;text-align:center;padding:20px;">
          <p style="font-size:64px;margin:0;">🔧</p>
          <h2 style="font-size:28px;margin:15px 0;">النظام تحت الصيانة</h2>
          <p style="color:#888;font-size:16px;">${settings['working_hours'] || 'سنعود قريباً'}</p>
          <p style="color:#555;font-size:13px;margin-top:20px;">${settings['contact_phone'] || ''}</p>
        </div>`;
      return;
    }

    // ⑤ إخفاء زر التسجيل
    if (settings['registration_open'] === 'false') {
      document.querySelectorAll('.register-btn, [onclick*="registerModal"]')
        .forEach(el => el.style.display = 'none');
    }

    // ⑥ تعطيل الطلبات
    if (settings['orders_enabled'] === 'false') {
      document.querySelectorAll('#submitOrderBtn, [onclick*="submitOrder"]')
        .forEach(el => {
          el.disabled = true;
          el.textContent = '🚫 الطلبات متوقفة مؤقتاً';
          el.style.opacity = '0.5';
        });
    }

    // ⑦ رقم التواصل
    const phone = settings['contact_phone'];
    if (phone) document.querySelectorAll('.contact-phone, [data-phone]')
      .forEach(el => el.textContent = phone);

    // ⑧ العنوان
    const address = settings['contact_address'];
    if (address) document.querySelectorAll('.contact-address, [data-address]')
      .forEach(el => el.textContent = address);

    // ⑨ ساعات العمل
    const hours = settings['working_hours'];
    if (hours) document.querySelectorAll('.working-hours, [data-hours]')
      .forEach(el => el.textContent = hours);

    // ⑩ نص الفوتر
    const footer = settings['footer_text'];
    if (footer) document.querySelectorAll('.footer-text, [data-footer]')
      .forEach(el => el.textContent = footer);

    // ⑪ تحديث الأسعار في فورم الطلب
    const priceMap = {
      'price_a4_black': ['priceA4Black', 'A4 أسود'],
      'price_a4_color': ['priceA4Color', 'A4 ملون'],
      'price_a3_black': ['priceA3Black', 'A3 أسود'],
      'price_a3_color': ['priceA3Color', 'A3 ملون'],
      'price_scan':     ['priceScan',    'تصوير'],
      'price_binding':  ['priceBinding', 'تجليد']
    };
    Object.entries(priceMap).forEach(([key, [elId]]) => {
      const val = settings[key];
      if (val) {
        const el = document.getElementById(elId);
        if (el) el.textContent = parseInt(val).toLocaleString('ar-IQ');
      }
    });

    // ⑫ تحديث خيارات select الطباعة
    const printType = document.getElementById('printType');
    if (printType && settings['price_a4_black']) {
      const opts = printType.querySelectorAll('option');
      opts.forEach(opt => {
        if (opt.value === 'A4_black') opt.textContent = `🖨️ A4 أسود — ${parseInt(settings['price_a4_black']).toLocaleString('ar-IQ')} IQD`;
        if (opt.value === 'A4_color') opt.textContent = `🌈 A4 ملون — ${parseInt(settings['price_a4_color'] || 500).toLocaleString('ar-IQ')} IQD`;
        if (opt.value === 'A3_black') opt.textContent = `📋 A3 أسود — ${parseInt(settings['price_a3_black'] || 500).toLocaleString('ar-IQ')} IQD`;
        if (opt.value === 'A3_color') opt.textContent = `🎨 A3 ملون — ${parseInt(settings['price_a3_color'] || 1000).toLocaleString('ar-IQ')} IQD`;
      });
    }

    console.log('✅ All settings applied to UI');
  },

  async showNotifications() {
    const notes = await this.getNotifications();
    if (!notes.length) return;
    
    // عرض آخر إشعار كـ alert
    const latest = notes[0];
    const seen = localStorage.getItem('lastNotif_' + latest.id);
    if (!seen) {
      localStorage.setItem('lastNotif_' + latest.id, '1');
      
      // عرض popup للمستخدم
      var popup = document.createElement('div');
      popup.style.cssText = 'position:fixed;top:20px;right:20px;left:20px;background:#1a1a00;border:2px solid #D4AF37;border-radius:15px;padding:20px;z-index:99999;font-family:Amiri,serif;text-align:center;box-shadow:0 8px 32px rgba(212,175,55,0.3);';
      popup.innerHTML = '<div style="color:#D4AF37;font-size:20px;margin-bottom:10px;">📢 ' + (latest.title||'') + '</div><div style="color:#ccc;font-size:16px;margin-bottom:15px;">' + (latest.message||'') + '</div><button onclick="this.parentElement.remove()" style="background:#D4AF37;color:#000;border:none;padding:10px 30px;border-radius:8px;font-family:Amiri,serif;font-size:16px;cursor:pointer;">حسناً ✓</button>';
      document.body.appendChild(popup);
      
      // إغلاق تلقائي بعد 10 ثوان
      setTimeout(function() { if(popup.parentElement) popup.remove(); }, 10000);
    }
  },

  // تطبيق الخدمات على كل مكان في التطبيق
  applyServices(services) {
    if (!services?.length) return;
    window.LIVE_SERVICES = services;

    // تحديث شبكة الخدمات في بوابة الطالب
    const grid = document.getElementById('studentServicesGrid');
    if (grid) {
      grid.innerHTML = services.map(s => `
        <div class="glass-card" style="padding:12px;text-align:center;cursor:pointer;"
             onclick="StudentPortal && StudentPortal.selectService('${s.name}')">
          <p style="font-size:26px;margin:0;">${s.icon || '📄'}</p>
          <p style="color:#D4AF37;margin:5px 0;font-size:13px;font-weight:bold;">${s.name}</p>
          <p style="color:#2ecc71;margin:0;font-size:12px;">${parseInt(s.price || 0).toLocaleString('ar-IQ')} IQD</p>
        </div>
      `).join('');
    }
  },

  // تطبيق الإعلانات على السلايدر
  applyAds(ads) {
    if (!ads?.length) { console.warn('⚠️ No ads'); return; }
    window.LIVE_ADS = ads;

    const container = document.querySelector('.slider-container');
    if (!container) return;

    container.innerHTML = ads.map((ad, i) => `
      <div class="slide" ${i === 0 ? 'style="display:grid;"' : ''}>
        <div class="slide-block" style="grid-column:span 3;position:relative;">
          <div class="slide-placeholder" id="placeholder_${i}"></div>
          <img
            data-src="${ad.image_url || ''}"
            alt="${ad.title || 'إعلان'}"
            style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.6s ease;"
            onload="this.style.opacity='1';document.getElementById('placeholder_${i}')?.remove();"
            onerror="this.src='https://picsum.photos/1200/600?random=${i+10}';this.style.opacity='0.5';">
        </div>
      </div>
    `).join('');

    // Lazy load images
    container.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
    });

    // Update dots
    const dotsEl = document.querySelector('.slide-nav');
    if (dotsEl) {
      dotsEl.innerHTML = ads.map((_,i) =>
        `<div class="slider-dot ${i===0?'active':''}"></div>`
      ).join('');
    }

    if (window.initSlider) initSlider();
    console.log('✅ Ads slider updated:', ads.length, 'ads');
  },

  // مراقبة التغييرات في الوقت الحقيقي
  startLiveSync() {
    const ANON_KEY = SUPABASE_ANON_KEY;
    const SUPA_URL = SUPABASE_URL;

    // تحديث كل 30 ثانية
    setInterval(async () => {
      try {
        const [settings, services, ads] = await Promise.all([
          this.getSettings(),
          this.getServices(),
          this.getAds()
        ]);
        window.LIVE_SETTINGS = settings;
        this.applySettings(settings);
        this.applyServices(services);
        this.applyAds(ads);

        // تحديث رصيد المستخدم
        const user = Auth.isLoggedIn();
        if (user?.id) await this.refreshUserBalance();

        // فحص إشعارات جديدة
        await this.showNotifications();

      } catch(e) { console.warn('LiveSync error:', e); }
    }, 30000); // كل 30 ثانية

    console.log('✅ Live sync started — updates every 30s');
  }
};

window.DB = DB;

// Init on page load
document.addEventListener('DOMContentLoaded', async function() {
    // تمديد الجلسة تلقائيا
    const session = Auth.isLoggedIn();
    if (session) {
        setInterval(async () => {
            await Auth.fetchUserProfile();
        }, 30 * 60 * 1000);
        console.log('✅ Session active:', session.username);
    }
    
    console.log('✅ TECHOPRINT 2026 v2.0 - Professional Auth Ready');
    
    // Check if user is already logged in
    const user = Auth.isLoggedIn();
    if (user) {
        console.log('✅ User logged in:', user.username);
        Auth.updateHeaderState();
        
        // Fetch fresh profile from Supabase on page load
        await Auth.fetchUserProfile();
    }

    // تحميل البيانات الحية من السيرفر
    const services = await DB.getServices();
    const settings = await DB.getSettings();
    const ads = await DB.getAds();

    // تطبيق الإعدادات على الواجهة
    DB.applySettings(settings);

    // حفظ البيانات عاملية للملفات الأخرى
    window.LIVE_SERVICES  = services;
    window.LIVE_SETTINGS  = settings;
    window.LIVE_ADS       = ads;

    // تطبيق الخدمات والإعلانات على الواجهة
    DB.applyServices(services);
    DB.applyAds(ads);

    // عرض الإشعارات للمستخدم المسجل
    if (Auth.isLoggedIn()) {
        await DB.showNotifications();
    }

    // بدء المزامنة الحية
    DB.startLiveSync();

    console.log('✅ Live data ready — services:', services.length, '| settings:', Object.keys(settings).length);
});
