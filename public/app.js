/**
 * TECHOPRINT 2026 - COMPLETE APP (FULL RESTORATION)
 * All 9 Gates + Student Portal 4 Pillars + Admin
 */

// ==================== GLOBAL STATE ====================
const APP_STATE = {
    currentLang: localStorage.getItem('techoprint_lang') || 'ar',
    user: JSON.parse(localStorage.getItem('techoprint_user') || 'null'),
    token: localStorage.getItem('techoprint_token') || null,
    balance: { IQD: 0, USD: 0 }
};

// ==================== ROUTER ====================
const Router = {
    routes: {
        'dashboard': () => loadDashboard(),
        'student': () => StudentPortal.render(),
        'library': () => loadLibrary(),
        'orders': () => loadOrders(),
        'wallet': () => loadWallet(),
        'tracking': () => loadTracking(),
        'transfer': () => loadTransfer(),
        'support': () => loadSupport(),
        'designer': () => loadDesigner(),
        'admin-dashboard': () => AdminPortal.renderDashboard(),
        'admin-users': () => AdminPortal.renderUsers(),
        'admin-delivery': () => AdminPortal.renderDelivery()
    },
    
    navigate(page) {
        // Update nav active state
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const activeNav = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (activeNav) activeNav.classList.add('active');
        
        // Update page title
        const titles = {
            'dashboard': '🏛️ لوحة التحكم',
            'student': '🎓 بوابة الطالب',
            'library': '📚 المكتبة',
            'orders': '📦 طلباتي',
            'wallet': '💰 المحفظة',
            'tracking': '📍 تتبع الطلب',
            'transfer': '🔄 التحويل',
            'support': '🎫 الدعم',
            'designer': '🎨 المصممون',
            'admin-dashboard': '👑 الرقابة المالية',
            'admin-users': '👥 إدارة المستخدمين',
            'admin-delivery': '🚚 إدارة التوصيل'
        };
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = titles[page] || 'TECHOPRINT 2026';
        
        // Execute route
        const handler = this.routes[page];
        if (handler) {
            handler();
        } else {
            loadDashboard();
        }
    }
};

// Global navigation
window.navigateTo = (page) => Router.navigate(page);

// ==================== PORTAL FUNCTIONS ====================
window.openPortal = (role) => {
    document.getElementById('masterPortal').style.display = 'none';
    document.getElementById('app').style.display = 'grid';
    
    // Role-based routing
    const roleRoutes = {
        'student': 'student',
        'teacher': 'library',
        'designer': 'designer',
        'publisher': 'library',
        'library': 'library',
        'ai': 'admin-dashboard',
        'delivery': 'admin-delivery',
        'admin': 'admin-dashboard',
        'guest': 'dashboard'
    };
    
    Router.navigate(roleRoutes[role] || 'dashboard');
    showToast(`مرحباً بك في ${role}!`, 'success');
};

window.showPortal = () => {
    document.getElementById('masterPortal').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
};

// ==================== DASHBOARD ====================
function loadDashboard() {
    const mainContent = document.getElementById('pageContent');
    mainContent.innerHTML = `
        <section class="page active">
            <div class="welcome-banner glass-panel">
                <div class="welcome-text">
                    <h2><span>مرحباً بك في</span> <span class="gold-text">TECHOPRINT 2026</span></h2>
                    <p>المنصة التعليمية الأولى في العراق</p>
                </div>
                <div class="welcome-stats">
                    <div class="stat-item glass-panel">
                        <span class="stat-value" id="totalOrders">12</span>
                        <span class="stat-label">إجمالي الطلبات</span>
                    </div>
                    <div class="stat-item glass-panel">
                        <span class="stat-value" id="totalBooks">48</span>
                        <span class="stat-label">الكتب المتاحة</span>
                    </div>
                    <div class="stat-item glass-panel">
                        <span class="stat-value" id="activeOrders">3</span>
                        <span class="stat-label">طلبات نشطة</span>
                    </div>
                </div>
            </div>
            
            <div class="quick-actions">
                <button class="action-btn glass-panel" onclick="Router.navigate('student')">
                    <span class="action-icon">🎓</span>
                    <span class="action-text">بوابة الطالب</span>
                </button>
                <button class="action-btn glass-panel" onclick="Router.navigate('library')">
                    <span class="action-icon">📚</span>
                    <span class="action-text">المكتبة</span>
                </button>
                <button class="action-btn glass-panel" onclick="Router.navigate('wallet')">
                    <span class="action-icon">💰</span>
                    <span class="action-text">المحفظة</span>
                </button>
                <button class="action-btn glass-panel" onclick="Router.navigate('orders')">
                    <span class="action-icon">📦</span>
                    <span class="action-text">طلباتي</span>
                </button>
                <button class="action-btn glass-panel" onclick="Router.navigate('tracking')">
                    <span class="action-icon">📍</span>
                    <span class="action-text">تتبع الطلب</span>
                </button>
                <button class="action-btn glass-panel" onclick="Router.navigate('transfer')">
                    <span class="action-icon">🔄</span>
                    <span class="action-text">تحويل رصيد</span>
                </button>
            </div>
            
            <div class="recent-activity glass-panel">
                <h3>📋 آخر النشاطات</h3>
                <div class="activity-list">
                    <div class="activity-item">
                        <span class="activity-icon">📦</span>
                        <span class="activity-text">تم شحن طلب #TP-2026-001</span>
                        <span class="activity-time">منذ ساعة</span>
                    </div>
                    <div class="activity-item">
                        <span class="activity-icon">💰</span>
                        <span class="activity-text">تم إيداع 50,000 IQD</span>
                        <span class="activity-time">منذ 3 ساعات</span>
                    </div>
                    <div class="activity-item">
                        <span class="activity-icon">📚</span>
                        <span class="activity-text">تم شراء كتاب الرياضيات</span>
                        <span class="activity-time">منذ يوم</span>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// ==================== LIBRARY ====================
function loadLibrary() {
    const mainContent = document.getElementById('pageContent');
    const books = [
        { title: 'رياضيات الصف الأول', author: 'أ. أحمد الخالدي', price: 2500, cover: '📐' },
        { title: 'العلوم الطبيعية', author: 'أ. فاطمة العبيدي', price: 3000, cover: '🔬' },
        { title: 'اللغة العربية', author: 'أ. محمد الراشدي', price: 2000, cover: '📖' },
        { title: 'الإنجليزية العامة', author: 'أ. سارة الجبوري', price: 3500, cover: '📕' },
        { title: 'الفيزياء', author: 'أ. علي العسكري', price: 4000, cover: '⚡' },
        { title: 'الكيمياء', author: 'أ. زينب الحسني', price: 3800, cover: '🧪' },
        { title: 'التاريخ', author: 'أ. حسن البغدادي', price: 2200, cover: '🏛️' },
        { title: 'الجغرافيا', author: 'أ. صفاء الناصري', price: 2300, cover: '🌍' }
    ];
    
    mainContent.innerHTML = `
        <section class="page active">
            <h2 class="gold-text" style="margin-bottom: 24px; font-family: 'Amiri'; font-size: 2rem;">📚 المكتبة العالمية</h2>
            
            <div class="library-filters glass-panel">
                <input type="text" class="search-input" placeholder="🔍 البحث في المكتبة...">
                <select class="filter-select">
                    <option value="">جميع المواد</option>
                    <option value="math">الرياضيات</option>
                    <option value="science">العلوم</option>
                    <option value="arabic">العربية</option>
                    <option value="english">الإنجليزية</option>
                </select>
                <select class="filter-select">
                    <option value="">جميع الصفوف</option>
                    <option value="1">الصف الأول</option>
                    <option value="2">الصف الثاني</option>
                    <option value="3">الصف الثالث</option>
                </select>
            </div>
            
            <div class="book-grid">
                ${books.map(b => `
                    <div class="book-card glass-panel">
                        <div class="book-cover">${b.cover}</div>
                        <div class="book-info">
                            <h3 class="book-title">${b.title}</h3>
                            <p class="book-author">${b.author}</p>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                                <span class="book-price">${b.price.toLocaleString()} IQD</span>
                                <button class="pillar-btn" onclick="showToast('تمت إضافة ${b.title} للسلة!', 'success')">
                                    🛒 شراء
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
}

// ==================== ORDERS ====================
function loadOrders() {
    const mainContent = document.getElementById('pageContent');
    const orders = [
        { id: 'TP-2026-001', status: 'out_for_delivery', statusText: 'قيد التوصيل', total: 15000, items: 3, date: '2026-04-22' },
        { id: 'TP-2026-002', status: 'processing', statusText: 'قيد الطباعة', total: 8000, items: 2, date: '2026-04-21' },
        { id: 'TP-2026-003', status: 'delivered', statusText: 'تم التسليم', total: 5000, items: 1, date: '2026-04-20' },
        { id: 'TP-2026-004', status: 'pending', statusText: 'معلق', total: 12000, items: 4, date: '2026-04-19' }
    ];
    
    mainContent.innerHTML = `
        <section class="page active">
            <h2 class="gold-text" style="margin-bottom: 24px; font-family: 'Amiri'; font-size: 2rem;">📦 طلباتي</h2>
            
            <div class="order-status-tabs" style="margin-bottom: 24px;">
                <button class="tab-btn active" onclick="showToast('عرض الكل', 'info')">الكل (4)</button>
                <button class="tab-btn" onclick="showToast('الطلبات المعلقة', 'info')">معلق (1)</button>
                <button class="tab-btn" onclick="showToast('قيد الطباعة', 'info')">قيد التنفيذ (1)</button>
                <button class="tab-btn" onclick="showToast('قيد التوصيل', 'info')">قيد التوصيل (1)</button>
                <button class="tab-btn" onclick="showToast('تم التسليم', 'info')">تم التسليم (1)</button>
            </div>
            
            <div class="orders-list">
                ${orders.map(o => `
                    <div class="order-card glass-panel">
                        <div class="order-info">
                            <span class="order-id">#${o.id}</span>
                            <span style="color: var(--text-muted); font-size: 0.85rem;">${o.items} أصناف • ${o.date}</span>
                        </div>
                        <div class="order-details" style="text-align: left;">
                            <span class="order-total" style="font-size: 1.1rem; font-weight: 700; color: var(--gold-royal);">${o.total.toLocaleString()} IQD</span>
                            <span class="order-status ${o.status}">${o.statusText}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
}

// ==================== WALLET ====================
function loadWallet() {
    const mainContent = document.getElementById('pageContent');
    mainContent.innerHTML = `
        <section class="page active">
            <h2 class="gold-text" style="margin-bottom: 24px; font-family: 'Amiri'; font-size: 2rem;">💰 محفظتي الذهبية</h2>
            
            <div class="wallet-container">
                <div class="wallet-card glass-panel">
                    <h3 style="margin-bottom: 24px;">الرصيد الحالي</h3>
                    <div class="balance-section" style="margin: 32px 0;">
                        <div class="balance-item">
                            <span class="currency">🇮🇶 IQD</span>
                            <span class="amount" style="font-size: 3rem; color: var(--gold-royal);">50,000</span>
                        </div>
                        <div class="balance-item">
                            <span class="currency">🇺🇸 USD</span>
                            <span class="amount" style="font-size: 2rem;">$38</span>
                        </div>
                    </div>
                    <div class="wallet-actions">
                        <button class="wallet-btn deposit" onclick="showDepositModal()">
                            <span>💎</span> إيداع
                        </button>
                        <button class="wallet-btn withdraw" onclick="showWithdrawModal()">
                            <span>💸</span> سحب
                        </button>
                    </div>
                </div>
                
                <div class="transactions-section glass-panel">
                    <h3>📋 سجل المعاملات</h3>
                    <div class="transaction-list">
                        <div class="transaction-item">
                            <div class="transaction-info">
                                <span class="transaction-type">💰 إيداع</span>
                                <span class="transaction-date">22 أبريل 2026</span>
                            </div>
                            <span class="transaction-amount positive">+50,000 IQD</span>
                        </div>
                        <div class="transaction-item">
                            <div class="transaction-info">
                                <span class="transaction-type">📦 طلب #TP-001</span>
                                <span class="transaction-date">22 أبريل 2026</span>
                            </div>
                            <span class="transaction-amount negative">-15,000 IQD</span>
                        </div>
                        <div class="transaction-item">
                            <div class="transaction-info">
                                <span class="transaction-type">📚 شراء كتاب</span>
                                <span class="transaction-date">21 أبريل 2026</span>
                            </div>
                            <span class="transaction-amount negative">-2,500 IQD</span>
                        </div>
                        <div class="transaction-item">
                            <div class="transaction-info">
                                <span class="transaction-type">🔄 تحويل من أحمد</span>
                                <span class="transaction-date">20 أبريل 2026</span>
                            </div>
                            <span class="transaction-amount positive">+10,000 IQD</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// ==================== TRACKING ====================
function loadTracking() {
    const mainContent = document.getElementById('pageContent');
    mainContent.innerHTML = `
        <section class="page active">
            <h2 class="gold-text" style="margin-bottom: 24px; font-family: 'Amiri'; font-size: 2rem;">📍 تتبع الطلب</h2>
            
            <div class="tracking-card glass-panel" style="max-width: 600px; margin: 0 auto 24px;">
                <form onsubmit="trackOrder(event)">
                    <div class="form-group">
                        <label>رقم الطلب</label>
                        <input type="text" id="trackOrderId" placeholder="مثال: TP-2026-001" required>
                    </div>
                    <button type="submit" class="submit-btn gold-btn">🔍 تتبع</button>
                </form>
            </div>
            
            <div id="trackingResult" class="glass-panel" style="max-width: 800px; margin: 0 auto; padding: 24px; display: none;">
                <h3 class="gold-text">تفاصيل التتبع</h3>
                <div style="margin: 20px 0;">
                    <p><strong>رقم الطلب:</strong> <span id="trackResultId">#TP-2026-001</span></p>
                    <p><strong>الحالة:</strong> <span class="order-status out_for_delivery">قيد التوصيل</span></p>
                    <p><strong>الموقع:</strong> <span>بغداد - المنصور</span></p>
                </div>
                
                <div class="tracking-timeline">
                    <div class="timeline-item completed">
                        <span class="timeline-icon">✅</span>
                        <span>تم الطلب</span>
                    </div>
                    <div class="timeline-item completed">
                        <span class="timeline-icon">✅</span>
                        <span>قيد الطباعة</span>
                    </div>
                    <div class="timeline-item active">
                        <span class="timeline-icon">🚚</span>
                        <span>قيد التوصيل</span>
                    </div>
                    <div class="timeline-item">
                        <span class="timeline-icon">⏳</span>
                        <span>تم التسليم</span>
                    </div>
                </div>
            </div>
            
            <div class="tracking-map glass-panel" style="max-width: 800px; margin: 24px auto;">
                <div style="height: 300px; background: rgba(212,175,55,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 4rem;">🗺️</span>
                </div>
            </div>
        </section>
    `;
}

function trackOrder(e) {
    e.preventDefault();
    const orderId = document.getElementById('trackOrderId').value;
    document.getElementById('trackingResult').style.display = 'block';
    document.getElementById('trackResultId').textContent = '#' + orderId;
    showToast('تم العثور على الطلب!', 'success');
}

// ==================== TRANSFER ====================
function loadTransfer() {
    const mainContent = document.getElementById('pageContent');
    mainContent.innerHTML = `
        <section class="page active">
            <div class="transfer-container">
                <div class="transfer-card glass-panel">
                    <h2 class="gold-text" style="font-family: 'Amiri'; font-size: 2rem;">🔄 تحويل رصيد</h2>
                    
                    <form onsubmit="handleTransfer(event)">
                        <div class="form-group">
                            <label>معرف المستخدم المستلم</label>
                            <input type="text" placeholder="ID أو البريد الإلكتروني" required>
                        </div>
                        <div class="form-group">
                            <label>المبلغ</label>
                            <input type="number" placeholder="أدخل المبلغ" required>
                        </div>
                        <div class="form-group">
                            <label>العملة</label>
                            <select>
                                <option value="IQD">🇮🇶 IQD - الدينار العراقي</option>
                                <option value="USD">🇺🇸 USD - الدولار</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>ملاحظة (اختياري)</label>
                            <textarea placeholder="أضف ملاحظة..."></textarea>
                        </div>
                        <button type="submit" class="submit-btn gold-btn">💸 إرسال التحويل</button>
                    </form>
                </div>
            </div>
        </section>
    `;
}

function handleTransfer(e) {
    e.preventDefault();
    showToast('تم إرسال التحويل بنجاح!', 'success');
}

// ==================== SUPPORT ====================
function loadSupport() {
    const mainContent = document.getElementById('pageContent');
    mainContent.innerHTML = `
        <section class="page active">
            <div class="support-container">
                <div class="ticket-form glass-panel">
                    <h2 class="gold-text" style="font-family: 'Amiri'; font-size: 1.8rem;">🎫 فتح تذكرة دعم</h2>
                    
                    <form onsubmit="createTicket(event)">
                        <div class="form-group">
                            <label>نوع المشكلة</label>
                            <select required>
                                <option value="support">استفسار عام</option>
                                <option value="receipt">مشكلة في إيصال</option>
                                <option value="delivery">مشكلة في التوصيل</option>
                                <option value="custom">طلب تصميم مخصص</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>الموضوع</label>
                            <input type="text" placeholder="موضوع التذكرة" required>
                        </div>
                        <div class="form-group">
                            <label>الوصف</label>
                            <textarea placeholder="وصف المشكلة..." rows="4" required></textarea>
                        </div>
                        <button type="submit" class="submit-btn gold-btn">📤 إرسال التذكرة</button>
                    </form>
                </div>
                
                <div class="my-tickets glass-panel">
                    <h3 class="gold-text">📋 تذاكري</h3>
                    
                    <div class="ticket-item" style="padding: 16px; background: rgba(255,255,255,0.03); border-radius: 12px; margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600;">استفسار عن طلب</span>
                            <span class="order-status processing">قيد المراجعة</span>
                        </div>
                        <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 8px;">22 أبريل 2026</p>
                    </div>
                    
                    <div class="ticket-item" style="padding: 16px; background: rgba(255,255,255,0.03); border-radius: 12px; margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600;">مشكلة في التوصيل</span>
                            <span class="order-status delivered">تم الحل</span>
                        </div>
                        <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 8px;">20 أبريل 2026</p>
                    </div>
                </div>
            </div>
        </section>
    `;
}

function createTicket(e) {
    e.preventDefault();
    showToast('تم إرسال التذكرة بنجاح!', 'success');
}

// ==================== DESIGNER ====================
function loadDesigner() {
    const mainContent = document.getElementById('pageContent');
    mainContent.innerHTML = `
        <section class="page active">
            <h2 class="gold-text" style="margin-bottom: 24px; font-family: 'Amiri'; font-size: 2rem;">🎨 المصممون والمؤلفون</h2>
            
            <div class="designer-grid">
                <div class="designer-card glass-panel">
                    <div class="designer-avatar">👨‍🎨</div>
                    <h3 class="designer-name">أحمد الكعبي</h3>
                    <p class="designer-role">مصمم كتب تعليمية</p>
                    <p class="designer-portfolio">12 كتاب • 48 محاضرة</p>
                </div>
                <div class="designer-card glass-panel">
                    <div class="designer-avatar">👩‍🏫</div>
                    <h3 class="designer-name">سارة الجبوري</h3>
                    <p class="designer-role">مؤلفة ومنسقة</p>
                    <p class="designer-portfolio">8 كتب • 32 محاضرة</p>
                </div>
                <div class="designer-card glass-panel">
                    <div class="designer-avatar">👨‍💻</div>
                    <h3 class="designer-name">محمد الراوي</h3>
                    <p class="designer-role">مصمم أغلفة</p>
                    <p class="designer-portfolio">24 كتاب</p>
                </div>
            </div>
        </section>
    `;
}

// ==================== ADMIN PORTAL ====================
const AdminPortal = {
    renderDashboard() {
        const mainContent = document.getElementById('pageContent');
        mainContent.innerHTML = `
            <section class="page active">
                <div class="admin-container">
                    <h2 class="gold-text" style="font-family: 'Amiri'; font-size: 2rem;">👑 لوحة الرقابة المالية</h2>
                    
                    <div class="financial-radar glass-panel">
                        <h3>📊 الرادار المالي</h3>
                        <div class="radar-stats">
                            <div class="radar-item">
                                <span class="radar-label">إجمالي المعاملات</span>
                                <span class="radar-value">1,247</span>
                            </div>
                            <div class="radar-item">
                                <span class="radar-label">المعاملات المعلقة</span>
                                <span class="radar-value pending">23</span>
                            </div>
                            <div class="radar-item">
                                <span class="radar-label">إجمالي الإيرادات</span>
                                <span class="radar-value gold">125,450,000 IQD</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="pending-section glass-panel">
                        <h3>💎 الإيداعات المعلقة للمراجعة</h3>
                        <div class="pending-deposit-item" style="padding: 16px; background: rgba(255,71,87,0.1); border-radius: 12px; margin-bottom: 12px;">
                            <div style="display: flex; justify-content: space-between;">
                                <div>
                                    <strong>50,000 IQD</strong>
                                    <p style="color: var(--text-muted); font-size: 0.85rem;">من المستخدم: user_123</p>
                                </div>
                                <div>
                                    <button class="pillar-btn" style="margin-right: 8px;" onclick="showToast('تم الموافقة!', 'success')">✅ قبول</button>
                                    <button class="pillar-btn gold" onclick="showToast('تم الرفض', 'error')">❌ رفض</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="server-health glass-panel">
                        <h3>🖥️ حالة الخادم</h3>
                        <div class="health-info">
                            <span>Uptime: <strong style="color: var(--success);">99.9%</strong></span>
                            <span>Memory: <strong>45%</strong></span>
                            <span>Requests: <strong>1,247/hr</strong></span>
                        </div>
                    </div>
                </div>
            </section>
        `;
    },
    
    renderUsers() {
        const mainContent = document.getElementById('pageContent');
        mainContent.innerHTML = `
            <section class="page active">
                <div class="admin-container">
                    <h2 class="gold-text" style="font-family: 'Amiri'; font-size: 2rem;">👥 إدارة المستخدمين</h2>
                    
                    <div class="user-management glass-panel">
                        <table class="users-table">
                            <thead>
                                <tr>
                                    <th>المستخدم</th>
                                    <th>البريد</th>
                                    <th>الدور</th>
                                    <th>الحالة</th>
                                    <th>إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>أحمد محمد</td>
                                    <td>ahmed@example.com</td>
                                    <td><span class="order-status processing">طالب</span></td>
                                    <td><span style="color: var(--success);">● نشط</span></td>
                                    <td>
                                        <button class="pillar-btn" style="padding: 6px 12px;" onclick="showToast('عرض الملف', 'info')">👁️</button>
                                        <button class="pillar-btn gold" style="padding: 6px 12px;" onclick="showToast('تعديل', 'info')">✏️</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>سارة علي</td>
                                    <td>sara@example.com</td>
                                    <td><span class="order-status delivered">مصمم</span></td>
                                    <td><span style="color: var(--success);">● نشط</span></td>
                                    <td>
                                        <button class="pillar-btn" style="padding: 6px 12px;" onclick="showToast('عرض الملف', 'info')">👁️</button>
                                        <button class="pillar-btn gold" style="padding: 6px 12px;" onclick="showToast('تعديل', 'info')">✏️</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        `;
    },
    
    renderDelivery() {
        const mainContent = document.getElementById('pageContent');
        mainContent.innerHTML = `
            <section class="page active">
                <div class="admin-container">
                    <h2 class="gold-text" style="font-family: 'Amiri'; font-size: 2rem;">🚚 إدارة التوصيل</h2>
                    
                    <div class="delivery-map glass-panel" style="height: 400px; margin-bottom: 24px;">
                        <div style="height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(212,175,55,0.1); border-radius: 12px;">
                            <span style="font-size: 5rem;">🗺️</span>
                        </div>
                    </div>
                    
                    <div class="active-deliveries glass-panel">
                        <h3>🚚 التوصيلات النشطة</h3>
                        <div class="delivery-item" style="padding: 16px; background: rgba(255,255,255,0.03); border-radius: 12px; margin-bottom: 12px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong>#TP-2026-001</strong>
                                    <p style="color: var(--text-muted); font-size: 0.85rem;">بغداد - المنصور</p>
                                </div>
                                <span class="order-status out_for_delivery">🚚 قيد التوصيل</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }
};

// ==================== MODALS ====================
function showDepositModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content modal-large glass-panel">
            <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2 class="gold-text">💎 إيداع رصيد</h2>
            
            <form onsubmit="handleDeposit(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>المبلغ (IQD)</label>
                        <input type="number" placeholder="مثال: 50000" required>
                    </div>
                    <div class="form-group">
                        <label>العملة</label>
                        <select>
                            <option value="IQD">🇮🇶 الدينار العراقي</option>
                            <option value="USD">🇺🇸 الدولار</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>رقم Zain Cash</label>
                        <input type="text" placeholder="07XX XXX XXXX">
                    </div>
                    <div class="form-group">
                        <label>رقم الحوالة</label>
                        <input type="text" placeholder="رقم المرجع">
                    </div>
                </div>
                <div class="form-group">
                    <label>صورة الإيصال</label>
                    <input type="file" accept="image/*,.pdf">
                </div>
                <button type="submit" class="submit-btn gold-btn">📤 إرسال للإدارة</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

function showWithdrawModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content modal-large glass-panel">
            <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2 class="gold-text">💸 سحب رصيد</h2>
            
            <form onsubmit="handleWithdraw(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>المبلغ (IQD)</label>
                        <input type="number" placeholder="مثال: 50000" required>
                    </div>
                    <div class="form-group">
                        <label>طريقة الاستلام</label>
                        <select required>
                            <option value="zain">📱 Zain Cash</option>
                            <option value="asiago">📱 Asia SDF</option>
                            <option value="iraqino">📱 Iraqino</option>
                            <option value="bank">🏦 تحويل بنكي</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>رقم الهاتف/الحساب</label>
                    <input type="text" placeholder="07XX XXX XXXX" required>
                </div>
                <button type="submit" class="submit-btn gold-btn">💸 طلب السحب</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

function handleDeposit(e) {
    e.preventDefault();
    showToast('تم إرسال طلب الإيداع!', 'success');
    document.querySelector('.modal.active')?.remove();
}

function handleWithdraw(e) {
    e.preventDefault();
    showToast('تم إرسال طلب السحب!', 'success');
    document.querySelector('.modal.active')?.remove();
}

// ==================== TOAST ====================
window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => toast.remove(), 5000);
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Hide preloader
    const loader = document.getElementById('preloader');
    if (loader) {
        loader.style.display = 'none';
    }
    
    // Show master portal
    const portal = document.getElementById('masterPortal');
    const app = document.getElementById('app');
    if (portal) portal.style.display = 'flex';
    if (app) app.style.display = 'none';
    
    // Setup nav click handlers
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            if (page) Router.navigate(page);
        });
    });
    
    console.log('🚀 TECHOPRINT 2026 - FULLY LOADED!');
});
