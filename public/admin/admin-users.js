/**
 * ADMIN USERS MODULE v9
 * User management with guaranteed rendering
 */

console.log('📦 Admin Users Module v9 loading...');

// ==================== GUARANTEED RENDER ====================
window.renderUsersTable = function() {
    try {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) {
            console.error('❌ usersTableBody element not found!');
            return;
        }
        
        const users = window.ADMIN_STATE?.users || [];
        
        console.log(`🎨 Rendering ${users.length} users in table`);
        
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #888;">⚠️ لا توجد بيانات - جاري التحميل...</td></tr>';
            return;
        }
        
        // Build table rows
        const html = users.map((u, i) => `
            <tr style="border-bottom: 1px solid #333; background: ${i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'};" data-user-id="${u?.id || ''}">
                <td style="padding: 14px 10px; text-align: center; color: #888; font-size: 12px;">${i + 1}</td>
                <td style="padding: 14px 10px;">
                    <strong style="color: var(--admin-gold); font-size: 14px;">${u?.username || 'مستخدم'}</strong>
                    ${u?.role === 'admin' ? '<span style="color: #F39C12; margin-right: 5px;">👑</span>' : ''}
                </td>
                <td style="padding: 14px 10px; direction: ltr; text-align: right; font-size: 13px; color: #aaa;">${u?.phone || '-'}</td>
                <td style="padding: 14px 10px; font-size: 13px;">${u?.governorate || '-'}</td>
                <td style="padding: 14px 10px; font-size: 13px; color: #2ECC71; font-weight: bold; text-align: center;">
                    ${window.formatNumber ? window.formatNumber(u?.balance || 0) : (u?.balance || 0)}
                    <span style="color: #888; font-size: 11px;"> IQD</span>
                </td>
                <td style="padding: 14px 10px; font-size: 13px; color: #3498DB; text-align: center;">
                    ${window.formatNumber ? window.formatNumber(u?.pages || 0) : (u?.pages || 0)}
                </td>
                <td style="padding: 14px 10px;">
                    <select onchange="window.changeUserStatus('${u?.id || ''}', this.value)" 
                        style="background: #1a1a1a; color: #fff; padding: 6px 8px; border-radius: 6px; cursor: pointer; font-size: 12px; border: 1px solid #444; min-width: 90px;">
                        <option value="active" ${u?.status === 'active' ? 'selected' : ''}>✅ نشط</option>
                        <option value="suspended" ${u?.status === 'suspended' ? 'selected' : ''}>🚫 موقوف</option>
                    </select>
                </td>
                <td style="padding: 14px 10px; white-space: nowrap;">
                    <button onclick="window.editUser('${u?.id || ''}')" title="تعديل" style="background: #3498DB; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; margin-left: 5px;">✏️</button>
                    <button onclick="window.deleteUser('${u?.id || ''}')" title="حذف" style="background: #E74C3C; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 12px;">🗑️</button>
                </td>
            </tr>
        `).join('');
        
        tbody.innerHTML = html;
        console.log(`✅ Rendered ${users.length} users successfully`);
        
    } catch (err) {
        console.error('❌ Render users error:', err);
    }
};

// ==================== USER ACTIONS ====================
window.changeUserStatus = async function(userId, status) {
    if (!userId || !status) return;
    
    try {
        console.log(`🔄 Updating user ${userId} → ${status}`);
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
    
    // Switch to wallet section
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
    
    if (!confirm('⚠️ هل أنت متأكد من حذف هذا المستخدم؟\nلا يمكن التراجع عن هذا الإجراء.')) return;
    
    try {
        console.log(`🗑️ Deleting user ${userId}`);
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

// ==================== SEARCH ====================
let searchTimeout = null;
window.searchUsers = function() {
    try {
        const searchInput = document.getElementById('userSearch');
        if (!searchInput) return;
        
        const query = searchInput.value?.toLowerCase() || '';
        
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
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #888;">🔍 لا توجد نتائج للبحث</td></tr>';
                return;
            }
            
            tbody.innerHTML = filtered.map((u, i) => `
                <tr style="border-bottom: 1px solid #333;">
                    <td style="padding: 14px 10px; text-align: center; color: #888;">${i + 1}</td>
                    <td style="padding: 14px 10px;"><strong style="color: var(--admin-gold);">${u?.username || '-'}</strong></td>
                    <td style="padding: 14px 10px; direction: ltr; color: #aaa;">${u?.phone || '-'}</td>
                    <td style="padding: 14px 10px;">${u?.governorate || '-'}</td>
                    <td style="padding: 14px 10px; color: #2ECC71; font-weight: bold;">${window.formatNumber ? window.formatNumber(u?.balance || 0) : (u?.balance || 0)} IQD</td>
                    <td style="padding: 14px 10px; color: #3498DB;">${window.formatNumber ? window.formatNumber(u?.pages || 0) : (u?.pages || 0)}</td>
                    <td style="padding: 14px 10px;">
                        <span style="color: ${u?.status === 'active' ? '#2ECC71' : '#E74C3C'}; font-size: 12px;">
                            ${u?.status === 'active' ? '✅ نشط' : '🚫 موقوف'}
                        </span>
                    </td>
                    <td style="padding: 14px 10px;">
                        <button onclick="window.editUser('${u?.id || ''}')" style="background: #3498DB; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 12px;">✏️</button>
                    </td>
                </tr>
            `).join('');
            
        }, 300);
        
    } catch (err) {
        console.error('❌ Search error:', err);
    }
};

// ==================== INIT ====================
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
    
    // Force render after 1 second
    setTimeout(() => {
        console.log('🔄 Checking if render needed...');
        const tbody = document.getElementById('usersTableBody');
        if (tbody && tbody.innerHTML.trim() === '') {
            console.log('⚠️ Table empty, forcing render');
            window.renderUsersTable();
        }
    }, 1500);
});

console.log('✅ Admin Users Module v9 ready');