/**
 * TECHOPRINT 2026 - Services Engine Module
 * Cards, Projects, and Orders internal portal logic
 */

(function() {
    'use strict';
    
    // ===== DYNAMIC DATA (From server or fallback defaults) =====
    let cardsData = [];
    let projectsData = [];
    
    // Fallback default data
    const DEFAULT_CARDS = [
        { id: 1, name: 'بطاقة طالب', price: 5000, desc: 'بطاقة طالب رسمية مع صورة وملومات كاملة', icon: '🎓', color: '#F39C12', delivery: '24 ساعة', type: 'card' },
        { id: 2, name: 'بطاقة مكتب', price: 15000, desc: 'بطاقة تعريف احترافية للمكاتب والشركات', icon: '🏢', color: '#3498DB', delivery: '48 ساعة', type: 'card' },
        { id: 3, name: 'بطاقة مختبر', price: 12000, desc: 'بطاقة مختبر طبي مع شهادات معتمدة', icon: '🔬', color: '#9B59B6', delivery: '48 ساعة', type: 'card' },
        { id: 4, name: 'بطاقة مدرسة', price: 8000, desc: 'بطاقة موظف مدرسة رسمية ومعمدة', icon: '🏫', color: '#E74C3C', delivery: '24 ساعة', type: 'card' },
        { id: 5, name: 'بطاقة جامعة', price: 10000, desc: 'بطاقة طالب جامعي مع barcode', icon: '🎓', color: '#2ECC71', delivery: '24 ساعة', type: 'card' },
        { id: 6, name: 'بطاقة خاصة', price: 20000, desc: 'تصميم مخصص حسب رغبة العميل', icon: '✨', color: '#E91E63', delivery: '72 ساعة', type: 'card' }
    ];
    
    const DEFAULT_PROJECTS = [
        { id: 101, name: 'تصميم شعار', price: 25000, desc: 'تصميم شعار احترافي مع تعديلات', icon: '🎨', color: '#E91E63', delivery: '3 أيام', type: 'project' },
        { id: 102, name: 'تصميم كارت أعمال', price: 15000, desc: 'تصميم كارت أعمال احترافي', icon: '💼', color: '#2196F3', delivery: '2 أيام', type: 'project' },
        { id: 103, name: 'تصميم بروشور', price: 20000, desc: 'تصميم بروشور احترافي', icon: '📄', color: '#FF9800', delivery: '2 أيام', type: 'project' },
        { id: 104, name: 'تصميم منشور', price: 10000, desc: 'تصميم منشور سوشال ميديا', icon: '📱', color: '#4CAF50', delivery: '1 يوم', type: 'project' }
    ];
    
    // Load services from server
    async function loadServicesData() {
        try {
            const res = await fetch(CONFIG.API_BASE + '/services');
            const services = await res.json();
            
            if (services && services.length > 0) {
                cardsData = services.filter(s => s.type === 'card' && s.is_active !== false);
                projectsData = services.filter(s => s.type === 'project' && s.is_active !== false);
            } else {
                // Use defaults if no services in DB
                cardsData = DEFAULT_CARDS;
                projectsData = DEFAULT_PROJECTS;
            }
        } catch (e) {
            console.error('Failed to load services:', e);
            cardsData = DEFAULT_CARDS;
            projectsData = DEFAULT_PROJECTS;
        }
    }
    
    // ===== STATE MACHINE (PEAK ARCHITECTURE) =====
    // State: 'home' | 'cards' | 'projects' | etc.
    let currentState = 'home';
    
    // ===== DYNAMIC OVERLAY CONTAINER =====
    function getServiceContainer() {
        let container = document.getElementById('serviceOverlay');
        if (!container) {
            container = document.createElement('div');
            container.id = 'serviceOverlay';
            container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 999;
                background: rgba(10, 10, 11, 0.95);
                display: none;
                overflow-y: auto;
                backdrop-filter: blur(10px);
            `;
            document.body.appendChild(container);
        }
        return container;
    }
    
    // ===== STATE MACHINE TRANSITIONS =====
    function setState(newState) {
        const previousState = currentState;
        currentState = newState;
        
        const overlay = getServiceContainer();
        
        if (newState === 'home') {
            // HOME LAYER: Always visible as base
            overlay.style.display = 'none';
            // Show home content
            document.getElementById('appContainer')?.style.setProperty('display', 'grid', 'important');
            document.getElementById('homePage')?.classList.add('active');
        } else {
            // SERVICE OVERLAY: Transparent on top of home
            overlay.style.display = 'block';
            // Home stays visible underneath
            renderServiceContent(overlay, newState);
        }
        
        console.log(`[State Machine] ${previousState} → ${newState}`);
    }
    
    // ===== RENDER SERVICE CONTENT =====
    function renderServiceContent(container, state) {
        switch(state) {
            case 'cards':
                renderCardsPage(container);
                break;
            case 'projects':
                renderProjectsPage(container);
                break;
            default:
                container.innerHTML = '<p style="color:#D4AF37;text-align:center;padding-top:100px;font-size:24px;">قريباً...</p>';
        }
    }
    
    // ===== OPEN SERVICE PAGE =====
    function openServicePage(serviceName) {
        setState(serviceName);
    }
    
    // ===== CLOSE SERVICE PAGE =====
    function closeServicePage() {
        setState('home');
    }
    
    // ===== RENDER CARDS PAGE =====
    function renderCardsPage(container) {
        container.innerHTML = `
            <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <h2 style="color: #D4AF37; font-size: 28px;">
                        <i class="fas fa-id-card"></i> بطاقات TECHOPRINT
                    </h2>
                    <button onclick="closeServicePage()" style="background: #D4AF37; color: #000; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 700;">
                        <i class="fas fa-times"></i> إغلاق
                    </button>
                </div>
                
                <!-- Cards Grid -->
                <div id="cardsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;">
                    ${cardsData.map(card => `
                        <div class="card-item" style="background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border: 2px solid ${card.color}40; border-radius: 16px; padding: 25px; text-align: center; transition: all 0.3s;">
                            <div style="font-size: 60px; margin-bottom: 15px;">${card.icon}</div>
                            <h3 style="color: #D4AF37; margin-bottom: 10px; font-size: 20px;">${card.name}</h3>
                            <p style="color: #888; font-size: 14px; margin-bottom: 15px;">${card.desc}</p>
                            <div style="background: ${card.color}20; padding: 10px; border-radius: 10px; margin-bottom: 15px;">
                                <span style="color: ${card.color}; font-size: 24px; font-weight: 700;">${card.price.toLocaleString()} IQD</span>
                            </div>
                            <div style="color: #2ECC71; font-size: 12px; margin-bottom: 15px;">
                                <i class="fas fa-clock"></i> التسليم: ${card.delivery}
                            </div>
                            <button onclick="Services.orderCard('${card.name}', ${card.id})" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #D4AF37, #B8860B); color: #000; border: none; border-radius: 10px; font-weight: 700; font-size: 16px; cursor: pointer;">
                                <i class="fas fa-shopping-cart"></i> اطلب الآن
                            </button>
                        </div>
                    `).join('')}
                </div>
                
                <!-- User Wallet Info -->
                <div style="margin-top: 40px; padding: 20px; background: #1a1a2e; border-radius: 16px; border: 1px solid #D4AF3740;">
                    <h3 style="color: #D4AF37; margin-bottom: 15px;"><i class="fas fa-wallet"></i> محفظتك</h3>
                    <div style="display: flex; gap: 30px;">
                        <div>
                            <span style="color: #888;">الرصيد:</span>
                            <span id="serviceBalance" style="color: #2ECC71; font-size: 24px; font-weight: 700;">0 IQD</span>
                        </div>
                        <div>
                            <span style="color: #888;">الصفحات:</span>
                            <span id="servicePages" style="color: #3498DB; font-size: 24px; font-weight: 700;">0</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Update wallet display
        updateServiceWallet();
    }
    
    // ===== RENDER PROJECTS PAGE =====
    function renderProjectsPage(container) {
        container.innerHTML = `
            <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <h2 style="color: #D4AF37; font-size: 28px;">
                        <i class="fas fa-palette"></i> مشاريع التصميم
                    </h2>
                    <button onclick="closeServicePage()" style="background: #D4AF37; color: #000; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 700;">
                        <i class="fas fa-times"></i> إغلاق
                    </button>
                </div>
                
                <!-- Projects Grid -->
                <div id="projectsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;">
                    ${projectsData.map(project => `
                        <div class="card-item" style="background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border: 2px solid ${project.color}40; border-radius: 16px; padding: 25px; text-align: center; transition: all 0.3s;">
                            <div style="font-size: 60px; margin-bottom: 15px;">${project.icon}</div>
                            <h3 style="color: #D4AF37; margin-bottom: 10px; font-size: 20px;">${project.name}</h3>
                            <p style="color: #888; font-size: 14px; margin-bottom: 15px;">${project.desc}</p>
                            <div style="background: ${project.color}20; padding: 10px; border-radius: 10px; margin-bottom: 15px;">
                                <span style="color: ${project.color}; font-size: 24px; font-weight: 700;">${project.price.toLocaleString()} IQD</span>
                            </div>
                            <div style="color: #2ECC71; font-size: 12px; margin-bottom: 15px;">
                                <i class="fas fa-clock"></i> التسليم: ${project.delivery}
                            </div>
                            <button onclick="Services.orderProject('${project.name}', ${project.id})" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #D4AF37, #B8860B); color: #000; border: none; border-radius: 10px; font-weight: 700; font-size: 16px; cursor: pointer;">
                                <i class="fas fa-paper-plane"></i> اطلب الآن
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // ===== UPDATE SERVICE WALLET =====
    function updateServiceWallet() {
        const session = getSession();
        if (!session) return;
        
        const balanceEl = document.getElementById('serviceBalance');
        const pagesEl = document.getElementById('servicePages');
        
        if (balanceEl) balanceEl.textContent = (session.balance || 0).toLocaleString() + ' IQD';
        if (pagesEl) pagesEl.textContent = (session.pages || 0).toLocaleString();
    }
    
    // ===== HELPERS =====
    const getSession = () => {
        const data = localStorage.getItem(TECHNO_CONFIG.SESSION_KEY);
        return data ? JSON.parse(data) : null;
    };
    
    const setSession = (user) => {
        localStorage.setItem(TECHNO_CONFIG.SESSION_KEY, JSON.stringify(user));
    };
    
    const showToast = (msg) => {
        const t = document.getElementById('toast');
        if (!t) return;
        t.textContent = msg;
        t.style.display = 'block';
        setTimeout(() => t.style.display = 'none', 3000);
    };
    
    // ===== RENDER CARDS =====
    function renderCards(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = cardsData.map(card => `
            <div class="card-item glass-panel" style="padding: 25px; text-align: center; border: 1px solid var(--glass-border); border-radius: 16px; transition: all 0.3s; cursor: pointer;">
                <div style="font-size: 50px; margin-bottom: 15px;">${card.icon}</div>
                <h3 style="color: var(--gold-royal); margin-bottom: 10px;">${card.name}</h3>
                <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 15px;">${card.desc}</p>
                <div style="color: var(--success); font-size: 20px; font-weight: 700;">${card.price.toLocaleString()} IQD</div>
                <button onclick="Services.orderCard('${card.name}', ${card.id})" style="margin-top: 15px; padding: 10px 25px; background: var(--gold-royal); color: #000; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; width: 100%;">طلب</button>
            </div>
        `).join('');
    }
    
    // ===== RENDER PROJECTS =====
    function renderProjects(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = projectsData.map(project => `
            <div class="card-item glass-panel" style="padding: 25px; text-align: center; border: 1px solid var(--glass-border); border-radius: 16px; transition: all 0.3s; cursor: pointer;">
                <div style="font-size: 50px; margin-bottom: 15px;">${project.icon}</div>
                <h3 style="color: var(--gold-royal); margin-bottom: 10px;">${project.name}</h3>
                <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 15px;">${project.desc}</p>
                <div style="color: var(--success); font-size: 20px; font-weight: 700;">${project.price.toLocaleString()} IQD</div>
                <button onclick="Services.orderProject('${project.name}', ${project.id})" style="margin-top: 15px; padding: 10px 25px; background: var(--gold-royal); color: #000; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; width: 100%;">طلب</button>
            </div>
        `).join('');
    }
    
    // ===== ORDER CARD =====
    async function orderCard(cardName, cardId) {
        const session = getSession();
        if (!session) { 
            showToast('الرجاء تسجيل الدخول أولاً');
            document.getElementById('loginModal')?.classList.add('active');
            return; 
        }
        
        const card = cardsData.find(c => c.name === cardName);
        if (!card) return;
        
        try {
            const res = await fetch(TECHNO_CONFIG.API_BASE + '/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session.id,
                    cardType: cardId,
                    cardName: card.name,
                    price: card.price
                })
            });
            
            const data = await res.json();
            
            if (data.success) {
                showToast('✅ ' + data.message);
                session.balance = Math.max(0, (session.balance || 0) - card.price);
                setSession(session);
                
                // Update UI
                document.getElementById('headerBalance').textContent = (session.balance || 0).toLocaleString();
                document.getElementById('walletBalanceMain').textContent = (session.balance || 0).toLocaleString() + ' IQD';
            } else {
                showToast(data.error || 'فشل الطلب');
            }
        } catch (e) {
            showToast('حدث خطأ - حاول لاحقاً');
        }
    }
    
    // ===== ORDER PROJECT =====
    async function orderProject(projectName, projectId) {
        const session = getSession();
        if (!session) { 
            showToast('الرجاء تسجيل الدخول أولاً');
            document.getElementById('loginModal')?.classList.add('active');
            return; 
        }
        
        const project = projectsData.find(p => p.name === projectName);
        if (!project) return;
        
        try {
            const res = await fetch(TECHNO_CONFIG.API_BASE + '/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session.id,
                    cardType: projectId,
                    cardName: project.name,
                    price: project.price
                })
            });
            
            const data = await res.json();
            
            if (data.success) {
                showToast('✅ ' + data.message);
                session.balance = Math.max(0, (session.balance || 0) - project.price);
                setSession(session);
                
                document.getElementById('headerBalance').textContent = (session.balance || 0).toLocaleString();
                document.getElementById('walletBalanceMain').textContent = (session.balance || 0).toLocaleString() + ' IQD';
            } else {
                showToast(data.error || 'فشل الطلب');
            }
        } catch (e) {
            showToast('حدث خطأ - حاول لاحقاً');
        }
    }
    
    // ===== LOAD USER ORDERS =====
    async function loadUserOrders(containerId) {
        const session = getSession();
        if (!session) return;
        
        const container = document.getElementById(containerId);
        if (!container) return;
        
        try {
            const res = await fetch(TECHNO_CONFIG.API_BASE + '/orders/' + session.id);
            const orders = await res.json();
            
            if (orders.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 60px;">لا توجد طلبات حالياً</p>';
                return;
            }
            
            const statusColors = { pending: '#F39C12', approved: '#2ECC71', rejected: '#E74C3C' };
            
            container.innerHTML = orders.map(order => `
                <div class="card-item glass-panel" style="padding: 20px; margin-bottom: 15px; border-radius: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="color: var(--gold-royal); margin-bottom: 5px;">${order.card_name}</h4>
                            <p style="color: var(--text-secondary); font-size: 12px;">${new Date(order.created_at).toLocaleDateString('ar-IQ')}</p>
                        </div>
                        <div style="text-align: left;">
                            <div style="color: var(--success); font-weight: 700;">${order.price?.toLocaleString() || 0} IQD</div>
                            <span style="padding: 5px 15px; border-radius: 20px; font-size: 12px; background: ${statusColors[order.status]}20; color: ${statusColors[order.status]};">
                                ${order.status === 'pending' ? '⏳ بانتظار' : order.status === 'approved' ? '✅ مقبول' : '❌ مرفوض'}
                            </span>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (e) {
            console.error('Failed to load orders:', e);
        }
    }
    
    // ===== INIT =====
    function init() {
        // Render cards in cards page
        renderCards('cardsGrid');
        
        // Setup projects page if exists
        if (document.getElementById('projectsGrid')) {
            renderProjects('projectsGrid');
        }
        
        // Load user orders
        if (document.getElementById('ordersList')) {
            loadUserOrders('ordersList');
        }
    }
    
    // Export to window
    window.Services = {
        cardsData,
        projectsData,
        renderCards,
        renderProjects,
        orderCard,
        orderProject,
        loadUserOrders,
        openServicePage,
        closeServicePage,
        setState,
        getCurrentState: () => currentState,
        updateServiceWallet,
        init
    };
    
    // Auto-init
    document.addEventListener('DOMContentLoaded', init);
    
})();