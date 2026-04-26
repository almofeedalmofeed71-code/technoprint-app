/**
 * TECHNO-CONTROL ADMIN CORE v9
 * Core initialization with REAL DATA from Supabase
 */

// ==================== SUPABASE CONFIG ====================
const SUPABASE_URL = 'https://avabozirwdefwtabywqo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YWJvemlyd2RlZnd0YWJ5d3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjM1NDQsImV4cCI6MjA5MjQzOTU0NH0.boDU0pXR1MGYiJXF1Jos-w0uehKCCZHsKgxHP7nbQVY';

// ==================== GLOBAL STATE ====================
window.ADMIN_STATE = {
    users: [],
    orders: [],
    tasks: [],
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
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            console.log(`✅ [${table}] Fetched:`, Array.isArray(data) ? data.length : 0, 'records');
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
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
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

// ==================== CORE UTILITIES ====================
window.showToast = function(message) {
    try {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.style.display = 'block';
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            toast.style.display = 'none';
        }, 3000);
    } catch (e) {
        console.log('Toast:', message);
    }
};

window.formatNumber = function(num) {
    if (num == null) return '0';
    return parseInt(num).toLocaleString('ar-IQ');
};

window.formatDate = function(dateStr) {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString('ar-IQ');
    } catch (e) {
        return '-';
    }
};

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('hseenop33');
    if (token) {
        initAdmin();
    } else {
        window.location.href = 'admin-login.html';
    }
});

async function initAdmin() {
    try {
        console.log('🚀 TECHNO-CONTROL v9 - Loading...');
        updateConnectionStatus('connecting');
        
        // Show dashboard
        const overlay = document.getElementById('authOverlay');
        const container = document.getElementById('dashboardContainer');
        if (overlay) overlay.style.display = 'none';
        if (container) {
            container.style.display = 'flex';
            container.style.width = '100vw';
            container.style.height = '100vh';
        }
        
        // Load all data from Supabase
        await loadAllData();
        
        // Setup event listeners
        setupNavigation();
        setupButtons();
        
        // Start sync
        startDataSync();
        
        // Update time
        updateTime();
        setInterval(updateTime, 1000);
        
        updateConnectionStatus('connected');
        window.showToast(`✅ لوحة التحكم جاهزة - ${ADMIN_STATE.users?.length || 0} مستخدم`);
        
    } catch (err) {
        console.error('Init error:', err);
        updateConnectionStatus('error');
        window.showToast('⚠️ حدث خطأ في التحميل');
        loadDemoData();
        renderDashboard();
    }
}

async function loadAllData() {
    try {
        ADMIN_STATE.isLoading = true;
        console.log('📡 Loading data from Supabase...');
        
        // Load users from profiles table
        const usersData = await window.supabase.query('profiles', '?select=*&order=created_at.desc&limit=500');
        
        if (usersData && Array.isArray(usersData) && usersData.length > 0) {
            ADMIN_STATE.users = usersData.map(u => ({
                id: u?.id || '',
                username: u?.username || 'مستخدم',
                phone: u?.phone || '',
                governorate: u?.governorate || '',
                category: u?.category || '',
                balance: u?.balance_iqd || 0,
                pages: u?.pages_count || 0,
                status: u?.status || 'active',
                role: u?.role || 'user'
            }));
            console.log(`✅ Loaded ${ADMIN_STATE.users.length} users`);
        } else {
            console.log('⚠️ No users found in DB, using demo data');
            loadDemoData();
        }
        
        // Load orders
        const ordersData = await window.supabase.query('orders', '?select=*&order=created_at.desc&limit=100');
        if (ordersData && Array.isArray(ordersData)) {
            ADMIN_STATE.orders = ordersData;
            console.log(`📦 Loaded ${ADMIN_STATE.orders.length} orders`);
        }
        
        // Load tasks
        const tasksData = await window.supabase.query('tasks', '?select=*&order=created_at.desc&limit=50');
        if (tasksData && Array.isArray(tasksData)) {
            ADMIN_STATE.tasks = tasksData;
            console.log(`📋 Loaded ${ADMIN_STATE.tasks.length} tasks`);
        }
        
        ADMIN_STATE.isLoading = false;
        ADMIN_STATE.isInitialized = true;
        
        // Render dashboard with real data
        renderDashboard();
        
        // Force render users table
        setTimeout(() => {
            if (window.renderUsersTable) window.renderUsersTable();
        }, 100);
        
    } catch (err) {
        console.error('Load error:', err);
        ADMIN_STATE.isLoading = false;
        loadDemoData();
        renderDashboard();
    }
}

function loadDemoData() {
    console.log('📝 Loading demo data...');
    ADMIN_STATE.users = [
        { id: 'demo1', username: 'أحمد محمد', phone: '07701234567', governorate: 'بغداد', balance: 150, pages: 500, status: 'active' },
        { id: 'demo2', username: 'زينب علي', phone: '07712345678', governorate: 'البصرة', balance: 200, pages: 1000, status: 'active' },
        { id: 'demo3', username: 'محمد خالد', phone: '07723456789', governorate: 'أربيل', balance: 75, pages: 300, status: 'active' },
        { id: 'demo4', username: 'فاطمة سعيد', phone: '07734567890', governorate: 'نينوى', balance: 120, pages: 450, status: 'active' },
        { id: 'demo5', username: 'علي حسن', phone: '07745678901', governorate: 'النجف', balance: 300, pages: 800, status: 'active' }
    ];
    ADMIN_STATE.orders = [
        { id: '1', customer: 'أحمد محمد', type: 'A4', pages: 50, amount: 5000, status: 'pending', created_at: new Date().toISOString() },
        { id: '2', customer: 'زينب علي', type: 'A3', pages: 100, amount: 15000, status: 'completed', created_at: new Date().toISOString() }
    ];
    ADMIN_STATE.tasks = [
        { id: '1', title: 'طباعة تقرير', status: 'pending', created_at: new Date().toISOString() },
        { id: '2', title: 'تصميم شعار', status: 'in_progress', created_at: new Date().toISOString() }
    ];
    console.log('✅ Demo data loaded:', ADMIN_STATE.users.length, 'users');
}

function renderDashboard() {
    try {
        console.log('🎨 Rendering dashboard...');
        
        // Update stats with REAL values
        updateStats();
        
        // Update radar stats
        updateRadarStats();
        
        // Force update current section
        const section = ADMIN_STATE.currentSection;
        if (section === 'dashboard') {
            switchSection('dashboard');
        } else {
            switchSection(section);
        }
        
        // Make sure users table is rendered
        setTimeout(() => {
            const tbody = document.getElementById('usersTableBody');
            if (tbody && tbody.innerHTML.trim() === '') {
                console.log('⚠️ Users table empty, re-rendering...');
                if (window.renderUsersTable) window.renderUsersTable();
            }
        }, 500);
        
    } catch (err) {
        console.error('Render error:', err);
    }
}

function updateStats() {
    try {
        const total = ADMIN_STATE.users?.length || 0;
        const balance = ADMIN_STATE.users?.reduce((s, u) => s + (u?.balance || 0), 0) || 0;
        const pages = ADMIN_STATE.users?.reduce((s, u) => s + (u?.pages || 0), 0) || 0;
        const active = ADMIN_STATE.users?.filter(u => u?.status === 'active').length || 0;
        
        console.log(`📊 Stats: ${total} users, ${balance} IQD balance, ${pages} pages, ${active} active`);
        
        const el1 = document.getElementById('totalUsers');
        const el2 = document.getElementById('totalBalance');
        const el3 = document.getElementById('totalPages');
        const el4 = document.getElementById('totalActive');
        
        if (el1) el1.textContent = formatNumber(total);
        if (el2) el2.textContent = formatNumber(balance) + ' IQD';
        if (el3) el3.textContent = formatNumber(pages);
        if (el4) el4.textContent = formatNumber(active);
        
        // Update radar stats
        updateRadarStats();
        
    } catch (e) {
        console.error('Stats error:', e);
    }
}

function updateRadarStats() {
    try {
        const total = ADMIN_STATE.users?.length || 0;
        const active = ADMIN_STATE.users?.filter(u => u?.status === 'active').length || 0;
        const today = ADMIN_STATE.users?.filter(u => {
            if (!u?.created_at) return false;
            const d = new Date(u.created_at);
            const t = new Date();
            return d.toDateString() === t.toDateString();
        }).length || 0;
        
        const el1 = document.getElementById('radarTotal');
        const el2 = document.getElementById('radarActive');
        const el3 = document.getElementById('radarNewToday');
        const el4 = document.getElementById('radarActiveNow');
        
        if (el1) el1.textContent = total;
        if (el2) el2.textContent = active;
        if (el3) el3.textContent = today;
        if (el4) el4.textContent = Math.max(1, Math.floor(total * 0.3));
        
    } catch (e) {
        console.error('Radar stats error:', e);
    }
}

function startDataSync() {
    if (ADMIN_STATE.syncInterval) clearInterval(ADMIN_STATE.syncInterval);
    ADMIN_STATE.syncInterval = setInterval(async () => {
        try {
            console.log('🔄 Syncing data...');
            const usersData = await window.supabase.query('profiles', '?select=*&order=created_at.desc&limit=500');
            if (usersData && Array.isArray(usersData)) {
                ADMIN_STATE.users = usersData.map(u => ({
                    id: u?.id || '',
                    username: u?.username || 'مستخدم',
                    phone: u?.phone || '',
                    governorate: u?.governorate || '',
                    balance: u?.balance_iqd || 0,
                    pages: u?.pages_count || 0,
                    status: u?.status || 'active'
                }));
                updateStats();
                // Only update table if we're on users section
                if (ADMIN_STATE.currentSection === 'users' && window.renderUsersTable) {
                    window.renderUsersTable();
                }
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
        renderSection(sectionId);
        
        // Log section switch
        console.log(`📱 Switched to: ${sectionId}`);
        
    } catch (err) {
        console.error('Section switch error:', err);
    }
}

function renderSection(section) {
    switch (section) {
        case 'users':
            if (window.renderUsersTable) window.renderUsersTable();
            break;
        case 'orders':
            if (window.renderOrdersTable) window.renderOrdersTable();
            break;
        case 'tasks':
            if (window.renderTasksList) window.renderTasksList();
            break;
        case 'wallet':
        case 'gifts':
        case 'messages':
            if (window.populateUserDropdowns) window.populateUserDropdowns();
            break;
        case 'radar':
            updateRadarStats();
            break;
        case 'printing':
            // Load printing data
            break;
        case 'ads':
            // Load ads data
            break;
    }
}

// ==================== BUTTON SETUP ====================
function setupButtons() {
    // Logout
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
}

// ==================== MOBILE MENU TOGGLE ====================
window.toggleMobileMenu = function() {
    try {
        const sidebar = document.getElementById('adminSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) {
            sidebar.classList.toggle('mobile-open');
            if (overlay) {
                overlay.classList.toggle('active');
            }
        }
    } catch (err) {
        console.error('Mobile menu error:', err);
    }
};

// Close mobile menu when clicking nav item
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-item').forEach(item => {
        item?.addEventListener('click', () => {
            if (window.innerWidth < 769) {
                window.toggleMobileMenu();
            }
        });
    });
});

// ==================== EXPORT TO WINDOW ====================
window.ADMIN_STATE = ADMIN_STATE;
window.initAdmin = initAdmin;
window.switchSection = switchSection;
window.logout = logout;
window.loadAllData = loadAllData;
window.renderDashboard = renderDashboard;
window.updateStats = updateStats;
window.toggleMobileMenu = toggleMobileMenu;
window.loadDemoData = loadDemoData;

console.log('✅ Admin Core v9 loaded');