/* TECHOPRINT 2026 - NAVIGATION */
/* NO ALERTS - Use display flex */

const Nav = {
    sections: ['dashboard', 'wallet', 'library', 'orders', 'tracking', 'printing', 'support', 'teacher', 'inks'],
    
    go(page) {
        this.sections.forEach(function(s) {
            var el = document.getElementById(s + 'Section');
            if (el) el.style.display = 'none';
        });
        var target = document.getElementById(page + 'Section');
        if (target) target.style.display = 'block';
        
        document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });
        var btn = document.getElementById('nav-' + page);
        if (btn) btn.classList.add('active');
    }
};

window.Nav = Nav;

// Modal functions - USE DISPLAY FLEX
window.openModal = function(id) { var m = document.getElementById(id); if (m) m.style.display = 'flex'; };
window.closeModal = function(id) { var m = document.getElementById(id); if (m) m.style.display = 'none'; };

window.toggleRegister = function() {
    var login = document.getElementById('loginModal');
    var reg = document.getElementById('registerModal');
    if (login) login.style.display = login.style.display === 'flex' ? 'none' : 'flex';
    if (reg) reg.style.display = reg.style.display === 'flex' ? 'none' : 'flex';
};

window.showNotification = function() {
    var m = document.createElement('div');
    m.className = 'modal';
    m.innerHTML = '<div class="modal-box"><h2>🔔</h2><p>📦 New order</p><p>💰 Payment</p></div>';
    m.style.display = 'flex';
    m.onclick = function(e) { if (e.target === m) m.remove(); };
    document.body.appendChild(m);
};

window.handleRegister = function(form) {
    if (window.Auth && Auth.register) Auth.register({
        fullName: form.fullName.value,
        username: form.username.value,
        email: form.email.value,
        phone: form.phone.value,
        password: form.password.value
    });
    return false;
};
