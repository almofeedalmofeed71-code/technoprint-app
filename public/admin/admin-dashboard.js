/**
 * TECHOPRINT 2026 - MASTER CONTROL DASHBOARD v4.0
 * Full Supabase Integration - Two-Way Sync
 * Professional Admin Panel with Offline Resilience
 */

// ==================== CONFIGURATION ====================
const SUPABASE_URL = 'https://rqzsokvhgjlftkouhphb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ2NTI0NywiZXhwIjoyMDkxMDQxMjQ3fQ.NuAG8xhCkYqsb-vZ-8K6Voe6p9oqBUIuVVrQrijpT7Y';

// State Management
let allUsers = [];
let appGates = [];
let appSettings = {};
let auditLog = [];

// ==================== SUPABASE API ====================

// Generic Supabase fetch with SERVICE_ROLE_KEY
async function supabaseFetch(table, params = {}) {
    const queryString = Object.entries(params)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');
    
    const url = `${SUPABASE_URL}/rest/v1/${table}${queryString ? '?' + queryString : ''}`;
    
    try {
        const res = await fetch(url, {
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return await res.json();
    } catch (err) {
        console.error('❌ Supabase error:', err);
        showToast('خطأ في الاتصال بقاعدة البيانات', 'error');
        return null;
    }
}

// Generic Supabase insert
async function supabaseInsert(table, data) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch (err) {
        console.error('❌ Insert error:', err);
        return null;
    }
}

// Generic Supabase update
async function supabaseUpdate(table, id, data) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return res.ok;
    } catch (err) {
        console.error('❌ Update error:', err);
        return false;
    }
}

// Generic Supabase delete
async function supabaseDelete(table, id) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
            }
        });
        return res.ok;
    } catch (err) {
        console.error('❌ Delete error:', err);
        return false;
    }
}

// ==================== AUDIT LOG ====================

async function logAction(action, target, details) {
    const log = {
        id: crypto.randomUUID(),
        action,
        target,
        details,
        admin: 'admin',
        timestamp: new Date().toISOString()
    };
    
    auditLog.unshift(log);
    localStorage.setItem('auditLog', JSON.stringify(auditLog));
    
    // Also save to Supabase
    await supabaseInsert('audit_log', log);
    
    renderAuditLog();
}

function renderAuditLog() {
    const container = document.getElementById('auditLogContainer');
    if (!container) return;
    
    container.innerHTML = auditLog.slice(0, 50).map(entry => `
        <div class="audit-entry">
            <span class="audit-time">${new Date(entry.timestamp).toLocaleString('ar-IQ')}</span>
            <span class="audit-action">${entry.action}</span>
            <span class="audit-target">${entry.target}</span>
            <span class="audit-details">${entry.details || '-'}</span>
        </div>
    `).join('') || '<p style="color:#888;">لا توجد سجلات</p>';
}

// ==================== USERS MANAGEMENT ====================

async function fetchAllUsers() {
    const users = await supabaseFetch('profiles', 'select=*&order=created_at.desc');
    if (users) {
        allUsers = users.map(u => ({
            id: u.id,
            username: u.username || '',
            phone: u.phone || '',
            governorate: u.governorate || '',
            category: u.category || '',
            balance: u.balance_iqd || 0,
            pages: u.pages_count || 0,
            status: u.status || 'active',
            role: u.role || 'user',
            createdAt: u.created_at
        }));
        
        updateStats();
        renderUsersTable();
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = allUsers.map((user, index) => `
        <tr class="user-row">
            <td>${index + 1}</td>
            <td><strong>${user.username}</strong></td>
            <td>${user.phone || '-'}</td>
            <td>${user.governorate || '-'}</td>
            <td><span class="category-badge">${user.category || '-'}</span></td>
            <td><span class="balance-value">${user.balance} IQD</span></td>
            <td><span class="pages-value">${user.pages}</span></td>
            <td>
                <select onchange="changeUserStatus('${user.id}', this.value)" class="status-select status-${user.status}">
                    <option value="active" ${user.status === 'active' ? 'selected' : ''}>✅ نشط</option>
                    <option value="suspended" ${user.status === 'suspended' ? 'selected' : ''}>🚫 موقوف</option>
                </select>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-edit" onclick="editUser('${user.id}')" title="تعديل">✏️</button>
                    <button class="btn-action btn-credit" onclick="openWalletModal('${user.id}')" title="شحن">💰</button>
                    <button class="btn-action btn-view" onclick="viewUserDetails('${user.id}')" title="عرض">👁️</button>
                    <button class="btn-action btn-delete" onclick="deleteUser('${user.id}')" title="حذف">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function changeUserStatus(userId, status) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    const success = await supabaseUpdate('profiles', userId, { status });
    if (success) {
        user.status = status;
        await logAction('تغيير الحالة', user.username, `الحالة: ${status}`);
        showToast(`تم تحديث حالة ${user.username}`, 'success');
        updateStats();
    }
}

function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    // Create edit modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>✏️ تعديل: ${user.username}</h3>
            <div class="form-group">
                <label>الهاتف</label>
                <input type="text" id="editPhone" value="${user.phone}">
            </div>
            <div class="form-group">
                <label>المحافظة</label>
                <input type="text" id="editGovernorate" value="${user.governorate}">
            </div>
            <div class="form-group">
                <label>الفئة</label>
                <select id="editCategory">
                    <option value="طالب" ${user.category === 'طالب' ? 'selected' : ''}>طالب</option>
                    <option value="مدرس" ${user.category === 'مدرس' ? 'selected' : ''}>مدرس</option>
                    <option value="مصمم" ${user.category === 'مصمم' ? 'selected' : ''}>مصمم</option>
                    <option value="مكتبة" ${user.category === 'مكتبة' ? 'selected' : ''}>مكتبة</option>
                    <option value="عادي" ${user.category === 'عادي' ? 'selected' : ''}>عادي</option>
                </select>
            </div>
            <div class="modal-actions">
                <button onclick="saveUserEdit('${userId}')" class="btn-save">💾 حفظ</button>
                <button onclick="this.closest('.modal-overlay').remove()" class="btn-cancel">إلغاء</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveUserEdit(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    const phone = document.getElementById('editPhone').value;
    const governorate = document.getElementById('editGovernorate').value;
    const category = document.getElementById('editCategory').value;
    
    const success = await supabaseUpdate('profiles', userId, {
        phone,
        governorate,
        category
    });
    
    if (success) {
        user.phone = phone;
        user.governorate = governorate;
        user.category = category;
        await logAction('تعديل مستخدم', user.username, 'تم تحديث البيانات');
        showToast('تم حفظ التعديلات بنجاح!', 'success');
        renderUsersTable();
        document.querySelector('.modal-overlay')?.remove();
    }
}

function openWalletModal(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content wallet-modal">
            <h3>💰 محفظة: ${user.username}</h3>
            <div class="current-balance">
                <div class="balance-item">
                    <span>الرصيد الحالي:</span>
                    <strong id="modalBalance">${user.balance} IQD</strong>
                </div>
                <div class="balance-item">
                    <span>الصفحات:</span>
                    <strong id="modalPages">${user.pages}</strong>
                </div>
            </div>
            <div class="form-group">
                <label>إضافة/خصم رصيد (IQD)</label>
                <input type="number" id="balanceAmount" placeholder="أدخل المبلغ">
            </div>
            <div class="form-group">
                <label>إضافة/خصم صفحات</label>
                <input type="number" id="pagesAmount" placeholder="أدخل عدد الصفحات">
            </div>
            <div class="modal-actions">
                <button onclick="applyCredit('${userId}', 'add')" class="btn-add">➕ إضافة</button>
                <button onclick="applyCredit('${userId}', 'subtract')" class="btn-subtract">➖ خصم</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function applyCredit(userId, action) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    const balanceDelta = parseInt(document.getElementById('balanceAmount').value) || 0;
    const pagesDelta = parseInt(document.getElementById('pagesAmount').value) || 0;
    
    if (balanceDelta === 0 && pagesDelta === 0) {
        showToast('أدخل مبلغ أو عدد صفحات', 'error');
        return;
    }
    
    const newBalance = action === 'add' 
        ? (user.balance || 0) + balanceDelta 
        : (user.balance || 0) - balanceDelta;
    
    const newPages = action === 'add'
        ? (user.pages || 0) + pagesDelta
        : (user.pages || 0) - pagesDelta;
    
    const success = await supabaseUpdate('profiles', userId, {
        balance_iqd: Math.max(0, newBalance),
        pages_count: Math.max(0, newPages)
    });
    
    if (success) {
        user.balance = Math.max(0, newBalance);
        user.pages = Math.max(0, newPages);
        
        await logAction(
            action === 'add' ? 'إضافة رصيد' : 'خصم رصيد',
            user.username,
            `رصيد: ${balanceDelta > 0 ? '+' : ''}${balanceDelta} | صفحات: ${pagesDelta > 0 ? '+' : ''}${pagesDelta}`
        );
        
        showToast(`تم ${action === 'add' ? 'إضافة' : 'خصم'} الرصيد بنجاح!`, 'success');
        renderUsersTable();
        updateStats();
        document.querySelector('.modal-overlay')?.remove();
    }
}

async function deleteUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    if (!confirm(`هل أنت متأكد من حذف حساب ${user.username}?\nلا يمكن التراجع!`)) return;
    
    const success = await supabaseDelete('profiles', userId);
    if (success) {
        await logAction('حذف مستخدم', user.username, 'تم حذف الحساب نهائياً');
        allUsers = allUsers.filter(u => u.id !== userId);
        renderUsersTable();
        updateStats();
        showToast(`تم حذف ${user.username}`, 'success');
    }
}

function viewUserDetails(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content details-modal">
            <h3>👤 ${user.username}</h3>
            <div class="details-grid">
                <div class="detail-item"><span>ID:</span><code>${user.id}</code></div>
                <div class="detail-item"><span>الهاتف:</span>${user.phone}</div>
                <div class="detail-item"><span>المحافظة:</span>${user.governorate}</div>
                <div class="detail-item"><span>الفئة:</span>${user.category}</div>
                <div class="detail-item"><span>الرصيد:</span>${user.balance} IQD</div>
                <div class="detail-item"><span>الصفحات:</span>${user.pages}</div>
                <div class="detail-item"><span>الحالة:</span>${user.status}</div>
                <div class="detail-item"><span>التسجيل:</span>${new Date(user.createdAt).toLocaleDateString('ar-IQ')}</div>
            </div>
            <button onclick="this.closest('.modal-overlay').remove()" class="btn-cancel">إغلاق</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function updateStats() {
    const totalUsers = allUsers.filter(u => u.status !== 'deleted').length;
    const totalBalance = allUsers.reduce((sum, u) => sum + (u.balance || 0), 0);
    const totalPages = allUsers.reduce((sum, u) => sum + (u.pages || 0), 0);
    
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalBalance').textContent = totalBalance;
    document.getElementById('totalPages').textContent = totalPages;
}

// ==================== CONTENT MANAGER (GATES) ====================

async function fetchGates() {
    const gates = await supabaseFetch('app_gates', 'select=*&order=order_num.asc');
    if (gates) {
        appGates = gates;
        renderGates();
    }
}

function renderGates() {
    const container = document.getElementById('gatesContainer');
    if (!container) return;
    
    container.innerHTML = appGates.map(gate => `
        <div class="gate-card">
            <div class="gate-header">
                <span class="gate-icon">${gate.icon || '📁'}</span>
                <span class="gate-name">${gate.name_ar}</span>
                <span class="gate-id">${gate.gate_key}</span>
            </div>
            <div class="gate-content">
                <p>${gate.description || '-'}</p>
                <div class="gate-items">
                    ${gate.items ? gate.items.map(item => `
                        <div class="gate-item">
                            <span>${item.name}</span>
                            <button onclick="removeGateItem('${gate.id}', '${item.id}')">×</button>
                        </div>
                    `).join('') : '<p style="color:#888;">لا توجد عناصر</p>'}
                </div>
            </div>
            <div class="gate-actions">
                <button onclick="editGate('${gate.id}')">✏️ تعديل</button>
                <button onclick="addGateItem('${gate.id}')">➕ عنصر</button>
                <button onclick="deleteGate('${gate.id}')" class="btn-danger">🗑️ حذف</button>
            </div>
        </div>
    `).join('') || '<p style="color:#888;">لا توجد بوابات</p>';
}

// ==================== THEME CONTROLLER ====================

async function fetchThemeSettings() {
    const settings = await supabaseFetch('app_settings', 'select=*');
    if (settings && settings.length > 0) {
        appSettings = settings[0];
        applyTheme();
    }
}

function applyTheme() {
    if (appSettings.primary_color) {
        document.documentElement.style.setProperty('--primary-color', appSettings.primary_color);
    }
    if (appSettings.font_family) {
        document.documentElement.style.setProperty('--font-family', appSettings.font_family);
    }
}

async function saveThemeChanges() {
    const primaryColor = document.getElementById('primaryColorPicker')?.value;
    const fontFamily = document.getElementById('fontFamilyInput')?.value;
    
    if (primaryColor) appSettings.primary_color = primaryColor;
    if (fontFamily) appSettings.font_family = fontFamily;
    
    await supabaseUpdate('app_settings', appSettings.id, appSettings);
    applyTheme();
    await logAction('تغيير المظهر', 'Admin', `اللون: ${primaryColor} | الخط: ${fontFamily}`);
    showToast('تم حفظ إعدادات المظهر!', 'success');
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    setupNavigation();
    
    // Load from localStorage first (offline resilience)
    const cachedUsers = localStorage.getItem('adminCachedUsers');
    if (cachedUsers) {
        allUsers = JSON.parse(cachedUsers);
        renderUsersTable();
        updateStats();
    }
    
    const cachedAuditLog = localStorage.getItem('auditLog');
    if (cachedAuditLog) {
        auditLog = JSON.parse(cachedAuditLog);
        renderAuditLog();
    }
    
    // Then fetch fresh from Supabase
    await fetchAllUsers();
    await fetchGates();
    await fetchThemeSettings();
    
    // Cache for offline use
    localStorage.setItem('adminCachedUsers', JSON.stringify(allUsers));
    
    // Auto-refresh every 30 seconds
    setInterval(async () => {
        await fetchAllUsers();
        localStorage.setItem('adminCachedUsers', JSON.stringify(allUsers));
    }, 30000);
});

// ==================== AUTH ====================

function checkAuth() {
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');
    
    // Check for token AND isAdmin flag
    if (!token || !userStr) {
        console.log('❌ No token or user - redirecting to login');
        window.location.href = 'admin-login.html';
        return;
    }
    
    try {
        const user = JSON.parse(userStr);
        if (!user.isAdmin) {
            console.log('❌ Not admin - redirecting to login');
            window.location.href = 'admin-login.html';
            return;
        }
        console.log('✅ Admin auth confirmed');
    } catch (e) {
        console.error('❌ Invalid user data');
        window.location.href = 'admin-login.html';
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = 'admin-login.html';
}

// ==================== NAVIGATION ====================

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            switchSection(section);
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
}

// ==================== TOAST ====================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}