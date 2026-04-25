// ===== TECHNO-CONTROL ADMIN DASHBOARD V3 - SERVER-API LINKED =====

// State Management
let allUsers = [];
let currentUsers = [];
let currentPage = 1;
const usersPerPage = 10;
let adsList = [];
let giftsHistory = [];
let broadcastsHistory = [];

// App Settings
let appSettings = {
    welcomeGiftPages: 1000,
    welcomeGiftBalance: 0,
    globalRewardEnabled: true
};

// ==================== SERVER-API LINKED FUNCTIONS ====================

// Fetch users from server API
async function fetchUsersFromServer() {
    try {
        const response = await fetch('/api/admin/profiles');
        const data = await response.json();
        if (Array.isArray(data)) {
            return data.map(u => ({
                id: u.id,
                name: u.full_name || 'مستخدم',
                username: u.username || '',
                phone: u.phone || '',
                governorate: u.governorate || '',
                role: u.role || 'student',
                category: u.category || '',
                balance: u.balance_iqd || 0,
                pages: u.pages_count || 0,
                status: u.status || 'active',
                createdAt: u.created_at
            }));
        }
    } catch (e) {
        console.error('Server fetch error:', e);
    }
    return [];
}

// Save App Settings to server
async function saveAppSettingsToServer(settings) {
    try {
        await fetch('/api/admin/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
    } catch (e) {
        console.error('Settings save error:', e);
    }
}

// Top up user via server
async function topUpUserOnServer(userId, balance, pages) {
    try {
        const response = await fetch(`/api/admin/profiles/${userId}/topup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ balance, pages })
        });
        return await response.json();
    } catch (e) {
        console.error('Top up error:', e);
        return null;
    }
}

// Delete user via server
async function deleteUserOnServer(userId) {
    try {
        await fetch(`/api/admin/profiles/${userId}`, { method: 'DELETE' });
        return true;
    } catch (e) {
        console.error('Delete error:', e);
        return false;
    }
}

// Update user via server
async function updateUserOnServer(userId, updates) {
    try {
        await fetch(`/api/admin/profiles/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return true;
    } catch (e) {
        console.error('Update error:', e);
        return false;
    }
}

// ==================== ORDERS ====================

// Fetch orders from server
async function fetchOrdersFromServer() {
    try {
        const response = await fetch('/api/admin/orders');
        const data = await response.json();
        return data || [];
    } catch (e) {
        console.error('Orders fetch error:', e);
        return [];
    }
}

// Update order status
async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`/api/admin/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return await response.json();
    } catch (e) {
        console.error('Order update error:', e);
        return null;
    }
}

// ==================== SERVICES MANAGEMENT ====================

// Fetch all services from server
async function fetchServicesFromServer() {
    try {
        const response = await fetch('/api/services');
        return await response.json();
    } catch (e) {
        console.error('Services fetch error:', e);
        return [];
    }
}

// Add new service
async function addService(serviceData) {
    try {
        const response = await fetch('/api/admin/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(serviceData)
        });
        const result = await response.json();
        showToast('تم إضافة الخدمة بنجاح!', 'success');
        return result;
    } catch (e) {
        showToast('فشل في إضافة الخدمة', 'error');
        return null;
    }
}

// Update service
async function updateService(serviceId, updates) {
    try {
        const response = await fetch(`/api/admin/services/${serviceId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        const result = await response.json();
        showToast('تم تحديث الخدمة بنجاح!', 'success');
        return result;
    } catch (e) {
        showToast('فشل في تحديث الخدمة', 'error');
        return null;
    }
}

// Delete service
async function deleteService(serviceId) {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;
    try {
        const response = await fetch(`/api/admin/services/${serviceId}`, { method: 'DELETE' });
        await response.json();
        showToast('تم حذف الخدمة بنجاح!', 'success');
    } catch (e) {
        showToast('فشل في حذف الخدمة', 'error');
    }
}

// Toggle service active status
async function toggleServiceStatus(serviceId, isActive) {
    await updateService(serviceId, { is_active: isActive });
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    setupNavigation();
    
    // Load settings from server
    await loadAppSettings();
    
    // Fetch users from server
    const serverUsers = await fetchUsersFromServer();
    if (serverUsers.length > 0) {
        allUsers = serverUsers;
    }
    
    loadUsers();
    loadAds();
    loadPortals();
    loadGiftsHistory();
    loadBroadcastsHistory();
    updateTime();
    setInterval(updateTime, 60000);
    
    // Auto-refresh users every 10 seconds
    setInterval(async () => {
        const freshUsers = await fetchUsersFromServer();
        if (freshUsers.length > 0) {
            allUsers = freshUsers;
            currentUsers = [...allUsers];
            renderUsersTable();
            updateStats();
        }
    }, 10000);
});

// Load App Settings
async function loadAppSettings() {
    try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        appSettings = { ...appSettings, ...data };
    } catch (e) {
        console.error('Failed to load settings:', e);
    }
    
    // Populate UI
    if (document.getElementById('welcomePagesGift')) document.getElementById('welcomePagesGift').value = appSettings.welcomeGiftPages || 1000;
    if (document.getElementById('welcomeBalanceGift')) document.getElementById('welcomeBalanceGift').value = appSettings.welcomeGiftBalance || 0;
    if (document.getElementById('globalRewardToggle')) document.getElementById('globalRewardToggle').checked = appSettings.globalRewardEnabled !== false;
}

// Save App Settings
async function saveAppSettings() {
    const settingsData = {
        welcomeGiftPages: parseInt(document.getElementById('welcomePagesGift')?.value) || 1000,
        welcomeGiftBalance: parseInt(document.getElementById('welcomeBalanceGift')?.value) || 0,
        globalRewardEnabled: document.getElementById('globalRewardToggle')?.checked || true
    };
    
    appSettings = settingsData;
    await saveAppSettingsToServer(settingsData);
    showToast('تم حفظ الإعدادات بنجاح!', 'success');
}

// ==================== AUTH ====================

function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (token) {
        document.getElementById('authOverlay').style.display = 'none';
        document.getElementById('dashboardContainer').style.display = 'block';
    }
}

function setupLoginForm() {
    const loginForm = document.getElementById('quickLogin');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('adminUsername')?.value?.trim();
            const password = document.getElementById('adminPassword')?.value?.trim();
            
            if (username === 'admin' && password === 'technoprint2024') {
                localStorage.setItem('adminToken', 'demo-token');
                localStorage.setItem('adminUser', JSON.stringify({ username: 'admin', role: 'super_admin', name: 'مدير النظام' }));
                document.getElementById('authOverlay').style.display = 'none';
                document.getElementById('dashboardContainer').style.display = 'block';
                showToast('تم تسجيل الدخول بنجاح!', 'success');
            } else {
                const errorEl = document.getElementById('loginError');
                if (errorEl) { errorEl.textContent = 'بيانات الدخول غير صحيحة'; errorEl.style.display = 'block'; }
            }
        });
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.reload();
}

// ==================== NAVIGATION ====================

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            switchSection(item.dataset.section);
        });
    });
}

function switchSection(sectionId) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
    });
    document.querySelectorAll('.section-panel').forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });
    
    const titles = {
        dashboard: 'لوحة التحكم',
        design: 'المظهر والألوان',
        icons: 'أيقونات البوابات',
        settings: 'الإعدادات',
        users: 'قاعدة البيانات',
        wallet: 'المحفظة',
        gifts: 'الإرسال',
        ads: 'إعلانات السلايدر',
        portals: 'حالة البوابات',
        broadcast: 'إشعارات عامة',
        messages: 'رسائل خاصة'
    };
    const titleEl = document.getElementById('sectionTitle');
    if (titleEl) titleEl.textContent = titles[sectionId] || 'لوحة التحكم';
}

// ==================== USERS MANAGEMENT ====================

function loadUsers() {
    currentUsers = [...allUsers];
    renderUsersTable();
    updateStats();
    populateUserSelects();
}

function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    const start = (currentPage - 1) * usersPerPage;
    const end = start + usersPerPage;
    const pageUsers = currentUsers.slice(start, end);
    
    tbody.innerHTML = pageUsers.map((user, index) => `
        <tr>
            <td>${start + index + 1}</td>
            <td>${user.name || '-'}</td>
            <td>${user.username || '-'}</td>
            <td>${user.phone || '-'}</td>
            <td>${user.governorate || '-'}</td>
            <td><span class="card-value">${user.balance || 0}</span></td>
            <td><span class="card-value">${user.pages || 0}</span></td>
            <td><span class="status-${user.status || 'active'}">${getStatusLabel(user.status)}</span></td>
            <td>
                <div style="display:flex;gap:5px;">
                    <button class="btn btn-blue" onclick="editUser(${user.id})" title="تعديل">✏️</button>
                    <button class="btn btn-gold" onclick="topUpUser(${user.id})" title="شحن">💰</button>
                    <button class="btn ${user.status === 'suspended' ? 'btn-green' : 'btn-red'}" onclick="toggleUserStatus(${user.id})" title="${user.status === 'suspended' ? 'تفعيل' : 'إيقاف'}">${user.status === 'suspended' ? '✅' : '🚫'}</button>
                    <button class="btn btn-red" onclick="deleteUser(${user.id})" title="حذف">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    renderPagination();
}

function getStatusLabel(status) {
    const labels = { active: '✅ نشط', suspended: '🚫 موقوف', deleted: '🗑️ محذوف' };
    return labels[status] || '✅ نشط';
}

function renderPagination() {
    const totalPages = Math.ceil(currentUsers.length / usersPerPage) || 1;
    const controls = document.getElementById('paginationControls');
    if (!controls || totalPages <= 1) return;
    
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="btn ${i === currentPage ? 'btn-gold' : 'btn-blue'}" onclick="goToPage(${i})" style="margin: 0 5px;">${i}</button>`;
    }
    controls.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    renderUsersTable();
}

function searchUsers() {
    const query = (document.getElementById('userSearch')?.value || '').toLowerCase();
    currentUsers = allUsers.filter(user => 
        (user.name?.toLowerCase().includes(query)) ||
        (user.username?.toLowerCase().includes(query)) ||
        (user.phone?.includes(query)) ||
        (user.governorate?.toLowerCase().includes(query))
    );
    currentPage = 1;
    renderUsersTable();
}

// MASTER CONTROL: Edit User
async function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    const newName = prompt('الاسم:', user.name);
    const newPhone = prompt('الهاتف:', user.phone);
    const newGovernorate = prompt('المحافظة:', user.governorate);
    
    const updates = {};
    if (newName !== null) { user.name = newName; updates.full_name = newName; }
    if (newPhone !== null) { user.phone = newPhone; updates.phone = newPhone; }
    if (newGovernorate !== null) { user.governorate = newGovernorate; updates.governorate = newGovernorate; }
    
    await updateUserOnServer(userId, updates);
    renderUsersTable();
    showToast('تم تحديث بيانات المستخدم بنجاح!', 'success');
}

// MASTER CONTROL: Top Up User (Server Linked)
async function topUpUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    const amount = parseInt(prompt(`شحن رصيد لـ ${user.name}:\nالرصيد الحالي: ${user.balance} IQD | ${user.pages} صفحة\n\nأدخل مبلغ الإيداع:`)) || 0;
    
    if (amount > 0) {
        const result = await topUpUserOnServer(userId, amount, Math.floor(amount * 2));
        if (result) {
            user.balance = result.balance;
            user.pages = result.pages;
            
            // Refresh from server
            const freshUsers = await fetchUsersFromServer();
            allUsers = freshUsers;
            currentUsers = [...allUsers];
            
            renderUsersTable();
            updateStats();
            showToast(`تم شحن ${amount} IQD لـ ${user.name}!`, 'success');
        }
    }
}

// MASTER CONTROL: Toggle User Status
async function toggleUserStatus(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    user.status = newStatus;
    
    await updateUserOnServer(userId, { status: newStatus });
    renderUsersTable();
    showToast(`تم ${newStatus === 'suspended' ? 'إيقاف' : 'تفعيل'} حساب ${user.name}`, 'success');
}

// MASTER CONTROL: Delete User (Server Linked)
async function deleteUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    if (confirm(`هل أنت متأكد من حذف حساب ${user.name}?\nلا يمكن التراجع!`)) {
        const success = await deleteUserOnServer(userId);
        if (success) {
            allUsers = allUsers.filter(u => u.id !== userId);
            currentUsers = [...allUsers];
            renderUsersTable();
            updateStats();
            showToast(`تم حذف حساب ${user.name}`, 'success');
        }
    }
}

function updateStats() {
    const activeUsers = allUsers.filter(u => u.status !== 'deleted');
    const totalEl = document.getElementById('totalUsers');
    const balanceEl = document.getElementById('totalBalance');
    const pagesEl = document.getElementById('totalPages');
    
    if (totalEl) totalEl.textContent = activeUsers.length;
    if (balanceEl) balanceEl.textContent = activeUsers.reduce((sum, u) => sum + (u.balance || 0), 0);
    if (pagesEl) pagesEl.textContent = activeUsers.reduce((sum, u) => sum + (u.pages || 0), 0);
}

function populateUserSelects() {
    ['walletUserSelect', 'giftUserSelect', 'rewardUserSelect', 'messageRecipient'].forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">-- اختر مستخدم --</option>' + 
                allUsers.map(user => `<option value="${user.id}">${user.name} (${user.username})</option>`).join('');
        }
    });
}

// ==================== ADS MANAGEMENT ====================

function loadAds() {
    adsList = JSON.parse(localStorage.getItem('technoprintAds') || '[]');
    if (adsList.length === 0) {
        adsList = [{ id: 1, url: 'https://picsum.photos/600/200?random=1', order: 1 }];
        saveAds();
    }
    renderAds();
    const totalAdsEl = document.getElementById('totalAds');
    if (totalAdsEl) totalAdsEl.textContent = adsList.length;
}

function saveAds() {
    localStorage.setItem('technoprintAds', JSON.stringify(adsList));
}

function renderAds() {
    const grid = document.getElementById('adsGrid');
    if (!grid) return;
    grid.innerHTML = adsList.map(ad => `
        <div class="preview-item">
            <img src="${ad.url}" alt="Ad ${ad.order}">
            <button class="delete-btn" onclick="deleteAd(${ad.id})">×</button>
            <div style="position:absolute;bottom:5px;left:5px;background:var(--admin-gold);color:black;padding:3px 8px;border-radius:5px;font-size:12px;">${ad.order}</div>
        </div>
    `).join('') || '<p style="color:#888;">لا توجد إعلانات</p>';
}

function handleAdUpload(input) {
    const files = input.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach((file, index) => {
        if (file.size > 10 * 1024 * 1024) {
            showToast(`الملف ${file.name} كبير جداً`, 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            adsList.push({ id: Date.now() + index, url: e.target.result, order: adsList.length + index + 1 });
            saveAds();
            renderAds();
            const totalAdsEl = document.getElementById('totalAds');
            if (totalAdsEl) totalAdsEl.textContent = adsList.length;
        };
        reader.readAsDataURL(file);
    });
    showToast('تم رفع الإعلانات بنجاح!', 'success');
}

function deleteAd(adId) {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
    adsList = adsList.filter(ad => ad.id !== adId);
    adsList.forEach((ad, index) => ad.order = index + 1);
    saveAds();
    renderAds();
    showToast('تم حذف الإعلان بنجاح!', 'success');
}

// ==================== PORTALS ====================

let portalStatus = { student: true, teacher: true, academy: true, store: false, support: true, settings: true };

const portalIcons = [
    { id: 'student', name: 'بوابة الطالب', icon: '👨‍🎓' },
    { id: 'teacher', name: 'بوابة المعلم', icon: '👨‍🏫' },
    { id: 'academy', name: ' تكنو أكاديمي', icon: '🎓' },
    { id: 'store', name: 'المتجر', icon: '🏪' },
    { id: 'support', name: 'الدعم الفني', icon: '💻' },
    { id: 'settings', name: 'الإعدادات', icon: '⚙️' }
];

function loadPortals() {
    const container = document.getElementById('portalsList');
    if (!container) return;
    
    container.innerHTML = portalIcons.map(portal => `
        <div class="toggle-group">
            <div>
                <span style="font-size:24px;margin-left:10px;">${portal.icon}</span>
                <span style="color:var(--admin-gold);">${portal.name}</span>
            </div>
            <label class="toggle-switch">
                <input type="checkbox" ${portalStatus[portal.id] ? 'checked' : ''} onchange="togglePortal('${portal.id}', this.checked)">
                <span class="toggle-slider"></span>
            </label>
        </div>
    `).join('');
}

function togglePortal(portalId, isActive) {
    portalStatus[portalId] = isActive;
    showToast(`تم ${isActive ? 'تفعيل' : 'تعطيل'} ${portalIcons.find(p => p.id === portalId)?.name}`, 'success');
}

// ==================== WALLET ====================

function loadWalletUser() {
    const userId = parseInt(document.getElementById('walletUserSelect')?.value);
    const user = allUsers.find(u => u.id === userId);
    
    const userInfo = document.getElementById('walletUserInfo');
    if (userInfo) userInfo.style.display = user ? 'block' : 'none';
    
    if (user) {
        const nameEl = document.getElementById('walletUserName');
        const balanceEl = document.getElementById('walletCurrentBalance');
        const pagesEl = document.getElementById('walletCurrentPages');
        if (nameEl) nameEl.textContent = user.name;
        if (balanceEl) balanceEl.textContent = user.balance || 0;
        if (pagesEl) pagesEl.textContent = user.pages || 0;
    }
}

async function adjustBalance(action) {
    const userId = parseInt(document.getElementById('walletUserSelect')?.value);
    const amount = parseInt(document.getElementById('balanceAmount')?.value) || 0;
    const user = allUsers.find(u => u.id === userId);
    
    if (!user) { showToast('الرجاء اختيار مستخدم أولاً', 'error'); return; }
    
    const result = await topUpUserOnServer(userId, action === 'add' ? amount : -amount, 0);
    if (result) {
        user.balance = result.balance;
        user.pages = result.pages;
        loadWalletUser();
        renderUsersTable();
        updateStats();
        showToast(`تم ${action === 'add' ? 'إضافة' : 'خصم'} ${amount} من الرصيد`, 'success');
    }
}

async function adjustPages(action) {
    const userId = parseInt(document.getElementById('walletUserSelect')?.value);
    const amount = parseInt(document.getElementById('pagesAmount')?.value) || 0;
    const user = allUsers.find(u => u.id === userId);
    
    if (!user) { showToast('الرجاء اختيار مستخدم أولاً', 'error'); return; }
    
    const result = await topUpUserOnServer(userId, 0, action === 'add' ? amount : -amount);
    if (result) {
        user.balance = result.balance;
        user.pages = result.pages;
        loadWalletUser();
        renderUsersTable();
        updateStats();
        showToast(`تم ${action === 'add' ? 'إضافة' : 'خصم'} ${amount} صفحة`, 'success');
    }
}

// ==================== GIFTS ====================

function loadGiftsHistory() {
    giftsHistory = JSON.parse(localStorage.getItem('giftsHistory') || '[]');
    const container = document.getElementById('giftsHistory');
    if (!container) return;
    
    container.innerHTML = giftsHistory.slice(0, 20).map(gift => `
        <div class="card" style="margin-bottom:10px;padding:15px;">
            <div style="display:flex;justify-content:space-between;">
                <span style="color:var(--admin-gold);">${gift.userName || 'مستخدم'}</span>
                <span style="color:#888;">${new Date(gift.date).toLocaleDateString('ar-IQ')}</span>
            </div>
            <div style="margin-top:10px;">
                <span class="btn btn-green" style="padding:5px 10px;font-size:12px;">+${gift.balance} رصيد</span>
                <span class="btn btn-blue" style="padding:5px 10px;font-size:12px;">+${gift.pages} صفحة</span>
            </div>
        </div>
    `).join('') || '<p style="color:#888;text-align:center;">لا توجد سجلات</p>';
}

async function sendWelcomeGift() {
    const userId = parseInt(document.getElementById('giftUserSelect')?.value);
    const balance = parseInt(document.getElementById('giftBalance')?.value) || appSettings.welcomeGiftBalance;
    const pages = parseInt(document.getElementById('giftPages')?.value) || appSettings.welcomeGiftPages;
    
    const user = allUsers.find(u => u.id === userId);
    if (!user) { showToast('الرجاء اختيار مستخدم أولاً', 'error'); return; }
    
    const result = await topUpUserOnServer(userId, balance, pages);
    if (result) {
        giftsHistory.unshift({ id: Date.now(), userId, userName: user.name, type: 'welcome', balance, pages, date: new Date().toISOString() });
        localStorage.setItem('giftsHistory', JSON.stringify(giftsHistory));
        renderUsersTable();
        updateStats();
        loadGiftsHistory();
        showToast(`تم إرسال هدية ترحيبية لـ ${user.name}!`, 'success');
    }
}

async function sendReward() {
    const userId = parseInt(document.getElementById('rewardUserSelect')?.value);
    const balance = parseInt(document.getElementById('rewardBalance')?.value) || 100;
    const pages = parseInt(document.getElementById('rewardPages')?.value) || 200;
    
    const user = allUsers.find(u => u.id === userId);
    if (!user) { showToast('الرجاء اختيار مستخدم أولاً', 'error'); return; }
    
    const result = await topUpUserOnServer(userId, balance, pages);
    if (result) {
        giftsHistory.unshift({ id: Date.now(), userId, userName: user.name, type: 'reward', balance, pages, date: new Date().toISOString() });
        localStorage.setItem('giftsHistory', JSON.stringify(giftsHistory));
        renderUsersTable();
        updateStats();
        loadGiftsHistory();
        showToast(`تم إرسال مكافأة لـ ${user.name}!`, 'success');
    }
}

// ==================== BROADCAST ====================

function loadBroadcastsHistory() {
    broadcastsHistory = JSON.parse(localStorage.getItem('broadcastsHistory') || '[]');
    const container = document.getElementById('broadcastHistory');
    if (!container) return;
    
    const typeColors = { info: 'var(--admin-blue)', success: 'var(--admin-green)', warning: 'var(--admin-gold)', urgent: 'var(--admin-red)' };
    
    container.innerHTML = broadcastsHistory.slice(0, 20).map(bc => `
        <div class="card" style="margin-bottom:10px;padding:15px;border-right:4px solid ${typeColors[bc.type]}">
            <div style="display:flex;justify-content:space-between;">
                <span style="color:var(--admin-gold);font-weight:bold;">${bc.title}</span>
                <span style="color:#888;">${new Date(bc.date).toLocaleDateString('ar-IQ')}</span>
            </div>
            <p style="margin:10px 0;color:#ccc;">${bc.message}</p>
            <small style="color:#666;">تم الإرسال إلى ${bc.sentTo} مستخدم</small>
        </div>
    `).join('') || '<p style="color:#888;text-align:center;">لا توجد إشعارات مرسلة</p>';
}

async function sendBroadcast() {
    const title = document.getElementById('broadcastTitle')?.value?.trim();
    const message = document.getElementById('broadcastMessage')?.value?.trim();
    const type = document.getElementById('broadcastType')?.value || 'info';
    
    if (!title || !message) { showToast('الرجاء ملء جميع الحقول', 'error'); return; }
    
    const activeUsers = allUsers.filter(u => u.status !== 'deleted');
    
    try {
        const response = await fetch('/api/admin/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, message, type })
        });
        const data = await response.json();
        
        if (data.success) {
            broadcastsHistory.unshift({ id: Date.now(), title, message, type, date: new Date().toISOString(), sentTo: activeUsers.length });
            localStorage.setItem('broadcastsHistory', JSON.stringify(broadcastsHistory));
            
            document.getElementById('broadcastTitle').value = '';
            document.getElementById('broadcastMessage').value = '';
            
            loadBroadcastsHistory();
            showToast(`تم إرسال الإشعار لـ ${activeUsers.length} مستخدم!`, 'success');
        }
    } catch (e) {
        console.error('Broadcast error:', e);
        showToast('فشل في إرسال الإشعار', 'error');
    }
}

// ==================== ICONS ====================

function loadIcons() {
    const grid = document.getElementById('iconsGrid');
    if (!grid) return;
    
    grid.innerHTML = portalIcons.map(portal => `
        <div class="card">
            <div class="card-icon" style="font-size:60px;">${portal.icon}</div>
            <h3>${portal.name}</h3>
            <button class="btn btn-blue" onclick="changeIcon('${portal.id}')">🖼️ تغيير</button>
        </div>
    `).join('');
}

function changeIcon(portalId) {
    const newIcon = prompt('أدخل الأيقونة الجديدة:', '👨‍🎓');
    if (newIcon && newIcon.trim()) {
        const portal = portalIcons.find(p => p.id === portalId);
        if (portal) {
            portal.icon = newIcon.trim();
            loadIcons();
            showToast('تم تغيير الأيقونة بنجاح!', 'success');
        }
    }
}

// ==================== TOAST ====================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.style.background = type === 'success' ? 'var(--admin-green)' : 
                           type === 'error' ? 'var(--admin-red)' : 
                           type === 'info' ? 'var(--admin-blue)' : 'var(--admin-gold)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ==================== TIME ====================

function updateTime() {
    const now = new Date();
    const timeEl = document.getElementById('currentTime');
    if (timeEl) {
        timeEl.textContent = now.toLocaleDateString('ar-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
}

// ==================== INIT ====================

loadIcons();
loadPortals();