/**
 * ADMIN USERS MODULE
 * User management functions
 */

// ==================== RENDER USERS TABLE ====================
window.renderUsersTable = function() {
    try {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        const users = window.ADMIN_STATE?.users || [];
        
        tbody.innerHTML = users.map((u, i) => `
            <tr style="border-bottom: 1px solid #333;" data-user-id="${u?.id || ''}">
                <td style="padding: 10px;">${i + 1}</td>
                <td style="padding: 10px;"><strong>${u?.username || '-'}</strong> ${u?.role === 'admin' ? '👑' : ''}</td>
                <td style="padding: 10px;">${u?.phone || '-'}</td>
                <td style="padding: 10px;">${u?.governorate || '-'}</td>
                <td style="padding: 10px; color: #D4AF37;">${formatNumber(u?.balance || 0)} IQD</td>
                <td style="padding: 10px;">${formatNumber(u?.pages || 0)}</td>
                <td style="padding: 10px;">
                    <select onchange="window.changeUserStatus('${u?.id || ''}', this.value)" 
                        style="background: #1a1a1a; color: #fff; padding: 5px; border-radius: 5px; cursor: pointer;">
                        <option value="active" ${u?.status === 'active' ? 'selected' : ''}>✅ نشط</option>
                        <option value="suspended" ${u?.status === 'suspended' ? 'selected' : ''}>🚫 موقوف</option>
                    </select>
                </td>
                <td style="padding: 10px;">
                    <button onclick="window.editUser('${u?.id || ''}')" style="background: #3498DB; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; margin-right: 5px;">✏️</button>
                    <button onclick="window.deleteUser('${u?.id || ''}')" style="background: #E74C3C; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">🗑️</button>
                </td>
            </tr>
        `).join('');
        
        // Setup event listeners for new rows
        setupUserButtons();
        
    } catch (err) {
        console.error('Render users error:', err);
    }
};

// ==================== USER ACTIONS ====================
window.changeUserStatus = async function(userId, status) {
    if (!userId || !status) return;
    
    try {
        const success = await window.supabase.update('profiles', { id: userId }, { status });
        if (success) {
            window.showToast(`✅ تم تحديث الحالة`);
            // Update local state
            const user = window.ADMIN_STATE.users.find(u => u?.id === userId);
            if (user) user.status = status;
        } else {
            window.showToast('❌ فشل تحديث الحالة');
        }
    } catch (err) {
        window.showToast('❌ حدث خطأ');
    }
};

window.editUser = function(userId) {
    if (!userId) return;
    
    const user = window.ADMIN_STATE.users.find(u => u?.id === userId);
    if (!user) return;
    
    // Show edit modal or populate wallet section
    window.showToast(`✏️ تعديل: ${user?.username || 'مستخدم'}`);
    
    // Switch to wallet section and select user
    window.switchSection('wallet');
    setTimeout(() => {
        const select = document.getElementById('walletUserSelect');
        if (select) select.value = userId;
        loadWalletUser();
    }, 100);
};

window.deleteUser = async function(userId) {
    if (!userId) return;
    
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    try {
        const success = await window.supabase.delete('profiles', { id: userId });
        if (success) {
            window.showToast('✅ تم حذف المستخدم');
            // Remove from local state
            window.ADMIN_STATE.users = window.ADMIN_STATE.users.filter(u => u?.id !== userId);
            window.renderUsersTable();
            window.updateStats();
        } else {
            window.showToast('❌ فشل حذف المستخدم');
        }
    } catch (err) {
        window.showToast('❌ حدث خطأ في الحذف');
    }
};

// ==================== SEARCH ====================
window.searchUsers = function() {
    try {
        const query = document.getElementById('userSearch')?.value?.toLowerCase() || '';
        
        if (!query) {
            window.renderUsersTable();
            return;
        }
        
        const filtered = (window.ADMIN_STATE?.users || []).filter(u => 
            (u?.username || '').toLowerCase().includes(query) ||
            (u?.phone || '').includes(query) ||
            (u?.governorate || '').toLowerCase().includes(query)
        );
        
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = filtered.map((u, i) => `
            <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 10px;">${i + 1}</td>
                <td style="padding: 10px;"><strong>${u?.username || '-'}</strong></td>
                <td style="padding: 10px;">${u?.phone || '-'}</td>
                <td style="padding: 10px;">${u?.governorate || '-'}</td>
                <td style="padding: 10px; color: #D4AF37;">${formatNumber(u?.balance || 0)} IQD</td>
                <td style="padding: 10px;">${formatNumber(u?.pages || 0)}</td>
                <td style="padding: 10px;">
                    <span style="color: ${u?.status === 'active' ? '#2ECC71' : '#E74C3C'}">
                        ${u?.status === 'active' ? '✅ نشط' : '🚫 موقوف'}
                    </span>
                </td>
                <td style="padding: 10px;">
                    <button onclick="window.editUser('${u?.id || ''}')" style="background: #3498DB; color: white; border: none; padding: 5px 10px; border-radius: 5px;">✏️</button>
                </td>
            </tr>
        `).join('');
        
    } catch (err) {
        console.error('Search error:', err);
    }
};

// ==================== SETUP BUTTONS ====================
function setupUserButtons() {
    // Search input
    const searchInput = document.getElementById('userSearch');
    if (searchInput && !searchInput.hasListener) {
        searchInput.addEventListener('input', window.searchUsers);
        searchInput.hasListener = true;
    }
}

// Auto-setup on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(setupUserButtons, 500);
});