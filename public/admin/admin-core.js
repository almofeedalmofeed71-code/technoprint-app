/**
 * TECHNO-CONTROL ADMIN CORE v8
 * Core initialization and Supabase client
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
    isLoading: false
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
            return await res.json();
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
        console.log('🚀 TECHNO-CONTROL v8 - Loading...');
        updateConnectionStatus('connecting');
        
        // Show dashboard
        const overlay = document.getElementById('authOverlay');
        const container = document.getElementById('dashboardContainer');
        if (overlay) overlay.style.display = 'none';
        if (container) container.style.display = 'flex';
        
        // Load all data
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
        window.showToast('✅ لوحة التحكم جاهزة');
        
    } catch (err) {
        console.error('Init error:', err);
        updateConnectionStatus('error');
        window.showToast('⚠️ حدث خطأ في التحميل');
    }
}

async function loadAllData() {
    try {
        ADMIN_STATE.isLoading = true;
        
        // Load users
        const usersData = await window.supabase.query('profiles', '?select=*&order=created_at.desc&limit=500');
        if (usersData && Array.isArray(usersData)) {
            ADMIN_STATE.users = usersData.map(u => ({
                id: u?.id || '',
                username: u?.username || 'مستخدم',
                phone: u?.phone || '',
                governorate: u?.governorate || '',
                balance: u?.balance_iqd || 0,
                pages: u?.pages_count || 0,
                status: u?.status || 'active',
                role: u?.role || 'user'
            }));
        }
        
        // Load orders
        const ordersData = await window.supabase.query('orders', '?select=*&order=created_at.desc&limit=100');
        if (ordersData && Array.isArray(ordersData)) {
            ADMIN_STATE.orders = ordersData;
        }
        
        // Load tasks
        const tasksData = await window.supabase.query('tasks', '?select=*&order=created_at.desc&limit=50');
        if (tasksData && Array.isArray(tasksData)) {
            ADMIN_STATE.tasks = tasksData;
        }
        
        ADMIN_STATE.isLoading = false;
        renderDashboard();
        
    } catch (err) {
        console.error('Load error:', err);
        ADMIN_STATE.isLoading = false;
        loadDemoData();
        renderDashboard();
    }
}

function loadDemoData() {
    ADMIN_STATE.users = [
        { id: '1', username: 'أحمد محمد', phone: '07701234567', governorate: 'بغداد', balance: 150, pages: 500, status: 'active' },
        { id: '2', username: 'زينب علي', phone: '07712345678', governorate: 'البصرة', balance: 200, pages: 1000, status: 'active' },
        { id: '3', username: 'محمد خالد', phone: '07723456789', governorate: 'أربيل', balance: 75, pages: 300, status: 'active' },
        { id: '4', username: 'فاطمة سعيد', phone: '07734567890', governorate: 'نينوى', balance: 120, pages: 450, status: 'active' }
    ];
    ADMIN_STATE.orders = [
        { id: '1', customer: 'أحمد محمد', type: 'A4', pages: 50, amount: 5000, status: 'pending', created_at: new Date().toISOString() },
        { id: '2', customer: 'زينب علي', type: 'A3', pages: 100, amount: 15000, status: 'completed', created_at: new Date().toISOString() }
    ];
    ADMIN_STATE.tasks = [
        { id: '1', title: 'طباعة تقرير', status: 'pending' },
        { id: '2', title: 'تصميم شعار', status: 'in_progress' }
    ];
}

function renderDashboard() {
    try {
        // Update stats
        updateStats();
        
        // Update current section
        const section = ADMIN_STATE.currentSection;
        switchSection(section);
        
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
        
        const el1 = document.getElementById('totalUsers');
        const el2 = document.getElementById('totalBalance');
        const el3 = document.getElementById('totalPages');
        const el4 = document.getElementById('totalActive');
        
        if (el1) el1.textContent = formatNumber(total);
        if (el2) el2.textContent = formatNumber(balance) + ' IQD';
        if (el3) el3.textContent = formatNumber(pages);
        if (el4) el4.textContent = formatNumber(active);
    } catch (e) {
        console.error('Stats error:', e);
    }
}

function startDataSync() {
    if (ADMIN_STATE.syncInterval) clearInterval(ADMIN_STATE.syncInterval);
    ADMIN_STATE.syncInterval = setInterval(async () => {
        try {
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
                renderUsersTable();
            }
        } catch (e) {}
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
            'messages': 'الرسائل'
        };
        
        const titleEl = document.getElementById('sectionTitle');
        if (titleEl) titleEl.textContent = titles[sectionId] || sectionId;
        
        // Render section content
        renderSection(sectionId);
        
    } catch (err) {
        console.error('Section switch error:', err);
    }
}

function renderSection(section) {
    switch (section) {
        case 'users':
            renderUsersTable();
            break;
        case 'orders':
            renderOrdersTable();
            break;
        case 'tasks':
            renderTasksList();
            break;
        case 'wallet':
            populateUserDropdowns();
            break;
        case 'gifts':
            populateUserDropdowns();
            break;
        case 'messages':
            populateUserDropdowns();
            break;
    }
}

// ==================== BUTTON SETUP ====================
function setupButtons() {
    // Logout
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
}

// Export for global use
window.ADMIN_STATE = ADMIN_STATE;
window.initAdmin = initAdmin;
window.switchSection = switchSection;
window.logout = logout;
window.loadAllData = loadAllData;
window.renderDashboard = renderDashboard;