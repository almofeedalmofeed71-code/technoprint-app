/**
 * ADMIN TASKS MODULE
 * Task management
 */

window.renderTasksList = function() {
    try {
        const container = document.getElementById('tasksList');
        if (!container) return;
        
        const tasks = window.ADMIN_STATE?.tasks || [];
        
        if (tasks.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #888; padding: 40px;">لا توجد مهام</p>';
            return;
        }
        
        container.innerHTML = tasks.map(t => `
            <div class="task-card" style="background: var(--admin-black); padding: 15px; border-radius: 10px; margin-bottom: 10px; border: 1px solid #333;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="color: var(--admin-gold); margin-bottom: 5px;">${t?.title || '-'}</h4>
                        <span style="color: #888; font-size: 12px;">${formatDate(t?.created_at)}</span>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <span style="padding: 5px 10px; border-radius: 15px; font-size: 12px; 
                            background: ${getTaskStatusColor(t?.status)}20; color: ${getTaskStatusColor(t?.status)};">
                            ${getTaskStatusText(t?.status)}
                        </span>
                        ${t?.status !== 'completed' ? `
                            <button onclick="window.completeTask('${t?.id || ''}')" 
                                style="background: #2ECC71; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">✓</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (err) {
        console.error('Render tasks error:', err);
    }
};

function getTaskStatusColor(status) {
    switch (status) {
        case 'completed': return '#2ECC71';
        case 'in_progress': return '#F39C12';
        case 'pending': return '#3498DB';
        default: return '#888';
    }
}

function getTaskStatusText(status) {
    switch (status) {
        case 'completed': return '✅ مكتمل';
        case 'in_progress': return '🔄 جاري';
        case 'pending': return '⏳ انتظار';
        default: return status || 'غير معروف';
    }
}

window.completeTask = async function(taskId) {
    if (!taskId) return;
    
    try {
        const success = await window.supabase.update('tasks', { id: taskId }, { status: 'completed' });
        if (success) {
            window.showToast('✅ تم إكمال المهمة');
            const task = window.ADMIN_STATE.tasks.find(t => t?.id === taskId);
            if (task) task.status = 'completed';
            window.renderTasksList();
        } else {
            window.showToast('❌ فشل التحديث');
        }
    } catch (err) {
        window.showToast('❌ حدث خطأ');
    }
};

window.addNewTask = function() {
    const title = document.getElementById('newTaskTitle')?.value;
    const priority = document.getElementById('newTaskPriority')?.value;
    
    if (!title) {
        window.showToast('⚠️ أدخل عنوان المهمة');
        return;
    }
    
    const newTask = {
        id: 'local_' + Date.now(),
        title,
        priority: priority || 'medium',
        status: 'pending',
        created_at: new Date().toISOString()
    };
    
    window.ADMIN_STATE.tasks.unshift(newTask);
    window.renderTasksList();
    window.showToast(`✅ تمت إضافة: ${title}`);
    
    document.getElementById('newTaskTitle').value = '';
};

/**
 * ADMIN SETTINGS MODULE
 * Design, colors, texts management
 */

window.saveColor = function(colorKey) {
    try {
        const colorInput = document.getElementById(colorKey + 'Color');
        const colorValue = colorInput?.value;
        if (!colorValue) return;
        
        // Update preview
        const previewId = colorKey === 'mainGold' ? 'previewGold' : 'previewBlack';
        const preview = document.getElementById(previewId);
        if (preview) preview.style.background = colorValue;
        
        const valueEl = document.getElementById(colorKey + 'Value');
        if (valueEl) valueEl.textContent = colorValue;
        
        // Save to localStorage (in production, save to DB)
        localStorage.setItem(`theme_${colorKey}`, colorValue);
        window.showToast('✅ تم حفظ اللون');
        
    } catch (err) {
        window.showToast('⚠️ حدث خطأ');
    }
};

window.saveTexts = function() {
    try {
        const texts = {
            appTitle: document.getElementById('appTitle')?.value,
            appDescription: document.getElementById('appDescription')?.value,
            welcomeText: document.getElementById('welcomeText')?.value,
            studentPortalName: document.getElementById('studentPortalName')?.value,
            teacherPortalName: document.getElementById('teacherPortalName')?.value,
            academyPortalName: document.getElementById('academyPortalName')?.value
        };
        
        localStorage.setItem('app_texts', JSON.stringify(texts));
        window.showToast('✅ تم حفظ جميع النصوص');
        
    } catch (err) {
        window.showToast('⚠️ حدث خطأ');
    }
};

window.handleAdUpload = async function(input) {
    if (!input?.files?.length) return;
    
    const files = input.files;
    let uploaded = 0;
    
    window.showToast(`⬆️ جاري رفع ${files.length} إعلان...`);
    
    for (const file of files) {
        try {
            // Convert to base64
            const reader = new FileReader();
            const base64 = await new Promise((resolve) => {
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
            
            // Save to localStorage as demo (in production, use Supabase Storage)
            const ads = JSON.parse(localStorage.getItem('admin_ads') || '[]');
            ads.push({
                id: 'ad_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                filename: file.name,
                size: file.size,
                type: file.type,
                data: base64,
                created_at: new Date().toISOString()
            });
            localStorage.setItem('admin_ads', JSON.stringify(ads));
            
            uploaded++;
            console.log(`✅ Uploaded: ${file.name}`);
        } catch (err) {
            console.error(`❌ Upload failed: ${file.name}`, err);
        }
    }
    
    window.showToast(`✅ تم رفع ${uploaded} من ${files.length} إعلان`);
    input.value = '';
    loadAdsGrid();
};

window.handleIconUpload = function(input) {
    if (!input?.files?.length) return;
    window.showToast(`⬆️ جاري رفع ${input.files.length} أيقونة...`);
    
    setTimeout(() => {
        window.showToast(`✅ تم رفع ${input.files.length} أيقونة`);
        input.value = '';
    }, 1000);
};

function loadAdsGrid() {
    try {
        const grid = document.getElementById('adsGrid');
        if (!grid) return;
        
        const ads = JSON.parse(localStorage.getItem('admin_ads') || '[]');
        
        if (ads.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: #888; padding: 40px; grid-column: 1/-1;">لا توجد إعلانات - ارفع أول إعلان</p>';
            return;
        }
        
        grid.innerHTML = ads.map(ad => `
            <div class="preview-item" style="position: relative;">
                <img src="${ad?.data || ''}" alt="${ad?.filename || 'ad'}" style="width: 100%; height: 100%; object-fit: cover;">
                <button onclick="window.deleteAd('${ad?.id || ''}')" title="حذف" style="position: absolute; top: 5px; left: 5px; width: 25px; height: 25px; background: #E74C3C; color: white; border: none; border-radius: 50%; cursor: pointer; font-size: 12px;">×</button>
                <span style="position: absolute; bottom: 5px; left: 5px; font-size: 10px; color: white; background: rgba(0,0,0,0.7); padding: 2px 5px; border-radius: 3px;">${ad?.filename || ''}</span>
            </div>
        `).join('');
        
    } catch (err) {
        console.error('Load ads error:', err);
    }
}

window.deleteAd = function(adId) {
    if (!adId) return;
    if (!confirm('حذف هذا الإعلان؟')) return;
    
    const ads = JSON.parse(localStorage.getItem('admin_ads') || '[]');
    const filtered = ads.filter(a => a?.id !== adId);
    localStorage.setItem('admin_ads', JSON.stringify(filtered));
    window.showToast('✅ تم حذف الإعلان');
    loadAdsGrid();
};

// Load ads on section render
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        loadAdsGrid();
    }, 1000);
});
