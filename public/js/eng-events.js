/* TECHOPRINT 2026 - ENG EVENTS */
/* All Event Listeners - Separated from Main Logic */

const Events = {
    init() {
        this.bindLangButtons();
        this.bindNavButtons();
        this.bindPortalCards();
        this.bindModalForms();
        this.bindSliderDots();
    },
    
    bindLangButtons() {
        document.querySelectorAll('.lang-btn[data-lang], .vert-lang-btn[data-lang]').forEach(btn => {
            btn.style.cursor = 'pointer';
            btn.onclick = () => {
                const lang = btn.dataset.lang;
                if (window.I18n) I18n.set(lang);
            };
        });
    },
    
    bindNavButtons() {
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.style.cursor = 'pointer';
            item.onclick = () => {
                const page = item.dataset.page;
                if (window.Nav) Nav.go(page);
            };
        });
        
        document.querySelectorAll('.bottom-nav-item').forEach(btn => {
            btn.style.cursor = 'pointer';
            const fn = btn.getAttribute('onclick') || '';
            const m = fn.match(/navigateTo\('(\w+)'\)/);
            if (m) {
                btn.onclick = () => { if (window.Nav) Nav.go(m[1]); };
            }
        });
    },
    
    bindPortalCards() {
        document.querySelectorAll('.portal-card').forEach(card => {
            card.style.cursor = 'pointer';
            card.onclick = () => {
                const fn = card.getAttribute('onclick');
                if (fn) eval(fn);
            };
        });
    },
    
    bindModalForms() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.onsubmit = (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail')?.value;
                const password = document.getElementById('loginPassword')?.value;
                if (window.Auth) {
                    Auth.login(email, password);
                    closeModal('loginModal');
                    showMainDashboard();
                }
            };
        }
        
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.onsubmit = (e) => {
                e.preventDefault();
                if (window.Auth) {
                    Auth.register({});
                    closeRegisterPage();
                    showMainDashboard();
                }
            };
        }
    },
    
    bindSliderDots() {
        document.querySelectorAll('.ads-dot').forEach((dot, i) => {
            dot.style.cursor = 'pointer';
            dot.onclick = () => {
                if (window.Slider) Slider.go(i);
            };
        });
    }
};

window.Events = Events;
