/**
 * TECHNO-CONTROL ADMIN CORE v14 — COMPLETE FIX
 * ═══════════════════════════════════════════════════════════════════
 * Tasks Applied:
 * 1. ✅ Supabase connection fix (retry loop, proper CDN handling)
 * 2. ✅ Data flow verification (missing tables → warning, continue)
 * 3. ✅ All helper functions exposed to window
 * 4. ✅ Boot screen support
 */

(function() {
    'use strict';

    // ══════════════════════════════════════════════
    //  CONFIGURATION
    // ══════════════════════════════════════════════
    const CONFIG = {
        SUPABASE_URL:      'https://rqzsokvhgjlftkouhphb.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxem9rbWhnamxmdGtvdWhwYmgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc3NTQ2NTI0NywiZXhwIjoxOTAxMDQxMjQ3fQ.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY',
        SYNC_INTERVAL: 60000,
        RETRY_DELAY:   100,
        MAX_RETRIES:   100
    };

    // ══════════════════════════════════════════════
    //  GLOBAL STATE
    // ══════════════════════════════════════════════
    let supabase  = null;
    let adminUser = null;

    const STATE = {
        users:          [],
        services:       [],
        orders:         [],
        ads:            [],
        tasks:          [],
        currentSection: 'dashboard',
        syncInterval:   null,
        realtimeChannel: null,
        isLoading:      false,
        isInitialized:  false,
        errors:         []
    };

    // ══════════════════════════════════════════════
    //  EXPOSE STATE (accessible to all files)
    // ══════════════════════════════════════════════
    window.ADMIN_STATE    = STATE;
    window.supabaseClient = () => supabase;
    window.getSupabaseClient = () => supabase;
    window.isSupabaseReady = () => supabase !== null;

    // ══════════════════════════════════════════════
    //  DOM HELPERS
    // ══════════════════════════════════════════════
    const $  = (id)  => document.getElementById(id);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ══════════════════════════════════════════════
    //  SUPABASE INIT — guaranteed with retry loop
    // ══════════════════════════════════════════════
    function initSupabaseClient() {
        return new Promise((resolve, reject) => {
            let attempts = 0;

            function tryInit() {
                attempts++;
                const lib = window.supabase;

                if (lib && typeof lib.createClient === 'function') {
                    try {
                        supabase = lib.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
                            auth: { persistSession: false }
                        });
                        console.log('✅ Supabase client created');
                        resolve(supabase);
                    } catch (e) {
                        console.error('❌ createClient threw:', e);
                        reject(e);
                    }
                } else if (attempts < CONFIG.MAX_RETRIES) {
                    console.log(`⏳ Waiting for Supabase... ${attempts}/${CONFIG.MAX_RETRIES}`);
                    setTimeout(tryInit, CONFIG.RETRY_DELAY);
                } else {
                    reject(new Error('❌ Supabase library not available after max retries'));
                }
            }

            tryInit();
        });
    }

    // ══════════════════════════════════════════════
    //  AUTH CHECK
    // ══════════════════════════════════════════════
    function checkAuth() {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('hseenop33');
        if (!token) {
            window.location.href = 'admin-login.html';
            return false;
        }
        try {
            const ud = localStorage.getItem('adminUser');
            if (ud) adminUser = JSON.parse(ud);
        } catch(e) {}
        return true;
    }

    // ══════════════════════════════════════════════
    //  UTILITIES
    // ══════════════════════════════════════════════
    function formatNumber(num) {
        if (num == null || isNaN(num)) return '0';
        return parseInt(num).toLocaleString('ar-IQ');
    }

    function showToast(message, type) {
        try {
            const el = $('toast');
            if (!el) {
                console.log('Toast:', message);
                return;
            }
            el.textContent = message;
            el.className = 'toast';
            // Force reflow
            void el.offsetWidth;
            el.classList.add('show');
            setTimeout(() => el.classList.remove('show'), 3500);
        } catch(e) {
            console.log('Toast:', message);
        }
    }

    function updateConnectionStatus(status) {
        const el = $('connectionStatus');
        if (!el) return;
        const map = {
            connecting: { icon: '🔄', text: 'جاري الاتصال...', color: '#F39C12' },
            connected:  { icon: '✅', text: 'متصل',            color: '#2ECC71' },
            error:      { icon: '❌', text: 'غير متصل',        color: '#E74C3C' }
        };
        const s = map[status] || map.connecting;
        el.innerHTML = `<span style="color:${s.color}">${s.icon}</span> ${s.text}`;
    }

    function updateTime() {
        const el = $('currentTime');
        if (el) el.textContent = new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
    }

    // ══════════════════════════════════════════════
    //  DATA LOADING — handles missing tables gracefully
    // ══════════════════════════════════════════════
    async function loadAllData() {
        if (!supabase) {
            console.error('❌ supabase is null — loadAllData aborted');
            return;
        }
        if (STATE.isLoading) return;

        STATE.isLoading = true;
        STATE.errors = [];
        console.log('📡 Loading data...');

        try {
            // ─── Users (profiles table) ────────────────────────
            try {
                const { data: usersData, error: uErr } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (uErr) {
                    console.warn('⚠️ profiles table error:', uErr.message);
                    STATE.errors.push({ table: 'profiles', error: uErr.message });
                    STATE.users = [];
                } else {
                    STATE.users = (usersData || []).map(u => ({
                        id:          u.id          || '',
                        username:    u.username    || u.name         || 'Unknown',
                        phone:       u.phone       || u.phone_number || '',
                        governorate: u.governorate || u.city         || '',
                        balance:     u.balance_iqd || u.balance      || 0,
                        pages:       u.pages_count || u.pages        || 0,
                        status:      u.status      || 'active',
                        role:        u.role        || 'user',
                        created_at:  u.created_at  || ''
                    }));
                    console.log(`✅ Users: ${STATE.users.length}`);
                }
            } catch (e) {
                console.warn('⚠️ profiles table failed:', e.message);
                STATE.errors.push({ table: 'profiles', error: e.message });
                STATE.users = [];
            }

            // ─── Services ────────────────────────────────────
            try {
                const { data: svcData, error: sErr } = await supabase
                    .from('services')
                    .select('*')
                    .order('order_index', { ascending: true });

                if (sErr) {
                    console.warn('⚠️ services table error:', sErr.message);
                    STATE.errors.push({ table: 'services', error: sErr.message });
                    STATE.services = [];
                } else {
                    STATE.services = (svcData || []).map(s => ({
                        id:          s.id          || '',
                        name:        s.name        || 'خدمة',
                        icon:        s.icon        || '📄',
                        price:       s.price       || 0,
                        currency:    s.currency    || 'IQD',
                        status:      s.status      || 'active',
                        description: s.description || ''
                    }));
                    console.log(`✅ Services: ${STATE.services.length}`);
                }
            } catch (e) {
                console.warn('⚠️ services table failed:', e.message);
                STATE.errors.push({ table: 'services', error: e.message });
                STATE.services = [];
            }

            // ─── Orders ───────────────────────────────────────
            try {
                const { data: ordData, error: oErr } = await supabase
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(100);

                if (oErr) {
                    console.warn('⚠️ orders table error:', oErr.message);
                    STATE.errors.push({ table: 'orders', error: oErr.message });
                    STATE.orders = [];
                } else {
                    STATE.orders = ordData || [];
                    console.log(`✅ Orders: ${STATE.orders.length}`);
                }
            } catch (e) {
                console.warn('⚠️ orders table failed:', e.message);
                STATE.errors.push({ table: 'orders', error: e.message });
                STATE.orders = [];
            }

            // ─── Ads ──────────────────────────────────────────
            try {
                const { data: adsData, error: aErr } = await supabase
                    .from('ads')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (aErr) {
                    console.warn('⚠️ ads table error:', aErr.message);
                    STATE.errors.push({ table: 'ads', error: aErr.message });
                    STATE.ads = [];
                } else {
                    STATE.ads = adsData || [];
                    console.log(`✅ Ads: ${STATE.ads.length}`);
                }
            } catch (e) {
                console.warn('⚠️ ads table failed:', e.message);
                STATE.errors.push({ table: 'ads', error: e.message });
                STATE.ads = [];
            }

            STATE.isLoading     = false;
            STATE.isInitialized = true;

            // Update UI
            updateStats();
            renderUsersTable();
            renderServicesGrid();
            renderOrdersTable();
            renderAdsGrid();
            populateUserSelects();

            // Toast summary
            if (STATE.errors.length > 0) {
                showToast(`⚠️ ${STATE.errors.length} جدول غير موجود — تم التخطي`);
            } else {
                showToast(`📊 ${STATE.users.length} مستخدم | ${STATE.services.length} خدمة`);
            }

        } catch (err) {
            console.error('❌ loadAllData error:', err);
            STATE.isLoading = false;
            updateConnectionStatus('error');
        }
    }

    // ══════════════════════════════════════════════
    //  STATS UPDATE
    // ══════════════════════════════════════════════
    function updateStats() {
        const users   = STATE.users || [];
        const balance = users.reduce((s, u) => s + (parseInt(u.balance) || 0), 0);
        const pages   = users.reduce((s, u) => s + (parseInt(u.pages)   || 0), 0);
        const active  = users.filter(u => u.status === 'active').length;
        const pending = (STATE.orders || []).filter(o => o.status === 'pending').length;

        const set = (id, val) => { const el = $(id); if (el) el.textContent = val; };

        set('totalUsers',   formatNumber(users.length));
        set('totalBalance', formatNumber(balance) + ' IQD');
        set('totalPages',   formatNumber(pages));
        set('totalActive',  formatNumber(active));
        set('radarTotal',   formatNumber(users.length));
        set('radarActive',  formatNumber(active));
        set('ordersTotal',  formatNumber((STATE.orders || []).length));
        set('ordersPending',formatNumber(pending));
    }

    // ══════════════════════════════════════════════
    //  REAL-TIME
    // ══════════════════════════════════════════════
    function startRealtimeListener() {
        if (!supabase) return;
        try {
            if (STATE.realtimeChannel) supabase.removeChannel(STATE.realtimeChannel);

            STATE.realtimeChannel = supabase.channel('admin-rt')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, loadAllData)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, loadAllData)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'orders'   }, loadAllData)
                .subscribe();

            console.log('✅ Real-time listener active');
        } catch(e) {
            console.warn('Realtime error:', e);
        }
    }

    // ══════════════════════════════════════════════
    //  RENDER FUNCTIONS
    // ══════════════════════════════════════════════
    function renderUsersTable() {
        const tbody = $('usersTableBody');
        if (!tbody) return;

        if (!STATE.users.length) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:#888;">لا توجد بيانات</td></tr>';
            return;
        }

        tbody.innerHTML = STATE.users.map((u, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${u.username}</td>
                <td>${u.phone || '-'}</td>
                <td>${u.governorate || '-'}</td>
                <td>${formatNumber(u.balance)}</td>
                <td>${formatNumber(u.pages)}</td>
                <td><span class="status-badge ${u.status === 'active' ? 'active' : 'inactive'}">${u.status === 'active' ? '🟢 نشط' : '🔴 غير نشط'}</span></td>
                <td>
                    <button onclick="window.editUser('${u.id}')"   style="background:#3498DB;color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;margin:2px;">✏️</button>
                    <button onclick="window.deleteUser('${u.id}')" style="background:#E74C3C;color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;margin:2px;">🗑️</button>
                </td>
            </tr>
        `).join('');
    }

    function renderServicesGrid() {
        const el = $('servicesGrid');
        if (!el) return;

        if (!STATE.services.length) {
            el.innerHTML = '<p style="text-align:center;color:#888;grid-column:1/-1;">لا توجد خدمات — أضف خدمة جديدة</p>';
            return;
        }

        el.innerHTML = STATE.services.map(s => `
            <div class="service-card">
                <div class="service-icon-wrapper">${s.icon}</div>
                <div class="service-title">${s.name}</div>
                <div class="service-price-tag">${formatNumber(s.price)} <span>IQD</span></div>
                <div class="service-status-badge ${s.status}">${s.status === 'active' ? '🟢 نشط' : '🔴 متوقف'}</div>
                <div style="display:flex;gap:10px;margin-top:10px;">
                    <button onclick="window.editService('${s.id}')"   style="background:#3498DB;color:white;border:none;padding:8px 15px;border-radius:8px;cursor:pointer;">✏️</button>
                    <button onclick="window.deleteService('${s.id}')" style="background:#E74C3C;color:white;border:none;padding:8px 15px;border-radius:8px;cursor:pointer;">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    function renderOrdersTable() {
        const el = $('ordersList');
        if (!el) return;

        if (!STATE.orders.length) {
            el.innerHTML = '<p style="text-align:center;color:#888;">لا توجد طلبات</p>';
            return;
        }

        el.innerHTML = STATE.orders.map(o => `
            <div class="order-card">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong>${o.customer_name || 'عميل'}</strong>
                        <span style="color:#888;margin-right:10px;">${o.phone || '-'}</span>
                    </div>
                    <span class="status-badge ${o.status || 'pending'}">
                        ${o.status === 'completed' ? '✅ مكتمل' : o.status === 'cancelled' ? '🔴 ملغي' : '⏳ قيد الانتظار'}
                    </span>
                </div>
                <div style="margin-top:8px;color:#888;font-size:13px;">
                    <span>📄 ${o.pages || 1} صفحة</span>
                    <span style="margin-right:15px;">💰 ${formatNumber(o.total_price || 0)} IQD</span>
                    <span style="margin-right:15px;">${o.print_type || 'A4'}</span>
                </div>
            </div>
        `).join('');
    }

    function renderAdsGrid() {
        const el = $('adsGrid');
        if (!el) return;

        if (!STATE.ads.length) {
            el.innerHTML = '<p style="text-align:center;color:#888;grid-column:1/-1;">لا توجد إعلانات</p>';
            return;
        }

        el.innerHTML = STATE.ads.map(ad => `
            <div style="background:var(--admin-surface);padding:15px;border-radius:10px;text-align:center;">
                <img src="${ad.image_url || ''}" alt="Ad" style="width:100%;height:150px;object-fit:cover;border-radius:8px;" onerror="this.style.display='none'">
                <p style="color:var(--admin-gold);margin-top:10px;">${ad.title || 'إعلان'}</p>
                <button onclick="window.deleteAd('${ad.id}')" style="background:#E74C3C;color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;margin-top:5px;">🗑️ حذف</button>
            </div>
        `).join('');
    }

    // ══════════════════════════════════════════════
    //  CRUD OPERATIONS
    // ══════════════════════════════════════════════
    async function addService() {
        const name  = $('newServiceName')?.value?.trim();
        const price = parseInt($('newServicePrice')?.value) || 0;
        const icon  = $('newServiceIcon')?.value?.trim() || '📄';

        if (!name || !price) { showToast('⚠️ أدخل اسم وسعر الخدمة'); return; }

        const { error } = await supabase.from('services').insert([{
            name, price, icon, status: 'active', currency: 'IQD',
            order_index: STATE.services.length + 1
        }]);

        if (error) { showToast('❌ فشل في إضافة الخدمة: ' + error.message); return; }
        showToast('✅ تمت إضافة الخدمة');
        $('newServiceName').value  = '';
        $('newServicePrice').value = '';
        loadAllData();
    }

    async function deleteService(id) {
        if (!confirm('هل تريد حذف هذه الخدمة؟')) return;
        const { error } = await supabase.from('services').delete().eq('id', id);
        showToast(error ? '❌ فشل في الحذف' : '✅ تم الحذف');
        if (!error) loadAllData();
    }

    async function editService(id) {
        const svc  = STATE.services.find(s => s.id === id);
        if (!svc) return;
        const name  = prompt('اسم الخدمة:', svc.name);
        const price = prompt('السعر:', svc.price);
        if (!name || !price) return;

        const { error } = await supabase.from('services').update({ name, price: parseInt(price) }).eq('id', id);
        showToast(error ? '❌ فشل في التعديل' : '✅ تم التعديل');
        if (!error) loadAllData();
    }

    async function deleteUser(id) {
        if (!confirm('هل تريد حذف هذا المستخدم؟')) return;
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        showToast(error ? '❌ فشل في الحذف' : '✅ تم الحذف');
        if (!error) loadAllData();
    }

    async function editUser(id) {
        const user = STATE.users.find(u => u.id === id);
        if (!user) return;
        showToast(`✏️ تعديل: ${user.username}`);
    }

    async function deleteAd(id) {
        if (!confirm('هل تريد حذف هذا الإعلان؟')) return;
        const { error } = await supabase.from('ads').delete().eq('id', id);
        showToast(error ? '❌ فشل في الحذف' : '✅ تم الحذف');
        if (!error) loadAllData();
    }

    async function addNewOrder() {
        const customer = $('orderCustomer')?.value?.trim();
        const type      = $('orderType')?.value    || 'A4';
        const pages     = parseInt($('orderPages')?.value) || 1;

        if (!customer) { showToast('⚠️ أدخل اسم العميل'); return; }

        const { error } = await supabase.from('orders').insert([{
            customer_name: customer, print_type: type, pages,
            status: 'pending', created_at: new Date().toISOString()
        }]);

        showToast(error ? '❌ فشل: ' + error.message : '✅ تم إضافة الطلب');
        if (!error) { $('orderCustomer').value = ''; loadAllData(); }
    }

    async function adjustBalance(action) {
        const sel    = $('walletUserSelect');
        const amount = parseInt($('balanceAmount')?.value) || 0;
        if (!sel?.value || !amount) { showToast('⚠️ اختر مستخدم وأدخل مبلغ'); return; }

        const user = STATE.users.find(u => u.id === sel.value);
        if (!user) return;

        const newBal = action === 'add'
            ? (parseInt(user.balance) || 0) + amount
            : (parseInt(user.balance) || 0) - amount;

        const { error } = await supabase.from('profiles').update({ balance_iqd: newBal }).eq('id', sel.value);
        showToast(error ? '❌ فشل' : `✅ تم ${action === 'add' ? 'إضافة' : 'خصم'} الرصيد`);
        if (!error) { $('balanceAmount').value = ''; loadAllData(); }
    }

    async function adjustPages(action) {
        const sel    = $('walletUserSelect');
        const amount = parseInt($('pagesAmount')?.value) || 0;
        if (!sel?.value || !amount) { showToast('⚠️ اختر مستخدم وأدخل عدد صفحات'); return; }

        const user = STATE.users.find(u => u.id === sel.value);
        if (!user) return;

        const newPg = action === 'add'
            ? (parseInt(user.pages) || 0) + amount
            : (parseInt(user.pages) || 0) - amount;

        const { error } = await supabase.from('profiles').update({ pages_count: newPg }).eq('id', sel.value);
        showToast(error ? '❌ فشل' : `✅ تم ${action === 'add' ? 'إضافة' : 'خصم'} الصفحات`);
        if (!error) { $('pagesAmount').value = ''; loadAllData(); }
    }

    async function sendWelcomeGift() {
        const sel     = $('giftUserSelect');
        const balance = parseInt($('giftBalance')?.value) || 50;
        const pages   = parseInt($('giftPages')?.value)   || 100;
        if (!sel?.value) { showToast('⚠️ اختر مستخدم'); return; }

        const user = STATE.users.find(u => u.id === sel.value);
        if (!user) return;

        const { error } = await supabase.from('profiles').update({
            balance_iqd: (parseInt(user.balance) || 0) + balance,
            pages_count:  (parseInt(user.pages)   || 0) + pages
        }).eq('id', sel.value);

        showToast(error ? '❌ فشل' : '🎁 تم إرسال الهدية الترحيبية');
        if (!error) loadAllData();
    }

    async function sendReward() {
        const sel     = $('rewardUserSelect');
        const balance = parseInt($('rewardBalance')?.value) || 100;
        const pages   = parseInt($('rewardPages')?.value)   || 200;
        if (!sel?.value) { showToast('⚠️ اختر مستخدم'); return; }

        const user = STATE.users.find(u => u.id === sel.value);
        if (!user) return;

        const { error } = await supabase.from('profiles').update({
            balance_iqd: (parseInt(user.balance) || 0) + balance,
            pages_count:  (parseInt(user.pages)   || 0) + pages
        }).eq('id', sel.value);

        showToast(error ? '❌ فشل' : '⭐ تم إرسال المكافأة');
        if (!error) loadAllData();
    }

    async function sendBroadcast() {
        const title   = $('broadcastTitle')?.value?.trim();
        const message = $('broadcastMessage')?.value?.trim();
        const type    = $('broadcastType')?.value || 'info';
        if (!title || !message) { showToast('⚠️ أدخل عنوان ومحتوى الإشعار'); return; }

        const { error } = await supabase.from('notifications').insert([{
            title, message, type, created_at: new Date().toISOString()
        }]);

        showToast(error ? '❌ فشل: ' + error.message : '📨 تم إرسال الإشعار للجميع');
        if (!error) { $('broadcastTitle').value = ''; $('broadcastMessage').value = ''; }
    }

    async function sendPrivateMessage() {
        const recipient = $('messageRecipient')?.value;
        const subject   = $('messageSubject')?.value?.trim();
        const content   = $('messageContent')?.value?.trim();
        if (!recipient || !subject || !content) { showToast('⚠️ أدخل جميع البيانات'); return; }

        const { error } = await supabase.from('messages').insert([{
            user_id: recipient, subject, content,
            created_at: new Date().toISOString()
        }]);

        showToast(error ? '❌ فشل' : '💬 تم إرسال الرسالة');
        if (!error) { $('messageSubject').value = ''; $('messageContent').value = ''; }
    }

    async function addNewTask() {
        const title    = $('newTaskTitle')?.value?.trim();
        const priority = $('newTaskPriority')?.value || 'medium';
        if (!title) { showToast('⚠️ أدخل عنوان المهمة'); return; }

        const { error } = await supabase.from('tasks').insert([{
            title, priority, status: 'pending', created_at: new Date().toISOString()
        }]);

        showToast(error ? '❌ فشل' : '✅ تمت إضافة المهمة');
        if (!error) { $('newTaskTitle').value = ''; loadAllData(); }
    }

    // ══════════════════════════════════════════════
    //  NAVIGATION
    // ══════════════════════════════════════════════
    function setupNavigation() {
        $$('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const sec = item.getAttribute('data-section');
                if (sec) switchSection(sec);
                if (window.innerWidth <= 768) toggleMobileMenu();
            });
        });

        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', logout);
    }

    function switchSection(id) {
        STATE.currentSection = id;
        $$('.section-panel').forEach(el => el.classList.remove('active'));
        const target = $(id);
        if (target) target.classList.add('active');
        $$('.nav-item').forEach(el => el.classList.remove('active'));
        const activeNav = document.querySelector(`.nav-item[data-section="${id}"]`);
        if (activeNav) activeNav.classList.add('active');

        const titles = {
            dashboard: 'لوحة التحكم', users: 'قاعدة البيانات',
            services:  'إدارة الخدمات', orders: 'الطلبات',
            tasks:     'المهام',         wallet: 'المحفظة',
            gifts:     'الإرسال',        design: 'الألوان',
            texts:     'النصوص',         ads: 'الإعلانات',
            broadcast: 'الإشعارات',      messages: 'الرسائل',
            radar:     'رادار المستخدمين', printing: 'وحدة الطباعة'
        };

        const titleEl = $('sectionTitle');
        if (titleEl) titleEl.textContent = titles[id] || id;
    }

    function toggleMobileMenu() {
        $('adminSidebar')?.classList.toggle('mobile-open');
        $('sidebarOverlay')?.classList.toggle('active');
    }

    function logout() {
        if (STATE.syncInterval) clearInterval(STATE.syncInterval);
        if (STATE.realtimeChannel && supabase) supabase.removeChannel(STATE.realtimeChannel);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('hseenop33');
        window.location.href = 'admin-login.html';
    }

    // ══════════════════════════════════════════════
    //  POPULATE SELECTS
    // ══════════════════════════════════════════════
    function populateUserSelects() {
        ['walletUserSelect', 'giftUserSelect', 'rewardUserSelect', 'messageRecipient'].forEach(id => {
            const sel = $(id);
            if (!sel) return;
            const cur = sel.value;
            sel.innerHTML = '<option value="">-- اختر مستخدم --</option>' +
                STATE.users.map(u =>
                    `<option value="${u.id}">${u.username} (${u.phone || 'بلا هاتف'})</option>`
                ).join('');
            sel.value = cur;
        });
    }

    // ══════════════════════════════════════════════
    //  SYNC LOOP
    // ══════════════════════════════════════════════
    function startDataSync() {
        if (STATE.syncInterval) clearInterval(STATE.syncInterval);
        STATE.syncInterval = setInterval(() => {
            if (STATE.isInitialized) loadAllData();
        }, CONFIG.SYNC_INTERVAL);
    }

    // ══════════════════════════════════════════════
    //  EXPOSE TO WINDOW
    // ══════════════════════════════════════════════
    window.switchSection      = switchSection;
    window.toggleMobileMenu   = toggleMobileMenu;
    window.logout             = logout;
    window.showToast          = showToast;
    window.updateStats        = updateStats;
    window.loadAllData        = loadAllData;

    window.addService         = addService;
    window.editService        = editService;
    window.deleteService      = deleteService;
    window.editUser           = editUser;
    window.deleteUser         = deleteUser;
    window.deleteAd           = deleteAd;
    window.addNewOrder        = addNewOrder;
    window.adjustBalance      = adjustBalance;
    window.adjustPages        = adjustPages;
    window.sendWelcomeGift    = sendWelcomeGift;
    window.sendReward         = sendReward;
    window.sendBroadcast      = sendBroadcast;
    window.sendPrivateMessage = sendPrivateMessage;
    window.addNewTask         = addNewTask;

    window.renderUsersTable   = renderUsersTable;
    window.renderServicesGrid = renderServicesGrid;
    window.renderOrdersTable  = renderOrdersTable;
    window.renderAdsGrid      = renderAdsGrid;

    // ══════════════════════════════════════════════
    //  MAIN INIT
    // ══════════════════════════════════════════════
    async function init() {
        console.log('🚀 TECHNO-CONTROL v14 starting...');
        
        // Hide boot screen if exists
        const bootScreen = $('bootScreen');
        
        if (!checkAuth()) return;
        try {
            updateConnectionStatus('connecting');
            
            // Initialize Supabase
            await initSupabaseClient();
            
            // Hide boot screen
            if (bootScreen) bootScreen.style.display = 'none';
            
            // Show dashboard
            const dashboardContainer = $('dashboardContainer');
            if (dashboardContainer) dashboardContainer.style.display = 'block';
            
            // Load data
            await loadAllData();
            
            // Setup navigation
            setupNavigation();
            
            // Start real-time
            startRealtimeListener();
            
            // Start sync
            startDataSync();
            
            // Update time
            updateTime();
            setInterval(updateTime, 1000);
            
            updateConnectionStatus('connected');
            showToast('✅ لوحة التحكم جاهزة');
            
        } catch (err) {
            console.error('❌ Init error:', err);
            updateConnectionStatus('error');
            if (bootScreen) {
                const msgEl = bootScreen.querySelector('p');
                if (msgEl) msgEl.textContent = '❌ ' + err.message;
                bootScreen.style.background = '#1a0000';
            }
        }
    }

    // ══════════════════════════════════════════════
    //  START
    // ══════════════════════════════════════════════
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('✅ admin-core.js v14 loaded');
})();