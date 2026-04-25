/**
 * TECHOPRINT 2026 - MASTER CONTROL DASHBOARD v5
 * Ultimate Fix - Owner Access Guaranteed
 */

// ==================== CONFIGURATION ====================
const SUPABASE_URL = 'https://rqzsokvhgjlftkouhphb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ2NTI0NywiZXhwIjoyMDkxMDQxMjQ3fQ.NuAG8xhCkYqsb-vZ-8K6Voe6p9oqBUIuVVrQrijpT7Y';
const API_URL = 'https://technoprint-app.vercel.app';

// State Management
let allUsers = [];
let auditLog = [];

// ==================== SUPABASE API ====================

async function supabaseFetch(table, params = '') {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
            }
        });
        return await res.json();
    } catch (err) {
        console.error('❌ Fetch error:', err);
        return null;
    }
}

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
        return false;
    }
}

// ==================== AUDIT LOG ====================

async function logAction(action, target, details) {
    const log = { id: crypto.randomUUID(), action, target, details, admin: 'admin', timestamp: new Date().toISOString() };
    auditLog.unshift(log);
    localStorage.setItem('auditLog', JSON.stringify(auditLog));
    await supabaseInsert('audit_log', log).catch(() => {});
}

// ==================== USERS MANAGEMENT ====================

async function fetchAllUsers() {
    const users = await supabaseFetch('profiles', '?select=*&order=created_at.desc');
    if (users && Array.isArray(users)) {
        allUsers = users.map(u => ({
            id: u.id, username: u.username || '', phone: u.phone || '',
            governorate: u.governorate || '', category: u.category || '',
            balance: u.balance_iqd || 0, pages: u.pages_count || 0,
            status: u.status || 'active', role: u.role || 'user', createdAt: u.created_at
        }));
        updateStats();
        renderUsersTable();
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    tbody.innerHTML = allUsers.map((u, i) => `
        <tr class="user-row ${u.role === 'admin' ? 'admin-row' : ''}">
            <td>${i + 1}</td>
            <td><strong>${u.username}</strong> ${u.role === 'admin' ? '👑' : u.role === 'staff' ? '👔' : ''}</td>
            <td>${u.phone || '-'}</td>
            <td>${u.governorate || '-'}</td>
            <td><span class="category-badge">${u.category || '-'}</span></td>
            <td><span class="balance-value">${u.balance} IQD</span></td>
            <td><span class="pages-value">${u.pages}</span></td>
            <td>
                <select onchange="changeUserStatus('${u.id}', this.value)" class="status-select">
                    <option value="active" ${u.status === 'active' ? 'selected' : ''}>✅ نشط</option>
                    <option value="suspended" ${u.status === 'suspended' ? 'selected' : ''}>🚫 موقوف</option>
                </select>
            </td>
            <td>
                ${u.role !== 'admin' ? `
                <button onclick="openWalletModal('${u.id}')" class="btn-action btn-credit">💰</button>
                <button onclick="editUser('${u.id}')" class="btn-action btn-edit">✏️</button>
                <button onclick="deleteUser('${u.id}')" class="btn-action btn-delete">🗑️</button>
                ` : '<span style="color:#D4AF37;">👑 مالك</span>'}
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
        await logAction('تغيير الحالة', user.username, status);
        showToast(`تم تحديث ${user.username}`);
        updateStats();
    }
}

function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    showModal(`
        <h3>✏️ تعديل: ${user.username}</h3>
        <div class="form-group"><label>الهاتف</label><input type="text" id="editPhone" value="${user.phone}"></div>
        <div class="form-group"><label>المحافظة</label><input type="text" id="editGovernorate" value="${user.governorate}"></div>
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
            <button onclick="closeModal()" class="btn-cancel">إلغاء</button>
        </div>
    `);
}

async function saveUserEdit(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    const phone = document.getElementById('editPhone').value;
    const governorate = document.getElementById('editGovernorate').value;
    const category = document.getElementById('editCategory').value;
    const success = await supabaseUpdate('profiles', userId, { phone, governorate, category });
    if (success) {
        user.phone = phone; user.governorate = governorate; user.category = category;
        await logAction('تعديل مستخدم', user.username, 'تم التحديث');
        showToast('تم الحفظ بنجاح!');
        renderUsersTable();
        closeModal();
    }
}

function openWalletModal(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    showModal(`
        <h3>💰 محفظة: ${user.username}</h3>
        <div class="current-balance">
            <p>الرصيد: <strong>${user.balance} IQD</strong></p>
            <p>الصفحات: <strong>${user.pages}</strong></p>
        </div>
        <div class="form-group"><label>الرصيد (IQD)</label><input type="number" id="balanceAmount" placeholder="أدخل المبلغ"></div>
        <div class="form-group"><label>الصفحات</label><input type="number" id="pagesAmount" placeholder="أدخل عدد الصفحات"></div>
        <div class="modal-actions">
            <button onclick="applyCredit('${userId}', 'add')" class="btn-add">➕ إضافة</button>
            <button onclick="applyCredit('${userId}', 'subtract')" class="btn-subtract">➖ خصم</button>
        </div>
    `);
}

async function applyCredit(userId, action) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    const balanceDelta = parseInt(document.getElementById('balanceAmount').value) || 0;
    const pagesDelta = parseInt(document.getElementById('pagesAmount').value) || 0;
    if (balanceDelta === 0 && pagesDelta === 0) { showToast('أدخل مبلغ أو صفحات', 'error'); return; }
    const newBalance = action === 'add' ? (user.balance || 0) + balanceDelta : (user.balance || 0) - balanceDelta;
    const newPages = action === 'add' ? (user.pages || 0) + pagesDelta : (user.pages || 0) - pagesDelta;
    const success = await supabaseUpdate('profiles', userId, { balance_iqd: Math.max(0, newBalance), pages_count: Math.max(0, newPages) });
    if (success) {
        user.balance = Math.max(0, newBalance); user.pages = Math.max(0, newPages);
        await logAction(action === 'add' ? 'إضافة رصيد' : 'خصم رصيد', user.username, `+${balanceDelta} | +${pagesDelta}`);
        showToast(`تم ${action === 'add' ? 'الإضافة' : 'الخصم'} بنجاح!`);
        renderUsersTable();
        updateStats();
        closeModal();
    }
}

async function deleteUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user || user.role === 'admin') { showToast('لا يمكن حذف المالك!', 'error'); return; }
    if (!confirm(`حذف ${user.username}؟`)) return;
    const success = await supabaseDelete('profiles', userId);
    if (success) {
        await logAction('حذف مستخدم', user.username, 'تم الحذف');
        allUsers = allUsers.filter(u => u.id !== userId);
        renderUsersTable();
        updateStats();
        showToast(`تم حذف ${user.username}`);
    }
}

// ==================== STAFF CREATION ====================

function showStaffCreation() {
    showModal(`
        <h3>👔 إنشاء حساب موظف</h3>
        <div class="form-group"><label>اسم المستخدم</label><input type="text" id="staffUsername" placeholder="اسم مستخدم فريد"></div>
        <div class="form-group"><label>كلمة المرور</label><input type="password" id="staffPassword" placeholder="6 أحرف على الأقل"></div>
        <div class="form-group"><label>رقم الهاتف</label><input type="tel" id="staffPhone" placeholder="7701234567"></div>
        <div class="modal-actions">
            <button onclick="createStaffAccount()" class="btn-save">✅ إنشاء الموظف</button>
            <button onclick="closeModal()" class="btn-cancel">إلغاء</button>
        </div>
    `);
}

async function createStaffAccount() {
    const username = document.getElementById('staffUsername')?.value?.trim();
    const password = document.getElementById('staffPassword')?.value?.trim();
    const phone = document.getElementById('staffPhone')?.value?.trim();
    
    if (!username || !password || !phone) { showToast('جميع الحقول مطلوبة', 'error'); return; }
    
    const data = {
        id: crypto.randomUUID(),
        username,
        password, // In production, hash this!
        phone,
        governorate: 'baghdad',
        address: 'Staff HQ',
        category: 'عادي',
        role: 'staff', // ⬅️ STAFF ROLE
        balance_iqd: 0,
        pages_count: 0,
        status: 'active'
    };
    
    const result = await supabaseInsert('profiles', data);
    if (result) {
        await logAction('إنشاء موظف', username, 'حساب staff جديد');
        showToast(`تم إنشاء الموظف ${username}!`);
        closeModal();
        fetchAllUsers();
    } else {
        showToast('فشل إنشاء الحساب', 'error');
    }
}

// ==================== UI HELPERS ====================

function showModal(content) {
    let modal = document.getElementById('dynamicModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dynamicModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }
    modal.innerHTML = `<div class="modal-content">${content}</div>`;
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('dynamicModal')?.remove();
}

function updateStats() {
    const total = allUsers.filter(u => u.status !== 'deleted').length;
    const balance = allUsers.reduce((s, u) => s + (u.balance || 0), 0);
    const pages = allUsers.reduce((s, u) => s + (u.pages || 0), 0);
    const staffCount = allUsers.filter(u => u.role === 'staff').length;
    document.getElementById('totalUsers').textContent = total;
    document.getElementById('totalBalance').textContent = balance;
    document.getElementById('totalPages').textContent = pages;
    document.getElementById('totalAds').textContent = 0;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = 'admin-login.html';
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', async () => {
    // ✅ GUARANTEED ACCESS - Allow owner session
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');
    
    // ✅ ADMIN SESSIONS - ALLOW ALL
    if (token === 'owner-2024' || 
        token === 'owner-session-2024' ||
        token?.startsWith('admin-db-') ||
        token?.startsWith('db-admin-session-')) {
        console.log('✅ Admin session - ACCESS GRANTED');
        initDashboard();
        return;
    }
    
    // For other sessions
    if (!token || !userStr) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    try {
        const user = JSON.parse(userStr);
        if (user.isAdmin || user.role === 'admin' || user.role === 'staff') {
            console.log('✅ Access granted for:', user.username);
            initDashboard();
        } else {
            window.location.href = 'admin-login.html';
        }
    } catch (e) {
        window.location.href = 'admin-login.html';
    }
});

async function initDashboard() {
    // Load cached data
    const cachedUsers = localStorage.getItem('adminCachedUsers');
    if (cachedUsers) {
        allUsers = JSON.parse(cachedUsers);
        renderUsersTable();
        updateStats();
    }
    
    // Fetch fresh data
    await fetchAllUsers();
    localStorage.setItem('adminCachedUsers', JSON.stringify(allUsers));
    
    // Auto-refresh
    setInterval(async () => {
        await fetchAllUsers();
        localStorage.setItem('adminCachedUsers', JSON.stringify(allUsers));
    }, 30000);
    
    // Show section
    document.getElementById('users')?.classList.add('active');
}
