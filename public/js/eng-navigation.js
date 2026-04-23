/* TECHOPRINT 2026 - NAVIGATION */
const Nav = {
    sections: ['dashboard', 'student', 'teacher', 'design', 'library', 'ai', 'academy', 'wallet', 'orders', 'tracking', 'settings', 'support', 'about'],
    
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
    m.style.display = 'flex';
    m.innerHTML = '<div class="modal-box"><h2>🔔 الإشعارات</h2><p>📦 طلب جديد</p></div>';
    m.onclick = function(e) { if (e.target === m) m.remove(); };
    document.body.appendChild(m);
};
window.handleRegister = function(form) {
    if (window.Auth && Auth.register) Auth.register({ fullName: form.fullName.value, username: form.username.value, email: form.email.value, phone: form.phone.value, password: form.password.value });
    return false;
};
