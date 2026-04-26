/**
 * ADMIN USERS MODULE v10
 * Renders REAL users from Supabase - NO DEMO DATA
 */

console.log('📦 Admin Users v10 loading...');

// ==================== RENDER REAL USERS ====================
window.renderUsersTable = function() {
    try {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) {
            console.error('❌ usersTableBody not found!');
            return;
        }
        
        const users = window.ADMIN_STATE?.users || [];
        
        console.log(`🎨 Rendering ${users.length} REAL users...`);
        
        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 60px 20px;">
                        <div style="font-size: 60px; margin-bottom: 15px;">👥</div>
                        <p style="color: #888; font-size: 16px;">لا توجد مستخدمين في قاعدة البيانات</p>
                        <small style="color: #666; display: block; margin-top: 10px;">
                            المستخدمون المسجلون عبر التطبيق سيظهرون هنا
                        </small>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Build table with REAL data
        const html = users.map((u, i) => `
            <tr style="border-bottom: 1px solid #222; transition: 0.2s;" 
                onmouseover="this.style.background='rgba(212,175,55,0.05)'" 
                onmouseout="this.style.background='transparent'">
                
                <td style="padding: 16px 12px; text-align: center;">
                    <span style="background: #1a1a1a; padding: 5px 10px; border-radius: 15px; font-size: 11px; color: #888;">
                        ${i + 1}
                    </span>
                </td>
                
                <td style="padding: 16px 12px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 20px;">👤</span>
                        <div>
                            <strong style="color: var(--admin-gold); font-size: 14px;">
                                ${u?.username || 'Unknown'}
                            </strong>
                            ${u?.role === 'admin' ? '<span style="color: #F39C12; font-size: 12px; margin-right: 5px;">👑</span>' : ''}
                            ${u?.role === 'teacher' ? '<span style="color: #3498DB; font-size: 12px; margin-right: 5px;">👨‍🏫</span>' : ''}
                        </div>
                    </div>
                </td>
                
                <td style="padding: 16px 12px; direction: ltr; text-align: right; font-size: 13px; color: #aaa; font-family: monospace;">
                    ${u?.phone || '-'}
                </td>
                
                <td style="padding: 16px 12px; font-size: 13px;">
                    <span style="background: #222; padding: 4px 10px; border-radius: 12px; font-size: 12px;">
                        📍 ${u?.governorate || '-'}
                    </span>
                </td>
                
                <td style="padding: 16px 12px; text-align: center;">
                    <span style="color: #2ECC71; font-size: 16px; font-weight: bold;">
                        ${formatNumber(u?.balance || 0)}
                    </span>
                    <div style="font-size: 10px; color: #666;">IQD</div>
                </td>
                
                <td style="padding: 16px 12px; text-align: center;">
                    <span style="color: #3498DB; font-size: 14px; font-weight: bold;">
                        ${formatNumber(u?.pages || 0)}
                    </span>
                </td>
                
                <td style="padding: 16px 12px;">
                    <select onchange="window.changeUserStatus('${u?.id || ''}', this.value)" 
                        style="background: #1a1a1a; color: #fff; padding: 8px 10px; border-radius: 8px; cursor: pointer; font-size: 12px; border: 1px solid #333; min-width: 100px;">
                        <option value="active" ${(u?.status || '') === 'active' ? 'selected' : ''}>✅ نشط</option>
                        <option value="suspended" ${(u?.status || '') === 'suspended' ? 'selected' : ''}>🚫 موقوف</option>
                    </select>
                </td>
                
                <td style="padding: 16px 12px; white-space: nowrap;">
                    <button onclick="window.editUser('${u?.id || ''}')" title="تعديل" 
                        style="background: #3498DB; color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 13px; margin-left: 5px;">
                        ✏️ تعديل
                    </button>
                    <button onclick="window.deleteUser('${u?.id || ''}')" title="حذف" 
                        style="background: #E74C3C; color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 13px;">
                        🗑️
                    </button>
                </td>
            </tr>
        `).join('');
        
        tbody.innerHTML = html;
        
        console.log(`✅ Rendered ${users.length} REAL users`);
        
        // Update stats too
        if (window.updateStats) window.updateStats();
        
    } catch (err) {
        console.error('❌ Render error:', err);
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
        console.error('❌ Status error:', err);
        window.showToast('❌ خطأ');
    }
};

window.editUser = function(userId) {
    if (!userId) return;
    
    const user = window.ADMIN_STATE?.users?.find(u => u?.id === userId);
    
    window.showToast(`✏️ ${user?.username || 'مستخدم'}`);
    
    // Switch to wallet and auto-select
    window.switchSection('wallet');
    setTimeout(() => {
        const select = document.getElementById('walletUserSelect');
        if (select && user) {
            select.innerHTML = `<option value="${user.id}">${user.username}</option>` + 
                select.innerHTML;
            select.value = user.id;
        }
    }, 200);
};

window.deleteUser = async function(userId) {
    if (!userId) return;
    
    if (!confirm('⚠️ هل أنت متأكد من حذف هذا المستخدم؟\nلا يمكن التراجع.')) return;
    
    try {
        console.log(`🗑️ Deleting user ${userId}`);
        
        const success = await window.supabase.delete('profiles', { id: userId });
        
        if (success) {
            window.showToast('✅ تم الحذف');
            
            // Remove from local state
            window.ADMIN_STATE.users = window.ADMIN_STATE?.users?.filter(u => u?.id !== userId) || [];
            
            window.renderUsersTable();
            if (window.updateStats) window.updateStats();
        } else {
            window.showToast('❌ فشل الحذف');
        }
    } catch (err) {
        console.error('❌ Delete error:', err);
        window.showToast('❌ خطأ في الحذف');
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
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 40px;">
                            🔍 لا توجد نتائج: "${query}"
                        </td>
                    </tr>
                `;
                return;
            }
            
            // Render filtered results
            tbody.innerHTML = filtered.map((u, i) => `
                <tr style="border-bottom: 1px solid #222;">
                    <td style="padding: 14px;">${i + 1}</td>
                    <td style="padding: 14px;"><strong style="color: var(--admin-gold);">${u?.username || '-'}</strong></td>
                    <td style="padding: 14px; direction: ltr; color: #aaa;">${u?.phone || '-'}</td>
                    <td style="padding: 14px;">${u?.governorate || '-'}</td>
                    <td style="padding: 14px; color: #2ECC71;">${formatNumber(u?.balance || 0)} IQD</td>
                    <td style="padding: 14px; color: #3498DB;">${formatNumber(u?.pages || 0)}</td>
                    <td style="padding: 14px;">
                        <span style="color: ${(u?.status || '') === 'active' ? '#2ECC71' : '#E74C3C'};">
                            ${(u?.status || '') === 'active' ? '✅' : '🚫'}
                        </span>
                    </td>
                    <td style="padding: 14px;">
                        <button onclick="window.editUser('${u?.id || ''}')" style="background: #3498DB; color: white; border: none; padding: 6px 10px; border-radius: 6px;">✏️</button>
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
    // Setup search
    setTimeout(() => {
        const searchInput = document.getElementById('userSearch');
        if (searchInput) {
            searchInput.addEventListener('input', window.searchUsers);
            console.log('✅ Search attached');
        }
    }, 500);
});

console.log('✅ Admin Users v10 ready');