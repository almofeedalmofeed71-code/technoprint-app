/**
 * TECHNO-CONTROL ADMIN CORE v16 — FIXED
 * KEY FIXED: rqznsokvhgjlftkouhphb (correct ref)
 * FIXED: supabase variable scoping for uploadAdImage
 */

// Global supabase instance accessible to all functions
window.supabaseAdmin = null;

(function() {
    'use strict';

    const CONFIG = {
        SUPABASE_URL:      'https://rqzsokvhgjlftkouhphb.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY',
        SYNC_INTERVAL: 30000,
        RETRY_DELAY:   50,
        MAX_RETRIES:   100
    };

    let supabase = null;

    const STATE = {
        users:          [],
        services:       [],
        orders:         [],
        ads:            [],
        notifications:  [],
        messages:       [],
        tasks:          [],
        settings:       [],
        currentSection: 'dashboard',
        syncInterval:   null,
        realtimeChannel: null,
        isLoading:      false,
        isInitialized:  false,
        errors:         []
    };

    window.ADMIN_STATE = STATE;
    window.supabaseClient = function() { return supabase; };
    window.getSupabaseClient = function() { return supabase; };
    window.isSupabaseReady = function() { return supabase !== null; };

    function $(id)   { return document.getElementById(id); }
    function $$(sel) { return document.querySelectorAll(sel); }

    // ══════════════════════════════════════════════
    //  SUPABASE INIT
    // ══════════════════════════════════════════════
    function initSupabaseClient() {
        return new Promise(function(resolve, reject) {
            var attempts = 0;
            function tryInit() {
                attempts++;
                if (window.supabase && typeof window.supabase.createClient === 'function') {
                    try {
                        supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
                        window._supabase = supabase;
                        window.supabaseAdmin = supabase; // Global access for uploadAdImage
                        console.log('✅ Supabase connected');
                        resolve(supabase);
                    } catch(e) { reject(e); }
                } else if (attempts < CONFIG.MAX_RETRIES) {
                    setTimeout(tryInit, CONFIG.RETRY_DELAY);
                } else {
                    reject(new Error('❌ supabase library failed'));
                }
            }
            tryInit();
        });
    }

    // ══════════════════════════════════════════════
    //  AUTH
    // ══════════════════════════════════════════════
    function checkAuth() {
        var token = localStorage.getItem('adminToken');
        if (!token || token !== 'hseenop9090-authenticated') { 
            window.location.href = 'admin-login.html'; 
            return false; 
        }
        return true;
    }

    // ══════════════════════════════════════════════
    //  UTILITIES
    // ══════════════════════════════════════════════
    function formatNumber(num) {
        if (num == null || isNaN(num)) return '0';
        return parseInt(num).toLocaleString('ar-IQ');
    }
    window.formatNumber = formatNumber;

    function showToast(message) {
        try {
            var el = $('toast');
            if (!el) return;
            el.textContent = message;
            el.style.display = 'block';
            el.classList.add('show');
            setTimeout(function() {
                el.classList.remove('show');
                setTimeout(function() { el.style.display = 'none'; }, 300);
            }, 3500);
        } catch(e) {}
    }
    window.showToast = showToast;

    function updateConnectionStatus(status) {
        var el = $('connectionStatus');
        if (!el) return;
        var map = {
            connecting: { icon: '🔄', text: 'جاري الاتصال...', color: '#f39c12' },
            connected:  { icon: '✅', text: 'متصل',            color: '#2ecc71' },
            error:      { icon: '❌', text: 'خطأ في الاتصال',  color: '#e74c3c' }
        };
        var s = map[status] || map.connecting;
        el.innerHTML = '<span style="color:' + s.color + '">' + s.icon + '</span> ' + s.text;
    }
    window.updateConnectionStatus = updateConnectionStatus;

    function updateTime() {
        var el = $('currentTime');
        if (el) el.textContent = new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
    }
    window.updateTime = updateTime;

    // ══════════════════════════════════════════════
    //  NAVIGATION
    // ══════════════════════════════════════════════
    function switchSection(id) {
        STATE.currentSection = id;
        $$('.section-panel').forEach(function(s) { s.classList.remove('active'); });
        var target = $(id);
        if (target) target.classList.add('active');
        $$('.nav-item').forEach(function(n) { n.classList.remove('active'); });
        var activeNav = document.querySelector('.nav-item[data-section="' + id + '"]');
        if (activeNav) activeNav.classList.add('active');
        var titles = {
            dashboard:'لوحة التحكم', users:'قاعدة البيانات', services:'إدارة الخدمات',
            orders:'الطلبات', tasks:'المهام', wallet:'المحفظة', gifts:'الإرسال',
            design:'الألوان', texts:'النصوص', ads:'الإعلانات', broadcast:'الإشعارات',
            messages:'الرسائل', settings:'إعدادات التطبيق', radar:'رادار المستخدمين', printing:'وحدة الطباعة'
        };
        var titleEl = $('sectionTitle');
        if (titleEl) titleEl.textContent = titles[id] || id;
    }
    window.switchSection = switchSection;

    function toggleMobileMenu() {
        var sidebar = $('adminSidebar');
        var overlay = $('sidebarOverlay');
        if (sidebar) sidebar.classList.toggle('mobile-open');
        if (overlay) overlay.classList.toggle('active');
    }
    window.toggleMobileMenu = toggleMobileMenu;

    function logout() {
        if (STATE.syncInterval) clearInterval(STATE.syncInterval);
        if (STATE.realtimeChannel && supabase) supabase.removeChannel(STATE.realtimeChannel);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('hseenop33');
        localStorage.removeItem('admin-db-hseenop33');
        window.location.href = 'admin-login.html';
    }
    window.logout = logout;

    function setupNavigation() {
        $$('.nav-item').forEach(function(item) {
            item.addEventListener('click', function() {
                var sec = this.getAttribute('data-section');
                if (sec) switchSection(sec);
                if (window.innerWidth <= 768) toggleMobileMenu();
            });
        });
        var logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', logout);
    }

    // ══════════════════════════════════════════════
    //  STATS
    // ══════════════════════════════════════════════
    function updateStats() {
        var users   = STATE.users || [];
        var balance = users.reduce(function(s,u){ return s+(parseInt(u.balance_iqd)||0); },0);
        var pages   = users.reduce(function(s,u){ return s+(parseInt(u.pages_count)||0);  },0);
        var active  = users.filter(function(u){ return u.status==='active'; }).length;
        var pending = (STATE.orders||[]).filter(function(o){ return o.status==='pending'; }).length;
        var set = function(id,val){ var el=$(id); if(el) el.textContent=val; };
        set('totalUsers',    formatNumber(users.length));
        set('totalBalance',  formatNumber(balance)+' IQD');
        set('totalPages',    formatNumber(pages));
        set('totalActive',   formatNumber(active));
        set('radarTotal',    formatNumber(users.length));
        set('radarActive',   formatNumber(active));
        set('ordersTotal',   formatNumber((STATE.orders||[]).length));
        set('ordersPending', formatNumber(pending));
    }

    // ══════════════════════════════════════════════
    //  RENDER
    // ══════════════════════════════════════════════
    function renderUsersTable() {
        var tbody = $('usersTableBody');
        if (!tbody) return;
        if (!STATE.users.length) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:#666;">لا توجد بيانات</td></tr>';
            return;
        }
        tbody.innerHTML = STATE.users.map(function(u,i) {
            return '<tr>' +
                '<td style="padding:12px;">'+(i+1)+'</td>' +
                '<td>'+(u.username||'Unknown')+'</td>' +
                '<td>'+(u.phone||'-')+'</td>' +
                '<td>'+(u.governorate||'-')+'</td>' +
                '<td>'+formatNumber(u.balance_iqd||0)+'</td>' +
                '<td>'+formatNumber(u.pages_count||0)+'</td>' +
                '<td><span class="status-badge '+(u.status==='active'?'active':'inactive')+'">'+(u.status==='active'?'🟢 نشط':'🔴 غير نشط')+'</span></td>' +
                '<td><button onclick="deleteUser(\''+u.id+'\')" style="background:#e74c3c;color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;">🗑️</button></td>' +
                '</tr>';
        }).join('');
    }
    window.renderUsersTable = renderUsersTable;

    function renderServicesGrid() {
        var el = $('servicesGrid');
        if (!el) return;
        if (!STATE.services.length) { el.innerHTML='<p style="text-align:center;color:#666;">لا توجد خدمات</p>'; return; }
        el.innerHTML = STATE.services.map(function(s) {
            return '<div class="service-card">' +
                '<div class="service-icon-wrapper">'+(s.icon||'📄')+'</div>' +
                '<div class="service-title">'+(s.name||'خدمة')+'</div>' +
                '<div class="service-price-tag">'+formatNumber(s.price||0)+' <span>IQD</span></div>' +
                '<button onclick="deleteService(\''+s.id+'\')" style="background:#e74c3c;color:white;border:none;padding:8px 15px;border-radius:8px;cursor:pointer;margin-top:10px;">🗑️ حذف</button>' +
                '</div>';
        }).join('');
    }
    window.renderServicesGrid = renderServicesGrid;

    function renderOrdersTable() {
        var el = $('ordersList');
        if (!el) return;
        if (!STATE.orders.length) { el.innerHTML='<p style="text-align:center;color:#666;">لا توجد طلبات</p>'; return; }
        el.innerHTML = STATE.orders.map(function(o) {
            var lbl = o.status==='completed'?'✅ مكتمل':o.status==='cancelled'?'🔴 ملغي':'⏳ قيد الانتظار';
            return '<div class="order-card">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                '<strong>'+(o.customer_name||'عميل')+'</strong>' +
                '<span class="status-badge '+(o.status||'pending')+'">'+lbl+'</span></div>' +
                '<div style="margin-top:8px;color:#888;font-size:13px;">' +
                '<span>📄 '+(o.pages||1)+' صفحة</span>' +
                '<span style="margin-right:15px;">💰 '+formatNumber(o.total_price||0)+' IQD</span>' +
                '</div></div>';
        }).join('');
    }
    window.renderOrdersTable = renderOrdersTable;

    function renderAdsGrid() {
        var el = $('adsGrid');
        if (!el) return;
        if (!STATE.ads.length) { el.innerHTML='<p style="text-align:center;color:#666;">لا توجد إعلانات</p>'; return; }
        el.innerHTML = STATE.ads.map(function(ad) {
            return '<div style="background:#111;padding:15px;border-radius:10px;text-align:center;">' +
                '<img src="'+(ad.image_url||'')+'" alt="Ad" style="width:100%;height:150px;object-fit:cover;border-radius:8px;" onerror="this.style.display=\'none\'">' +
                '<p style="color:#D4AF37;margin-top:10px;">'+(ad.title||'إعلان')+'</p>' +
                '<button onclick="deleteAd(\''+ad.id+'\')" style="background:#e74c3c;color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;margin-top:5px;">🗑️ حذف</button>' +
                '</div>';
        }).join('');
    }
    window.renderAdsGrid = renderAdsGrid;

    function renderSettingsPanel() {
        var container = $('settingsContainer');
        if (!container) return;
        if (!STATE.settings.length) { container.innerHTML='<p style="color:#888;text-align:center;">لا توجد إعدادات</p>'; return; }
        var cats = {identity:'🏷️ الهوية',pricing:'💰 الأسعار',wallet:'👛 المحفظة',app:'⚙️ التطبيق',ui:'🎨 الواجهة',general:'📋 عام'};
        var groups = {};
        STATE.settings.forEach(function(s){ var k=s.category||'general'; if(!groups[k]) groups[k]=[]; groups[k].push(s); });
        var html = '';
        Object.keys(groups).forEach(function(cat) {
            html += '<div style="background:#111;border:1px solid #2a2a2a;border-top:3px solid #D4AF37;border-radius:16px;padding:20px;">';
            html += '<h3 style="color:#D4AF37;margin:0 0 16px 0;">'+(cats[cat]||cat)+'</h3>';
            groups[cat].forEach(function(s) {
                // ✅ الحل
                var v = String(s.value ?? '').replace(/^"|"$/g, '');
                html += '<div style="margin-bottom:16px;">';
                html += '<label style="display:block;color:#aaa;font-size:12px;margin-bottom:6px;">'+(s.label||s.key)+'</label>';
                if (s.value_type==='boolean') {
                    html += '<label class="toggle-switch"><input type="checkbox" '+(v==='true'?'checked':'')+' onchange="saveSetting(\''+s.key+'\',this.checked.toString())"><span class="toggle-slider"></span></label>';
                    html += '<span style="color:#888;font-size:12px;margin-right:8px;">'+(v==='true'?'مفعّل':'معطّل')+'</span>';
                } else if (s.value_type==='color') {
                    html += '<input type="color" value="'+(v||'#D4AF37')+'" style="width:48px;height:36px;border:none;border-radius:8px;cursor:pointer;" onchange="saveSetting(\''+s.key+'\',this.value)">';
                } else if (s.value_type==='number') {
                    html += '<input type="number" value="'+v+'" style="width:140px;background:#0a0a0a;border:1px solid #2a2a2a;color:#e8e8e8;border-radius:8px;padding:8px 12px;" onchange="saveSetting(\''+s.key+'\',this.value)">';
                } else {
                    html += '<input type="text" value="'+v+'" style="width:100%;background:#0a0a0a;border:1px solid #2a2a2a;color:#e8e8e8;border-radius:8px;padding:8px 12px;box-sizing:border-box;" onchange="saveSetting(\''+s.key+'\',this.value)">';
                }
                html += '</div>';
            });
            html += '</div>';
        });
        container.innerHTML = html;
    }
    window.renderSettingsPanel = renderSettingsPanel;

    function populateUserSelects() {
        ['walletUserSelect','giftUserSelect','rewardUserSelect','messageRecipient'].forEach(function(id) {
            var sel = $(id);
            if (!sel) return;
            var cur = sel.value;
            sel.innerHTML = '<option value="">-- اختر مستخدم --</option>' +
                STATE.users.map(function(u){ return '<option value="'+u.id+'">'+(u.username||'Unknown')+' ('+(u.phone||'بلا هاتف')+')</option>'; }).join('');
            sel.value = cur;
        });
    }
    window.populateUserSelects = populateUserSelects;

    // ══════════════════════════════════════════════
    //  LOAD ALL DATA
    // ══════════════════════════════════════════════
    async function loadAllData() {
        if (!supabase) { console.error('❌ supabase is null'); return; }
        if (STATE.isLoading) return;
        STATE.isLoading = true;
        console.log('📡 fetching from Supabase...');
        try {
            var r1 = await supabase.from('profiles').select('*').order('created_at',{ascending:false});
            if (r1.error) {
                console.warn('⚠️ profiles:', r1.error.message);
                // retry once
                await new Promise(function(r){ setTimeout(r, 1000); });
                r1 = await supabase.from('profiles').select('*').order('created_at',{ascending:false});
                if (!r1.error) {
                    STATE.users = (r1.data||[]).map(function(x){
                        return { id:x.id||'', username:x.username||x.name||'مجهول', phone:x.phone||x.phone_number||'', governorate:x.governorate||x.city||'', balance_iqd:x.balance_iqd||x.balance||0, pages_count:x.pages_count||x.pages||0, status:x.status||'active', role:x.role||'user', created_at:x.created_at||'' };
                    });
                }
            } else {
                STATE.users = (r1.data||[]).map(function(x){
                    return { id:x.id||'', username:x.username||x.name||'مجهول', phone:x.phone||x.phone_number||'', governorate:x.governorate||x.city||'', balance_iqd:x.balance_iqd||x.balance||0, pages_count:x.pages_count||x.pages||0, status:x.status||'active', role:x.role||'user', created_at:x.created_at||'' };
                });
            }
            if (STATE.users.length) console.log('✅ profiles:', STATE.users.length);

            var r2 = await supabase.from('services').select('*').order('order_index',{ascending:true});
            if (r2.error) console.warn('⚠️ services:', r2.error.message);
            else { STATE.services=r2.data||[]; console.log('✅ services:',STATE.services.length); }

            var r3 = await supabase.from('orders').select('*').order('created_at',{ascending:false}).limit(100);
            if (r3.error) console.warn('⚠️ orders:', r3.error.message);
            else { STATE.orders=r3.data||[]; console.log('✅ orders:',STATE.orders.length); }

            var r4 = await supabase.from('ads').select('*').order('created_at',{ascending:false});
            if (r4.error) console.warn('⚠️ ads:', r4.error.message);
            else { STATE.ads=r4.data||[]; console.log('✅ ads:',STATE.ads.length); }

            var r5 = await supabase.from('tasks').select('*').order('created_at',{ascending:false});
            if (r5.error) console.warn('⚠️ tasks:', r5.error.message);
            else { STATE.tasks=r5.data||[]; console.log('✅ tasks:',STATE.tasks.length); }

            var r6 = await supabase.from('app_settings').select('*').order('category');
            if (r6.error) console.warn('⚠️ app_settings:', r6.error.message);
            else { STATE.settings=r6.data||[]; console.log('✅ settings:',STATE.settings.length); }

            var r7 = await supabase.from('notifications').select('*').order('created_at',{ascending:false});
            if (!r7.error) STATE.notifications=r7.data||[];

            var r8 = await supabase.from('messages').select('*').order('created_at',{ascending:false});
            if (!r8.error) STATE.messages=r8.data||[];

            STATE.isLoading=true; STATE.isInitialized=true;

            updateStats();
            renderUsersTable();
            renderServicesGrid();
            renderOrdersTable();
            renderAdsGrid();
            renderSettingsPanel();
            populateUserSelects();
            updateConnectionStatus('connected');
            showToast('✅ '+STATE.users.length+' مستخدم | '+STATE.services.length+' خدمة');

        } catch(err) {
            console.error('❌ loadAllData failed:', err);
            updateConnectionStatus('error');
            showToast('❌ فشل تحميل البيانات');
        }
        STATE.isLoading = false;
    }
    window.loadAllData = loadAllData;

    // ══════════════════════════════════════════════
    //  CRUD
    // ══════════════════════════════════════════════
    async function addService() {
        var name=$('newServiceName')?$('newServiceName').value.trim():'';
        var price=$('newServicePrice')?parseInt($('newServicePrice').value)||0:0;
        var icon=$('newServiceIcon')?$('newServiceIcon').value.trim():'📄';
        if (!name||!price){showToast('⚠️ أدخل اسم وسعر الخدمة');return;}
        var r=await supabase.from('services').insert([{name,price,icon,status:'active',currency:'IQD',order_index:STATE.services.length+1}]);
        showToast(r.error?'❌ فشل: '+r.error.message:'✅ تمت إضافة الخدمة');
        if(!r.error) loadAllData();
    }
    window.addService=addService;

    async function deleteService(id){
        if(!confirm('هل تريد حذف هذه الخدمة؟'))return;
        var r=await supabase.from('services').delete().eq('id',id);
        showToast(r.error?'❌ فشل':'✅ تم الحذف');
        if(!r.error) loadAllData();
    }
    window.deleteService=deleteService;

    async function deleteUser(id){
        if(!confirm('هل تريد حذف هذا المستخدم؟'))return;
        var r=await supabase.from('profiles').delete().eq('id',id);
        showToast(r.error?'❌ فشل':'✅ تم الحذف');
        if(!r.error) loadAllData();
    }
    window.deleteUser=deleteUser;

    async function deleteAd(id){
        if(!confirm('هل تريد حذف هذا الإعلان؟'))return;
        var r=await supabase.from('ads').delete().eq('id',id);
        showToast(r.error?'❌ فشل':'✅ تم الحذف');
        if(!r.error) loadAllData();
    }
    window.deleteAd=deleteAd;

    async function addNewOrder(){
        var customer=$('orderCustomer')?$('orderCustomer').value.trim():'';
        var type=$('orderType')?$('orderType').value:'A4';
        var pages=$('orderPages')?parseInt($('orderPages').value)||1:1;
        if(!customer){showToast('⚠️ أدخل اسم العميل');return;}
        var r=await supabase.from('orders').insert([{customer_name:customer,print_type:type,pages,status:'pending',created_at:new Date().toISOString()}]);
        showToast(r.error?'❌ فشل: '+r.error.message:'✅ تم إضافة الطلب');
        if(!r.error){if($('orderCustomer'))$('orderCustomer').value='';loadAllData();}
    }
    window.addNewOrder=addNewOrder;

    async function adjustBalance(action){
        var sel=$('walletUserSelect')?$('walletUserSelect').value:'';
        var amount=$('balanceAmount')?parseInt($('balanceAmount').value)||0:0;
        if(!sel||!amount){showToast('⚠️ اختر مستخدم وأدخل مبلغ');return;}
        var user=STATE.users.find(function(u){return u.id===sel;});
        if(!user)return;
        var newBal=action==='add'?(parseInt(user.balance_iqd)||0)+amount:(parseInt(user.balance_iqd)||0)-amount;
        var r=await supabase.from('profiles').update({balance_iqd:newBal}).eq('id',sel);
        showToast(r.error?'❌ فشل':'✅ تم '+(action==='add'?'إضافة':'خصم')+' الرصيد');
        if(!r.error){if($('balanceAmount'))$('balanceAmount').value='';loadAllData();}
    }
    window.adjustBalance=adjustBalance;

    async function adjustPages(action){
        var sel=$('walletUserSelect')?$('walletUserSelect').value:'';
        var amount=$('pagesAmount')?parseInt($('pagesAmount').value)||0:0;
        if(!sel||!amount){showToast('⚠️ اختر مستخدم وأدخل عدد صفحات');return;}
        var user=STATE.users.find(function(u){return u.id===sel;});
        if(!user)return;
        var newPg=action==='add'?(parseInt(user.pages_count)||0)+amount:(parseInt(user.pages_count)||0)-amount;
        var r=await supabase.from('profiles').update({pages_count:newPg}).eq('id',sel);
        showToast(r.error?'❌ فشل':'✅ تم '+(action==='add'?'إضافة':'خصم')+' الصفحات');
        if(!r.error){if($('pagesAmount'))$('pagesAmount').value='';loadAllData();}
    }
    window.adjustPages=adjustPages;

    async function sendWelcomeGift(){
        var sel=$('giftUserSelect')?$('giftUserSelect').value:'';
        var balance=$('giftBalance')?parseInt($('giftBalance').value)||50:50;
        var pages=$('giftPages')?parseInt($('giftPages').value)||100:100;
        if(!sel){showToast('⚠️ اختر مستخدم');return;}
        var user=STATE.users.find(function(u){return u.id===sel;});
        if(!user)return;
        var r=await supabase.from('profiles').update({balance_iqd:(parseInt(user.balance_iqd)||0)+balance,pages_count:(parseInt(user.pages_count)||0)+pages}).eq('id',sel);
        showToast(r.error?'❌ فشل':'🎁 تم إرسال الهدية الترحيبية');
        if(!r.error) loadAllData();
    }
    window.sendWelcomeGift=sendWelcomeGift;

    async function sendReward(){
        var sel=$('rewardUserSelect')?$('rewardUserSelect').value:'';
        var balance=$('rewardBalance')?parseInt($('rewardBalance').value)||100:100;
        var pages=$('rewardPages')?parseInt($('rewardPages').value)||200:200;
        if(!sel){showToast('⚠️ اختر مستخدم');return;}
        var user=STATE.users.find(function(u){return u.id===sel;});
        if(!user)return;
        var r=await supabase.from('profiles').update({balance_iqd:(parseInt(user.balance_iqd)||0)+balance,pages_count:(parseInt(user.pages_count)||0)+pages}).eq('id',sel);
        showToast(r.error?'❌ فشل':'⭐ تم إرسال المكافأة');
        if(!r.error) loadAllData();
    }
    window.sendReward=sendReward;

    async function sendBroadcast(){
        var title=$('broadcastTitle')?$('broadcastTitle').value.trim():'';
        var message=$('broadcastMessage')?$('broadcastMessage').value.trim():'';
        var type=$('broadcastType')?$('broadcastType').value:'info';
        if(!title||!message){showToast('⚠️ أدخل عنوان ومحتوى الإشعار');return;}
        var r=await supabase.from('notifications').insert([{title,message,type,created_at:new Date().toISOString()}]);
        showToast(r.error?'❌ فشل: '+r.error.message:'📨 تم إرسال الإشعار للجميع');
        if(!r.error){if($('broadcastTitle'))$('broadcastTitle').value='';if($('broadcastMessage'))$('broadcastMessage').value='';}
    }
    window.sendBroadcast=sendBroadcast;

    async function sendPrivateMessage(){
        var recipient=$('messageRecipient')?$('messageRecipient').value:'';
        var subject=$('messageSubject')?$('messageSubject').value.trim():'';
        var content=$('messageContent')?$('messageContent').value.trim():'';
        if(!recipient||!subject||!content){showToast('⚠️ أدخل جميع البيانات');return;}
        var r=await supabase.from('messages').insert([{user_id:recipient,subject,content,created_at:new Date().toISOString()}]);
        showToast(r.error?'❌ فشل':'💬 تم إرسال الرسالة');
        if(!r.error){if($('messageSubject'))$('messageSubject').value='';if($('messageContent'))$('messageContent').value='';}
    }
    window.sendPrivateMessage=sendPrivateMessage;

    async function saveSetting(key,value){
        if(!supabase){showToast('❌ الاتصال غير متاح');return;}
        var jsonVal=(typeof value==='string'&&!['true','false'].includes(value)&&isNaN(value))?JSON.stringify(value):value;
        var r=await supabase.from('app_settings').update({value:jsonVal}).eq('key',key);
        showToast(r.error?'❌ فشل الحفظ':'✅ تم الحفظ');
    }
    window.saveSetting=saveSetting;

    // ══════════════════════════════════════════════
    //  REALTIME + SYNC
    // ══════════════════════════════════════════════
    function startRealtimeListener(){
        if(!supabase)return;
        try {
            var channel=supabase.channel('admin-rt')
                .on('postgres_changes',{event:'*',schema:'public',table:'profiles'},function(){loadAllData();})
                .on('postgres_changes',{event:'*',schema:'public',table:'services'},function(){loadAllData();})
                .on('postgres_changes',{event:'*',schema:'public',table:'orders'},function(){loadAllData();})
                .on('postgres_changes',{event:'*',schema:'public',table:'tasks'},function(){loadAllData();})
                .on('postgres_changes',{event:'*',schema:'public',table:'app_settings'},function(){loadAllData();})
                .subscribe(function(status){console.log('📡 Realtime:',status);});
            STATE.realtimeChannel=channel;
        } catch(e){ console.warn('Realtime error:',e.message); }
    }

    function startDataSync(){
        if(STATE.syncInterval) clearInterval(STATE.syncInterval);
        STATE.syncInterval=setInterval(function(){
            if(!STATE.isLoading&&supabase) loadAllData();
        },CONFIG.SYNC_INTERVAL);
    }

    // ══════════════════════════════════════════════
    //  INIT
    // ══════════════════════════════════════════════
    async function init(){
        console.log('🚀 TECHNO-CONTROL v16 starting...');
        if(!checkAuth())return;
        updateConnectionStatus('connecting');
        try {
            await initSupabaseClient();
        } catch(err){
            console.error('❌ init failed:',err);
            updateConnectionStatus('error');
            showToast('❌ فشل الاتصال');
            return;
        }
        var dashboard=$('dashboardContainer');
        var boot=$('bootScreen');
        if(dashboard) dashboard.style.display='block';
        if(boot)      boot.style.display='none';
        await loadAllData();
        setupNavigation();
        startRealtimeListener();
        startDataSync();
        updateTime();
        setInterval(updateTime,60000);
        console.log('✅ TECHNO-CONTROL ready');
    }
    window.init=init;

    if(document.readyState==='loading'){
        document.addEventListener('DOMContentLoaded',init);
    } else {
        init();
    }

/* ═══════════════════════════════════════════════════════
   TECHNO-PRINT — Ad Upload Functions (Vanilla JS)
   Paste at BOTTOM of admin-core.js (before last line)
   ═══════════════════════════════════════════════════════ */

const _UPLOAD_URL  = 'https://rqzsokvhgjlftkouhphb.supabase.co';
const _UPLOAD_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY';
const _BUCKET_NAME = 'media';

async function uploadAdImage(input) {
    /* ── Helpers (no jQuery) ── */
    function getEl(id) { return document.getElementById(id); }
    function setBar(pct) { var b = getEl('adProgressBar'); if(b) b.style.width = pct + '%'; }
    function setStatus(msg) { var s = getEl('adUploadStatus'); if(s) s.textContent = msg; }

    try {
        /* 1 ── Validate file ── */
        var file = input && input.files && input.files[0];
        if (!file) { console.warn('[Upload] No file selected'); return; }

        var allowedTypes = ['image/png','image/jpeg','image/jpg','image/webp','image/gif'];
        if (!allowedTypes.includes(file.type)) {
            showToast('❌ نوع الملف غير مدعوم — استخدم PNG أو JPG');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast('❌ حجم الملف أكبر من 5MB');
            return;
        }

        /* 2 ── Show progress bar ── */
        var progressEl = getEl('adUploadProgress');
        var previewEl  = getEl('adPreviewBox');
        if (progressEl) progressEl.style.display = 'block';
        if (previewEl)  previewEl.style.display  = 'none';
        setBar(10);
        setStatus('⏳ جاري رفع الصورة...');

        /* 3 ── Build unique file path ── */
        var ext      = (file.name.split('.').pop() || 'jpg').toLowerCase();
        var filename = 'ad_' + Date.now() + '_' + Math.random().toString(36).substr(2,6) + '.' + ext;
        var filePath = 'ads/' + filename;

        console.log('[Upload] File:', file.name, '| Size:', file.size, '| Path:', filePath);
        setBar(30);

        /* 4 ── Upload via REST API (no Supabase client needed) ── */
        var uploadURL = _UPLOAD_URL + '/storage/v1/object/' + _BUCKET_NAME + '/' + filePath;

        var uploadResponse = await fetch(uploadURL, {
            method:  'POST',
            headers: {
                'apikey':        _UPLOAD_KEY,
                'Authorization': 'Bearer ' + _UPLOAD_KEY,
                'Content-Type':  file.type,
                'x-upsert':      'true'
            },
            body: file
        });

        console.log('[Upload] Response status:', uploadResponse.status);

        if (!uploadResponse.ok) {
            var errText = await uploadResponse.text();
            console.error('[Upload] FULL ERROR:', {
                status:     uploadResponse.status,
                statusText: uploadResponse.statusText,
                body:       errText,
                url:        uploadURL
            });
            throw new Error('رمز الخطأ ' + uploadResponse.status + ' — ' + errText);
        }

        setBar(75);
        setStatus('✅ تم الرفع — جاري الحصول على الرابط...');

        /* 5 ── Build public URL ── */
        var publicURL = _UPLOAD_URL + '/storage/v1/object/public/' + _BUCKET_NAME + '/' + filePath;
        console.log('[Upload] Public URL:', publicURL);

        /* 6 ── Store for saveAdToDatabase() ── */
        window._pendingAdUrl = publicURL;

        setBar(100);
        setStatus('✅ تم الرفع بنجاح!');

        /* 7 ── Show preview ── */
        var previewImg = getEl('adPreviewImg');
        if (previewImg) previewImg.src = publicURL;
        if (previewEl)  previewEl.style.display = 'block';

        showToast('✅ تم رفع الصورة — اضغط حفظ الإعلان');

    } catch (err) {
        /* Full error log */
        console.error('[Upload] CAUGHT ERROR:', {
            message: err.message,
            stack:   err.stack,
            full:    err
        });
        showToast('❌ فشل الرفع: ' + (err.message || 'خطأ غير معروف'));
        setStatus('❌ ' + (err.message || 'خطأ'));
        setBar(0);
    }
}

async function saveAdToDatabase() {
    var url   = window._pendingAdUrl;
    var titleEl = document.getElementById('adTitle');
    var title = (titleEl ? titleEl.value.trim() : '') || 'إعلان';

    if (!url) { showToast('⚠️ ارفع صورة أولاً'); return; }

    console.log('[SaveAd] Saving:', { title: title, url: url });

    try {
        var response = await fetch(_UPLOAD_URL + '/rest/v1/ads', {
            method:  'POST',
            headers: {
                'apikey':       _UPLOAD_KEY,
                'Authorization':'Bearer ' + _UPLOAD_KEY,
                'Content-Type': 'application/json',
                'Prefer':       'return=minimal'
            },
            body: JSON.stringify({
                title:      title,
                image_url:  url,
                is_active:  true,
                created_at: new Date().toISOString()
            })
        });

        if (!response.ok) {
            var errText = await response.text();
            console.error('[SaveAd] FULL ERROR:', {
                status: response.status,
                body:   errText
            });
            throw new Error('رمز الخطأ ' + response.status + ' — ' + errText);
        }

        console.log('[SaveAd] ✅ Saved to database');
        showToast('✅ تم حفظ الإعلان — سيظهر في التطبيق');

        /* Reset UI */
        window._pendingAdUrl = null;
        var pb = document.getElementById('adPreviewBox');
        var pp = document.getElementById('adUploadProgress');
        var ti = document.getElementById('adTitle');
        var fi = document.getElementById('adFileInput');
        if (pb) pb.style.display  = 'none';
        if (pp) pp.style.display  = 'none';
        if (ti) ti.value = '';
        if (fi) fi.value = '';

        if (typeof loadAllData === 'function') loadAllData();

    } catch (err) {
        console.error('[SaveAd] CAUGHT ERROR:', { message: err.message, full: err });
        showToast('❌ فشل الحفظ: ' + (err.message || 'خطأ'));
    }
}

window.uploadAdImage = uploadAdImage;
window.saveAdToDatabase = saveAdToDatabase;

// هذه القفلة هي اللي تنهي الخط الأحمر
})();
