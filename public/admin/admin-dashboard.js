// ===== TECHNO-CONTROL ADMIN DASHBOARD SCRIPT =====

// State Management
let allUsers = [];
let currentUsers = [];
let currentPage = 1;
const usersPerPage = 10;
let adsList = [];
let giftsHistory = [];
let broadcastsHistory = [];

// Portal Icons Configuration
const portalIcons = [
    { id: 'student', name: 'بوابة الطالب', icon: '👨‍🎓' },
    { id: 'teacher', name: 'بوابة المعلم', icon: '👨‍🏫' },
    { id: 'academy', name: ' تكنو أكاديمي', icon: '🎓' },
    { id: 'store', name: 'المتجر', icon: '🏪' },
    { id: 'support', name: 'الدعم الفني', icon: '💻' },
    { id: 'settings', name: 'الإعدادات', icon: '⚙️' }
];

// Portal Status (Demo)
let portalStatus = {
    student: true,
    teacher: true,
    academy: true,
    store: false,
    support: true,
    settings: true
};

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupNavigation();
    loadConfiguration();
    loadUsers();
    loadAds();
    loadPortals();
    loadGiftsHistory();
    loadBroadcastsHistory();
    updateTime();
    setInterval(updateTime, 60000);
});

// Authentication Check
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (token) {
        document.getElementById('authOverlay').style.display = 'none';
        document.getElementById('dashboardContainer').style.display = 'block';
    } else {
        setupLoginForm();
    }
}

// Setup Login Form
function setupLoginForm() {
    const loginForm = document.getElementById('quickLogin');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value.trim();
        
        // Demo authentication
        if (username === 'admin' && password === 'technoprint2024') {
            localStorage.setItem('adminToken', 'demo-token');
            localStorage.setItem('adminUser', JSON.stringify({ 
                username: 'admin', 
                role: 'super_admin',
                name: 'مدير النظام'
            }));
            document.getElementById('authOverlay').style.display = 'none';
            document.getElementById('dashboardContainer').style.display = 'block';
            showToast('تم تسجيل الدخول بنجاح!', 'success');
        } else {
            document.getElementById('loginError').textContent = 'بيانات الدخول غير صحيحة';
            document.getElementById('loginError').style.display = 'block';
        }
    });
}

// Logout
function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.reload();
}

// Navigation Setup
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            switchSection(section);
        });
    });
}

// Switch Section
function switchSection(sectionId) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionId) {
            item.classList.add('active');
        }
    });
    
    // Update sections
    document.querySelectorAll('.section-panel').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    // Update title
    const titles = {
        dashboard: 'لوحة التحكم',
        design: 'المظهر والألوان',
        icons: 'أيقونات البوابات',
        texts: 'النصوص',
        users: 'قاعدة البيانات',
        wallet: 'المحفظة',
        gifts: 'الإرسال',
        ads: 'إعلانات السلايدر',
        portals: 'حالة البوابات',
        broadcast: 'إشعارات عامة',
        messages: 'رسائل خاصة'
    };
    document.getElementById('sectionTitle').textContent = titles[sectionId] || 'لوحة التحكم';
}

// Update Time
function updateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentTime').textContent = now.toLocaleDateString('ar-IQ', options);
}

// ===== CONFIGURATION MANAGEMENT =====

function loadConfiguration() {
    const config = JSON.parse(localStorage.getItem('technoprintConfig') || '{}');
    
    // Colors
    document.getElementById('mainGoldColor').value = config.mainGold || '#D4AF37';
    document.getElementById('mainGoldValue').textContent = config.mainGold || '#D4AF37';
    document.getElementById('mainBlackColor').value = config.mainBlack || '#0A0A0A';
    document.getElementById('mainBlackValue').textContent = config.mainBlack || '#0A0A0A';
    updateColorPreview();
    
    // Texts
    document.getElementById('appTitle').value = config.appTitle || 'TECHNO-PRINT';
    document.getElementById('appDescription').value = config.appDescription || 'منصة الطباعة الذكية';
    document.getElementById('welcomeText').value = config.welcomeText || 'مرحباً بك في تقنية';
    document.getElementById('studentPortalName').value = config.studentPortalName || 'بوابة الطالب';
    document.getElementById('teacherPortalName').value = config.teacherPortalName || 'بوابة المعلم';
    document.getElementById('academyPortalName').value = config.academyPortalName || ' تكنو أكاديمي';
    document.getElementById('footerText').value = config.footerText || '© 2024 TECHNO-PRINT';
}

function saveColor(type) {
    const config = JSON.parse(localStorage.getItem('technoprintConfig') || '{}');
    
    if (type === 'mainGold') {
        config.mainGold = document.getElementById('mainGoldColor').value;
        document.getElementById('mainGoldValue').textContent = config.mainGold;
    } else if (type === 'mainBlack') {
        config.mainBlack = document.getElementById('mainBlackColor').value;
        document.getElementById('mainBlackValue').textContent = config.mainBlack;
    }
    
    localStorage.setItem('technoprintConfig', JSON.stringify(config));
    updateColorPreview();
    showToast('تم حفظ اللون بنجاح!', 'success');
}

function updateColorPreview() {
    const gold = document.getElementById('mainGoldColor').value;
    const black = document.getElementById('mainBlackColor').value;
    
    const goldPreview = document.getElementById('previewGold');
    const blackPreview = document.getElementById('previewBlack');
    
    goldPreview.style.background = gold;
    goldPreview.style.color = black;
    
    blackPreview.style.background = black;
    blackPreview.style.color = gold;
}

function saveTexts() {
    const config = JSON.parse(localStorage.getItem('technoprintConfig') || '{}');
    
    config.appTitle = document.getElementById('appTitle').value;
    config.appDescription = document.getElementById('appDescription').value;
    config.welcomeText = document.getElementById('welcomeText').value;
    config.studentPortalName = document.getElementById('studentPortalName').value;
    config.teacherPortalName = document.getElementById('teacherPortalName').value;
    config.academyPortalName = document.getElementById('academyPortalName').value;
    config.footerText = document.getElementById('footerText').value;
    
    localStorage.setItem('technoprintConfig', JSON.stringify(config));
    showToast('تم حفظ النصوص بنجاح!', 'success');
}

// Color picker events
document.getElementById('mainGoldColor').addEventListener('input', (e) => {
    document.getElementById('mainGoldValue').textContent = e.target.value;
    updateColorPreview();
});

document.getElementById('mainBlackColor').addEventListener('input', (e) => {
    document.getElementById('mainBlackValue').textContent = e.target.value;
    updateColorPreview();
});

// ===== ICONS MANAGEMENT =====

function loadIcons() {
    const iconsGrid = document.getElementById('iconsGrid');
    const config = JSON.parse(localStorage.getItem('technoprintConfig') || '{}');
    const savedIcons = config.portalIcons || {};
    
    iconsGrid.innerHTML = portalIcons.map(portal => `
        <div class="card">
            <div class="card-icon" style="font-size: 60px;">${savedIcons[portal.id] || portal.icon}</div>
            <h3>${portal.name}</h3>
            <button class="btn btn-blue" onclick="changeIcon('${portal.id}')">🖼️ تغيير</button>
        </div>
    `).join('');
}

function changeIcon(portalId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const config = JSON.parse(localStorage.getItem('technoprintConfig') || '{}');
                config.portalIcons = config.portalIcons || {};
                config.portalIcons[portalId] = event.target.result;
                localStorage.setItem('technoprintConfig', JSON.stringify(config));
                loadIcons();
                showToast('تم تحديث الأيقونة بنجاح!', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function handleIconUpload(input) {
    if (input.files.length > 0) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            showToast('تم رفع الأيقونة - اختر البوابة للتحديث', 'info');
        };
        reader.readAsDataURL(file);
    }
}

// ===== USERS MANAGEMENT =====

function loadUsers() {
    // Load demo users
    allUsers = JSON.parse(localStorage.getItem('technoprintUsers') || '[]');
    
    // Add demo users if empty
    if (allUsers.length === 0) {
        allUsers = [
            { id: 1, name: 'أحمد محمد', phone: '07701234567', governorate: 'بغداد', balance: 150, pages: 500, status: 'active', createdAt: '2024-01-15' },
            { id: 2, name: 'زينب علي', phone: '07712345678', governorate: 'البصرة', balance: 200, pages: 1000, status: 'active', createdAt: '2024-01-20' },
            { id: 3, name: 'محمد خالد', phone: '07723456789', governorate: 'أربيل', balance: 75, pages: 300, status: 'active', createdAt: '2024-02-01' },
            { id: 4, name: 'فاطمة سعيد', phone: '07734567890', governorate: 'نينوى', balance: 120, pages: 450, status: 'inactive', createdAt: '2024-02-10' },
            { id: 5, name: 'عمر يوسف', phone: '07745678901', governorate: 'النجف', balance: 180, pages: 600, status: 'active', createdAt: '2024-02-15' }
        ];
        saveUsers();
    }
    
    currentUsers = [...allUsers];
    renderUsersTable();
    updateStats();
    populateUserSelects();
}

function saveUsers() {
    localStorage.setItem('technoprintUsers', JSON.stringify(allUsers));
}

function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    const start = (currentPage - 1) * usersPerPage;
    const end = start + usersPerPage;
    const pageUsers = currentUsers.slice(start, end);
    
    tbody.innerHTML = pageUsers.map((user, index) => `
        <tr>
            <td>${start + index + 1}</td>
            <td>${user.name}</td>
            <td>${user.phone}</td>
            <td>${user.governorate}</td>
            <td><span class="card-value">${user.balance}</span></td>
            <td><span class="card-value">${user.pages}</span></td>
            <td>
                <span style="color: ${user.status === 'active' ? 'var(--admin-green)' : 'var(--admin-red)'}">
                    ${user.status === 'active' ? '✅ نشط' : '❌ غير نشط'}
                </span>
            </td>
            <td>
                <button class="btn btn-blue" onclick="editUser(${user.id})">✏️</button>
                <button class="btn btn-red" onclick="deleteUser(${user.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
    
    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(currentUsers.length / usersPerPage);
    const controls = document.getElementById('paginationControls');
    
    if (totalPages <= 1) {
        controls.innerHTML = '';
        return;
    }
    
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
    const query = document.getElementById('userSearch').value.toLowerCase();
    currentUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.phone.includes(query) ||
        user.governorate.toLowerCase().includes(query)
    );
    currentPage = 1;
    renderUsersTable();
}

function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
        const newBalance = prompt(`الرصيد الحالي: ${user.balance}\nأدخل الرصيد الجديد:`, user.balance);
        if (newBalance !== null) {
            user.balance = parseInt(newBalance) || user.balance;
            saveUsers();
            renderUsersTable();
            showToast('تم تحديث الرصيد بنجاح!', 'success');
        }
    }
}

function deleteUser(userId) {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
        allUsers = allUsers.filter(u => u.id !== userId);
        saveUsers();
        renderUsersTable();
        showToast('تم حذف المستخدم بنجاح!', 'success');
    }
}

function updateStats() {
    document.getElementById('totalUsers').textContent = allUsers.length;
    document.getElementById('totalBalance').textContent = allUsers.reduce((sum, u) => sum + u.balance, 0);
    document.getElementById('totalPages').textContent = allUsers.reduce((sum, u) => sum + u.pages, 0);
    document.getElementById('totalAds').textContent = adsList.length;
}

function populateUserSelects() {
    const selects = [
        'walletUserSelect', 'giftUserSelect', 'rewardUserSelect', 'messageRecipient'
    ];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">-- اختر مستخدم --</option>' + 
            allUsers.map(user => `<option value="${user.id}">${user.name} (${user.phone})</option>`).join('');
    });
}

// ===== WALLET MANAGEMENT =====

function loadWalletUser() {
    const userId = parseInt(document.getElementById('walletUserSelect').value);
    const user = allUsers.find(u => u.id === userId);
    
    if (user) {
        document.getElementById('walletUserInfo').style.display = 'block';
        document.getElementById('walletUserName').textContent = user.name;
        document.getElementById('walletCurrentBalance').textContent = user.balance;
        document.getElementById('walletCurrentPages').textContent = user.pages;
    } else {
        document.getElementById('walletUserInfo').style.display = 'none';
    }
}

function adjustBalance(action) {
    const userId = parseInt(document.getElementById('walletUserSelect').value);
    const amount = parseInt(document.getElementById('balanceAmount').value) || 0;
    const user = allUsers.find(u => u.id === userId);
    
    if (!user) {
        showToast('الرجاء اختيار مستخدم أولاً', 'error');
        return;
    }
    
    if (action === 'add') {
        user.balance += amount;
    } else {
        user.balance = Math.max(0, user.balance - amount);
    }
    
    saveUsers();
    loadWalletUser();
    renderUsersTable();
    updateStats();
    showToast(`تم ${action === 'add' ? 'إضافة' : 'خصم'} ${amount} من الرصيد`, 'success');
}

function adjustPages(action) {
    const userId = parseInt(document.getElementById('walletUserSelect').value);
    const amount = parseInt(document.getElementById('pagesAmount').value) || 0;
    const user = allUsers.find(u => u.id === userId);
    
    if (!user) {
        showToast('الرجاء اختيار مستخدم أولاً', 'error');
        return;
    }
    
    if (action === 'add') {
        user.pages += amount;
    } else {
        user.pages = Math.max(0, user.pages - amount);
    }
    
    saveUsers();
    loadWalletUser();
    renderUsersTable();
    updateStats();
    showToast(`تم ${action === 'add' ? 'إضافة' : 'خصم'} ${amount} صفحة`, 'success');
}

// ===== GIFTS MANAGEMENT =====

function sendWelcomeGift() {
    const userId = parseInt(document.getElementById('giftUserSelect').value);
    const balance = parseInt(document.getElementById('giftBalance').value) || 50;
    const pages = parseInt(document.getElementById('giftPages').value) || 100;
    
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        showToast('الرجاء اختيار مستخدم أولاً', 'error');
        return;
    }
    
    user.balance += balance;
    user.pages += pages;
    saveUsers();
    
    // Log gift
    const gift = {
        id: Date.now(),
        userId: user.id,
        userName: user.name,
        type: 'welcome',
        balance: balance,
        pages: pages,
        date: new Date().toISOString()
    };
    giftsHistory.unshift(gift);
    localStorage.setItem('giftsHistory', JSON.stringify(giftsHistory));
    
    renderUsersTable();
    updateStats();
    loadGiftsHistory();
    showToast(`تم إرسال هدية ترحيبية لـ ${user.name}!`, 'success');
}

function sendReward() {
    const userId = parseInt(document.getElementById('rewardUserSelect').value);
    const balance = parseInt(document.getElementById('rewardBalance').value) || 100;
    const pages = parseInt(document.getElementById('rewardPages').value) || 200;
    
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        showToast('الرجاء اختيار مستخدم أولاً', 'error');
        return;
    }
    
    user.balance += balance;
    user.pages += pages;
    saveUsers();
    
    // Log reward
    const gift = {
        id: Date.now(),
        userId: user.id,
        userName: user.name,
        type: 'reward',
        balance: balance,
        pages: pages,
        date: new Date().toISOString()
    };
    giftsHistory.unshift(gift);
    localStorage.setItem('giftsHistory', JSON.stringify(giftsHistory));
    
    renderUsersTable();
    updateStats();
    loadGiftsHistory();
    showToast(`تم إرسال مكافأة لـ ${user.name}!`, 'success');
}

function loadGiftsHistory() {
    giftsHistory = JSON.parse(localStorage.getItem('giftsHistory') || '[]');
    const container = document.getElementById('giftsHistory');
    
    container.innerHTML = giftsHistory.slice(0, 20).map(gift => `
        <div class="card" style="margin-bottom: 10px; padding: 15px;">
            <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--admin-gold);">${gift.userName}</span>
                <span style="color: #888;">${new Date(gift.date).toLocaleDateString('ar-IQ')}</span>
            </div>
            <div style="margin-top: 10px;">
                <span class="btn btn-green" style="padding: 5px 10px; font-size: 12px;">+${gift.balance} رصيد</span>
                <span class="btn btn-blue" style="padding: 5px 10px; font-size: 12px;">+${gift.pages} صفحة</span>
                <span style="margin-right: 10px; color: ${gift.type === 'welcome' ? 'var(--admin-gold)' : 'var(--admin-green)'};">
                    ${gift.type === 'welcome' ? '🎁 ترحيبية' : '⭐ مكافأة'}
                </span>
            </div>
        </div>
    `).join('') || '<p style="color: #888; text-align: center;">لا توجد سجلات</p>';
}

// ===== ADS MANAGEMENT =====

function loadAds() {
    adsList = JSON.parse(localStorage.getItem('technoprintAds') || '[]');
    
    // Add demo ads if empty
    if (adsList.length === 0) {
        adsList = [
            { id: 1, url: 'https://via.placeholder.com/600x200/D4AF37/0A0A0A?text=TECHNO-PRINT', order: 1 },
            { id: 2, url: 'https://via.placeholder.com/600x200/0A0A0A/D4AF37?text=طباعة+ذكية', order: 2 }
        ];
        saveAds();
    }
    
    renderAds();
    document.getElementById('totalAds').textContent = adsList.length;
}

function saveAds() {
    localStorage.setItem('technoprintAds', JSON.stringify(adsList));
}

function renderAds() {
    const grid = document.getElementById('adsGrid');
    grid.innerHTML = adsList.map(ad => `
        <div class="preview-item">
            <img src="${ad.url}" alt="Ad ${ad.order}">
            <button class="delete-btn" onclick="deleteAd(${ad.id})">×</button>
            <div style="position: absolute; bottom: 5px; left: 5px; background: var(--admin-gold); color: black; padding: 3px 8px; border-radius: 5px; font-size: 12px;">
                ${ad.order}
            </div>
        </div>
    `).join('') || '<p style="color: #888;">لا توجد إعلانات</p>';
}

function handleAdUpload(input) {
    const files = input.files;
    if (files.length > 0) {
        Array.from(files).forEach((file, index) => {
            if (file.size > 10 * 1024 * 1024) {
                showToast(`الملف ${file.name} كبير جداً (حد أقصى 10MB)`, 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const newAd = {
                    id: Date.now() + index,
                    url: e.target.result,
                    order: adsList.length + index + 1
                };
                adsList.push(newAd);
                saveAds();
                renderAds();
                document.getElementById('totalAds').textContent = adsList.length;
            };
            reader.readAsDataURL(file);
        });
        showToast('تم رفع الإعلانات بنجاح!', 'success');
    }
}

function deleteAd(adId) {
    if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
        adsList = adsList.filter(ad => ad.id !== adId);
        // Reorder
        adsList.forEach((ad, index) => ad.order = index + 1);
        saveAds();
        renderAds();
        document.getElementById('totalAds').textContent = adsList.length;
        showToast('تم حذف الإعلان بنجاح!', 'success');
    }
}

// ===== PORTALS MANAGEMENT =====

function loadPortals() {
    const config = JSON.parse(localStorage.getItem('technoprintConfig') || '{}');
    portalStatus = config.portalStatus || portalStatus;
    renderPortals();
}

function renderPortals() {
    const container = document.getElementById('portalsList');
    container.innerHTML = portalIcons.map(portal => `
        <div class="toggle-group">
            <div>
                <span style="font-size: 24px; margin-left: 10px;">${portal.icon}</span>
                <span style="color: var(--admin-gold);">${portal.name}</span>
            </div>
            <label class="toggle-switch">
                <input type="checkbox" ${portalStatus[portal.id] ? 'checked' : ''} 
                       onchange="togglePortal('${portal.id}', this.checked)">
                <span class="toggle-slider"></span>
            </label>
        </div>
    `).join('');
}

function togglePortal(portalId, isActive) {
    portalStatus[portalId] = isActive;
    const config = JSON.parse(localStorage.getItem('technoprintConfig') || '{}');
    config.portalStatus = portalStatus;
    localStorage.setItem('technoprintConfig', JSON.stringify(config));
    showToast(`تم ${isActive ? 'تفعيل' : 'تعطيل'} ${portalIcons.find(p => p.id === portalId)?.name}`, 'success');
}

// ===== BROADCAST MANAGEMENT =====

function sendBroadcast() {
    const title = document.getElementById('broadcastTitle').value.trim();
    const message = document.getElementById('broadcastMessage').value.trim();
    const type = document.getElementById('broadcastType').value;
    
    if (!title || !message) {
        showToast('الرجاء ملء جميع الحقول', 'error');
        return;
    }
    
    const broadcast = {
        id: Date.now(),
        title: title,
        message: message,
        type: type,
        date: new Date().toISOString(),
        sentTo: allUsers.length
    };
    
    broadcastsHistory.unshift(broadcast);
    localStorage.setItem('broadcastsHistory', JSON.stringify(broadcastsHistory));
    
    // Clear form
    document.getElementById('broadcastTitle').value = '';
    document.getElementById('broadcastMessage').value = '';
    
    loadBroadcastsHistory();
    showToast(`تم إرسال الإشعار لـ ${allUsers.length} مستخدم!`, 'success');
}

function loadBroadcastsHistory() {
    broadcastsHistory = JSON.parse(localStorage.getItem('broadcastsHistory') || '[]');
    const container = document.getElementById('broadcastHistory');
    
    const typeColors = {
        info: 'var(--admin-blue)',
        success: 'var(--admin-green)',
        warning: 'var(--admin-gold)',
        urgent: 'var(--admin-red)'
    };
    
    container.innerHTML = broadcastsHistory.slice(0, 20).map(bc => `
        <div class="card" style="margin-bottom: 10px; padding: 15px; border-right: 4px solid ${typeColors[bc.type]}">
            <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--admin-gold); font-weight: bold;">${bc.title}</span>
                <span style="color: #888;">${new Date(bc.date).toLocaleDateString('ar-IQ')}</span>
            </div>
            <p style="margin: 10px 0; color: #ccc;">${bc.message}</p>
            <small style="color: #666;">تم الإرسال إلى ${bc.sentTo} مستخدم</small>
        </div>
    `).join('') || '<p style="color: #888; text-align: center;">لا توجد إشعارات مرسلة</p>';
}

// ===== MESSAGES MANAGEMENT =====

function sendPrivateMessage() {
    const userId = parseInt(document.getElementById('messageRecipient').value);
    const subject = document.getElementById('messageSubject').value.trim();
    const content = document.getElementById('messageContent').value.trim();
    
    if (!userId || !subject || !content) {
        showToast('الرجاء ملء جميع الحقول', 'error');
        return;
    }
    
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        showToast('المستخدم غير موجود', 'error');
        return;
    }
    
    // Store message (in real app, this would go to database)
    const messages = JSON.parse(localStorage.getItem('userMessages') || '[]');
    messages.unshift({
        id: Date.now(),
        userId: userId,
        userName: user.name,
        subject: subject,
        content: content,
        date: new Date().toISOString(),
        read: false
    });
    localStorage.setItem('userMessages', JSON.stringify(messages));
    
    // Clear form
    document.getElementById('messageRecipient').value = '';
    document.getElementById('messageSubject').value = '';
    document.getElementById('messageContent').value = '';
    
    showToast(`تم إرسال الرسالة إلى ${user.name}!`, 'success');
}

// ===== TOAST NOTIFICATION =====

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = type === 'success' ? 'var(--admin-green)' : 
                           type === 'error' ? 'var(--admin-red)' : 
                           type === 'info' ? 'var(--admin-blue)' : 'var(--admin-gold)';
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize icons on load
loadIcons();