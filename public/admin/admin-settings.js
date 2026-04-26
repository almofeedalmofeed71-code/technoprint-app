/**
 * ADMIN SETTINGS MODULE v12
 * Ads + Storage + Real Supabase Upload
 */

console.log('📦 Admin Settings v12 loading...');

// ==================== ADS GRID ====================
window.renderAdsGrid = function() {
    try {
        const grid = document.getElementById('adsGrid');
        if (!grid) return;
        
        const ads = window.ADMIN_STATE?.ads || [];
        
        if (ads.length === 0) {
            grid.innerHTML = `
                <div style="text-align: center; padding: 60px; grid-column: 1/-1;">
                    <div style="font-size: 60px; margin-bottom: 15px;">📢</div>
                    <p style="color: #888; font-size: 16px;">لا توجد إعلانات</p>
                    <small style="color: #666;">ارفع أول إعلان لعرضه هنا وفي التطبيق</small>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = ads.map(ad => `
            <div style="position: relative; background: #1a1a1a; border-radius: 10px; overflow: hidden; aspect-ratio: 16/9; border: 2px solid #333;">
                ${ad?.url ? 
                    `<img src="${ad.url}" alt="${ad?.filename || 'ad'}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.innerHTML='<div style=display:flex;align-items:center;justify-content:center;height:100%;font-size:40px;>📢</div>'">` :
                    `<div style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 40px;">📢</div>`
                }
                <div style="position: absolute; top: 5px; left: 5px; right: 5px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="background: ${ad?.is_active ? '#2ECC71' : '#888'}; color: white; padding: 4px 10px; border-radius: 5px; font-size: 10px;">
                        ${ad?.is_active ? '✅' : '⏳'}
                    </span>
                    <button onclick="window.deleteAd('${ad?.id || ''}')" style="background: #E74C3C; color: white; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 14px;">×</button>
                </div>
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.8); padding: 8px; font-size: 11px; color: white; text-align: center;">
                    ${ad?.filename || 'إعلان'}
                </div>
            </div>
        `).join('');
        
        console.log(`✅ Rendered ${ads.length} ads`);
        
    } catch (err) {
        console.error('❌ Render ads error:', err);
    }
};

// ==================== UPLOAD TO SUPABASE STORAGE ====================
window.handleAdUpload = async function(input) {
    if (!input?.files?.length) return;
    
    const files = Array.from(input.files);
    let uploaded = 0;
    let failed = 0;
    
    window.showToast(`⬆️ جاري رفع ${files.length} إعلان إلى Supabase...`);
    
    for (const file of files) {
        try {
            // Generate unique filename
            const ext = file.name.split('.').pop() || 'jpg';
            const filename = `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
            
            // Upload to Supabase Storage
            const publicUrl = await window.supabase.uploadToStorage('ads', filename, file);
            
            if (publicUrl) {
                // Insert record into ads table
                const adRecord = {
                    filename: file.name,
                    url: publicUrl,
                    type: file.type,
                    size: file.size,
                    is_active: true,
                    created_at: new Date().toISOString()
                };
                
                const result = await window.supabase.insert('ads', adRecord);
                
                if (result) {
                    uploaded++;
                    console.log(`✅ Uploaded: ${file.name} → ${publicUrl}`);
                    
                    // Add to local state
                    const newAd = { id: 'new_' + Date.now(), ...adRecord };
                    window.ADMIN_STATE.ads = [newAd, ...(window.ADMIN_STATE.ads || [])];
                } else {
                    failed++;
                }
            } else {
                // If storage fails, save as base64 in ads table
                const reader = new FileReader();
                const base64 = await new Promise((resolve) => {
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });
                
                const adRecord = {
                    filename: file.name,
                    url: base64,
                    type: file.type,
                    size: file.size,
                    is_active: true,
                    created_at: new Date().toISOString()
                };
                
                const result = await window.supabase.insert('ads', adRecord);
                if (result) {
                    uploaded++;
                    console.log(`✅ Saved as base64: ${file.name}`);
                    
                    const newAd = { id: 'new_' + Date.now(), ...adRecord };
                    window.ADMIN_STATE.ads = [newAd, ...(window.ADMIN_STATE.ads || [])];
                } else {
                    failed++;
                }
            }
            
        } catch (err) {
            console.error(`❌ Upload failed: ${file.name}`, err);
            failed++;
        }
    }
    
    if (uploaded > 0) {
        window.showToast(`✅ تم رفع ${uploaded} من ${files.length} إعلان`);
    }
    if (failed > 0) {
        window.showToast(`⚠️ فشل رفع ${failed} إعلان`);
    }
    
    input.value = '';
    
    // Re-render ads grid
    window.renderAdsGrid();
};

window.deleteAd = async function(adId) {
    if (!adId) return;
    if (!confirm('حذف هذا الإعلان؟')) return;
    
    try {
        window.showToast('🗑️ جاري الحذف...');
        
        const success = await window.supabase.delete('ads', { id: adId });
        
        if (success) {
            window.ADMIN_STATE.ads = (window.ADMIN_STATE.ads || []).filter(a => a?.id !== adId);
            window.renderAdsGrid();
            window.showToast('✅ تم حذف الإعلان');
        } else {
            window.showToast('❌ فشل الحذف');
        }
    } catch (err) {
        console.error('❌ Delete ad error:', err);
        window.showToast('❌ خطأ في الحذف');
    }
};

window.toggleAdStatus = async function(adId) {
    if (!adId) return;
    
    const ad = window.ADMIN_STATE?.ads?.find(a => a?.id === adId);
    if (!ad) return;
    
    const newStatus = !ad.is_active;
    
    try {
        await window.supabase.update('ads', { id: adId }, { is_active: newStatus });
        ad.is_active = newStatus;
        window.renderAdsGrid();
        window.showToast(`✅ ${newStatus ? 'تم التفعيل' : 'تم الإيقاف'}`);
    } catch (err) {
        window.showToast('❌ خطأ في التحديث');
    }
};

// ==================== TASKS MODULE ====================
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
            <div style="background: #1a1a1a; padding: 15px; border-radius: 10px; margin-bottom: 10px; border: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h4 style="color: var(--admin-gold); margin-bottom: 5px;">${t?.title || '-'}</h4>
                    <small style="color: #666;">${t?.created_at || ''}</small>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span style="padding: 5px 12px; border-radius: 15px; font-size: 12px; background: ${t?.status === 'completed' ? '#2ECC71' : '#3498DB'}20; color: ${t?.status === 'completed' ? '#2ECC71' : '#3498DB'};">
                        ${t?.status === 'completed' ? '✅ مكتمل' : '⏳ قيد الانتظار'}
                    </span>
                    ${t?.status !== 'completed' ? `
                        <button onclick="window.completeTask('${t?.id || ''}')" style="background: #2ECC71; color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer;">✓</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
    } catch (err) {
        console.error('❌ Render tasks error:', err);
    }
};

window.addNewTask = async function() {
    const titleInput = document.getElementById('newTaskTitle');
    const prioritySelect = document.getElementById('newTaskPriority');
    
    const title = titleInput?.value?.trim();
    const priority = prioritySelect?.value || 'medium';
    
    if (!title) {
        window.showToast('⚠️ أدخل عنوان المهمة');
        return;
    }
    
    try {
        const newTask = {
            title,
            priority,
            status: 'pending',
            created_at: new Date().toISOString()
        };
        
        const result = await window.supabase.insert('tasks', newTask);
        
        if (result) {
            window.ADMIN_STATE.tasks = window.ADMIN_STATE.tasks || [];
            window.ADMIN_STATE.tasks.unshift({ id: 'new_' + Date.now(), ...newTask });
            window.renderTasksList();
            window.showToast(`✅ تمت إضافة: ${title}`);
            if (titleInput) titleInput.value = '';
        } else {
            window.showToast('❌ فشل إضافة المهمة');
        }
    } catch (err) {
        console.error('❌ Add task error:', err);
        window.showToast('❌ خطأ');
    }
};

window.completeTask = async function(taskId) {
    if (!taskId) return;
    
    try {
        const success = await window.supabase.update('tasks', { id: taskId }, { status: 'completed' });
        
        if (success) {
            const task = window.ADMIN_STATE.tasks?.find(t => t?.id === taskId);
            if (task) task.status = 'completed';
            window.renderTasksList();
            window.showToast('✅ تم إكمال المهمة');
        } else {
            window.showToast('❌ فشل التحديث');
        }
    } catch (err) {
        window.showToast('❌ خطأ');
    }
};

// ==================== COLORS & TEXTS ====================
window.saveColor = function(colorKey) {
    try {
        const colorInput = document.getElementById(colorKey + 'Color');
        const colorValue = colorInput?.value;
        
        if (!colorValue) return;
        
        // Save to localStorage (in production, save to DB settings table)
        localStorage.setItem(`theme_${colorKey}`, colorValue);
        
        // Update preview
        const previewId = colorKey === 'mainGold' ? 'previewGold' : 'previewBlack';
        const preview = document.getElementById(previewId);
        if (preview) preview.style.background = colorValue;
        
        const valueEl = document.getElementById(colorKey + 'Value');
        if (valueEl) valueEl.textContent = colorValue;
        
        window.showToast('✅ تم حفظ اللون');
        
    } catch (err) {
        window.showToast('⚠️ خطأ');
    }
};

window.saveTexts = function() {
    try {
        const texts = {
            appTitle: document.getElementById('appTitle')?.value || '',
            appDescription: document.getElementById('appDescription')?.value || '',
            welcomeText: document.getElementById('welcomeText')?.value || '',
            studentPortalName: document.getElementById('studentPortalName')?.value || '',
            teacherPortalName: document.getElementById('teacherPortalName')?.value || '',
            academyPortalName: document.getElementById('academyPortalName')?.value || ''
        };
        
        // Save to localStorage (in production, save to DB)
        localStorage.setItem('app_texts', JSON.stringify(texts));
        window.showToast('✅ تم حفظ جميع النصوص');
        
    } catch (err) {
        window.showToast('⚠️ خطأ في الحفظ');
    }
};

// ==================== ICON UPLOAD FOR SERVICES ====================
window.uploadIconFromFile = async function(input) {
    if (!input?.files?.length) return;
    
    const file = input.files[0];
    if (!file) return;
    
    try {
        window.showToast('⬆️ جاري رفع الأيقونة...');
        
        const ext = file.name.split('.').pop() || 'png';
        const filename = `icon_${Date.now()}.${ext}`;
        
        const iconUrl = await window.supabase.uploadToStorage('icons', filename, file);
        
        if (iconUrl) {
            document.getElementById('newServiceIcon').value = iconUrl;
            
            const preview = document.getElementById('iconPreview');
            if (preview) {
                preview.innerHTML = `<img src="${iconUrl}" style="width:60px;height:60px;border-radius:10px;border:2px solid var(--admin-gold);">`;
            }
            
            window.showToast('✅ تم رفع الأيقونة');
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
    // Load ads after DOM is ready
    setTimeout(() => {
        window.renderAdsGrid();
    }, 500);
});

console.log('✅ Admin Settings v12 ready');