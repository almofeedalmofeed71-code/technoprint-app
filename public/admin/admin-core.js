/**
 * TECHNO-CONTROL ADMIN CORE v12
 * Full Supabase Integration with Service Role + Real-time
 */

// ==================== SUPABASE CONFIG ====================
// Note: Using same Supabase URL as admin-login.js to ensure consistency
const SUPABASE_URL = 'https://rqzsokvhgjlftkouhphb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY';

// Note: For full admin access, use Service Role Key on server-side only
// For client-side, RLS policies must be configured to allow admin access

// ==================== SUPABASE CLIENT ====================
let supabaseClient = null;

// Initialize Supabase Client
async function initSupabase() {
    try {
        // Load supabase-js from CDN if not already loaded
        if (typeof window.supabase === 'undefined') {
            console.log('📦 Loading supabase-js...');
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized');
        return supabaseClient;
    } catch (e) {
        console.error('❌ Failed to init Supabase:', e);
        return null;
    }
}

// ==================== GLOBAL STATE ====================
window.ADMIN_STATE = {
    users: [],
    services: [],
    orders: [],
    ads: [],
    tasks: [],
    currentSection: 'dashboard',
    syncInterval: null,
    realtimeChannel: null,
    isLoading: false,
    isInitialized: false
};

// ==================== UTILITIES ====================
window.showToast = function(message) {
    try {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
    } catch (e) {
        console.log('Toast:', message);
    }
};

window.formatNumber = function(num) {
    if (num == null || isNaN(num)) return '0';
    return parseInt(num).toLocaleString('ar-IQ');
};

// ==================== INIT - FULL DATA FETCH ====================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 TECHNO-CONTROL v12 initializing...');
    
    const token = localStorage.getItem('adminToken') || localStorage.getItem('hseenop33');
    if (!token) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    await initAdmin();
});

async function initAdmin() {
    try {
        updateConnectionStatus('connecting');
        
        // Initialize Supabase
        const client = await initSupabase();
        if (!client) {
            throw new Error('Failed to initialize Supabase');
        }
        
        // Show dashboard
        const overlay = document.getElementById('authOverlay');
        const container = document.getElementById('dashboardContainer');
        if (overlay) overlay.style.display = 'none';
        if (container) container.style.display = 'block';
        
        // Load ALL data from Supabase
        await loadAllData();
        
        // Setup navigation
        setupNavigation();
        
        // Start real-time listener
        startRealtimeListener();
        
        // Start sync interval
        startDataSync();
        
        // Update time
        updateTime();
        setInterval(updateTime, 1000);
        
        updateConnectionStatus('connected');
        window.showToast(`✅ لوحة التحكم جاهزة`);
        
    } catch (err) {
        console.error('❌ Init error:', err);
        updateConnectionStatus('error');
        window.showToast('⚠️ خطأ في الاتصال');
    }
}

async function loadAllData() {
    try {
        ADMIN_STATE.isLoading = true;
        console.log('📡 Fetching ALL data from Supabase...');
        
        const client = supabaseClient;
        
        // ==================== 1. FETCH USERS ====================
        console.log('📡 Fetching users from profiles...');
        const { data: usersData, error: usersError } = await client
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (usersError) {
            console.error('❌ Users fetch error:', usersError);
        } else {
            ADMIN_STATE.users = (usersData || []).map(u => ({
                id: u?.id || '',
                username: u?.username || u?.name || 'Unknown',
                phone: u?.phone || u?.phone_number || '',
                governorate: u?.governorate || u?.city || '',
                balance: u?.balance_iqd || u?.balance || 0,
                pages: u?.pages_count || u?.pages || 0,
                status: u?.status || 'active',
                role: u?.role || 'user',
                created_at: u?.created_at || ''
            }));
            console.log(`✅ USERS: ${ADMIN_STATE.users.length} loaded`);
        }
        
        // ==================== 2. FETCH SERVICES ====================
        console.log('📡 Fetching services...');
        const { data: servicesData, error: servicesError } = await client
            .from('services')
            .select('*')
            .order('order_index', { ascending: true });
        
        if (servicesError) {
            console.error('❌ Services fetch error:', servicesError);
        } else {
            ADMIN_STATE.services = (servicesData || []).map(s => ({
                id: s?.id || '',
                name: s?.name || 'خدمة',
                icon: s?.icon || '📄',
                price: s?.price || 0,
                currency: s?.currency || 'IQD',
                status: s?.status || 'active',
                description: s?.description || ''
            }));
            console.log(`✅ SERVICES: ${ADMIN_STATE.services.length} loaded`);
        }
        
        // ==================== 3. FETCH ORDERS ====================
        console.log('📡 Fetching orders...');
        const { data: ordersData, error: ordersError } = await client
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
        
        if (ordersError) {
            console.error('❌ Orders fetch error:', ordersError);
        } else {
            ADMIN_STATE.orders = ordersData || [];
            console.log(`✅ ORDERS: ${ADMIN_STATE.orders.length} loaded`);
        }
        
        // ==================== 4. FETCH ADS ====================
        console.log('📡 Fetching ads...');
        const { data: adsData, error: adsError } = await client
            .from('ads')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
        
        if (adsError) {
            console.error('❌ Ads fetch error:', adsError);
        } else {
            ADMIN_STATE.ads = adsData || [];
            console.log(`✅ ADS: ${ADMIN_STATE.ads.length} loaded`);
        }
        
        ADMIN_STATE.isLoading = false;
        ADMIN_STATE.isInitialized = true;
        
        // Update stats
        updateStats();
        
        // Render tables
        if (window.renderUsersTable) window.renderUsersTable();
        if (window.renderServicesGrid) window.renderServicesGrid();
        if (window.renderOrdersTable) window.renderOrdersTable();
        if (window.renderAdsGrid) window.renderAdsGrid();
        
        console.log(`✅ ALL DATA LOADED: ${ADMIN_STATE.users.length} users, ${ADMIN_STATE.services.length} services`);
        window.showToast(`📊 ${ADMIN_STATE.users.length} مستخدم | ${ADMIN_STATE.services.length} خدمة`);
        
    } catch (err) {
        console.error('❌ Load error:', err);
        ADMIN_STATE.isLoading = false;
        updateConnectionStatus('error');
    }
}

function updateStats() {
    try {
        const users = ADMIN_STATE.users || [];
        const total = users.length;
        const balance = users.reduce((s, u) => s + (parseInt(u?.balance) || 0), 0);
        const pages = users.reduce((s, u) => s + (parseInt(u?.pages) || 0), 0);
        const active = users.filter(u => u?.status === 'active').length;
        
        console.log(`📊 Stats: ${total} users, ${formatNumber(balance)} IQD, ${formatNumber(pages)} pages`);
        
        // Update dashboard stats
        const el1 = document.getElementById('totalUsers');
        const el2 = document.getElementById('totalBalance');
        const el3 = document.getElementById('totalPages');
        const el4 = document.getElementById('totalActive');
        
        if (el1) el1.textContent = formatNumber(total);
        if (el2) el2.textContent = formatNumber(balance) + ' IQD';
        if (el3) el3.textContent = formatNumber(pages);
        if (el4) el4.textContent = formatNumber(active);
        
        // Update radar stats
        const radarTotal = document.getElementById('radarTotal');
        const radarActive = document.getElementById('radarActive');
        if (radarTotal) radarTotal.textContent = formatNumber(total);
        if (radarActive) radarActive.textContent = formatNumber(active);
        
        // Update orders stats
        const ordersTotal = document.getElementById('ordersTotal');
        const ordersPending = document.getElementById('ordersPending');
        if (ordersTotal) ordersTotal.textContent = formatNumber(ADMIN_STATE.orders?.length || 0);
        if (ordersPending) {
            const pending = ADMIN_STATE.orders?.filter(o => o?.status === 'pending').length || 0;
            ordersPending.textContent = formatNumber(pending);
        }
        
    } catch (e) {
        console.error('❌ Stats error:', e);
    }
}

// ==================== REAL-TIME LISTENER ====================
function startRealtimeListener() {
    try {
        const client = supabaseClient;
        if (!client) return;
        
        // Remove existing channel
        if (ADMIN_STATE.realtimeChannel) {
            client.removeChannel(ADMIN_STATE.realtimeChannel);
        }
        
        // Create realtime channel
        const channel = client.channel('admin-realtime')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'profiles' },
                (payload) => {
                    console.log('🔄 Profiles change:', payload);
                    handleProfileChange(payload);
                }
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'services' },
                (payload) => {
                    console.log('🔄 Services change:', payload);
                    handleServiceChange(payload);
                }
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    console.log('🔄 Orders change:', payload);
                    handleOrderChange(payload);
                }
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'ads' },
                (payload) => {
                    console.log('🔄 Ads change:', payload);
                    handleAdChange(payload);
                }
            )
            .subscribe();
        
        ADMIN_STATE.realtimeChannel = channel;
        console.log('✅ Real-time listener active');
        
    } catch (e) {
        console.error('❌ Realtime error:', e);
    }
}

async function handleProfileChange(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    if (eventType === 'INSERT') {
        // New user added
        const user = {
            id: newRecord?.id || '',
            username: newRecord?.username || 'New User',
            phone: newRecord?.phone || '',
            balance: newRecord?.balance_iqd || 0,
            pages: newRecord?.pages_count || 0,
            status: newRecord?.status || 'active'
        };
        ADMIN_STATE.users.unshift(user);
        window.showToast(`🆕 مستخدم جديد: ${user.username}`);
    } else if (eventType === 'UPDATE') {
        // User updated
        const idx = ADMIN_STATE.users.findIndex(u => u?.id === newRecord?.id);
        if (idx !== -1) {
            ADMIN_STATE.users[idx] = {
                ...ADMIN_STATE.users[idx],
                ...newRecord
            };
        }
    } else if (eventType === 'DELETE') {
        // User deleted
        if (oldRecord?.id) {
            ADMIN_STATE.users = ADMIN_STATE.users.filter(u => u?.id !== oldRecord.id);
        }
    }
    
    // Re-render
    updateStats();
    if (ADMIN_STATE.currentSection === 'users' && window.renderUsersTable) {
        window.renderUsersTable();
    }
}

async function handleServiceChange(payload) {
    const { eventType, new: newRecord } = payload;
    
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
        const service = {
            id: newRecord?.id || '',
            name: newRecord?.name || 'خدمة',
            icon: newRecord?.icon || '📄',
            price: newRecord?.price || 0,
            status: newRecord?.status || 'active'
        };
        
        const idx = ADMIN_STATE.services.findIndex(s => s?.id === service.id);
        if (idx !== -1) {
            ADMIN_STATE.services[idx] = service;
        } else {
            ADMIN_STATE.services.push(service);
        }
    } else if (eventType === 'DELETE') {
        ADMIN_STATE.services = ADMIN_STATE.services.filter(s => s?.id !== payload.old?.id);
    }
    
    if (window.renderServicesGrid) window.renderServicesGrid();
    window.showToast(`🔄 تم تحديث الخدمات`);
}

async function handleOrderChange(payload) {
    const { eventType, new: newRecord } = payload;
    
    if (eventType === 'INSERT') {
        ADMIN_STATE.orders.unshift(newRecord);
        window.showToast(`📦 طلب جديد`);
    }
    
    updateStats();
    if (window.renderOrdersTable) window.renderOrdersTable();
}

async function handleAdChange(payload) {
    const { eventType, new: newRecord } = payload;
    
    if (eventType === 'INSERT') {
        ADMIN_STATE.ads.unshift(newRecord);
    } else if (eventType === 'DELETE') {
        ADMIN_STATE.ads = ADMIN_STATE.ads.filter(a => a?.id !== payload.old?.id);
    }
    
    if (window.renderAdsGrid) window.renderAdsGrid();
}

// ==================== PERIODIC SYNC ====================
function startDataSync() {
    if (ADMIN_STATE.syncInterval) clearInterval(ADMIN_STATE.syncInterval);
    
    ADMIN_STATE.syncInterval = setInterval(async () => {
        try {
            console.log('🔄 Syncing data...');
            await loadAllData();
        } catch (e) {
            console.log('Sync error:', e?.message);
        }
    }, 60000); // Sync every 60 seconds
}

function updateConnectionStatus(status) {
    const el = document.getElementById('connectionStatus');
    if (!el) return;
    
    const map = {
        'connecting': { icon: '🔄', text: 'جاري الاتصال...', color: '#F39C12' },
        'connected': { icon: '✅', text: 'متصل', color: '#2ECC71' },
        'error': { icon: '❌', text: 'غير متصل', color: '#E74C3C' }
    };
    
    const s = map[status] || map['connecting'];
    el.innerHTML = `<span style="color:${s.color}">${s.icon}</span> ${s.text}`;
}

function updateTime() {
    const el = document.getElementById('currentTime');
    if (el) {
        el.textContent = new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
    }
}

function logout() {
    if (ADMIN_STATE.syncInterval) clearInterval(ADMIN_STATE.syncInterval);
    if (ADMIN_STATE.realtimeChannel && supabaseClient) {
        supabaseClient.removeChannel(ADMIN_STATE.realtimeChannel);
    }
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('hseenop33');
    window.location.href = 'admin-login.html';
}

// ==================== SUPABASE HELPERS ====================
window.supabase = {
    async query(table, params = '') {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            console.error(`❌ DB Error:`, e);
            return null;
        }
    },
    
    async insert(table, data) {
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
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            console.error(`❌ Insert Error:`, e);
            return null;
        }
    },
    
    async upsert(table, data) {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            console.error(`❌ Upsert Error:`, e);
            return null;
        }
    },
    
    async update(table, filters, data) {
        try {
            const filterStr = Object.entries(filters).map(([k, v]) => `${k}=eq.${v}`).join('&');
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filterStr}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return res.ok;
        } catch (e) {
            console.error(`❌ Update Error:`, e);
            return false;
        }
    },
    
    async delete(table, filters) {
        try {
            const filterStr = Object.entries(filters).map(([k, v]) => `${k}=eq.${v}`).join('&');
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filterStr}`, {
                method: 'DELETE',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            return res.ok;
        } catch (e) {
            console.error(`❌ Delete Error:`, e);
            return false;
        }
    },
    
    async uploadToStorage(bucket, filePath, file) {
        try {
            const storageUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`;
            
            const res = await fetch(storageUrl, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': file.type
                },
                body: file
            });
            
            if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
            
            const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
            console.log(`✅ Uploaded: ${publicUrl}`);
            return publicUrl;
            
        } catch (e) {
            console.error(`❌ Storage Error:`, e);
            return null;
        }
    }
};

// ==================== NAVIGATION ====================
function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item?.addEventListener('click', () => {
            const section = item?.getAttribute('data-section');
            if (section) switchSection(section);
        });
    });
    
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
}

function switchSection(sectionId) {
    try {
        ADMIN_STATE.currentSection = sectionId;
        
        // Hide all sections
        document.querySelectorAll('.section-panel').forEach(el => {
            el?.classList?.remove('active');
        });
        
        // Show target
        const target = document.getElementById(sectionId);
        if (target) target.classList.add('active');
        
        // Update nav
        document.querySelectorAll('.nav-item').forEach(el => el?.classList?.remove('active'));
        const activeNav = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
        if (activeNav) activeNav.classList.add('active');
        
        // Update title
        const titles = {
            'dashboard': 'لوحة التحكم',
            'users': 'قاعدة البيانات',
            'services': 'إدارة الخدمات',
            'orders': 'الطلبات',
            'tasks': 'المهام',
            'wallet': 'المحفظة',
            'gifts': 'الإرسال',
            'design': 'الألوان',
            'texts': 'النصوص',
            'ads': 'الإعلانات',
            'broadcast': 'الإشعارات',
            'messages': 'الرسائل',
            'radar': 'رادار المستخدمين',
            'printing': 'وحدة الطباعة'
        };
        
        const titleEl = document.getElementById('sectionTitle');
        if (titleEl) titleEl.textContent = titles[sectionId] || sectionId;
        
        // Render section content
        if (sectionId === 'users' && window.renderUsersTable) window.renderUsersTable();
        if (sectionId === 'services' && window.renderServicesGrid) window.renderServicesGrid();
        if (sectionId === 'orders' && window.renderOrdersTable) window.renderOrdersTable();
        if (sectionId === 'ads' && window.renderAdsGrid) window.renderAdsGrid();
        if (sectionId === 'tasks' && window.renderTasksList) window.renderTasksList();
        
        console.log(`📱 Switched to: ${sectionId}`);
        
    } catch (err) {
        console.error('❌ Section switch error:', err);
    }
}

// ==================== MOBILE MENU ====================
window.toggleMobileMenu = function() {
    try {
        const sidebar = document.getElementById('adminSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.toggle('mobile-open');
        if (overlay) overlay.classList.toggle('active');
    } catch (err) {
        console.error('Mobile menu error:', err);
    }
};

// ==================== EXPORT ====================
window.ADMIN_STATE = ADMIN_STATE;
window.initAdmin = initAdmin;
window.loadAllData = loadAllData;
window.switchSection = switchSection;
window.logout = logout;
window.updateStats = updateStats;
window.toggleMobileMenu = toggleMobileMenu;
window.supabaseClient = supabaseClient;

console.log('✅ Admin Core v12 loaded - FULL SUPABASE INTEGRATION');