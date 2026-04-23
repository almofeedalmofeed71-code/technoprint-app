/**
 * TECHOPRINT 2026 - STUDENT DASHBOARD (Part 1)
 * Welcome message, Quick stats, Quick actions
 */

const StudentDashboard = {
    render() {
        const container = document.getElementById('pageContent');
        if (!container) return;
        
        container.innerHTML = `
            <section class="page active student-dashboard">
                <!-- Welcome Banner -->
                <div class="welcome-banner glass-panel">
                    <div class="welcome-text">
                        <h2><span data-i18n="dashboard.welcome">${window.i18n.t('dashboard.welcome')}</span> <span class="gold-text">TECHOPRINT 2026</span></h2>
                        <p data-i18n="dashboard.subtitle">${window.i18n.t('dashboard.subtitle')}</p>
                    </div>
                    <div class="welcome-stats">
                        <div class="stat-item glass-panel">
                            <span class="stat-value" id="totalOrders">0</span>
                            <span class="stat-label" data-i18n="dashboard.totalOrders">${window.i18n.t('dashboard.totalOrders')}</span>
                        </div>
                        <div class="stat-item glass-panel">
                            <span class="stat-value" id="totalBooks">0</span>
                            <span class="stat-label" data-i18n="dashboard.totalBooks">${window.i18n.t('dashboard.totalBooks')}</span>
                        </div>
                        <div class="stat-item glass-panel">
                            <span class="stat-value" id="activeOrders">0</span>
                            <span class="stat-label" data-i18n="dashboard.activeOrders">${window.i18n.t('dashboard.activeOrders')}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions Grid -->
                <div class="quick-actions">
                    <button class="action-btn glass-panel" onclick="Router.navigate('wallet')">
                        <span class="action-icon">💰</span>
                        <span class="action-text" data-i18n="dashboard.myWallet">${window.i18n.t('dashboard.myWallet')}</span>
                    </button>
                    <button class="action-btn glass-panel" onclick="Router.navigate('library')">
                        <span class="action-icon">📚</span>
                        <span class="action-text" data-i18n="dashboard.browseLibrary">${window.i18n.t('dashboard.browseLibrary')}</span>
                    </button>
                    <button class="action-btn glass-panel" onclick="Router.navigate('transfer')">
                        <span class="action-icon">🔄</span>
                        <span class="action-text" data-i18n="dashboard.transferBalance">${window.i18n.t('dashboard.transferBalance')}</span>
                    </button>
                    <button class="action-btn glass-panel" onclick="Router.navigate('tracking')">
                        <span class="action-icon">📍</span>
                        <span class="action-text" data-i18n="dashboard.trackOrder">${window.i18n.t('dashboard.trackOrder')}</span>
                    </button>
                </div>
                
                <!-- Recent Activity -->
                <div class="recent-activity glass-panel">
                    <h3 data-i18n="dashboard.recentActivity">${window.i18n.t('dashboard.recentActivity')}</h3>
                    <div class="activity-list" id="activityList">
                        <p class="empty-state" data-i18n="dashboard.noActivity">${window.i18n.t('dashboard.noActivity')}</p>
                    </div>
                </div>
            </section>
        `;
    }
};
