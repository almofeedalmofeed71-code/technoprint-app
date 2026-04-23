/* TECHOPRINT 2026 - ENG MAIN */
/* MASTER LOADER - Calls All Engines */

const Main = {
    version: '2026.1.0',
    
    init() {
        console.log(`[MAIN] TECHOPRINT ${this.version} Loading...`);
        
        // Phase 1: Core Engines
        I18n.init();
        console.log('[MAIN] ✓ I18n Engine');
        
        // Phase 2: Auth
        Auth.init();
        console.log('[MAIN] ✓ Auth Engine');
        
        // Phase 3: Navigation
        Nav.init();
        console.log('[MAIN] ✓ Nav Engine');
        
        // Phase 4: Slider
        Slider.init();
        console.log('[MAIN] ✓ Slider Engine');
        
        // Phase 5: Splash Flow
        this.initSplash();
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
        if (mp) mp.style.display = 'block';
        if (app) app.style.display = 'none';
    },
    
    showDashboard() {
        const mp = document.getElementById('masterPortal');
        const app = document.getElementById('app');
        if (mp) mp.style.display = 'none';
        if (app) app.style.display = 'flex';
        Nav.go('dashboard');
    }
};

// Global exports
window.Main = Main;
window.showPortal = () => Main.showPortal();
window.showMainDashboard = () => Main.showDashboard();
window.closeModal = (id) => { const m = document.getElementById(id); if (m) m.style.display = 'none'; };
window.openModal = (id) => { const m = document.getElementById(id); if (m) m.style.display = 'flex'; };

// Start
document.addEventListener('DOMContentLoaded', () => Main.init());
if (document.readyState !== 'loading') setTimeout(() => Main.init(), 10);
