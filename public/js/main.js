/* TECHOPRINT 2026 - MAIN */
/* Clean App Loader */

const App = {
    init() {
        console.log('[TECHOPRINT 2026] Main loaded');
        // Trigger initApp
        if (window.initApp) initApp();
    }
};

window.showMainDashboard = () => {
    document.getElementById('masterPortal').style.display = 'none';
    document.getElementById('app').style.display = 'block';
};
window.showStudentDashboard = window.showMainDashboard;
window.navigateTo = (p) => console.log('Navigate to:', p);
window.openModal = (id) => { const m = document.getElementById(id); if (m) m.style.display = 'flex'; };
window.closeModal = (id) => { const m = document.getElementById(id); if (m) m.style.display = 'none'; };
window.Nav = { go: (p) => console.log('Nav to:', p) };

document.addEventListener('DOMContentLoaded', () => App.init());
