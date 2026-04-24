// ===== TECHNO-CONTROL CLIENT SYNC ENGINE - ENHANCED VERSION =====
// Sync Admin changes to Client UI in REAL-TIME

// Config Keys
const CONFIG_KEY = 'technoprintConfig';
const NOTIFICATIONS_KEY = 'technoprintNotifications';
const WALLET_KEY = 'technoprintWallet';
const USERS_KEY = 'technoprintUsers';

// Supabase Config
const SUPABASE_URL = 'https://avabozirwdefwtabywqo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YWJvemlyd2RlZnd0YWJ5d3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjM1NDQsImV4cCI6MjA5MjQzOTU0NH0.boDU0pXR1MGYiJXF1Jos-w0uehKCCZHsKgxHP7nbQVY';

// Load configuration
function loadClientConfig() {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    
    return {
        mainGold: '#D4AF37',
        mainBlack: '#0A0A0A',
        appTitle: 'TECHNO-PRINT',
        portalIcons: {
            student: '👨‍🎓',
            teacher: '👨‍🏫',
            academy: '🎓',
            store: '🏪',
            support: '💻',
            settings: '⚙️'
        },
        portalStatus: {
            student: true,
            teacher: true,
            academy: true,
            store: false,
            support: true,
            settings: true
        }
    };
}

// Apply theme colors to CSS variables
function applyThemeColors() {
    const config = loadClientConfig();
    
    document.documentElement.style.setProperty('--main-gold', config.mainGold);
    document.documentElement.style.setProperty('--main-black', config.mainBlack);
    document.body.style.setProperty('--main-gold', config.mainGold);
    document.body.style.setProperty('--main-black', config.mainBlack);
}

// Apply portal icons
function applyPortalIcons() {
    const config = loadClientConfig();
    const icons = config.portalIcons || {};
    
    // Find and update portal icons
    document.querySelectorAll('[data-portal-icon]').forEach(el => {
        const portalId = el.dataset.portalIcon;
        if (icons[portalId]) {
            el.textContent = icons[portalId];
        }
    });
}

// Check if portal is active
function isPortalActive(portalId) {
    const config = loadClientConfig();
    return config.portalStatus?.[portalId] !== false;
}

// Notifications
function loadNotifications() {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
}

function showNotification(title, message, type = 'info') {
    const notifications = loadNotifications();
    
    const notification = {
        id: Date.now(),
        title,
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    notifications.unshift(notification);
    if (notifications.length > 50) {
        notifications.pop();
    }
    
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    updateNotificationBell();
    
    // Show toast
    if (typeof showToast === 'function') {
        showToast(`${title}: ${message}`);
    }
}

function updateNotificationBell() {
    const bell = document.querySelector('.bell-icon, #bellIcon, [data-bell]');
    if (bell) {
        const notifications = loadNotifications();
        const unread = notifications.filter(n => !n.read).length;
        
        let badge = bell.querySelector('.notification-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'notification-badge';
            bell.style.position = 'relative';
            bell.appendChild(badge);
        }
        
        badge.textContent = unread > 0 ? unread : '';
        badge.style.cssText = unread > 0 ? `
            position: absolute;
            top: -5px;
            right: -5px;
            background: #E63946;
            color: white;
            border-radius: 50%;
            padding: 2px 6px;
            font-size: 10px;
            min-width: 18px;
            text-align: center;
        ` : 'display: none';
    }
}

// Wallet sync
function syncWalletBalance() {
    const walletData = localStorage.getItem(WALLET_KEY);
    if (walletData) {
        const data = JSON.parse(walletData);
        const balanceEl = document.querySelector('.wallet-balance, #walletBalance, [data-wallet]');
        if (balanceEl) {
            balanceEl.textContent = data.balance.toLocaleString();
        }
    }
}

function updateWalletBalance(newBalance, pages = 0) {
    const data = {
        balance: newBalance,
        pages: pages,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(WALLET_KEY, JSON.stringify(data));
    syncWalletBalance();
}

// Fetch real users from Supabase
async function syncUsersFromDatabase() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&order=created_at.desc`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        const data = await response.json();
        if (Array.isArray(data)) {
            const users = data.map(u => ({
                id: u.id,
                name: u.full_name || 'مستخدم',
                phone: u.phone || '',
                governorate: u.governorate || '',
                balance: u.balance_iqd || 0,
                pages: u.pages_count || 0,
                status: 'active',
                createdAt: u.created_at
            }));
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            return users;
        }
    } catch (e) {
        console.error('Failed to sync users:', e);
    }
    return [];
}

// Register user to Supabase
async function registerUser(formData) {
    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY
            },
            body: JSON.stringify({
                email: formData.email,
                password: formData.password,
                data: {
                    full_name: formData.fullName,
                    phone: formData.phone,
                    governorate: formData.governorate,
                    username: formData.username
                }
            })
        });
        
        const result = await response.json();
        
        if (result.user) {
            // Create profile
            await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                },
                body: JSON.stringify({
                    id: result.user.id,
                    full_name: formData.fullName,
                    phone: formData.phone,
                    governorate: formData.governorate,
                    username: formData.username,
                    balance_iqd: 0,
                    pages_count: 0
                })
            });
            
            return { success: true, user: result.user };
        }
        
        return { success: false, error: result.message || 'Registration failed' };
    } catch (e) {
        console.error('Registration error:', e);
        return { success: false, error: e.message };
    }
}

// Get config from server
async function fetchConfigFromServer() {
    try {
        const response = await fetch('/api/admin/config');
        const data = await response.json();
        if (data.success && data.config) {
            localStorage.setItem(CONFIG_KEY, JSON.stringify(data.config));
            return data.config;
        }
    } catch (e) {
        console.error('Failed to fetch config:', e);
    }
    return loadClientConfig();
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch config from server first
    await fetchConfigFromServer();
    
    // Apply initial settings
    applyThemeColors();
    applyPortalIcons();
    updateNotificationBell();
    syncWalletBalance();
    
    // Sync users from database
    await syncUsersFromDatabase();
    
    // Poll for changes every 5 seconds
    setInterval(async () => {
        await fetchConfigFromServer();
        applyThemeColors();
        applyPortalIcons();
    }, 5000);
    
    // Poll notifications every 3 seconds
    setInterval(async () => {
        await fetchConfigFromServer();
        updateNotificationBell();
    }, 3000);
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});

// Listen for storage changes from other tabs
window.addEventListener('storage', (e) => {
    if (e.key === CONFIG_KEY) {
        applyThemeColors();
        applyPortalIcons();
    }
    if (e.key === NOTIFICATIONS_KEY) {
        updateNotificationBell();
        if (e.newValue) {
            const notifications = JSON.parse(e.newValue);
            const latest = notifications[0];
            if (latest && !latest.read) {
                showNotification(latest.title, latest.message, latest.type);
            }
        }
    }
});

// Export functions
window.ClientSync = {
    loadConfig: loadClientConfig,
    applyTheme: applyThemeColors,
    applyIcons: applyPortalIcons,
    loadNotifications,
    showNotification,
    updateWallet: updateWalletBalance,
    isPortalActive,
    fetchConfigFromServer,
    syncUsersFromDatabase,
    registerUser
};