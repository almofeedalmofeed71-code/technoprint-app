/**
 * TECHOPRINT - Shared Core Module Index
 * Exports all core services for portal access
 * Version: 2.0.0
 */

export { mofeedAuth } from './auth.js';
export { mofeedNotifications } from './notifications.js';
export { mofeedDB } from './database.js';
export { mofeedRadar } from './radar.js';
export { accounting } from './accounting.js';

// Core configuration
export const coreConfig = {
    version: '2.0.0',
    portalPrefix: 'TP',
    radarEndpoint: '/api/radar',
    supportedPortals: ['student', 'teacher', 'designer', 'library'],
    arabicFonts: {
        heading: 'Amiri',
        body: 'Noto Naskh Arabic'
    },
    cmykReady: true,
    rtlDefault: true
};

// Import shared CSS
import './base.css';

// Initialize core services
const initCore = () => {
    console.log('Mofeed Core v2.0.0 initialized');
    return coreConfig;
};

export default initCore;