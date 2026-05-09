/**
 * TECHOPRINT - Mofeed Radar System
 * Weekly Report Generator - Cross-Portal Data Aggregation
 * Version: 2.0.0
 */

class MofeedRadar {
    constructor() {
        this.endpoint = '/api/radar';
        this.portals = ['student', 'teacher', 'designer', 'library'];
        this.reportInterval = 604800000; // 7 days in milliseconds
    }

    async collectPortalData(portal) {
        try {
            const response = await fetch(`${this.endpoint}/collect/${portal}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error(`Failed to collect ${portal} data:`, error);
            return null;
        }
    }

    async generateWeeklyReport() {
        const report = {
            generated: new Date().toISOString(),
            period: this.getWeekRange(),
            portals: {},
            summary: {
                totalUsers: 0,
                totalOrders: 0,
                totalRevenue: 0,
                activeServices: 0
            }
        };

        for (const portal of this.portals) {
            const data = await this.collectPortalData(portal);
            if (data) {
                report.portals[portal] = data;
                this.aggregateSummary(report.summary, data);
            }
        }

        await this.saveReport(report);
        return report;
    }

    getWeekRange() {
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - 7);
        return {
            start: start.toISOString(),
            end: now.toISOString()
        };
    }

    aggregateSummary(summary, data) {
        summary.totalUsers += data.users || 0;
        summary.totalOrders += data.orders || 0;
        summary.totalRevenue += data.revenue || 0;
        summary.activeServices += data.services || 0;
    }

    async saveReport(report) {
        try {
            await fetch(`${this.endpoint}/report/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(report)
            });
        } catch (error) {
            console.error('Failed to save report:', error);
        }
    }

    async getWeeklyReports(limit = 12) {
        try {
            const response = await fetch(`${this.endpoint}/reports?limit=${limit}`);
            return await response.json();
        } catch {
            return [];
        }
    }
}

export const mofeedRadar = new MofeedRadar();
export default mofeedRadar;