/**
 * TECHNO-CONTROL SETTINGS
 * Contains: renderSettingsPanel, renderSettingInput, saveSetting
 */

function renderSettingsPanel() {
    var container = document.getElementById('settingsContainer');
    if (!container) return;

    var settings = window.STATE.settings || [];

    if (!settings.length) {
        container.innerHTML = '<p style="color:#888;text-align:center;">لا توجد إعدادات</p>';
        return;
    }

    var cats = { identity: '🏷️ الهوية', pricing: '💰 الأسعار', wallet: '👛 المحفظة', app: '⚙️ التطبيق', ui: '🎨 الواجهة', general: '📋 عام' };
    var groups = {};
    settings.forEach(function(s) {
        var k = s.category || 'general';
        if (!groups[k]) groups[k] = [];
        groups[k].push(s);
    });

    var html = '';
    var categories = Object.keys(groups);

    for (var c = 0; c < categories.length; c++) {
        var catName = categories[c];
        var catSettings = groups[catName];

        html += '<div style="background:#111;border:1px solid #2a2a2a;border-top:3px solid var(--admin-gold);border-radius:16px;padding:20px;">';
        html += '<h3 style="color:var(--admin-gold);margin:0 0 16px 0;">' + (cats[catName] || catName) + '</h3>';

        for (var j = 0; j < catSettings.length; j++) {
            var s = catSettings[j];
            html += '<div style="margin-bottom:16px;">';
            html += '<label style="display:block;color:#aaa;font-size:12px;margin-bottom:6px;">' + (s.label || s.key) + '</label>';
            html += renderSettingInput(s);
            html += '</div>';
        }

        html += '</div>';
    }

    container.innerHTML = html;
}

function renderSettingInput(s) {
    var v = (s.value || '').replace(/^"|"$/g, '');

    if (s.value_type === 'boolean') {
        return '<label class="toggle-switch">' +
            '<input type="checkbox" ' + (v === 'true' ? 'checked' : '') + ' onchange="saveSetting(\'' + s.key + '\', this.checked.toString())">' +
            '<span class="toggle-slider"></span></label>' +
            '<span style="color:#888;font-size:12px;margin-right:8px;">' + (v === 'true' ? 'مفعّل' : 'معطّل') + '</span>';
    }

    if (s.value_type === 'color') {
        return '<input type="color" value="' + (v || '#D4AF37') + '" style="width:48px;height:36px;border:none;border-radius:8px;cursor:pointer;" onchange="saveSetting(\'' + s.key + '\', this.value)">';
    }

    if (s.value_type === 'number') {
        return '<input type="number" value="' + v + '" style="width:140px;background:#0a0a0a;border:1px solid #2a2a2a;color:#e8e8e8;border-radius:8px;padding:8px 12px;" onchange="saveSetting(\'' + s.key + '\', this.value)">';
    }

    return '<input type="text" value="' + v + '" style="width:100%;background:#0a0a0a;border:1px solid #2a2a2a;color:#e8e8e8;border-radius:8px;padding:8px 12px;box-sizing:border-box;" onchange="saveSetting(\'' + s.key + '\', this.value)">';
}

async function saveSetting(key, value) {
    if (!window.supabaseClient()) {
        window.showToast('❌ الاتصال غير متاح');
        return;
    }

    var jsonVal = (typeof value === 'string' && !['true', 'false'].includes(value) && isNaN(value)) ? JSON.stringify(value) : value;

    var result = await window.supabaseClient().from('app_settings').update({ value: jsonVal }).eq('key', key);

    window.showToast(result.error ? '❌ فشل الحفظ' : '✅ تم الحفظ');
}

window.renderSettingsPanel = renderSettingsPanel;
window.renderSettingInput = renderSettingInput;
window.saveSetting = saveSetting;