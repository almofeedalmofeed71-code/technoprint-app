/**
 * TECHOPRINT - Shared Core Database Service
 * Mofeed Radar System - Centralized Database Access
 * Version: 2.0.0
 */

class MofeedDatabase {
    constructor() {
        this.radarUrl = '/api/radar';
        this.cache = new Map();
        this.cacheTimeout = 300000; // 5 minutes
    }

    async query(table, filters = {}, portal = 'global') {
        const cacheKey = `${portal}:${table}:${JSON.stringify(filters)}`;
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(`${this.radarUrl}/db/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table, filters, portal })
            });
            const result = await response.json();
            
            this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
            return result;
        } catch (error) {
            console.error('Database query failed:', error);
            return { error: true, data: [] };
        }
    }

    async insert(table, data, portal) {
        try {
            const response = await fetch(`${this.radarUrl}/db/insert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table, data, portal })
            });
            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async update(table, id, data, portal) {
        try {
            const response = await fetch(`${this.radarUrl}/db/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table, id, data, portal })
            });
            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async delete(table, id, portal) {
        try {
            const response = await fetch(`${this.radarUrl}/db/delete`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table, id, portal })
            });
            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    clearCache() {
        this.cache.clear();
    }
}

export const mofeedDB = new MofeedDatabase();
export default mofeedDB;