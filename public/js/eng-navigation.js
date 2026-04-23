/* TECHOPRINT 2026 - ENG NAVIGATION */
/* REAL SCREEN NAVIGATION - GOLD/BLACK Empire */

const Nav = {
    current: 'dashboard',
    screens: ['dashboard', 'wallet', 'library', 'orders', 'tracking', 'printings', 'support', 'teacher', 'inks'],
    
    init() {
        console.log('[NAV] Navigation ready');
        this.show('dashboard');
    },
    
    go(page) {
        if (!this.screens.includes(page)) return;
        this.current = page;
        this.show(page);
    },
    
    show(page) {
        // Hide all sections
        const sections = ['dashboard', 'wallet', 'library', 'orders', 'tracking', 'printings', 'support', 'teacher', 'inks'];
        sections.forEach(s => {
            const el = document.getElementById(s + 'Section');
            if (el) el.style.display = 'none';
        });
        
        // Show requested section
        const target = document.getElementById(page + 'Section');
        if (target) target.style.display = 'block';
        
        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById('nav-' + page);
        if (activeBtn) activeBtn.classList.add('active');
    }
};

window.Nav = Nav;
window.navigateTo = function(p) { Nav.go(p); };

// Modal functions
window.openModal = function(id) {
    var modal = document.getElementById(id);
    if (modal) modal.style.display = 'flex';
};

window.closeModal = function(id) {
    var modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
};

window.toggleRegister = function() {
    var login = document.getElementById('loginModal');
    var reg = document.getElementById('registerModal');
    if (login) login.style.display = login.style.display === 'flex' ? 'none' : 'flex';
    if (reg) reg.style.display = reg.style.display === 'flex' ? 'none' : 'flex';
};

// Notification
window.showNotification = function() {
    var modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-box">
            <button class="modal-close" onclick="this.closest('.modal').remove()"><i class="fas fa-times"></i></button>
            <h2>🔔 Notifications</h2>
            <div style="text-align:right;margin-top:15px;">
                <p>📦 New order received</p>
                <p>💰 Payment confirmed</p>
                <p>🖨️ Print job completed</p>
            </div>
        </div>
    `;
    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
};

// Handle register
window.handleRegister = function(form) {
    var data = {
        fullName: form.fullName.value,
        username: form.username.value,
        email: form.email.value,
        phone: form.phone.value,
        governorate: form.governorate.value,
        address: form.address.value,
        password: form.password.value
    };
    Auth.register(data);
    return false;
};
