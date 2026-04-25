/**
 * TECHOPRINT 2026 - Services Engine Module
 * Cards, Projects, and Orders internal portal logic
 */

(function() {
    'use strict';
    
    // ===== CARDS DATA =====
    const cardsData = [
        { id: 1, name: 'بطاقة طالب', price: 5000, desc: 'بطاقة طالب رسمية', icon: '🎓' },
        { id: 2, name: 'بطاقة مكتب', price: 15000, desc: 'بطاقة تعريف مكتب', icon: '🏢' },
        { id: 3, name: 'بطاقة مختبر', price: 12000, desc: 'بطاقة مختبر طبي', icon: '🔬' },
        { id: 4, name: 'بطاقة مدرسة', price: 8000, desc: 'بطاقة موظف مدرسة', icon: '🏫' },
        { id: 5, name: 'بطاقة جامعة', price: 10000, desc: 'بطاقة طالب جامعي', icon: '🎓' },
        { id: 6, name: 'بطاقة خاصة', price: 20000, desc: 'تصميم مخصص', icon: '✨' }
    ];
    
    // ===== PROJECTS DATA =====
    const projectsData = [
        { id: 1, name: 'تصميم شعار', price: 25000, desc: 'تصميم شعار احترافي', icon: '🎨' },
        { id: 2, name: 'تصميم كارت أعمال', price: 15000, desc: 'تصميم كارت أعمال', icon: '💼' },
        { id: 3, name: 'تصميم بروشور', price: 20000, desc: 'تصميم بروشور احترافي', icon: '📄' },
        { id: 4, name: 'تصميم منشور', price: 10000, desc: 'تصميم منشور سوشال ميديا', icon: '📱' }
    ];
    
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
        init
    };
    
    // Auto-init
    document.addEventListener('DOMContentLoaded', init);
    
})();