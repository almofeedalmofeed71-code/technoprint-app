/**
 * TECHOPRINT - Shared Core Notifications Service
 * Mofeed Radar System - Unified Notifications
 * Version: 2.0.0
 */

class MofeedNotifications {
    constructor() {
        this.channels = {
            email: '/api/radar/notify/email',
            push: '/api/radar/notify/push',
            sms: '/api/radar/notify/sms',
            inApp: '/api/radar/notify/inapp'
        };
    }

    async send(notification) {
        const { type, recipient, title, body, priority = 'normal' } = notification;
        
        const payload = {
            type,
            recipient,
            title: this.arabicSanitize(title),
            body: this.arabicSanitize(body),
            priority,
            timestamp: new Date().toISOString(),
            source: 'mofeed_radar'
        };

        try {
            const response = await fetch(this.channels[type] || this.channels.inApp, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return await response.json();
        } catch (error) {
            console.error('Notification failed:', error);
            return { success: false };
        }
    }

    arabicSanitize(text) {
        if (typeof text !== 'string') return text;
        // Preserve Arabic characters while sanitizing
        return text.replace(/[^\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\s\w\-.,!?؟]/g, '');
    }

    async getNotifications(userId) {
        try {
            const response = await fetch(`/api/radar/notifications/${userId}`);
            return await response.json();
        } catch {
            return [];
        }
    }
}

export const mofeedNotifications = new MofeedNotifications();
export default mofeedNotifications;