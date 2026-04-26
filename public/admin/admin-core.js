/**
 * TECHNO-CONTROL ADMIN CORE v10
 * REAL DATA ONLY - NO DEMO DATA
 * Connects to Supabase profiles table
 */

// ==================== SUPABASE CONFIG ====================
const SUPABASE_URL = 'https://avabozirwdefwtabywqo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YWJvemlyd2RlZnd0YWJ5d3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjM1NDQsImV4cCI6MjA5MjQzOTU0NH0.boDU0pXR1MGYiJXF1Jos-w0uehKCCZHsKgxHP7nbQVY';

// ==================== GLOBAL STATE ====================
window.ADMIN_STATE = {
    users: [],
    orders: [],
    tasks: [],
    ads: [],
    currentSection: 'dashboard',
    syncInterval: null,
    isLoading: false,
    isInitialized: false
};

// ==================== SUPABASE CLIENT ====================
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
            if (!res.ok) {
                console.error(`❌ HTTP ${res.status} for ${table}`);
                return null;
            }
            const data = await res.json();
            console.log(`✅ [${table}] →`, Array.isArray(data) ? data.length : 0, 'records');
            return data;
        } catch (e) {
            console.error(`❌ DB Error [${table}]:`, e?.message);
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
            if (!res.ok) {
                const err = await res.text();
                console.error(`❌ Insert error [${table}]:`, err);
                return null;
            }
            return await res.json();
        } catch (e) {
            console.error(`❌ Insert Error:`, e?.message);
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
            console.error(`❌ Update Error:`, e?.message);
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
            console.error(`❌ Delete Error:`, e?.message);
            return false;
        }
    }
};

// ==================== UTILITIES ====================
window.showToast = function(message) {
    try {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    } catch (e) {
        console.log('Toast:', message);
    }
};

window.formatNumber = function(num) {
    if (num == null || isNaN(num)) return '0';
    return parseInt(num).toLocaleString('ar-IQ');
};

// ==================== INIT - FETCH REAL DATA ONLY ====================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 TECHNO-CONTROL v10 initializing...');
    
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
        
        // Show dashboard
        const overlay = document.getElementById('authOverlay');
        const container = document.getElementById('dashboardContainer');
        if (overlay) overlay.style.display = 'none';
        if (container) {
            container.style.display = 'block';
        }
        
        // Load REAL DATA from Supabase
        await loadAllData();
        
        // Setup navigation
        setupNavigation();
        
        // Start sync every 30 seconds
        startDataSync();
        
        // Update time
        updateTime();
        setInterval(updateTime, 1000);
        
        updateConnectionStatus('connected');
        
    } catch (err) {
        console.error('❌ Init error:', err);
        updateConnectionStatus('error');
        window.showToast('⚠️ خطأ في الاتصال');
    }
}

async function loadAllData() {
    try {
        ADMIN_STATE.isLoading = true;
        console.log('📡 Fetching REAL data from Supabase...');
        
        // Fetch REAL users from profiles table
        const usersData = await window.supabase.query(
            'profiles',
            '?select=*&order=created_at.desc'
        );
        
        if (usersData && Array.isArray(usersData) && usersData.length > 0) {
            ADMIN_STATE.users = usersData.map(u => ({
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
            console.log(`✅ REAL DATA: ${ADMIN_STATE.users.length} users loaded`);
        } else {
            console.log('⚠️ No users in database');
            ADMIN_STATE.users = [];
        }
        
        // Fetch orders
        const ordersData = await window.supabase.query(
            'orders',
            '?select=*&order=created_at.desc'
        );
        if (ordersData && Array.isArray(ordersData)) {
            ADMIN_STATE.orders = ordersData;
            console.log(`📦 ${ADMIN_STATE.orders.length} orders loaded`);
        }
        
        // Fetch ads from ads table (not localStorage)
        const adsData = await window.supabase.query(
            'ads',
            '?select=*&order=created_at.desc&limit=20'
        );
        if (adsData && Array.isArray(adsData)) {
            ADMIN_STATE.ads = adsData;
            console.log(`📢 ${ADMIN_STATE.ads.length} ads loaded`);
        }
        
        ADMIN_STATE.isLoading = false;
        ADMIN_STATE.isInitialized = true;
        
        // Update stats with REAL data
        updateStats();
        
        // Render users table immediately
        if (window.renderUsersTable) {
            window.renderUsersTable();
        }
        
        window.showToast(`✅ ${ADMIN_STATE.users.length} مستخدم محمل`);
        
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
        
        console.log(`📊 Stats: ${total} users, ${balance} IQD, ${pages} pages`);
        
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
        if (radarTotal) radarTotal.textContent = total;
        if (radarActive) radarActive.textContent = active;
        
    } catch (e) {
        console.error('❌ Stats error:', e);
    }
}

function startDataSync() {
    if (ADMIN_STATE.syncInterval) clearInterval(ADMIN_STATE.syncInterval);
    
    ADMIN_STATE.syncInterval = setInterval(async () => {
        try {
            console.log('🔄 Syncing real data...');
            
            const usersData = await window.supabase.query(
                'profiles',
                '?select=*&order=created_at.desc'
            );
            
            if (usersData && Array.isArray(usersData)) {
                ADMIN_STATE.users = usersData.map(u => ({
                    id: u?.id || '',
                    username: u?.username || 'Unknown',
                    phone: u?.phone || '',
                    governorate: u?.governorate || '',
                    balance: u?.balance_iqd || 0,
                    pages: u?.pages_count || 0,
                    status: u?.status || 'active'
                }));
                
                updateStats();
                
                // Re-render users table if on users section
                if (ADMIN_STATE.currentSection === 'users' && window.renderUsersTable) {
                    window.renderUsersTable();
                }
                
                console.log(`✅ Synced: ${ADMIN_STATE.users.length} users`);
            }
        } catch (e) {
            console.log('Sync error:', e?.message);
        }
    }, 30000);
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
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('hseenop33');
    window.location.href = 'admin-login.html';
}

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
        
        // Show target section
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
            'orders': 'الطلبات',
            'tasks': 'المهام',
            'wallet': 'المحفظة',
            'gifts': 'الإرسال',
            'design': 'الألوان',
            'texts': 'النصوص',
            'broadcast': 'الإشعارات',
            'messages': 'الرسائل',
            'radar': 'رادار المستخدمين',
            'printing': 'وحدة الطباعة',
            'ads': 'الإعلانات'
        };
        
        const titleEl = document.getElementById('sectionTitle');
        if (titleEl) titleEl.textContent = titles[sectionId] || sectionId;
        
        // Render section content
        if (sectionId === 'users' && window.renderUsersTable) window.renderUsersTable();
        if (sectionId === 'ads' && window.loadAdsFromDB) window.loadAdsFromDB();
        
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
window.switchSection = switchSection;
window.logout = logout;
window.loadAllData = loadAllData;
window.updateStats = updateStats;
window.toggleMobileMenu = toggleMobileMenu;

console.log('✅ Admin Core v10 loaded - REAL DATA ONLY');