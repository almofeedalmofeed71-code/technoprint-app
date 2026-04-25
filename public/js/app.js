// TECHOPRINT 2026 - UNIFIED APP v2.0
// All modules linked to Supabase database

// ===== CONFIG =====
const API_BASE = '/api';
const SESSION_KEY = 'technoprintSession';

// ===== SESSION MANAGEMENT =====
function getSession() {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
}

function setSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// ===== MODAL HELPERS =====
window.openModal = function(id) { document.getElementById(id).style.display = 'flex'; };
window.closeModal = function(id) { document.getElementById(id).style.display = 'none'; };

// ===== TOAST =====
window.showToast = function(msg, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
};

// ===== NAVIGATION =====
window.Nav = {
    go: function(section) {
        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(s => s.style.display = 'none');
        // Show target section
        const target = document.getElementById(section + 'Section');
        if (target) target.style.display = 'block';
        // Update nav
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`.nav-btn[onclick*="${section}"]`);
        if (btn) btn.classList.add('active');
    }
};

// ===== AUTH (Registration + Login) =====
async function handleRegister(formData) {
    const { username, password, phone, governorate, address, category } = formData;
    
    // Validation
    if (!username || !password || !phone || !governorate || !address || !category) {
        showToast('الرجاء ملء جميع الحقول المطلوبة');
        return;
    }
    
    try {
        const res = await fetch(API_BASE + '/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await res.json();
        
        if (data.success && data.user) {
            setSession(data.user);
            closeModal('registerModal');
            showToast('🎉 تم إنشاء الحساب بنجاح!');
            showWelcomeGift(data.user.username, data.user.pages || 1000);
            updateUI(data.user);
        } else {
            showToast(data.error || 'فشل التسجيل');
        }
    } catch (e) {
        showToast('حدث خطأ - حاول لاحقاً');
    }
}

async function handleLogin(username, password) {
    try {
        const res = await fetch(API_BASE + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await res.json();
        
        if (data.success && data.user) {
            setSession(data.user);
            closeModal('loginModal');
            showToast('مرحباً ' + data.user.username);
            updateUI(data.user);
        } else {
            showToast(data.error || 'فشل تسجيل الدخول');
        }
    } catch (e) {
        showToast('حدث خطأ - حاول لاحقاً');
    }
}

function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    location.reload();
}

// ===== UPDATE UI =====
function updateUI(user) {
    if (!user) return;
    
    // Hide register/login buttons
    const regBtn = document.querySelector('.register-btn');
    if (regBtn) regBtn.style.display = 'none';
}

// ===== CARDS MODULE (Active) =====
async function loadCards() {
    const container = document.getElementById('cardsGrid');
    if (!container) return;
    
    // Default cards (can be loaded from DB)
    const defaultCards = [
        { id: 1, name: 'بطاقة طالب', price: 5000, desc: 'بطاقة طالب رسمية', icon: '🎓' },
        { id: 2, name: 'بطاقة مكتب', price: 15000, desc: 'بطاقة تعريف مكتب', icon: '🏢' },
        { id: 3, name: 'بطاقة مختبر', price: 12000, desc: 'بطاقة مختبر طبي', icon: '🔬' },
        { id: 4, name: 'بطاقة مدرسة', price: 8000, desc: 'بطاقة موظف مدرسة', icon: '🏫' },
        { id: 5, name: 'بطاقة جامعة', price: 10000, desc: 'بطاقة طالب جامعي', icon: '🎓' },
        { id: 6, name: 'بطاقة خاصة', price: 20000, desc: 'تصميم مخصص', icon: '✨' }
    ];
    
    container.innerHTML = defaultCards.map(card => `
        <div class="card-item">
            <div style="font-size:50px;">${card.icon}</div>
            <h4>${card.name}</h4>
            <p class="card-desc">${card.desc}</p>
            <div class="card-price">${card.price.toLocaleString()} IQD</div>
            <button class="btn-gold" style="margin-top:10px;" onclick="orderCard(${card.id}, '${card.name}')">طلب</button>
        </div>
    `).join('');
}

async function orderCard(cardId, cardName) {
    const session = getSession();
    if (!session) {
        showToast('الرجاء تسجيل الدخول أولاً');
        openModal('loginModal');
        return;
    }
    showToast('تم إرسال طلب ' + cardName);
}

// ===== WALLET SYNC =====
async function syncWallet() {
    const session = getSession();
    if (!session) return;
    
    try {
        const res = await fetch(API_BASE + '/wallet/' + session.id);
        const data = await res.json();
        
        if (data.balance !== undefined) {
            session.balance = data.balance;
            session.pages = data.pages;
            setSession(session);
            updateWalletDisplay(data.balance, data.pages);
        }
    } catch (e) {
        console.log('Wallet sync error');
    }
}

function updateWalletDisplay(balance, pages) {
    const balEl = document.getElementById('walletBalance');
    const pagesEl = document.getElementById('walletPages');
    if (balEl) balEl.textContent = balance.toLocaleString() + ' IQD';
    if (pagesEl) pagesEl.textContent = pages.toLocaleString() + ' صفحة';
}

// ===== WELCOME GIFT =====
function showWelcomeGift(name, pages) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.95);z-index:99999;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
        <div style="text-align:center;animation:scaleIn 0.5s">
            <style>@keyframes scaleIn{from{transform:scale(0.5);opacity:0}to{transform:scale(1);opacity:1}}</style>
            <div style="font-size:80px;">🎉</div>
            <h2 style="color:#D4AF37;margin:20px 0;">أهلاً ${name}</h2>
            <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #D4AF37;border-radius:20px;padding:30px;max-width:350px;">
                <div style="font-size:40px;">🎁</div>
                <p style="color:#aaa;">لقد حصلت على</p>
                <div style="font-size:48px;color:#D4AF37;font-weight:bold;">${pages.toLocaleString()}</div>
                <p style="color:#888;">صفحة طباعة مجانية</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="btn-gold" style="margin-top:20px;">🚀 ابدأ الآن</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    // Check session
    const session = getSession();
    if (session) {
        updateUI(session);
        syncWallet();
    }
    
    // Load cards
    loadCards();
    
    // Auto-sync wallet
    setInterval(syncWallet, 30000);
    
    // Setup register form
    document.getElementById('registerForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegister({
            username: this.username.value.trim(),
            password: this.password.value,
            phone: this.phone.value.trim(),
            governorate: this.governorate.value,
            address: this.address.value.trim(),
            category: this.category.value
        });
    });
    
    // Setup login form
    document.getElementById('loginForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin(this.querySelector('#loginUsername')?.value, this.querySelector('#loginPassword')?.value);
    });
});

// ===== EXPORT =====
window.App = { handleRegister, handleLogin, handleLogout, loadCards, syncWallet };