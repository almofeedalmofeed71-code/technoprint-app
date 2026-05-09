/**
 * TECHOPRINT - Designer Portal Asset Manager
 * Secure asset management with unique IDs
 * CMYK Ready Export
 * Version: 2.0.0
 */

class AssetManager {
    constructor() {
        this.iconSizes = [192, 512];
        this.assetEndpoint = '/api/radar/assets';
        this.currentAsset = null;
    }

    generateAssetId() {
        return `TP_ASSET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async uploadAsset(file, metadata = {}) {
        const assetId = this.generateAssetId();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('assetId', assetId);
        formData.append('metadata', JSON.stringify(metadata));

        try {
            const response = await fetch(`${this.assetEndpoint}/upload`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            await mofeedAuth.reportToRadar('asset_uploaded', {
                assetId,
                type: metadata.type,
                portal: 'designer'
            });
            
            return result;
        } catch (error) {
            console.error('Asset upload failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getAssets(filter = {}) {
        return await mofeedDB.query('assets', filter, 'designer');
    }

    async deleteAsset(assetId) {
        try {
            const result = await fetch(`${this.assetEndpoint}/${assetId}`, {
                method: 'DELETE'
            });
            
            await mofeedAuth.reportToRadar('asset_deleted', { assetId });
            return await result.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Icon management
    async uploadIcon(file, size) {
        if (!this.iconSizes.includes(size)) {
            return { success: false, error: 'Invalid icon size' };
        }

        const metadata = {
            type: 'app_icon',
            size,
            format: file.type
        };

        return await this.uploadAsset(file, metadata);
    }

    loadIconManager() {
        const modal = document.createElement('div');
        modal.className = 'modal icon-manager';
        modal.innerHTML = `
            <div class="icon-manager-content">
                <h3 class="arabic-heading">إدارة أيقونات التطبيق</h3>
                <div class="icon-sizes">
                    ${this.iconSizes.map(size => `
                        <div class="icon-size-section">
                            <h4>${size}x${size} px</h4>
                            <input type="file" accept="image/png" data-size="${size}">
                            <img src="assets/icons/icon-${size}.png" alt="${size}px" 
                                 class="icon-preview" width="${Math.min(size, 128)}" height="${Math.min(size, 128)}">
                        </div>
                    `).join('')}
                </div>
                <button class="portal-btn" onclick="assetManager.saveIcons()">حفظ الأيقونات</button>
                <button class="portal-btn" onclick="this.closest('.modal').remove()">إغلاق</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async saveIcons() {
        const inputs = document.querySelectorAll('.icon-size-section input');
        for (const input of inputs) {
            const file = input.files[0];
            if (file) {
                const size = parseInt(input.dataset.size);
                await this.uploadIcon(file, size);
            }
        }
        
        await mofeedNotifications.send({
            type: 'inApp',
            recipient: 'admin',
            title: 'تحديث الأيقونات',
            body: 'تم تحديث أيقونات التطبيق بنجاح'
        });
    }

    // Gallery management
    async loadGallery() {
        const gallery = document.getElementById('assetGallery');
        if (!gallery) return;

        const assets = await this.getAssets();
        gallery.innerHTML = assets.map(asset => `
            <div class="gallery-item" data-id="${asset.assetId}">
                <img src="${asset.url}" alt="${asset.name}">
                <div class="gallery-item-info">
                    <span class="arabic-body">${asset.name}</span>
                    <span class="asset-id">${asset.assetId}</span>
                </div>
                <button class="delete-btn" onclick="assetManager.deleteAsset('${asset.assetId}')">حذف</button>
            </div>
        `).join('');
    }

    // CMYK Export
    async exportForPrint() {
        const assets = await this.getAssets({ type: 'branding' });
        const exportData = assets.map(asset => ({
            ...asset,
            exportFormat: 'CMYK',
            colorProfile: 'ISO Coated v2 (ECI)',
            bleed: '3mm'
        }));

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `assets_cmyk_${Date.now()}.json`;
        a.click();

        await mofeedAuth.reportToRadar('cmyk_export', { assetCount: assets.length });
    }
}

export const assetManager = new AssetManager();
export default assetManager;