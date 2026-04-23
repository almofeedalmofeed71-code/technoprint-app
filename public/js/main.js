/* TECHOPRINT 2026 - MAIN */
/* Clean App Loader */

const App = {
    init() {
        console.log('[TECHOPRINT 2026] Starting...');
        I18n.set('ar');
        this.showPortal();
        this.bindEvents();
        setTimeout(() => this.hideSplash(), 2000);
    },
    
    showPortal() {
        document.getElementById('masterPortal').style.display = 'block';
        document.getElementById('app').style.display = 'none';
    },
    
    showDashboard() {
        document.getElementById('masterPortal').style.display = 'none';
        document.getElementById('app').style.display = 'block';
    },
    
    hideSplash() {
        const splash = document.getElementById('splashScreen');
        if (splash) {
            splash.style.display = 'none';
        }
    },
    
    bindEvents() {
        document.querySelectorAll('.gate-card').forEach(card => {
            card.style.cursor = 'pointer';
        });
        document.querySelectorAll('.service-card').forEach(card => {
            card.style.cursor = 'pointer';
        });
    }
};

window.showMainDashboard = () => App.showDashboard();
window.showStudentDashboard = () => App.showDashboard();
window.navigateTo = (p) => console.log('Navigate to:', p);
window.openModal = (id) => { const m = document.getElementById(id); if (m) m.style.display = 'flex'; };
window.closeModal = (id) => { const m = document.getElementById(id); if (m) m.style.display = 'none'; };
window.Nav = { go: (p) => console.log('Nav to:', p) };

document.addEventListener('DOMContentLoaded', () => App.init());
