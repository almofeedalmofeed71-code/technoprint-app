/**
 * TECHNO-CONTROL RENDER FUNCTIONS
 * Contains: renderUsersTable, renderServicesGrid, renderOrdersTable, renderAdsGrid, renderAll
 */

function renderUsersTable() {
    var tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    var users = window.STATE.users || [];

    if (!users.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:#666;">لا توجد بيانات</td></tr>';
        return;
    }

    var html = '';
    for (var i = 0; i < users.length; i++) {
        var u = users[i];
        html += '<tr>';
        html += '<td>' + (i + 1) + '</td>';
        html += '<td>' + (u.username || 'Unknown') + '</td>';
        html += '<td>' + (u.phone || '-') + '</td>';
        html += '<td>' + (u.governorate || '-') + '</td>';
        html += '<td>' + window.formatNumber(u.balance_iqd || 0) + '</td>';
        html += '<td>' + window.formatNumber(u.pages_count || 0) + '</td>';
        html += '<td><span class="status-badge ' + (u.status === 'active' ? 'active' : 'inactive') + '">' + (u.status === 'active' ? '🟢 نشط' : '🔴 غير نشط') + '</span></td>';
        html += '<td>';
        html += '<button onclick="window.editUser(\'' + u.id + '\')" style="background:#3498db;color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;margin:2px;">✏️</button>';
        html += '<button onclick="window.deleteUser(\'' + u.id + '\')" style="background:#e74c3c;color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;margin:2px;">🗑️</button>';
        html += '</td></tr>';
    }
    tbody.innerHTML = html;
}

function renderServicesGrid() {
    var el = document.getElementById('servicesGrid');
    if (!el) return;

    var services = window.STATE.services || [];

    if (!services.length) {
        el.innerHTML = '<p style="text-align:center;color:#666;grid-column:1/-1;">لا توجد خدمات — أضف خدمة جديدة</p>';
        return;
    }

    var html = '';
    for (var i = 0; i < services.length; i++) {
        var s = services[i];
        html += '<div class="service-card">';
        html += '<div class="service-icon-wrapper">' + (s.icon || '📄') + '</div>';
        html += '<div class="service-title">' + (s.name || 'خدمة') + '</div>';
        html += '<div class="service-price-tag">' + window.formatNumber(s.price || 0) + ' <span>' + (s.currency || 'IQD') + '</span></div>';
        html += '<div class="service-status-badge ' + (s.status || 'active') + '">' + (s.status === 'active' ? '🟢 نشط' : '🔴 متوقف') + '</div>';
        html += '<div style="display:flex;gap:10px;margin-top:10px;">';
        html += '<button onclick="window.editService(\'' + s.id + '\')" style="background:#3498db;color:white;border:none;padding:8px 15px;border-radius:8px;cursor:pointer;">✏️</button>';
        html += '<button onclick="window.deleteService(\'' + s.id + '\')" style="background:#e74c3c;color:white;border:none;padding:8px 15px;border-radius:8px;cursor:pointer;">🗑️</button>';
        html += '</div></div>';
    }
    el.innerHTML = html;
}

function renderOrdersTable() {
    var el = document.getElementById('ordersList');
    if (!el) return;

    var orders = window.STATE.orders || [];

    if (!orders.length) {
        el.innerHTML = '<p style="text-align:center;color:#666;">لا توجد طلبات</p>';
        return;
    }

    var html = '';
    for (var i = 0; i < orders.length; i++) {
        var o = orders[i];
        var statusLabel = o.status === 'completed' ? '✅ مكتمل' : o.status === 'cancelled' ? '🔴 ملغي' : '⏳ قيد الانتظار';
        html += '<div class="order-card">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;">';
        html += '<div><strong>' + (o.customer_name || 'عميل') + '</strong>';
        html += '<span style="color:#888;margin-right:10px;">' + (o.phone || '-') + '</span></div>';
        html += '<span class="status-badge ' + (o.status || 'pending') + '">' + statusLabel + '</span></div>';
        html += '<div style="margin-top:8px;color:#888;font-size:13px;">';
        html += '<span>📄 ' + (o.pages || 1) + ' صفحة</span>';
        html += '<span style="margin-right:15px;">💰 ' + window.formatNumber(o.total_price || 0) + ' IQD</span>';
        html += '<span style="margin-right:15px;">' + (o.print_type || 'A4') + '</span>';
        html += '</div></div>';
    }
    el.innerHTML = html;
}

function renderAdsGrid() {
    var el = document.getElementById('adsGrid');
    if (!el) return;

    var ads = window.STATE.ads || [];

    if (!ads.length) {
        el.innerHTML = '<p style="text-align:center;color:#666;grid-column:1/-1;">لا توجد إعلانات</p>';
        return;
    }

    var html = '';
    for (var i = 0; i < ads.length; i++) {
        var ad = ads[i];
        html += '<div style="background:var(--admin-surface, #111);padding:15px;border-radius:10px;text-align:center;">';
        html += '<img src="' + (ad.image_url || '') + '" alt="Ad" style="width:100%;height:150px;object-fit:cover;border-radius:8px;" onerror="this.style.display=\'none\'">';
        html += '<p style="color:var(--admin-gold, #D4AF37);margin-top:10px;">' + (ad.title || 'إعلان') + '</p>';
        html += '<button onclick="window.deleteAd(\'' + ad.id + '\')" style="background:#e74c3c;color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;margin-top:5px;">🗑️ حذف</button>';
        html += '</div>';
    }
    el.innerHTML = html;
}

function renderAll() {
    renderUsersTable();
    renderServicesGrid();
    renderOrdersTable();
    renderAdsGrid();
    if (typeof window.renderSettingsPanel === 'function') {
        window.renderSettingsPanel();
    }
    if (typeof window.populateUserSelects === 'function') {
        window.populateUserSelects();
    }
    updateStats();
}

function updateStats() {
    var users = window.STATE.users || [];
    var balance = users.reduce(function(s, u) { return s + (parseInt(u.balance_iqd) || 0); }, 0);
    var pages = users.reduce(function(s, u) { return s + (parseInt(u.pages_count) || 0); }, 0);
    var active = users.filter(function(u) { return u.status === 'active'; }).length;
    var pending = (window.STATE.orders || []).filter(function(o) { return o.status === 'pending'; }).length;

    var set = function(id, val) {
        var el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    set('totalUsers', window.formatNumber(users.length));
    set('totalBalance', window.formatNumber(balance) + ' IQD');
    set('totalPages', window.formatNumber(pages));
    set('totalActive', window.formatNumber(active));
    set('radarTotal', window.formatNumber(users.length));
    set('radarActive', window.formatNumber(active));
    set('ordersTotal', window.formatNumber((window.STATE.orders || []).length));
    set('ordersPending', window.formatNumber(pending));
}

window.renderUsersTable = renderUsersTable;
window.renderServicesGrid = renderServicesGrid;
window.renderOrdersTable = renderOrdersTable;
window.renderAdsGrid = renderAdsGrid;
window.renderAll = renderAll;
window.updateStats = updateStats;