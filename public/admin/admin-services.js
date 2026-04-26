/**
 * ADMIN SERVICES MODULE v11
 * Dynamic Services Management - Synced with DB
 */

console.log('📦 Admin Services v11 loading...');

// ==================== SERVICES CONFIG ====================
const STORAGE_BUCKET = 'ads';
const STORAGE_URL = 'https://avabozirwdefwtabywqo.supabase.co/storage/v1/object';

// ==================== LOAD SERVICES FROM DB ====================
window.loadServicesFromDB = async function() {
    try {
        console.log('📡 Fetching services from DB...');
        
        const servicesData = await window.supabase.query(
            'services',
            '?select=*&order=order_index.asc'
        );
        
        if (!servicesData || !Array.isArray(servicesData) || servicesData.length === 0) {
            console.log('⚠️ No services found, using defaults');
            loadDefaultServices();
            return;
        }
        
        ADMIN_STATE.services = servicesData.map(s => ({
            id: s?.id || '',
            name: s?.name || 'خدمة',
            icon: s?.icon || '📄',
            price: s?.price || 0,
            currency: s?.currency || 'IQD',
            status: s?.status || 'active',
            description: s?.description || '',
            order_index: s?.order_index || 0
        }));
        
        console.log(`✅ Loaded ${ADMIN_STATE.services.length} services from DB`);
        window.renderServicesGrid();
        
    } catch (err) {
        console.error('❌ Load services error:', err);
        loadDefaultServices();
    }
};

function loadDefaultServices() {
    ADMIN_STATE.services = [
        { id: 's1', name: 'طباعة A4', icon: '📄', price: 100, status: 'active' },
        { id: 's2', name: 'طباعة A3', icon: '📃', price: 200, status: 'active' },
        { id: 's3', name: 'تصوير ملون', icon: '🖼️', price: 250, status: 'active' },
        { id: 's4', name: 'تصميم شعار', icon: '🎨', price: 500, status: 'active' },
        { id: 's5', name: 'لوحات', icon: '🖼️', price: 1000, status: 'active' },
        { id: 's6', name: 'طباعة كتب', icon: '📚', price: 300, status: 'active' }
    ];
    console.log('⚠️ Using default services');
    window.renderServicesGrid();
}

// ==================== RENDER SERVICES GRID ====================
window.renderServicesGrid = function() {
    try {
        const container = document.getElementById('servicesGrid');
        if (!container) return;
        
        const services = ADMIN_STATE.services || [];
        
        if (services.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px; grid-column: 1/-1;">
                    <div style="font-size: 60px; margin-bottom: 15px;">⚙️</div>
                    <p style="color: #888; font-size: 16px;">لا توجد خدمات</p>
                    <small style="color: #666;">أضف خدمة جديدة من النموذج أدناه</small>
                </div>
            `;
            return;
        }
        
        container.innerHTML = services.map(s => `
            <div style="background: #1a1a1a; border-radius: 15px; padding: 20px; border: 2px solid ${s?.status === 'active' ? '#333' : '#E74C3C'}; position: relative;">
                <div style="position: absolute; top: 10px; left: 10px; display: flex; gap: 5px;">
                    <button onclick="window.editService('${s?.id || ''}')" style="background: #3498DB; color: white; border: none; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; font-size: 12px;">✏️</button>
                    <button onclick="window.deleteService('${s?.id || ''}')" style="background: #E74C3C; color: white; border: none; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; font-size: 12px;">🗑️</button>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <div style="font-size: 50px; margin-bottom: 10px;">${s?.icon || '📄'}</div>
                    <h3 style="color: var(--admin-gold); margin-bottom: 10px; font-size: 16px;">${s?.name || 'خدمة'}</h3>
                    <div style="font-size: 24px; font-weight: bold; color: #2ECC71; margin-bottom: 10px;">
                        ${window.formatNumber ? window.formatNumber(s?.price || 0) : (s?.price || 0)}
                        <span style="font-size: 12px; color: #888;">${s?.currency || 'IQD'}</span>
                    </div>
                    <span style="background: ${s?.status === 'active' ? '#2ECC71' : '#E74C3C'}; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px;">
                        ${s?.status === 'active' ? '✅ نشط' : '🚫 متوقف'}
                    </span>
                </div>
                
                <div style="margin-top: 15px; text-align: center;">
                    <button onclick="window.toggleServiceStatus('${s?.id || ''}')" 
                        style="background: ${s?.status === 'active' ? '#F39C12' : '#2ECC71'}; color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; font-size: 12px; width: 100%;">
                        ${s?.status === 'active' ? '⏸️ إيقاف' : '▶️ تفعيل'}
                    </button>
                </div>
            </div>
        `).join('');
        
        console.log(`✅ Rendered ${services.length} services`);
        
    } catch (err) {
        console.error('❌ Render services error:', err);
    }
};

// ==================== SERVICE CRUD ====================
window.addService = async function() {
    try {
        const name = document.getElementById('newServiceName')?.value?.trim();
        const icon = document.getElementById('newServiceIcon')?.value?.trim() || '📄';
        const price = parseInt(document.getElementById('newServicePrice')?.value) || 0;
        
        if (!name) {
            window.showToast('⚠️ أدخل اسم الخدمة');
            return;
        }
        
        if (price <= 0) {
            window.showToast('⚠️ أدخل السعر بشكل صحيح');
            return;
        }
        
        window.showToast('⬆️ جاري إضافة الخدمة...');
        
        const newService = {
            name,
            icon,
            price,
            currency: 'IQD',
            status: 'active',
            description: '',
            order_index: (ADMIN_STATE.services?.length || 0) + 1,
            created_at: new Date().toISOString()
        };
        
        const result = await window.supabase.insert('services', newService);
        
        if (result) {
            window.showToast(`✅ تم إضافة: ${name}`);
            document.getElementById('newServiceName').value = '';
            document.getElementById('newServiceIcon').value = '';
            document.getElementById('newServicePrice').value = '';
            await loadServicesFromDB();
        } else {
            // Add locally if DB insert fails
            newService.id = 'local_' + Date.now();
            ADMIN_STATE.services = ADMIN_STATE.services || [];
            ADMIN_STATE.services.push(newService);
            window.renderServicesGrid();
            window.showToast(`✅ تم إضافة: ${name} (محلياً)`);
        }
        
    } catch (err) {
        console.error('❌ Add service error:', err);
        window.showToast('❌ خطأ في الإضافة');
    }
};

window.editService = function(serviceId) {
    const service = ADMIN_STATE.services?.find(s => s?.id === serviceId);
    if (!service) return;
    
    const newName = prompt('اسم الخدمة:', service.name);
    if (!newName || newName === service.name) return;
    
    const newIcon = prompt('الأيقونة (رمز):', service.icon) || service.icon;
    const newPrice = prompt('السعر (IQD):', service.price);
    
    if (newPrice && !isNaN(newPrice)) {
        service.name = newName;
        service.icon = newIcon;
        service.price = parseInt(newPrice);
        
        window.supabase.update('services', { id: serviceId }, { name: newName, icon: newIcon, price: parseInt(newPrice) });
        
        window.renderServicesGrid();
        window.showToast('✅ تم تحديث الخدمة');
    }
};

window.deleteService = async function(serviceId) {
    if (!confirm('حذف هذه الخدمة؟')) return;
    
    try {
        await window.supabase.delete('services', { id: serviceId });
        ADMIN_STATE.services = ADMIN_STATE.services?.filter(s => s?.id !== serviceId) || [];
        window.renderServicesGrid();
        window.showToast('✅ تم حذف الخدمة');
    } catch (err) {
        window.showToast('❌ خطأ في الحذف');
    }
};

window.toggleServiceStatus = async function(serviceId) {
    const service = ADMIN_STATE.services?.find(s => s?.id === serviceId);
    if (!service) return;
    
    const newStatus = service.status === 'active' ? 'inactive' : 'active';
    
    try {
        await window.supabase.update('services', { id: serviceId }, { status: newStatus });
        service.status = newStatus;
        window.renderServicesGrid();
        window.showToast(`✅ ${newStatus === 'active' ? 'تم التفعيل' : 'تم الإيقاف'}`);
    } catch (err) {
        window.showToast('❌ خطأ في التحديث');
    }
};

// ==================== ICON PICKER PRESETS ====================
const ICON_PRESETS = ['📄', '📃', '📋', '🖨️', '📷', '🖼️', '🎨', '📚', '✏️', '📝', '📦', '🗂️', '📁', '📊', '📈', '💰', '🛒', '🏷️', '🎫', '🪪'];

// ==================== UPLOAD ICON TO STORAGE ====================
window.uploadIconFromFile = async function(input) {
    if (!input?.files?.length) return;
    
    const file = input.files[0];
    if (!file) return;
    
    try {
        window.showToast('⬆️ جاري رفع الأيقونة...');
        
        // Generate unique filename
        const ext = file.name.split('.').pop();
        const filename = `icon_${Date.now()}.${ext}`;
        
        // Upload to storage bucket 'icons'
        const res = await fetch(`${STORAGE_URL}/icons/${filename}`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': file.type
            },
            body: file
        });
        
        if (res.ok) {
            const iconUrl = `${SUPABASE_URL}/storage/v1/object/icons/${filename}`;
            window.showToast('✅ تم رفع الأيقونة');
            
            // Set the icon URL
            document.getElementById('newServiceIcon').value = iconUrl;
            
            // Preview
            const preview = document.getElementById('iconPreview');
            if (preview) preview.innerHTML = `<img src="${iconUrl}" style="width:60px;height:60px;border-radius:10px;">`;
        } else {
            window.showToast('❌ فشل الرفع');
        }
        
    } catch (err) {
        console.error('❌ Upload icon error:', err);
        window.showToast('❌ خطأ في الرفع');
    }
};

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        loadServicesFromDB();
        
        // Setup icon preset buttons
        const iconPicker = document.getElementById('iconPicker');
        if (iconPicker) {
            iconPicker.innerHTML = ICON_PRESETS.map(icon => 
                `<button onclick="document.getElementById('newServiceIcon').value='${icon}'; this.style.background='#D4AF37'" style="background:#1a1a1a;color:white;border:1px solid #333;width:40px;height:40px;border-radius:8px;cursor:pointer;font-size:20px;">${icon}</button>`
            ).join('');
        }
    }, 1000);
});

console.log('✅ Admin Services v11 ready');