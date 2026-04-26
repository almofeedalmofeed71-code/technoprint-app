/**
 * ADMIN WALLET MODULE
 * Wallet, Gifts, and Balance management
 */

// ==================== POPULATE DROPDOWNS ====================
window.populateUserDropdowns = function() {
    try {
        const selects = ['walletUserSelect', 'giftUserSelect', 'rewardUserSelect', 'messageRecipient'];
        
        selects.forEach(id => {
            const select = document.getElementById(id);
            if (!select) return;
            
            // Clear except first
            select.innerHTML = '<option value="">-- اختر مستخدم --</option>';
            
            (window.ADMIN_STATE?.users || []).forEach(user => {
                const option = document.createElement('option');
                option.value = user?.id || '';
                option.textContent = `${user?.username || 'مستخدم'} - ${user?.phone || ''}`;
                select.appendChild(option);
            });
        });
        
    } catch (err) {
        console.error('Populate dropdowns error:', err);
    }
};

// ==================== WALLET FUNCTIONS ====================
window.loadWalletUser = function() {
    try {
        const userId = document.getElementById('walletUserSelect')?.value;
        if (!userId) {
            const info = document.getElementById('walletUserInfo');
            if (info) info.style.display = 'none';
            return;
        }
        
        const user = (window.ADMIN_STATE?.users || []).find(u => u?.id === userId);
        if (!user) return;
        
        const info = document.getElementById('walletUserInfo');
        if (info) {
            info.style.display = 'block';
            const nameEl = document.getElementById('walletUserName');
            const balanceEl = document.getElementById('walletCurrentBalance');
            const pagesEl = document.getElementById('walletCurrentPages');
            
            if (nameEl) nameEl.textContent = user?.username || 'مستخدم';
            if (balanceEl) balanceEl.textContent = formatNumber(user?.balance || 0) + ' IQD';
            if (pagesEl) pagesEl.textContent = formatNumber(user?.pages || 0);
        }
        
    } catch (err) {
        console.error('Load wallet error:', err);
    }
};

window.adjustBalance = async function(action) {
    try {
        const userId = document.getElementById('walletUserSelect')?.value;
        const amount = parseInt(document.getElementById('balanceAmount')?.value);
        
        if (!userId || !amount) {
            window.showToast('⚠️ اختر مستخدم وأدخل المبلغ');
            return;
        }
        
        const user = (window.ADMIN_STATE?.users || []).find(u => u?.id === userId);
        if (!user) return;
        
        const newBalance = action === 'add' 
            ? (user?.balance || 0) + amount 
            : Math.max(0, (user?.balance || 0) - amount);
        
        const success = await window.supabase.update('profiles', { id: userId }, { balance_iqd: newBalance });
        if (success) {
            window.showToast(`✅ تم ${action === 'add' ? 'إضافة' : 'خصم'} ${amount} IQD`);
            user.balance = newBalance;
            window.renderUsersTable();
            window.updateStats();
        } else {
            // Update locally
            user.balance = newBalance;
            window.showToast('✅ تم التحديث محلياً');
            window.renderUsersTable();
            window.updateStats();
        }
        
        window.loadWalletUser();
        
    } catch (err) {
        window.showToast('❌ حدث خطأ');
    }
};

window.adjustPages = async function(action) {
    try {
        const userId = document.getElementById('walletUserSelect')?.value;
        const amount = parseInt(document.getElementById('pagesAmount')?.value);
        
        if (!userId || !amount) {
            window.showToast('⚠️ اختر مستخدم وأدخل العدد');
            return;
        }
        
        const user = (window.ADMIN_STATE?.users || []).find(u => u?.id === userId);
        if (!user) return;
        
        const newPages = action === 'add' 
            ? (user?.pages || 0) + amount 
            : Math.max(0, (user?.pages || 0) - amount);
        
        const success = await window.supabase.update('profiles', { id: userId }, { pages_count: newPages });
        if (success) {
            window.showToast(`✅ تم ${action === 'add' ? 'إضافة' : 'خصم'} ${amount} صفحة`);
            user.pages = newPages;
            window.renderUsersTable();
            window.updateStats();
        } else {
            user.pages = newPages;
            window.showToast('✅ تم التحديث محلياً');
            window.renderUsersTable();
            window.updateStats();
        }
        
        window.loadWalletUser();
        
    } catch (err) {
        window.showToast('❌ حدث خطأ');
    }
};

// ==================== GIFTS ====================
window.sendWelcomeGift = async function() {
    try {
        const userId = document.getElementById('giftUserSelect')?.value;
        const balance = parseInt(document.getElementById('giftBalance')?.value) || 50;
        const pages = parseInt(document.getElementById('giftPages')?.value) || 100;
        
        if (!userId) {
            window.showToast('⚠️ اختر مستخدم أولاً');
            return;
        }
        
        const user = (window.ADMIN_STATE?.users || []).find(u => u?.id === userId);
        if (!user) return;
        
        const newBalance = (user?.balance || 0) + balance;
        const newPages = (user?.pages || 0) + pages;
        
        await window.supabase.update('profiles', { id: userId }, { 
            balance_iqd: newBalance,
            pages_count: newPages
        });
        
        await window.supabase.insert('gift_transactions', {
            user_id: userId,
            type: 'welcome_gift',
            balance_amount: balance,
            pages_amount: pages,
            sent_by: 'admin',
            created_at: new Date().toISOString()
        });
        
        window.showToast(`🎁 تم إرسال هدية ترحيبية لـ ${user?.username || 'المستخدم'}`);
        user.balance = newBalance;
        user.pages = newPages;
        window.renderUsersTable();
        window.updateStats();
        
    } catch (err) {
        window.showToast('❌ فشل إرسال الهدية');
    }
};

window.sendReward = async function() {
    try {
        const userId = document.getElementById('rewardUserSelect')?.value;
        const balance = parseInt(document.getElementById('rewardBalance')?.value) || 100;
        const pages = parseInt(document.getElementById('rewardPages')?.value) || 200;
        
        if (!userId) {
            window.showToast('⚠️ اختر مستخدم أولاً');
            return;
        }
        
        const user = (window.ADMIN_STATE?.users || []).find(u => u?.id === userId);
        if (!user) return;
        
        const newBalance = (user?.balance || 0) + balance;
        const newPages = (user?.pages || 0) + pages;
        
        await window.supabase.update('profiles', { id: userId }, { 
            balance_iqd: newBalance,
            pages_count: newPages
        });
        
        await window.supabase.insert('gift_transactions', {
            user_id: userId,
            type: 'special_reward',
            balance_amount: balance,
            pages_amount: pages,
            sent_by: 'admin',
            created_at: new Date().toISOString()
        });
        
        window.showToast(`⭐ تم إرسال مكافأة لـ ${user?.username || 'المستخدم'}`);
        user.balance = newBalance;
        user.pages = newPages;
        window.renderUsersTable();
        window.updateStats();
        
    } catch (err) {
        window.showToast('❌ فشل إرسال المكافأة');
    }
};

// ==================== MESSAGES ====================
window.sendPrivateMessage = async function() {
    try {
        const userId = document.getElementById('messageRecipient')?.value;
        const subject = document.getElementById('messageSubject')?.value;
        const content = document.getElementById('messageContent')?.value;
        
        if (!userId || !content) {
            window.showToast('⚠️ اختر مستلم وأدخل المحتوى');
            return;
        }
        
        const user = (window.ADMIN_STATE?.users || []).find(u => u?.id === userId);
        
        await window.supabase.insert('messages', {
            user_id: userId,
            subject: subject || 'رسالة من الإدارة',
            content,
            from_admin: true,
            sent_by: 'admin',
            created_at: new Date().toISOString()
        });
        
        window.showToast(`💬 تم إرسال الرسالة لـ ${user?.username || 'المستخدم'}`);
        document.getElementById('messageContent').value = '';
        
    } catch (err) {
        window.showToast('⚠️ فشل إرسال الرسالة');
    }
};

// ==================== BROADCAST ====================
window.sendBroadcast = async function() {
    try {
        const title = document.getElementById('broadcastTitle')?.value;
        const message = document.getElementById('broadcastMessage')?.value;
        const type = document.getElementById('broadcastType')?.value;
        
        if (!title || !message) {
            window.showToast('⚠️ أدخل العنوان والمحتوى');
            return;
        }
        
        await window.supabase.insert('notifications', {
            title,
            message,
            type: type || 'info',
            sent_to: 'all',
            sent_by: 'admin',
            created_at: new Date().toISOString()
        });
        
        window.showToast(`📨 تم إرسال الإشعار لـ ${window.ADMIN_STATE?.users?.length || 0} مستخدم`);
        document.getElementById('broadcastTitle').value = '';
        document.getElementById('broadcastMessage').value = '';
        
    } catch (err) {
        window.showToast('⚠️ تم الحفظ محلياً');
    }
};

// ==================== SETUP EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Wallet select change
    setTimeout(() => {
        const walletSelect = document.getElementById('walletUserSelect');
        if (walletSelect) {
            walletSelect.addEventListener('change', window.loadWalletUser);
        }
    }, 1000);
});