/**
 * TECHOPRINT 2026 - COMPLETE APP (VERSION 2.0)
 * All 9 Gates + Student Portal 4 Pillars + Admin
 * Features: i18n, Registration, Login, Duplicate Transfer Prevention, Phone +964
 */

// ==================== GLOBAL STATE ====================
const APP_STATE = {
    currentLang: localStorage.getItem('techoprint_lang') || 'ar',
    user: JSON.parse(localStorage.getItem('techoprint_user') || 'null'),
    token: localStorage.getItem('techoprint_token') || null,
    balance: { IQD: 0, USD: 0 },
    usedTransferRefs: new Set() // Track used transfer references
};

// ==================== API HELPER ====================
async function apiCall(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': APP_STATE.user?.id || ''
            }
        };
        if (body) options.body = JSON.stringify(body);
        
        const res = await fetch(`/api/${endpoint}`, options);
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return { error: err.message };
    }
}

// ==================== ROUTER ====================
const Router = {
    routes: {
        'dashboard': () => loadDashboard(),
        'student': () => StudentPortal.render(),
        'library': () => loadLibrary(),
        'orders': () => loadOrders(),
        'wallet': () => loadWallet(),
        'tracking': () => loadTracking(),
        'transfer': () => loadTransfer(),
        'support': () => loadSupport(),
        'designer': () => loadDesigner(),
        'admin-dashboard': () => AdminPortal.renderDashboard(),
        'admin-users': () => AdminPortal.renderUsers(),
        'admin-delivery': () => AdminPortal.renderDelivery()
    },
    
    navigate(page) {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const activeNav = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (activeNav) activeNav.classList.add('active');
        
        const titles = {
            'dashboard': '🏛️ ' + window.i18n.t('nav.dashboard'),
            'student': '🎓 ' + window.i18n.t('portal.studentTitle'),
            'library': '📚 ' + window.i18n.t('nav.library'),
            'orders': '📦 ' + window.i18n.t('nav.orders'),
            'wallet': '💰 ' + window.i18n.t('nav.wallet'),
            'tracking': '📍 ' + window.i18n.t('nav.tracking'),
            'transfer': '🔄 ' + window.i18n.t('nav.transfer'),
            'support': '🎫 ' + window.i18n.t('nav.support'),
            'designer': '🎨 ' + window.i18n.t('nav.designer'),
            'admin-dashboard': '👑 ' + window.i18n.t('nav.adminDashboard'),
            'admin-users': '👥 ' + window.i18n.t('nav.adminUsers'),
            'admin-delivery': '🚚 ' + window.i18n.t('nav.adminDelivery')
        };
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = titles[page] || 'TECHOPRINT 2026';
        
        const handler = this.routes[page];
        if (handler) handler();
        else loadDashboard();
    }
};
window.navigateTo = (page) => Router.navigate(page);

// ==================== PORTAL FUNCTIONS ====================
// GUEST ACCESS: Allow browsing without login
window.switchPortalLanguage = (lang) => {
    window.i18n.setLanguage(lang);
    window.i18n.applyLanguage(lang);
};

window.openPortal = (role) => {
    const masterPortal = document.getElementById('masterPortal');
    const app = document.getElementById('app');
    if (masterPortal) masterPortal.style.display = 'none';
    if (app) app.style.display = 'grid';
    
    // Guest Access: Browse freely, only show login on Order/Upload actions
    const loginRequiredRoles = ['student', 'teacher'];
    
    const roleRoutes = {
        'student': 'library', 'teacher': 'library', 'designer': 'designer',
        'publisher': 'library', 'library': 'library', 'ai': 'admin-dashboard',
        'delivery': 'admin-delivery', 'admin': 'admin-dashboard', 'guest': 'dashboard'
    };
    
    Router.navigate(roleRoutes[role] || 'dashboard');
    showToast(window.i18n.t('messages.welcome'), 'success');
};

window.showPortal = () => {
    const masterPortal = document.getElementById('masterPortal');
    const app = document.getElementById('app');
    if (masterPortal) masterPortal.style.display = 'flex';
    if (app) app.style.display = 'none';
};

// REQUIRE LOGIN ONLY ON ACTION (Order/Buy/Upload)
window.requireLogin = (callback) => {
    if (APP_STATE.user) {
        callback?.();
    } else {
        showLoginModal();
        showToast(window.i18n.t('auth.loginRequiredForOrder'), 'info');
    }
};

// ==================== HORIZONTAL SCROLL FOR PORTALS ====================
window.initPortalHorizontalScroll = () => {
    const container = document.getElementById('portalsGrid');
    if (container) {
        container.classList.add('horizontal-scroll-section');
        container.style.display = 'flex';
        container.style.flexDirection = 'row';
        container.style.overflowX = 'auto';
        container.style.scrollSnapType = 'x mandatory';
        container.style.gap = '20px';
        container.style.padding = '20px';
        
        const cards = container.querySelectorAll('.portal-card');
        cards.forEach(card => {
            card.style.minWidth = '320px';
            card.style.maxWidth = '350px';
            card.style.flexShrink = '0';
        });
    }
};

// ==================== LANGUAGE SWITCHER ON PORTAL ====================
window.switchPortalLanguage = (lang) => {
    window.i18n.setLanguage(lang);
    
    document.querySelectorAll('.portal-lang-switcher .lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) btn.classList.add('active');
    });
    
    // Translate portal elements
    document.querySelectorAll('[data-i18n-portal]').forEach(el => {
        const key = el.getAttribute('data-i18n-portal');
        const translation = window.i18n.t('portal.' + key) || el.textContent;
        el.textContent = translation;
    });
};

// ==================== REGISTRATION & LOGIN ====================
window.openRegisterPage = () => {
    document.getElementById('registerPage').style.display = 'flex';
    document.getElementById('loginModal').style.display = 'none';
    window.i18n.reload();
};

window.closeRegisterPage = () => {
    document.getElementById('registerPage').style.display = 'none';
};

window.showLoginModal = () => {
    document.getElementById('loginModal').style.display = 'flex';
    window.i18n.reload();
};

window.closeModal = (modalId) => {
    document.getElementById(modalId).style.display = 'none';
};

window.handleRegister = async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('registerError');
    errorEl.style.display = 'none';
    
    const fullName = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const role = document.getElementById('regRole').value;
    
    // Validation
    if (password !== confirmPassword) {
        errorEl.textContent = '⚠️ كلمة المرور غير متطابقة!';
        errorEl.style.display = 'block';
        return;
    }
    
    if (phone && !/^7[0-9]{9}$/.test(phone)) {
        errorEl.textContent = '⚠️ رقم الهاتف يجب أن يبدأ بـ 7 ويتكون من 10 أرقام';
        errorEl.style.display = 'block';
        return;
    }
    
    try {
        const res = await apiCall('auth/signup', 'POST', { email, password, full_name: fullName, phone: '+964' + phone, role });
        
        if (res.error) {
            errorEl.textContent = '⚠️ ' + res.error;
            errorEl.style.display = 'block';
        } else {
            showToast(window.i18n.t('messages.registerSuccess'), 'success');
            closeRegisterPage();
            showLoginModal();
        }
    } catch (err) {
        errorEl.textContent = '⚠️ حدث خطأ في الاتصال';
        errorEl.style.display = 'block';
    }
};

window.handleLogin = async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('loginError');
    errorEl.style.display = 'none';
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    try {
        const res = await apiCall('auth/login', 'POST', { email, password });
        
        if (res.error) {
            errorEl.textContent = '⚠️ ' + res.error;
            errorEl.style.display = 'block';
        } else {
            APP_STATE.token = res.token;
            APP_STATE.user = res.user;
            localStorage.setItem('techoprint_token', res.token);
            localStorage.setItem('techoprint_user', JSON.stringify(res.user));
            
            showToast(window.i18n.t('messages.loginSuccess'), 'success');
            closeModal('loginModal');
            openPortal('student');
            
            document.getElementById('userName').textContent = res.user.full_name || 'مستخدم';
            document.getElementById('userRole').textContent = window.i18n.getRoleName(res.user.role);
        }
    } catch (err) {
        errorEl.textContent = '⚠️ حدث خطأ في الاتصال';
        errorEl.style.display = 'block';
    }
};

// ==================== DUPLICATE TRANSFER REFERENCE CHECK ====================
window.checkDuplicateTransfer = async (refNumber) => {
    if (!refNumber || refNumber.length < 3) return;
    
    const errorEl = document.getElementById('transferRefError');
    
    // Check local cache first
    if (APP_STATE.usedTransferRefs.has(refNumber)) {
        errorEl.style.display = 'block';
        showToast(window.i18n.t('errors.duplicateTransfer'), 'error');
        return;
    }
    
    // Check server
    try {
        const res = await apiCall(`transactions/check-ref/${refNumber}`);
        if (res.exists) {
            APP_STATE.usedTransferRefs.add(refNumber);
            errorEl.style.display = 'block';
            showToast(window.i18n.t('errors.duplicateTransfer'), 'error');
        } else {
            errorEl.style.display = 'none';
        }
    } catch (err) {
        console.error('Check ref error:', err);
    }
};

// ==================== DEPOSIT HANDLER ====================
window.handleDeposit = async (e) => {
    e.preventDefault();
    
    const amount = document.getElementById('depositAmount').value;
    const currency = document.getElementById('depositCurrency').value;
    const zainNumber = document.getElementById('zainNumber').value;
    const transactionRef = document.getElementById('transactionRef').value;
    const receiptFile = document.getElementById('receiptImage').files[0];
    
    // Check for duplicate
    if (APP_STATE.usedTransferRefs.has(transactionRef)) {
        showToast(window.i18n.t('errors.duplicateTransfer'), 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('type', 'deposit');
    formData.append('amount', amount);
    formData.append('currency', currency);
    formData.append('payment_method', 'zain_cash');
    formData.append('payment_number', '+964' + zainNumber);
    formData.append('reference_id', transactionRef);
    formData.append('receipt', receiptFile);
    
    try {
        const res = await fetch('/api/transactions/upload', {
            method: 'POST',
            headers: { 'x-user-id': APP_STATE.user?.id || '' },
            body: formData
        }).then(r => r.json());
        
        if (res.success) {
            APP_STATE.usedTransferRefs.add(transactionRef);
            showToast(window.i18n.t('messages.depositSubmitted'), 'success');
            closeModal('depositModal');
        } else {
            showToast(res.error || window.i18n.t('messages.error'), 'error');
        }
    } catch (err) {
        showToast(window.i18n.t('messages.error'), 'error');
    }
};

// ==================== WITHDRAW HANDLER ====================
window.handleWithdraw = async (e) => {
    e.preventDefault();
    
    const amount = document.getElementById('withdrawAmount').value;
    const currency = document.getElementById('withdrawCurrency').value;
    const method = document.getElementById('withdrawMethod').value;
    const phone = document.getElementById('withdrawPhone').value;
    const details = document.getElementById('withdrawDetails').value;
    
    try {
        const res = await apiCall('transactions', 'POST', {
            type: 'withdraw',
            amount,
            currency,
            payment_method: method,
            payment_number: '+964' + phone,
            description: details
        });
        
        if (res.success) {
            showToast(window.i18n.t('messages.withdrawSubmitted'), 'success');
            closeModal('withdrawModal');
        } else {
            showToast(res.error || window.i18n.t('messages.error'), 'error');
        }
    } catch (err) {
        showToast(window.i18n.t('messages.error'), 'error');
    }
};

// ==================== PHONE INPUT VALIDATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Phone input validation - remove leading zero and non-digits
    document.querySelectorAll('.phone-input').forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9]/g, '');
            // Remove leading zero if present
            if (value.startsWith('0')) {
                value = value.substring(1);
            }
            e.target.value = value;
        });
        
        input.addEventListener('blur', (e) => {
            const value = e.target.value;
            // Validate starts with 7
            if (value && !value.startsWith('7')) {
                e.target.setCustomValidity('يجب أن يبدأ الرقم بـ 7');
            } else {
                e.target.setCustomValidity('');
            }
        });
    });
});

// ==================== ADMIN PORTAL ====================
const AdminPortal = {
    renderDashboard() {
        loadPendingDeposits();
        loadPendingWithdrawals();
        updateServerHealth();
    },
    
    renderUsers() {
        loadUsers();
    },
    
    renderDelivery() {
        initDeliveryMap();
    }
};

// ==================== LOAD PENDING DEPOSITS ====================
async function loadPendingDeposits() {
    try {
        const res = await apiCall('transactions?status=eq.pending&type=eq.deposit');
        const container = document.getElementById('pendingDeposits');
        
        if (!res || res.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--success);"></i>
                    <p>${window.i18n.t('admin.noPendingDeposits')}</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = res.map(tx => `
            <div class="pending-deposit-item glass-panel" data-id="${tx.id}">
                <div class="deposit-info">
                    <strong>${parseFloat(tx.amount).toLocaleString()} ${tx.currency}</strong>
                    <p style="color: var(--text-muted); font-size: 0.85rem;">
                        <i class="fas fa-user"></i> ${tx.profiles?.full_name || 'مستخدم'}
                        <br>
                        <i class="fas fa-hashtag"></i> ${tx.reference_id || 'بدون مرجع'}
                        <br>
                        <i class="fas fa-clock"></i> ${new Date(tx.created_at).toLocaleDateString('ar-IQ')}
                    </p>
                </div>
                ${tx.receipt_url ? `<a href="${tx.receipt_url}" target="_blank" class="pillar-btn"><i class="fas fa-image"></i> عرض الإيصال</a>` : ''}
                <div class="deposit-actions">
                    <button class="pillar-btn" onclick="approveDeposit('${tx.id}')">✅ ${window.i18n.t('admin.approve')}</button>
                    <button class="pillar-btn gold" onclick="rejectDeposit('${tx.id}')">❌ ${window.i18n.t('admin.reject')}</button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Load pending deposits error:', err);
    }
}

// ==================== LOAD PENDING WITHDRAWALS ====================
async function loadPendingWithdrawals() {
    try {
        const res = await apiCall('transactions?status=eq.pending&type=eq.withdraw');
        const container = document.getElementById('pendingWithdrawals');
        
        if (!res || res.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--success);"></i>
                    <p>لا توجد طلبات سحب معلقة</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = res.map(tx => `
            <div class="pending-withdrawal-item glass-panel" data-id="${tx.id}">
                <div class="withdrawal-info">
                    <strong>${parseFloat(tx.amount).toLocaleString()} ${tx.currency}</strong>
                    <p style="color: var(--text-muted); font-size: 0.85rem;">
                        <i class="fas fa-user"></i> ${tx.profiles?.full_name || 'مستخدم'}
                        <br>
                        <i class="fas fa-mobile-alt"></i> ${tx.payment_number || 'غير محدد'}
                        <br>
                        <i class="fas fa-credit-card"></i> ${tx.description || 'نقداً'}
                        <br>
                        <i class="fas fa-clock"></i> ${new Date(tx.created_at).toLocaleDateString('ar-IQ')}
                    </p>
                </div>
                <div class="proof-upload-section">
                    <label><i class="fas fa-image gold-icon"></i> إثبات السحب (وصل الحوالة):</label>
                    <input type="file" id="withdrawProof_${tx.id}" accept="image/*,.pdf" class="proof-input">
                    <small class="proof-hint">ارفع صورة الوصل كإثبات على عملية السحب</small>
                </div>
                <div class="withdrawal-actions">
                    <button class="pillar-btn" onclick="approveWithdrawal('${tx.id}')">✅ ${window.i18n.t('admin.approve')}</button>
                    <button class="pillar-btn gold" onclick="rejectWithdrawal('${tx.id}')">❌ ${window.i18n.t('admin.reject')}</button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Load pending withdrawals error:', err);
    }
}

// ==================== APPROVE/REJECT DEPOSIT ====================
window.approveDeposit = async (txId) => {
    try {
        const res = await apiCall(`transactions/${txId}`, 'PATCH', { status: 'completed' });
        if (res.success) {
            showToast(window.i18n.t('messages.depositApproved'), 'success');
            loadPendingDeposits();
        }
    } catch (err) {
        showToast(window.i18n.t('messages.error'), 'error');
    }
};

window.rejectDeposit = async (txId) => {
    try {
        const res = await apiCall(`transactions/${txId}`, 'PATCH', { status: 'failed' });
        if (res.success) {
            showToast(window.i18n.t('messages.depositRejected'), 'success');
            loadPendingDeposits();
        }
    } catch (err) {
        showToast(window.i18n.t('messages.error'), 'error');
    }
};

// ==================== APPROVE/REJECT WITHDRAWAL ====================
window.approveWithdrawal = async (txId) => {
    const proofInput = document.getElementById(`withdrawProof_${txId}`);
    
    if (!proofInput || !proofInput.files[0]) {
        showToast('يرجى رفع صورة إثبات السحب أولاً!', 'warning');
        return;
    }
    
    const formData = new FormData();
    formData.append('proof', proofInput.files[0]);
    
    try {
        const res = await fetch(`/api/transactions/${txId}/proof`, {
            method: 'POST',
            headers: { 'x-user-id': APP_STATE.user?.id || '' },
            body: formData
        }).then(r => r.json());
        
        if (res.success) {
            // Update status
            await apiCall(`transactions/${txId}`, 'PATCH', { status: 'completed' });
            showToast('تم قبول طلب السحب ورفع الإثبات بنجاح!', 'success');
            loadPendingWithdrawals();
        }
    } catch (err) {
        showToast(window.i18n.t('messages.error'), 'error');
    }
};

window.rejectWithdrawal = async (txId) => {
    try {
        const res = await apiCall(`transactions/${txId}`, 'PATCH', { status: 'failed' });
        if (res.success) {
            showToast('تم رفض طلب السحب', 'success');
            loadPendingWithdrawals();
        }
    } catch (err) {
        showToast(window.i18n.t('messages.error'), 'error');
    }
};

// ==================== LOAD USERS ====================
async function loadUsers() {
    try {
        const res = await apiCall('profiles?select=*&order=created_at.desc');
        const tbody = document.getElementById('usersList');
        
        if (!res || res.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">لا يوجد مستخدمين</td></tr>';
            return;
        }
        
        tbody.innerHTML = res.map(user => `
            <tr>
                <td>${user.full_name || 'مستخدم'}</td>
                <td>${user.email || '-'}</td>
                <td><span class="order-status processing">${window.i18n.getRoleName(user.role)}</span></td>
                <td><span style="color: ${user.is_active ? 'var(--success)' : 'var(--danger)'};">● ${user.is_active ? window.i18n.t('admin.active') : window.i18n.t('admin.inactive')}</span></td>
                <td>
                    <button class="pillar-btn" style="padding: 6px 12px;" onclick="viewUser('${user.id}')">👁️</button>
                    <button class="pillar-btn gold" style="padding: 6px 12px;" onclick="editUser('${user.id}')">✏️</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Load users error:', err);
    }
}

// ==================== SERVER HEALTH ====================
function updateServerHealth() {
    document.getElementById('serverUptime').textContent = '99.9%';
    document.getElementById('serverMemory').textContent = '45%';
}

// ==================== DELIVERY MAP ====================
function initDeliveryMap() {
    const container = document.getElementById('deliveryMapContainer');
    if (container) {
        container.innerHTML = `
            <div style="height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(212,175,55,0.1); border-radius: 12px;">
                <span style="font-size: 5rem;">🗺️</span>
            </div>
        `;
    }
}

// ==================== DASHBOARD ====================
function loadDashboard() {
    const mainContent = document.getElementById('pageContent');
    mainContent.innerHTML = `
        <section class="page active">
            <div class="welcome-banner glass-panel">
                <div class="welcome-text">
                    <h2><span data-i18n="dashboard.welcome">${window.i18n.t('dashboard.welcome')}</span> <span class="gold-text">TECHOPRINT 2026</span></h2>
                    <p data-i18n="dashboard.subtitle">${window.i18n.t('dashboard.subtitle')}</p>
                </div>
                <div class="welcome-stats">
                    <div class="stat-item glass-panel">
                        <span class="stat-value" id="totalOrders">12</span>
                        <span class="stat-label" data-i18n="dashboard.totalOrders">${window.i18n.t('dashboard.totalOrders')}</span>
                    </div>
                    <div class="stat-item glass-panel">
                        <span class="stat-value" id="totalBooks">48</span>
                        <span class="stat-label" data-i18n="dashboard.totalBooks">${window.i18n.t('dashboard.totalBooks')}</span>
                    </div>
                    <div class="stat-item glass-panel">
                        <span class="stat-value" id="activeOrders">3</span>
                        <span class="stat-label" data-i18n="dashboard.activeOrders">${window.i18n.t('dashboard.activeOrders')}</span>
                    </div>
                </div>
            </div>
            
            <div class="quick-actions">
                <button class="action-btn glass-panel" onclick="Router.navigate('wallet')">
                    <span class="action-icon">💰</span>
                    <span class="action-text" data-i18n="dashboard.myWallet">${window.i18n.t('dashboard.myWallet')}</span>
                </button>
                <button class="action-btn glass-panel" onclick="Router.navigate('library')">
                    <span class="action-icon">📚</span>
                    <span class="action-text" data-i18n="dashboard.browseLibrary">${window.i18n.t('dashboard.browseLibrary')}</span>
                </button>
                <button class="action-btn glass-panel" onclick="Router.navigate('transfer')">
                    <span class="action-icon">🔄</span>
                    <span class="action-text" data-i18n="dashboard.transferBalance">${window.i18n.t('dashboard.transferBalance')}</span>
                </button>
                <button class="action-btn glass-panel" onclick="Router.navigate('tracking')">
                    <span class="action-icon">📍</span>
                    <span class="action-text" data-i18n="dashboard.trackOrder">${window.i18n.t('dashboard.trackOrder')}</span>
                </button>
            </div>
            
            <div class="recent-activity glass-panel">
                <h3 data-i18n="dashboard.recentActivity">${window.i18n.t('dashboard.recentActivity')}</h3>
                <div class="activity-list">
                    <p class="empty-state" data-i18n="dashboard.noActivity">${window.i18n.t('dashboard.noActivity')}</p>
                </div>
            </div>
        </section>
    `;
}

// ==================== LIBRARY ====================
function loadLibrary() {
    const mainContent = document.getElementById('pageContent');
    const books = [
        { title: 'رياضيات الصف الأول', author: 'أ. أحمد الخالدي', price: 2500, cover: '📐' },
        { title: 'العلوم الطبيعية', author: 'أ. فاطمة العبيدي', price: 3000, cover: '🔬' },
        { title: 'اللغة العربية', author: 'أ. محمد الراشدي', price: 2000, cover: '📖' },
        { title: 'الإنجليزية العامة', author: 'أ. سارة الجبوري', price: 3500, cover: '📕' },
        { title: 'الفيزياء', author: 'أ. علي العسكري', price: 4000, cover: '⚡' },
        { title: 'الكيمياء', author: 'أ. زينب الحسني', price: 3800, cover: '🧪' },
        { title: 'التاريخ', author: 'أ. حسن البغدادي', price: 2200, cover: '🏛️' },
        { title: 'الجغرافيا', author: 'أ. صفاء الناصري', price: 2300, cover: '🌍' }
    ];
    
    mainContent.innerHTML = `
        <section class="page active">
            <h2 class="gold-text" style="margin-bottom: 24px; font-family: 'Amiri'; font-size: 2rem;">📚 المكتبة العالمية</h2>
            
            <div class="library-filters glass-panel">
                <input type="text" class="search-input" placeholder="🔍 البحث في المكتبة...">
                <select class="filter-select">
                    <option value="">${window.i18n.t('library.allSubjects')}</option>
                    <option value="math">${window.i18n.t('library.math')}</option>
                    <option value="science">${window.i18n.t('library.science')}</option>
                    <option value="arabic">${window.i18n.t('library.arabic')}</option>
                    <option value="english">${window.i18n.t('library.english')}</option>
                </select>
                <select class="filter-select">
                    <option value="">${window.i18n.t('library.allGrades')}</option>
                    <option value="1">الصف الأول</option>
                    <option value="2">الصف الثاني</option>
                    <option value="3">الصف الثالث</option>
                </select>
            </div>
            
            <div class="book-grid">
                ${books.map(b => `
                    <div class="book-card glass-panel">
                        <div class="book-cover">${b.cover}</div>
                        <div class="book-info">
                            <h3 class="book-title">${b.title}</h3>
                            <p class="book-author">${b.author}</p>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                                <span class="book-price">${b.price.toLocaleString()} IQD</span>
                                <button class="pillar-btn" onclick="showToast('تمت إضافة ${b.title} للسلة!', 'success')">
                                    🛒 شراء
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
}

// ==================== ORDERS ====================
function loadOrders() {
    const mainContent = document.getElementById('pageContent');
    mainContent.innerHTML = `
        <section class="page active">
            <h2 class="gold-text" style="margin-bottom: 24px; font-family: 'Amiri'; font-size: 2rem;">📦 ${window.i18n.t('orders.title')}</h2>
            <div class="orders-list">
                <p class="empty-state">${window.i18n.t('orders.noOrders')}</p>
            </div>
        </section>
    `;
}

// ==================== WALLET ====================
function loadWallet() {
    const mainContent = document.getElementById('pageContent');
    mainContent.innerHTML = `
        <section class="page active">
            <h2 class="gold-text" style="margin-bottom: 24px; font-family: 'Amiri'; font-size: 2rem;">💰 ${window.i18n.t('wallet.title')}</h2>
            <div class="wallet-container">
                <div class="wallet-card glass-panel">
                    <h3>${window.i18n.t('wallet.balance')}</h3>
                    <div class="balance-section" style="margin: 32px 0;">
                        <div class="balance-item">
                            <span class="currency">🇮🇶 IQD</span>
                            <span class="amount" style="font-size: 3rem; color: var(--gold-royal);">${(APP_STATE.balance.IQD || 50000).toLocaleString()}</span>
                        </div>
                    </div>
                    <div class="wallet-actions">
                        <button class="wallet-btn deposit" onclick="showDepositModal()">
                            <span>💎</span> ${window.i18n.t('wallet.deposit')}
                        </button>
                        <button class="wallet-btn withdraw" onclick="showWithdrawModal()">
                            <span>💸</span> ${window.i18n.t('wallet.withdraw')}
                        </button>
                    </div>
                </div>
                
                <div class="transactions-section glass-panel">
                    <h3>${window.i18n.t('wallet.transactionHistory')}</h3>
                    <div class="transaction-list">
                        <p class="empty-state">${window.i18n.t('wallet.noTransactions')}</p>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// ==================== TRACKING ====================
function loadTracking() {
    const mainContent = document.getElementById('pageContent');
    mainContent.innerHTML = `
        <section class="page active">
            <h2 class="gold-text" style="margin-bottom: 24px; font-family: 'Amiri'; font-size: 2rem;">📍 ${window.i18n.t('tracking.title')}</h2>
            <div class="tracking-card glass-panel" style="max-width: 600px; margin: 0 auto 24px;">
                <form onsubmit="trackOrder(event)">
                    <div class="form-group">
                        <label>${window.i18n.t('tracking.orderNumber')}</label>
                        <input type="text" id="trackOrderId" placeholder="مثال: TP-2026-001" required>
                    </div>
                    <button type="submit" class="submit-btn gold-btn">🔍 ${window.i18n.t('tracking.track')}</button>
                </form>
            </div>
        </section>
    `;
}

function trackOrder(e) {
    e.preventDefault();
    showToast(window.i18n.t('tracking.notFound'), 'info');
}

// ==================== TRANSFER ====================
function loadTransfer() {
    const mainContent = document.getElementById('pageContent');
    mainContent.innerHTML = `
        <section class="page active">
            <div class="transfer-container">
                <div class="transfer-card glass-panel">
                    <h2 class="gold-text" style="font-family: 'Amiri'; font-size: 2rem;">🔄 ${window.i18n.t('transfer.title')}</h2>
                    <form onsubmit="handleTransfer(event)">
                        <div class="form-group">
                            <label>${window.i18n.t('transfer.recipientId')}</label>
                            <input type="text" id="recipientId" placeholder="ID أو البريد الإلكتروني" required>
                        </div>
                        <div class="form-group">
                            <label>${window.i18n.t('transfer.amount')}</label>
                            <input type="number" id="transferAmount" placeholder="أدخل المبلغ" required>
                        </div>
                        <div class="form-group">
                            <label>${window.i18n.t('transfer.currency')}</label>
                            <select>
                                <option value="IQD">🇮🇶 IQD - الدينار العراقي</option>
                                <option value="USD">🇺🇸 USD - الدولار</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>${window.i18n.t('transfer.description')}</label>
                            <textarea id="transferDescription" placeholder="أضف ملاحظة..."></textarea>
                        </div>
                        <button type="submit" class="submit-btn gold-btn">💸 ${window.i18n.t('transfer.submit')}</button>
                    </form>
                </div>
            </div>
        </section>
    `;
}

function handleTransfer(e) {
    e.preventDefault();
    showToast(window.i18n.t('messages.transferSuccess'), 'success');
}

// ==================== SUPPORT ====================
function loadSupport() {
    const mainContent = document.getElementById('pageContent');
    mainContent.innerHTML = `
        <section class="page active">
            <div class="support-container">
                <div class="ticket-form glass-panel">
                    <h2 class="gold-text" style="font-family: 'Amiri'; font-size: 1.8rem;">🎫 ${window.i18n.t('support.title')}</h2>
                    <form onsubmit="createTicket(event)">
                        <div class="form-group">
                            <label>${window.i18n.t('support.type')}</label>
                            <select required>
                                <option value="support">${window.i18n.t('support.general')}</option>
                                <option value="receipt">${window.i18n.t('support.receiptIssue')}</option>
                                <option value="delivery">${window.i18n.t('support.deliveryIssue')}</option>
                                <option value="custom">${window.i18n.t('support.customDesign')}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>${window.i18n.t('support.subject')}</label>
                            <input type="text" placeholder="موضوع التذكرة" required>
                        </div>
                        <div class="form-group">
                            <label>${window.i18n.t('support.description')}</label>
                            <textarea placeholder="وصف المشكلة..." rows="4" required></textarea>
                        </div>
                        <button type="submit" class="submit-btn gold-btn">📤 ${window.i18n.t('support.submit')}</button>
                    </form>
                </div>
                <div class="my-tickets glass-panel">
                    <h3 class="gold-text">📋 ${window.i18n.t('support.myTickets')}</h3>
                </div>
            </div>
        </section>
    `;
}

function createTicket(e) {
    e.preventDefault();
    showToast(window.i18n.t('messages.ticketSubmitted'), 'success');
}

// ==================== DESIGNER ====================
function loadDesigner() {
    const mainContent = document.getElementById('pageContent');
    mainContent.innerHTML = `
        <section class="page active">
            <h2 class="gold-text" style="margin-bottom: 24px; font-family: 'Amiri'; font-size: 2rem;">🎨 ${window.i18n.t('designer.title')}</h2>
            <div class="designer-grid">
                <div class="designer-card glass-panel">
                    <div class="designer-avatar">👨‍🎨</div>
                    <h3 class="designer-name">أحمد الكعبي</h3>
                    <p class="designer-role">مصمم كتب تعليمية</p>
                    <p class="designer-portfolio">12 كتاب • 48 محاضرة</p>
                </div>
                <div class="designer-card glass-panel">
                    <div class="designer-avatar">👩‍🏫</div>
                    <h3 class="designer-name">سارة الجبوري</h3>
                    <p class="designer-role">مؤلفة ومنسقة</p>
                    <p class="designer-portfolio">8 كتب • 32 محاضرة</p>
                </div>
            </div>
        </section>
    `;
}

// ==================== TOAST ====================
window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => toast.remove(), 5000);
};

// ==================== HORIZONTAL SCROLL INITIALIZER ====================
function initHorizontalScroll() {
    document.querySelectorAll('.horizontal-scroll-section').forEach(section => {
        let startX = 0, scrollLeft = 0, isDown = false;
        
        section.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - section.offsetLeft;
            scrollLeft = section.scrollLeft;
            section.style.cursor = 'grabbing';
        });
        
        section.addEventListener('mouseleave', () => {
            isDown = false;
            section.style.cursor = 'grab';
        });
        
        section.addEventListener('mouseup', () => {
            isDown = false;
            section.style.cursor = 'grab';
        });
        
        section.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            section.scrollLeft = scrollLeft - (e.pageX - startX) * 2;
        });
        
        section.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX;
            scrollLeft = section.scrollLeft;
        });
        
        section.addEventListener('touchmove', (e) => {
            section.scrollLeft = scrollLeft + (startX - e.touches[0].pageX) * 1.5;
        });
    });
}

// ==================== UPDATE NOTIFIER ====================
const UpdateNotifier = {
    currentVersion: '2.1',
    check() {
        const lastVersion = localStorage.getItem('techoprint_version');
        if (lastVersion !== this.currentVersion) {
            const toast = document.createElement('div');
            toast.className = 'update-toast';
            toast.innerHTML = `<div><strong>🚀 Update ${this.currentVersion}</strong><p>New features! Swipe to explore.</p></div><button onclick="this.parentElement.remove()">×</button>`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 8000);
            localStorage.setItem('techoprint_version', this.currentVersion);
        }
    }
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('preloader');
    if (loader) loader.style.display = 'none';
    
    const portal = document.getElementById('masterPortal');
    const app = document.getElementById('app');
    if (portal) portal.style.display = 'flex';
    if (app) app.style.display = 'none';
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            if (page) Router.navigate(page);
        });
    });
    
    // Initialize i18n
    if (window.i18n && window.i18n.init) {
        window.i18n.init();
    }
    
    // Initialize Horizontal Scroll
    initHorizontalScroll();
    initPortalHorizontalScroll();
    
    // Check for updates
    UpdateNotifier.check();
    
    console.log('🚀 TECHOPRINT 2026 v2.1 - FULLY LOADED!');
});
