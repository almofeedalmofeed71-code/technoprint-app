/* TECHOPRINT 2026 - ENG MAIN */
/* MASTER LOADER - Calls All Engines */

const Main = {
    version: '2026.1.0',
    
    init() {
        console.log(`[MAIN] TECHOPRINT ${this.version} Loading...`);
        
        // Phase 1: Core Engines
        if (window.I18n) { I18n.init(); console.log('[MAIN] ✓ I18n Engine'); }
        if (window.Auth) { Auth.init(); console.log('[MAIN] ✓ Auth Engine'); }
        if (window.Nav) { Nav.init(); console.log('[MAIN] ✓ Nav Engine'); }
        if (window.Slider) { Slider.init(); console.log('[MAIN] ✓ Slider Engine'); }
        if (window.Events) { Events.init(); console.log('[MAIN] ✓ Events Engine'); }
        
        // Phase 2: Vertical Languages
        this.initVerticalLanguages();
        
        // Phase 3: Gate Bindings
        this.initGates();
        
        // Phase 4: Splash Flow
        this.initSplash();
    },
    
    initVerticalLanguages() {
        document.querySelectorAll('.lang-btn[data-lang], .vert-lang-btn[data-lang]').forEach(btn => {
            btn.style.cursor = 'pointer';
            btn.onclick = () => {
                const lang = btn.dataset.lang;
                if (window.I18n) I18n.set(lang);
            };
        });
        console.log('[MAIN] ✓ Vertical Languages Initialized');
    },
    
    initGates() {
        const gate = document.getElementById('gate-student');
        if (gate) {
            gate.style.cursor = 'pointer';
            gate.onclick = function() { showStudentDashboard(); };
        }
        console.log('[MAIN] ✓ Gates Bound');
    },
    
    initSplash() {
        const splash = document.getElementById('splashScreen');
        const preloader = document.getElementById('preloader');
        
        if (splash) {
            setTimeout(() => {
                splash.classList.add('hidden');
                setTimeout(() => {
                    splash.style.display = 'none';
                    this.initPreloader();
                }, 500);
            }, 1500);
        } else {
            this.initPreloader();
        }
    },
    
    initPreloader() {
        const preloader = document.getElementById('preloader');
        const bar = preloader?.querySelector('.progress-fill');
        
        if (bar) {
            let w = 0;
            const iv = setInterval(() => {
                w += Math.random() * 20;
                if (w >= 100) {
                    w = 100;
                    clearInterval(iv);
                    setTimeout(() => {
                        preloader.classList.add('hidden');
                        setTimeout(() => {
                            preloader.style.display = 'none';
                            this.showPortal();
                        }, 300);
                    }, 200);
                }
                bar.style.width = w + '%';
            }, 150);
        } else {
            this.showPortal();
        }
    },
    
    showPortal() {
        const mp = document.getElementById('masterPortal');
        const app = document.getElementById('app');
        if (mp) { mp.style.display = 'flex'; mp.classList.add('entrance'); }
        if (app) app.style.display = 'none';
    },
    
    showDashboard() {
        const mp = document.getElementById('masterPortal');
        const app = document.getElementById('app');
        if (mp) mp.style.display = 'none';
        if (app) { app.style.display = 'flex'; app.classList.add('entrance'); }
        if (window.Nav) Nav.go('dashboard');
    }
};

// Global exports
window.Main = Main;
window.showPortal = () => Main.showPortal();
window.showMainDashboard = () => Main.showDashboard();
window.showStudentDashboard = () => Main.showDashboard();
window.closeModal = (id) => { const m = document.getElementById(id); if (m) m.style.display = 'none'; };
window.openModal = (id) => { const m = document.getElementById(id); if (m) m.style.display = 'flex'; };

// Start - Immediately after DOM ready
document.addEventListener('DOMContentLoaded', () => Main.init());
if (document.readyState !== 'loading') setTimeout(() => Main.init(), 10);
