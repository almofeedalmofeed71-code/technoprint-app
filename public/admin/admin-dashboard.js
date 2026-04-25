/**
 * TECHNO-CONTROL DASHBOARD v6 - CLEAN VERSION
 * No null errors, shows real data
 */

const SUPABASE_URL = 'https://rqzsokvhgjlftkouhphb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ2NTI0NywiZXhwIjoyMDkxMDQxMjQ3fQ.NuAG8xhCkYqsb-vZ-8K6Voe6p9oqBUIuVVrQrijpT7Y';

let allUsers = [];

// ==================== DB FUNCTIONS ====================

async function dbFetch(query) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, {
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
            }
        });
        return await res.json();
    } catch (e) {
        console.log('DB Error:', e);
        return null;
    }
}

async function dbUpdate(table, id, data) {
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return true;
    } catch (e) {
        return false;
    }
}

// ==================== MAIN INIT ====================

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('adminToken');
    
    // Allow access if token exists
    if (token) {
        initDashboard();
    } else {
        window.location.href = 'admin-login.html';
    }
});

async function initDashboard() {
    console.log('🚀 Loading dashboard...');
    
    // Show main container
    const overlay = document.getElementById('authOverlay');
    const container = document.getElementById('dashboardContainer');
    if (overlay) overlay.style.display = 'none';
    if (container) container.style.display = 'flex';
    
    // Load users
    await loadUsers();
    
    // Start refresh
    setInterval(loadUsers, 30000);
}

async function loadUsers() {
    const users = await dbFetch('profiles?select=*&order=created_at.desc');
    
    if (users && Array.isArray(users)) {
        allUsers = users.map(u => ({
            id: u.id,
            username: u.username || '',
            phone: u.phone || '',
            governorate: u.governorate || '',
            category: u.category || '',
            balance: u.balance_iqd || 0,
            pages: u.pages_count || 0,
            status: u.status || 'active',
            role: u.role || 'user'
        }));
        
        updateStats();
        renderUsers();
    }
}

function updateStats() {
    // Use optional chaining to prevent null errors
    const total = allUsers?.length || 0;
    const balance = allUsers?.reduce((s, u) => s + (u.balance || 0), 0) || 0;
    const pages = allUsers?.reduce((s, u) => s + (u.pages || 0), 0) || 0;
    
    // Safe updates
    document.getElementById('totalUsers')?.setAttribute('data-value', total);
    document.getElementById('totalBalance')?.setAttribute('data-value', balance);
    document.getElementById('totalPages')?.setAttribute('data-value', pages);
    document.getElementById('totalAds')?.setAttribute('data-value', 0);
    
    // Update text content with null checks
    const el1 = document.getElementById('totalUsers');
    const el2 = document.getElementById('totalBalance');
    const el3 = document.getElementById('totalPages');
    const el4 = document.getElementById('totalAds');
    
    if (el1) el1.textContent = total;
    if (el2) el2.textContent = balance.toLocaleString();
    if (el3) el3.textContent = pages.toLocaleString();
    if (el4) el4.textContent = '0';
}

function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = allUsers.map((u, i) => `
        <tr style="border-bottom: 1px solid #333;">
            <td style="padding: 10px;">${i + 1}</td>
            <td style="padding: 10px;"><strong>${u.username}</strong> ${u.role === 'admin' ? '👑' : ''}</td>
            <td style="padding: 10px;">${u.phone || '-'}</td>
            <td style="padding: 10px;">${u.governorate || '-'}</td>
            <td style="padding: 10px;">${u.category || '-'}</td>
            <td style="padding: 10px; color: #D4AF37;">${u.balance} IQD</td>
            <td style="padding: 10px;">${u.pages}</td>
            <td style="padding: 10px;">
                <select onchange="changeStatus('${u.id}', this.value)" style="background: #1a1a1a; color: #fff; padding: 5px;">
                    <option value="active" ${u.status === 'active' ? 'selected' : ''}>✅ نشط</option>
                    <option value="suspended" ${u.status === 'suspended' ? 'selected' : ''}>🚫 موقوف</option>
                </select>
            </td>
        </tr>
    `).join('');
}

async function changeStatus(userId, status) {
    await dbUpdate('profiles', userId, { status });
    await loadUsers();
}

function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = 'admin-login.html';
}

// Toast
function showToast(msg) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = msg;
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 3000);
    }
}