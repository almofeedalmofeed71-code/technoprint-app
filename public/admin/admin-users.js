/**
 * ADMIN USERS MODULE v8
 * User management with real Supabase data
 */

// ==================== RENDER USERS TABLE ====================
window.renderUsersTable = function() {
    try {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) {
            console.log('⚠️ usersTableBody not found');
            return;
        }
        
        const users = window.ADMIN_STATE?.users || [];
        
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #888;">لا توجد بيانات - جاري التحميل...</td></tr>';
            return;
        }
        
        tbody.innerHTML = users.map((u, i) => `
            <tr style="border-bottom: 1px solid #333;" data-user-id="${u?.id || ''}">
                <td style="padding: 12px 8px; font-size: 12px;">${i + 1}</td>
                <td style="padding: 12px 8px; font-size: 12px;">
                    <strong style="color: var(--admin-gold);">${u?.username || '-'}</strong>
                    ${u?.role === 'admin' ? ' 👑' : ''}
                </td>
                <td style="padding: 12px 8px; font-size: 12px; direction: ltr;">${u?.phone || '-'}</td>
                <td style="padding: 12px 8px; font-size: 12px;">${u?.governorate || '-'}</td>
                <td style="padding: 12px 8px; font-size: 12px; color: #2ECC71; font-weight: bold;">
                    ${window.formatNumber ? window.formatNumber(u?.balance || 0) : (u?.balance || 0)} IQD
                </td>
                <td style="padding: 12px 8px; font-size: 12px;">${window.formatNumber ? window.formatNumber(u?.pages || 0) : (u?.pages || 0)}</td>
                <td style="padding: 12px 8px; font-size: 12px;">
                    <select onchange="window.changeUserStatus('${u?.id || ''}', this.value)" 
                        style="background: #1a1a1a; color: #fff; padding: 5px 8px; border-radius: 5px; cursor: pointer; font-size: 11px; min-width: 80px;">
                        <option value="active" ${u?.status === 'active' ? 'selected' : ''}>✅ نشط</option>
                        <option value="suspended" ${u?.status === 'suspended' ? 'selected' : ''}>🚫 موقوف</option>
                    </select>
                </td>
                <td style="padding: 12px 8px; font-size: 12px;">
                    <button onclick="window.editUser('${u?.id || ''}')" title="تعديل" style="background: #3498DB; color: white; border: none; padding: 5px 8px; border-radius: 5px; cursor: pointer; margin-left: 3px; font-size: 11px;">✏️</button>
                    <button onclick="window.deleteUser('${u?.id || ''}')" title="حذف" style="background: #E74C3C; color: white; border: none; padding: 5px 8px; border-radius: 5px; cursor: pointer; font-size: 11px;">🗑️</button>
                </td>
            </tr>
        `).join('');
        
        console.log(`✅ Rendered ${users.length} users`);
        
    } catch (err) {
        console.error('❌ Render users error:', err);
    }
};

// ==================== USER ACTIONS ====================
window.changeUserStatus = async function(userId, status) {
    if (!userId || !status) return;
    
    try {
        console.log(`🔄 Updating user ${userId} status to ${status}`);
        const success = await window.supabase.update('profiles', { id: userId }, { status });
        
        if (success) {
            window.showToast(`✅ تم تحديث الحالة`);
            // Update local state
            const user = window.ADMIN_STATE?.users?.find(u => u?.id === userId);
            if (user) user.status = status;
            window.renderUsersTable();
        } else {
            window.showToast('❌ فشل تحديث الحالة');
        }
    } catch (err) {
        console.error('❌ Change status error:', err);
        window.showToast('❌ حدث خطأ');
    }
};

window.editUser = function(userId) {
    if (!userId) return;
    
    const user = window.ADMIN_STATE?.users?.find(u => u?.id === userId);
    if (!user) return;
    
    window.showToast(`✏️ تعديل: ${user?.username || 'مستخدم'}`);
    
    // Switch to wallet section and select user
    window.switchSection('wallet');
    setTimeout(() => {
        const select = document.getElementById('walletUserSelect');
        if (select) {
            select.value = userId;
            window.loadWalletUser?.();
        }
    }, 100);
};

window.deleteUser = async function(userId) {
    if (!userId) return;
    
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    try {
        const success = await window.supabase.delete('profiles', { id: userId });
        if (success) {
            window.showToast('✅ تم حذف المستخدم');
            window.ADMIN_STATE.users = window.ADMIN_STATE?.users?.filter(u => u?.id !== userId) || [];
            window.renderUsersTable();
            window.updateStats?.();
        } else {
            window.showToast('❌ فشل حذف المستخدم');
        }
    } catch (err) {
        console.error('❌ Delete error:', err);
        window.showToast('❌ حدث خطأ في الحذف');
    }
};

// ==================== SEARCH WITH DEBOUNCE ====================
let searchTimeout = null;
window.searchUsers = function() {
    try {
        const searchInput = document.getElementById('userSearch');
        if (!searchInput) return;
        
        const query = searchInput.value?.toLowerCase() || '';
        
        // Debounce search
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const users = window.ADMIN_STATE?.users || [];
            
            if (!query) {
                window.renderUsersTable();
                return;
            }
            
            const filtered = users.filter(u => 
                (u?.username || '').toLowerCase().includes(query) ||
                (u?.phone || '').includes(query) ||
                (u?.governorate || '').toLowerCase().includes(query)
            );
            
            const tbody = document.getElementById('usersTableBody');
            if (!tbody) return;
            
            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #888;">لا توجد نتائج</td></tr>';
                return;
            }
            
            tbody.innerHTML = filtered.map((u, i) => `
                <tr style="border-bottom: 1px solid #333;">
                    <td style="padding: 12px 8px; font-size: 12px;">${i + 1}</td>
                    <td style="padding: 12px 8px; font-size: 12px;"><strong style="color: var(--admin-gold);">${u?.username || '-'}</strong></td>
                    <td style="padding: 12px 8px; font-size: 12px; direction: ltr;">${u?.phone || '-'}</td>
                    <td style="padding: 12px 8px; font-size: 12px;">${u?.governorate || '-'}</td>
                    <td style="padding: 12px 8px; font-size: 12px; color: #2ECC71;">${window.formatNumber ? window.formatNumber(u?.balance || 0) : (u?.balance || 0)} IQD</td>
                    <td style="padding: 12px 8px; font-size: 12px;">${window.formatNumber ? window.formatNumber(u?.pages || 0) : (u?.pages || 0)}</td>
                    <td style="padding: 12px 8px; font-size: 12px;">
                        <span style="color: ${u?.status === 'active' ? '#2ECC71' : '#E74C3C'}; font-size: 11px;">
                            ${u?.status === 'active' ? '✅ نشط' : '🚫 موقوف'}
                        </span>
                    </td>
                    <td style="padding: 12px 8px; font-size: 12px;">
                        <button onclick="window.editUser('${u?.id || ''}')" style="background: #3498DB; color: white; border: none; padding: 5px 8px; border-radius: 5px; cursor: pointer; font-size: 11px;">✏️</button>
                    </td>
                </tr>
            `).join('');
            
        }, 300);
        
    } catch (err) {
        console.error('❌ Search error:', err);
    }
};

// ==================== SETUP EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Setup search input listener
    setTimeout(() => {
        const searchInput = document.getElementById('userSearch');
        if (searchInput) {
            searchInput.removeAttribute('oninput');
            searchInput.addEventListener('input', window.searchUsers);
            console.log('✅ Search listener attached');
        }
    }, 500);
});

// Re-export render function globally
window.renderUsersTable = window.renderUsersTable;