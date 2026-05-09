/**
 * TECHOPRINT - Shared Core Authentication Service
 * Mofeed Radar System - Cross-Domain Authentication
 * Version: 2.0.0
 * Arabic Support: Amiri/Naskh Fonts
 */

class MofeedAuth {
    constructor() {
        this.radarEndpoint = '/api/radar';
        this.sessionKey = 'mofeed_session';
        this.portalPrefix = 'TP';
    }

    async authenticate(credentials, portal) {
        try {
            const response = await fetch(`${this.radarEndpoint}/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...credentials,
                    portal: portal,
                    timestamp: new Date().toISOString()
                })
            });
            return await response.json();
        } catch (error) {
            return { success: false, error: 'auth_failed' };
        }
    }

    async validateSession(sessionId) {
        const session = sessionStorage.getItem(this.sessionKey);
        if (!session) return { valid: false };
        
        try {
            const parsed = JSON.parse(session);
            return { valid: true, user: parsed.user, portal: parsed.portal };
        } catch {
            return { valid: false };
        }
    }

    async logout() {
        sessionStorage.removeItem(this.sessionKey);
        await this.reportToRadar('logout', { timestamp: Date.now() });
    }

    async reportToRadar(action, data) {
        try {
            await fetch(`${this.radarEndpoint}/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    data,
                    portal: this.portalPrefix,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (e) {
            console.warn('Radar report failed:', e);
        }
    }

    getUserRole() {
        const session = sessionStorage.getItem(this.sessionKey);
        if (!session) return null;
        try {
            return JSON.parse(session).user?.role || null;
        } catch {
            return null;
        }
    }
}

export const mofeedAuth = new MofeedAuth();
export default mofeedAuth;