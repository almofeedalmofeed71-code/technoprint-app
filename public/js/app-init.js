/* TECHOPRINT 2026 - MASTER INITIALIZATION */
/* Centralized Function Map - FIXED BINDING */

const MasterLoader = {
    version: '2026.1.0',
    
    init() {
        console.log(`[MASTER] TECHOPRINT ${this.version} Loading...`);
        
        // Phase 1: Core Systems
        this.phase1_Core();
        
        // Phase 2: UI Systems
        this.phase2_UI();
        
        // Phase 3: App Systems
        this.phase3_App();
        
        console.log('[MASTER] Initialization Complete');
    },
    
    phase1_Core() {
        // 1. Initialize Internationalization
        if (window.I18nEngine) {
            I18nEngine.init();
            console.log('[MASTER] ✓ Languages Initialized');
        }
        
        // 2. Initialize Authentication
        if (window.AuthLogic) {
            AuthLogic.init();
            console.log('[MASTER] ✓ Auth Initialized');
        }
        
        // 3. Initialize Navigation
        if (window.NavLogic) {
            NavLogic.init();
            console.log('[MASTER] ✓ Navigation Initialized');
        }
    },
    
    phase2_UI() {
        // 4. Initialize Splash Screen
        this.initSplash();
    },
    
    phase3_App() {
        // 5. Initialize Slider Logic
        if (window.initMegaSlider) {
            initMegaSlider();
            console.log('[MASTER] ✓ Slider Initialized');
        }
        
        // 6. Initialize Portal Functions
        this.initPortalFunctions();
    },
    
    initSplash() {
        const splash = document.getElementById('splashScreen');
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
        const progress = preloader?.querySelector('.progress-fill');
        if (progress) {
            let width = 0;
            const interval = setInterval(() => {
                width += Math.random() * 20;
                if (width >= 100) {
                    width = 100;
                    clearInterval(interval);
                    setTimeout(() => {
                        preloader.classList.add('hidden');
                        setTimeout(() => {
                            preloader.style.display = 'none';
                            this.showPortal();
                        }, 300);
                    }, 200);
                }
                progress.style.width = width + '%';
            }, 150);
        } else {
            this.showPortal();
        }
    },
    
    initPortalFunctions() {
        // Show Portal (Master Gateway)
        window.showPortal = () => {
            const mp = document.getElementById('masterPortal');
            const app = document.getElementById('app');
            const sp = document.getElementById('studentPortal');
            if (mp) mp.style.display = 'block';
            if (app) app.style.display = 'none';
            if (sp) sp.style.display = 'none';
        };
        
        // Open Portal (Specific Type)
        window.openPortal = (type) => {
            const mp = document.getElementById('masterPortal');
            const app = document.getElementById('app');
            const sp = document.getElementById('studentPortal');
            
            if (type === 'student') {
                if (mp) mp.style.display = 'none';
                if (app) app.style.display = 'none';
                if (sp) sp.style.display = 'block';
            } else {
                // For other portals, show main app
                if (mp) mp.style.display = 'none';
                if (sp) sp.style.display = 'none';
                if (app) app.style.display = 'flex';
            }
        };
        
        // Show Main Dashboard
        window.showMainDashboard = () => {
            const mp = document.getElementById('masterPortal');
            const sp = document.getElementById('studentPortal');
            const app = document.getElementById('app');
            if (mp) mp.style.display = 'none';
            if (sp) sp.style.display = 'none';
            if (app) app.style.display = 'flex';
            if (NavLogic) NavLogic.navigate('dashboard');
        };
        
        // Modal Controls
        window.closeModal = (id) => {
            const m = document.getElementById(id);
            if (m) m.style.display = 'none';
        };
        
        window.openModal = (id) => {
            const m = document.getElementById(id);
            if (m) m.style.display = 'flex';
        };
        
        window.showLoginModal = () => {
            const m = document.getElementById('loginModal');
            if (m) m.style.display = 'flex';
        };
        
        window.openRegisterPage = () => {
            const m = document.getElementById('registerPage');
            if (m) m.style.display = 'flex';
        };
        
        window.closeRegisterPage = () => {
            const m = document.getElementById('registerPage');
            if (m) m.style.display = 'none';
        };
    },
    
    showPortal() {
        const mp = document.getElementById('masterPortal');
        const app = document.getElementById('app');
        if (mp) mp.style.display = 'block';
        if (app) app.style.display = 'none';
    }
};

// Start on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    MasterLoader.init();
});

// Also try immediate in case DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => MasterLoader.init(), 10);
}

// Global exports
window.MasterLoader = MasterLoader;
