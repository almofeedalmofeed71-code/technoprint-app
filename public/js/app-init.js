/* TECHOPRINT 2026 - MASTER INITIALIZATION */
/* Centralized Function Map - Calls All Modules in Order */

const MasterLoader = {
    version: '2026.1.0',
    
    init() {
        console.log(`[MASTER] TECHOPRINT ${this.version} Loading...`);
        
        // Phase 1: Core Systems (No dependencies)
        this.phase1_Core();
        
        // Phase 2: UI Systems (After core)
        this.phase2_UI();
        
        // Phase 3: App Systems (After UI)
        this.phase3_App();
        
        console.log('[MASTER] Initialization Complete');
    },
    
    phase1_Core() {
        // 1. Initialize Internationalization
        if (window.initLanguages) {
            initLanguages();
            console.log('[MASTER] ✓ Languages Initialized');
        }
        
        // 2. Initialize Authentication
        if (window.initAuth) {
            initAuth();
            console.log('[MASTER] ✓ Auth Initialized');
        }
        
        // 3. Initialize Navigation
        if (window.initNavigation) {
            initNavigation();
            console.log('[MASTER] ✓ Navigation Initialized');
        }
    },
    
    phase2_UI() {
        // 4. Initialize Splash Screen
        this.initSplash();
        
        // 5. Initialize Preloader
        this.initPreloader();
        
        // 6. Initialize Modals
        this.initModals();
    },
    
    phase3_App() {
        // 7. Initialize Slider Logic
        if (window.initMegaSlider) {
            initMegaSlider();
            console.log('[MASTER] ✓ Slider Initialized');
        }
        
        // 8. Initialize Portals
        this.initPortals();
        
        // 9. Check Authentication State
        this.checkAuthState();
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
        }
    },
    
    initPreloader() {
        const preloader = document.getElementById('preloader');
        const progress = preloader?.querySelector('.progress-fill');
        if (progress) {
            let width = 0;
            const interval = setInterval(() => {
                width += Math.random() * 15;
                if (width >= 100) {
                    width = 100;
                    clearInterval(interval);
                    setTimeout(() => {
                        preloader.classList.add('hidden');
                        setTimeout(() => {
                            preloader.style.display = 'none';
                            this.showMasterPortal();
                        }, 500);
                    }, 300);
                }
                progress.style.width = width + '%';
            }, 200);
        }
    },
    
    initModals() {
        // Bind modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                if (modal) modal.style.display = 'none';
            });
        });
        
        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.style.display = 'none';
            });
        });
    },
    
    initPortals() {
        // Portal visibility controls
        window.showPortal = () => {
            document.getElementById('masterPortal')?.classList.remove('hidden');
            document.getElementById('app')?.style.setProperty('display', 'none');
            document.getElementById('studentPortal')?.classList.add('hidden');
        };
        
        window.openPortal = (type) => {
            if (type === 'student') {
                document.getElementById('masterPortal')?.classList.add('hidden');
                document.getElementById('studentPortal')?.classList.remove('hidden');
            } else {
                // For other portals, check auth first
                if (!AuthLogic?.isLoggedIn()) {
                    showLoginModal();
                    return;
                }
                this.showMainApp();
            }
        };
        
        window.showMainDashboard = () => {
            this.showMainApp();
            NavLogic?.navigate('dashboard');
        };
        
        window.showMainApp = () => {
            document.getElementById('masterPortal')?.classList.add('hidden');
            document.getElementById('studentPortal')?.classList.add('hidden');
            document.getElementById('app')?.style.setProperty('display', 'flex');
        };
    },
    
    showMasterPortal() {
        document.getElementById('masterPortal')?.classList.remove('hidden');
        document.getElementById('app')?.style.setProperty('display', 'none');
    },
    
    checkAuthState() {
        if (AuthLogic?.isLoggedIn()) {
            this.showMainApp();
        } else {
            this.showMasterPortal();
        }
    }
};

// Start the Master Loader
window.addEventListener('DOMContentLoaded', () => {
    MasterLoader.init();
});

// Global exports
window.MasterLoader = MasterLoader;
window.showPortal = () => MasterLoader.showMasterPortal();
window.showMainDashboard = () => MasterLoader.showMainApp();
window.openPortal = (type) => {
    if (type === 'student') {
        MasterLoader.showMasterPortal();
        document.getElementById('masterPortal')?.classList.add('hidden');
        document.getElementById('studentPortal')?.classList.remove('hidden');
    } else {
        if (!AuthLogic?.isLoggedIn()) {
            showLoginModal();
        } else {
            MasterLoader.showMainApp();
        }
    }
};
window.closeModal = (id) => { const m = document.getElementById(id); if (m) m.style.display = 'none'; };
window.openModal = (id) => { const m = document.getElementById(id); if (m) m.style.display = 'flex'; };
window.showLoginModal = () => openModal('loginModal');
window.openRegisterPage = () => { document.getElementById('registerPage')?.style.setProperty('display', 'flex'); };
window.closeRegisterPage = () => { document.getElementById('registerPage')?.style.setProperty('display', 'none'); };
