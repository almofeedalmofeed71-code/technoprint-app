// ===== TECHNO-CONTROL CLIENT SYNC ENGINE =====
// This file syncs Admin Dashboard changes to Client UI in real-time

// Configuration sync key
const CONFIG_KEY = 'technoprintConfig';
const NOTIFICATIONS_KEY = 'technoprintNotifications';
const WALLET_KEY = 'technoprintWallet';

// Load configuration from localStorage (or config.json)
function loadClientConfig() {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    
    // Default config
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

// Apply colors to CSS variables
function applyThemeColors() {
    const config = loadClientConfig();
    
    document.documentElement.style.setProperty('--main-gold', config.mainGold);
    document.documentElement.style.setProperty('--main-black', config.mainBlack);
    
    // Also apply to body
    document.body.style.setProperty('--main-gold', config.mainGold);
    document.body.style.setProperty('--main-black', config.mainBlack);
}

// Update portal icons in the UI
function applyPortalIcons() {
    const config = loadClientConfig();
    const icons = config.portalIcons || {};
    
    // Find all icon placeholders and update
    document.querySelectorAll('[data-portal-icon]').forEach(el => {
        const portalId = el.dataset.portalIcon;
        if (icons[portalId]) {
            el.textContent = icons[portalId];
        }
    });
    
    // Update student portal icon
    const studentIcon = document.querySelector('.student-icon, .portal-student-icon, [class*="student"] .icon');
    if (studentIcon && icons.student) {
        studentIcon.textContent = icons.student;
    }
    
    // Update teacher portal icon
    const teacherIcon = document.querySelector('.teacher-icon, .portal-teacher-icon, [class*="teacher"] .icon');
    if (teacherIcon && icons.teacher) {
        teacherIcon.textContent = icons.teacher;
    }
    
    // Update academy portal icon
    const academyIcon = document.querySelector('.academy-icon, .portal-academy-icon, [class*="academy"] .icon');
    if (academyIcon && icons.academy) {
        academyIcon.textContent = icons.academy;
    }
}

// Check if portal is active
function isPortalActive(portalId) {
    const config = loadClientConfig();
    return config.portalStatus?.[portalId] !== false;
}

// Handle notifications
function loadNotifications() {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    return [];
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
    
    // Update bell icon
    updateNotificationBell(notifications);
    
    // Show toast if available
    if (typeof showToast === 'function') {
        showToast(`${title}: ${message}`);
    } else {
        // Browser notification
        if (Notification.permission === 'granted') {
            new Notification(title, { body: message });
        }
    }
}

function updateNotificationBell() {
    const bell = document.querySelector('.bell-icon, #bellIcon, [data-bell]');
    if (bell) {
        const notifications = loadNotifications();
        const unread = notifications.filter(n => !n.read).length;
        
        const badge = bell.querySelector('.notification-badge') || document.createElement('span');
        badge.className = 'notification-badge';
        badge.textContent = unread > 0 ? unread : '';
        badge.style.cssText = `
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
        `;
        
        if (unread > 0 && !bell.contains(badge)) {
            bell.style.position = 'relative';
            bell.appendChild(badge);
        }
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

// Initialize client sync
document.addEventListener('DOMContentLoaded', () => {
    // Apply initial theme
    applyThemeColors();
    applyPortalIcons();
    updateNotificationBell();
    syncWalletBalance();
    
    // Poll for config changes every 5 seconds
    setInterval(() => {
        applyThemeColors();
        applyPortalIcons();
    }, 5000);
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});

// Listen for storage changes from other tabs (Admin changes)
window.addEventListener('storage', (e) => {
    if (e.key === CONFIG_KEY || e.key === NOTIFICATIONS_KEY) {
        applyThemeColors();
        applyPortalIcons();
        updateNotificationBell();
        
        // Show new notification if broadcast was sent
        if (e.key === NOTIFICATIONS_KEY && e.newValue) {
            const notifications = JSON.parse(e.newValue);
            const latest = notifications[0];
            if (latest && !latest.read) {
                showNotification(latest.title, latest.message, latest.type);
            }
        }
    }
});

// Export functions for global use
window.ClientSync = {
    loadConfig: loadClientConfig,
    applyTheme: applyThemeColors,
    applyIcons: applyPortalIcons,
    loadNotifications,
    showNotification,
    updateWallet: updateWalletBalance,
    isPortalActive
};