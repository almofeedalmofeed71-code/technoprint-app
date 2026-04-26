/**
 * ADMIN ORDERS MODULE
 * Order/Printing job management
 */

// ==================== RENDER ORDERS TABLE ====================
window.renderOrdersTable = function() {
    try {
        const container = document.getElementById('ordersList');
        if (!container) return;
        
        const orders = window.ADMIN_STATE?.orders || [];
        
        if (orders.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #888; padding: 40px;">لا توجد طلبات</p>';
            return;
        }
        
        container.innerHTML = orders.map(o => `
            <div class="order-card" style="background: var(--admin-black); padding: 15px; border-radius: 10px; margin-bottom: 10px; border: 1px solid #333;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="color: var(--admin-gold); margin-bottom: 5px;">${o?.customer || 'عميل'}</h4>
                        <p style="color: #888; font-size: 13px;">
                            📄 ${o?.type || 'A4'} | 📑 ${o?.pages || 0} صفحة | 💰 ${formatNumber(o?.amount || 0)} IQD
                        </p>
                        <span style="color: #666; font-size: 11px;">${formatDate(o?.created_at)}</span>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <span style="padding: 5px 10px; border-radius: 15px; font-size: 12px;
                            background: ${getStatusColor(o?.status)}20; color: ${getStatusColor(o?.status)};">
                            ${getStatusText(o?.status)}
                        </span>
                        ${o?.status !== 'completed' ? `
                            <button onclick="window.updateOrderStatus('${o?.id || ''}', 'completed')" 
                                style="background: #2ECC71; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                                ✅ إنهاء
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        // Update stats
        updateOrderStats();
        
    } catch (err) {
        console.error('Render orders error:', err);
    }
};

function getStatusColor(status) {
    switch (status) {
        case 'completed': return '#2ECC71';
        case 'printing': return '#F39C12';
        case 'pending': return '#3498DB';
        default: return '#888';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'completed': return '✅ مكتمل';
        case 'printing': return '🖨️ جاري';
        case 'pending': return '⏳ انتظار';
        default: return status || 'غير معروف';
    }
}

function updateOrderStats() {
    try {
        const orders = window.ADMIN_STATE?.orders || [];
        const total = orders.length;
        const pending = orders.filter(o => o?.status === 'pending').length;
        const completed = orders.filter(o => o?.status === 'completed').length;
        const totalAmount = orders.reduce((s, o) => s + (o?.amount || 0), 0);
        
        const el1 = document.getElementById('ordersTotal');
        const el2 = document.getElementById('ordersPending');
        const el3 = document.getElementById('ordersCompleted');
        const el4 = document.getElementById('ordersAmount');
        
        if (el1) el1.textContent = total;
        if (el2) el2.textContent = pending;
        if (el3) el3.textContent = completed;
        if (el4) el4.textContent = formatNumber(totalAmount) + ' IQD';
        
    } catch (e) {
        console.error('Order stats error:', e);
    }
}

// ==================== ORDER ACTIONS ====================
window.updateOrderStatus = async function(orderId, newStatus) {
    if (!orderId) return;
    
    try {
        const success = await window.supabase.update('orders', { id: orderId }, { status: newStatus });
        if (success) {
            window.showToast('✅ تم تحديث حالة الطلب');
            // Update local
            const order = window.ADMIN_STATE.orders.find(o => o?.id === orderId);
            if (order) order.status = newStatus;
            window.renderOrdersTable();
        } else {
            window.showToast('❌ فشل التحديث');
        }
    } catch (err) {
        window.showToast('❌ حدث خطأ');
    }
};

window.addNewOrder = function() {
    const customer = document.getElementById('orderCustomer')?.value;
    const type = document.getElementById('orderType')?.value;
    const pages = parseInt(document.getElementById('orderPages')?.value) || 1;
    const color = document.getElementById('orderColor')?.value;
    
    if (!customer) {
        window.showToast('⚠️ أدخل اسم العميل');
        return;
    }
    
    const pricePerPage = color === 'ملون' ? 100 : 50;
    const amount = pages * pricePerPage;
    
    const newOrder = {
        id: 'local_' + Date.now(),
        customer,
        type: type || 'A4',
        pages,
        color,
        amount,
        status: 'pending',
        created_at: new Date().toISOString()
    };
    
    window.ADMIN_STATE.orders.unshift(newOrder);
    window.renderOrdersTable();
    window.showToast(`✅ تمت إضافة طلب: ${customer}`);
    
    // Clear form
    document.getElementById('orderCustomer').value = '';
    document.getElementById('orderPages').value = '';
};

window.deleteOrder = async function(orderId) {
    if (!orderId) return;
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    
    try {
        const success = await window.supabase.delete('orders', { id: orderId });
        if (success) {
            window.showToast('✅ تم حذف الطلب');
            window.ADMIN_STATE.orders = window.ADMIN_STATE.orders.filter(o => o?.id !== orderId);
            window.renderOrdersTable();
        }
    } catch (err) {
        window.showToast('❌ حدث خطأ');
    }
};