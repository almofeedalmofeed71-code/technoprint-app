/**
 * TECHNO-CONTROL CRUD OPERATIONS
 * Contains: addService, editService, deleteService, addNewOrder, deleteUser, editUser, deleteAd, adjustBalance, adjustPages, sendWelcomeGift, sendReward, sendBroadcast, sendPrivateMessage, addNewTask, populateUserSelects
 */

function populateUserSelects() {
    var selectIds = ['walletUserSelect', 'giftUserSelect', 'rewardUserSelect', 'messageRecipient'];

    for (var s = 0; s < selectIds.length; s++) {
        var id = selectIds[s];
        var sel = document.getElementById(id);
        if (!sel) continue;

        var cur = sel.value;
        var options = '<option value="">-- اختر مستخدم --</option>';

        for (var i = 0; i < window.STATE.users.length; i++) {
            var u = window.STATE.users[i];
            var label = (u.username || 'Unknown') + ' (' + (u.phone || 'بلا هاتف') + ')';
            options += '<option value="' + u.id + '">' + label + '</option>';
        }

        sel.innerHTML = options;
        sel.value = cur;
    }
}

async function addService() {
    var nameInput = document.getElementById('newServiceName');
    var priceInput = document.getElementById('newServicePrice');
    var iconInput = document.getElementById('newServiceIcon');

    var name  = nameInput ? nameInput.value.trim() : '';
    var price = parseInt(priceInput ? priceInput.value : 0) || 0;
    var icon  = iconInput ? iconInput.value.trim() : '📄';

    if (!name || !price) { window.showToast('⚠️ أدخل اسم وسعر الخدمة'); return; }

    var insertData = {
        name: name,
        price: price,
        icon: icon,
        status: 'active',
        currency: 'IQD',
        order_index: window.STATE.services.length + 1
    };

    var result = await window.supabaseClient().from('services').insert([insertData]);

    if (result.error) {
        window.showToast('❌ فشل في إضافة الخدمة: ' + result.error.message);
    } else {
        window.showToast('✅ تمت إضافة الخدمة');
        if (nameInput) nameInput.value = '';
        if (priceInput) priceInput.value = '';
        window.loadAllData();
    }
}

async function deleteService(id) {
    if (!confirm('هل تريد حذف هذه الخدمة؟')) return;

    var result = await window.supabaseClient().from('services').delete().eq('id', id);

    window.showToast(result.error ? '❌ فشل في الحذف' : '✅ تم الحذف');
    if (!result.error) window.loadAllData();
}

async function editService(id) {
    var svc = null;
    for (var i = 0; i < window.STATE.services.length; i++) {
        if (window.STATE.services[i].id === id) {
            svc = window.STATE.services[i];
            break;
        }
    }
    if (!svc) return;

    var name  = prompt('اسم الخدمة:', svc.name);
    var price = prompt('السعر:', svc.price);
    if (!name || !price) return;

    var result = await window.supabaseClient().from('services').update({
        name: name,
        price: parseInt(price)
    }).eq('id', id);

    window.showToast(result.error ? '❌ فشل في التعديل' : '✅ تم التعديل');
    if (!result.error) window.loadAllData();
}

async function deleteUser(id) {
    if (!confirm('هل تريد حذف هذا المستخدم؟')) return;

    var result = await window.supabaseClient().from('profiles').delete().eq('id', id);

    window.showToast(result.error ? '❌ فشل في الحذف' : '✅ تم الحذف');
    if (!result.error) window.loadAllData();
}

async function editUser(id) {
    var user = null;
    for (var i = 0; i < window.STATE.users.length; i++) {
        if (window.STATE.users[i].id === id) {
            user = window.STATE.users[i];
            break;
        }
    }
    if (!user) return;
    window.showToast('✏️ تعديل: ' + (user.username || 'مستخدم'));
}

async function deleteAd(id) {
    if (!confirm('هل تريد حذف هذا الإعلان؟')) return;

    var result = await window.supabaseClient().from('ads').delete().eq('id', id);

    window.showToast(result.error ? '❌ فشل في الحذف' : '✅ تم الحذف');
    if (!result.error) window.loadAllData();
}

async function addNewOrder() {
    var customerInput = document.getElementById('orderCustomer');
    var typeInput = document.getElementById('orderType');
    var pagesInput = document.getElementById('orderPages');

    var customer = customerInput ? customerInput.value.trim() : '';
    var type = typeInput ? typeInput.value : 'A4';
    var pages = parseInt(pagesInput ? pagesInput.value : 1) || 1;

    if (!customer) { window.showToast('⚠️ أدخل اسم العميل'); return; }

    var insertData = {
        customer_name: customer,
        print_type: type,
        pages: pages,
        status: 'pending',
        created_at: new Date().toISOString()
    };

    var result = await window.supabaseClient().from('orders').insert([insertData]);

    window.showToast(result.error ? '❌ فشل: ' + result.error.message : '✅ تم إضافة الطلب');
    if (!result.error) {
        if (customerInput) customerInput.value = '';
        window.loadAllData();
    }
}

async function adjustBalance(action) {
    var selInput = document.getElementById('walletUserSelect');
    var amountInput = document.getElementById('balanceAmount');

    var sel = selInput ? selInput.value : '';
    var amount = parseInt(amountInput ? amountInput.value : 0) || 0;

    if (!sel || !amount) { window.showToast('⚠️ اختر مستخدم وأدخل مبلغ'); return; }

    var user = null;
    for (var i = 0; i < window.STATE.users.length; i++) {
        if (window.STATE.users[i].id === sel) {
            user = window.STATE.users[i];
            break;
        }
    }
    if (!user) return;

    var newBal = action === 'add'
        ? (parseInt(user.balance_iqd) || 0) + amount
        : (parseInt(user.balance_iqd) || 0) - amount;

    var result = await window.supabaseClient().from('profiles').update({ balance_iqd: newBal }).eq('id', sel);

    window.showToast(result.error ? '❌ فشل' : '✅ تم ' + (action === 'add' ? 'إضافة' : 'خصم') + ' الرصيد');
    if (!result.error) {
        if (amountInput) amountInput.value = '';
        window.loadAllData();
    }
}

async function adjustPages(action) {
    var selInput = document.getElementById('walletUserSelect');
    var amountInput = document.getElementById('pagesAmount');

    var sel = selInput ? selInput.value : '';
    var amount = parseInt(amountInput ? amountInput.value : 0) || 0;

    if (!sel || !amount) { window.showToast('⚠️ اختر مستخدم وأدخل عدد صفحات'); return; }

    var user = null;
    for (var i = 0; i < window.STATE.users.length; i++) {
        if (window.STATE.users[i].id === sel) {
            user = window.STATE.users[i];
            break;
        }
    }
    if (!user) return;

    var newPg = action === 'add'
        ? (parseInt(user.pages_count) || 0) + amount
        : (parseInt(user.pages_count) || 0) - amount;

    var result = await window.supabaseClient().from('profiles').update({ pages_count: newPg }).eq('id', sel);

    window.showToast(result.error ? '❌ فشل' : '✅ تم ' + (action === 'add' ? 'إضافة' : 'خصم') + ' الصفحات');
    if (!result.error) {
        if (amountInput) amountInput.value = '';
        window.loadAllData();
    }
}

async function sendWelcomeGift() {
    var selInput = document.getElementById('giftUserSelect');
    var balanceInput = document.getElementById('giftBalance');
    var pagesInput = document.getElementById('giftPages');

    var sel = selInput ? selInput.value : '';
    var balance = parseInt(balanceInput ? balanceInput.value : 50) || 50;
    var pages = parseInt(pagesInput ? pagesInput.value : 100) || 100;

    if (!sel) { window.showToast('⚠️ اختر مستخدم'); return; }

    var user = null;
    for (var i = 0; i < window.STATE.users.length; i++) {
        if (window.STATE.users[i].id === sel) {
            user = window.STATE.users[i];
            break;
        }
    }
    if (!user) return;

    var result = await window.supabaseClient().from('profiles').update({
        balance_iqd: (parseInt(user.balance_iqd) || 0) + balance,
        pages_count: (parseInt(user.pages_count) || 0) + pages
    }).eq('id', sel);

    window.showToast(result.error ? '❌ فشل' : '🎁 تم إرسال الهدية الترحيبية');
    if (!result.error) window.loadAllData();
}

async function sendReward() {
    var selInput = document.getElementById('rewardUserSelect');
    var balanceInput = document.getElementById('rewardBalance');
    var pagesInput = document.getElementById('rewardPages');

    var sel = selInput ? selInput.value : '';
    var balance = parseInt(balanceInput ? balanceInput.value : 100) || 100;
    var pages = parseInt(pagesInput ? pagesInput.value : 200) || 200;

    if (!sel) { window.showToast('⚠️ اختر مستخدم'); return; }

    var user = null;
    for (var i = 0; i < window.STATE.users.length; i++) {
        if (window.STATE.users[i].id === sel) {
            user = window.STATE.users[i];
            break;
        }
    }
    if (!user) return;

    var result = await window.supabaseClient().from('profiles').update({
        balance_iqd: (parseInt(user.balance_iqd) || 0) + balance,
        pages_count: (parseInt(user.pages_count) || 0) + pages
    }).eq('id', sel);

    window.showToast(result.error ? '❌ فشل' : '⭐ تم إرسال المكافأة');
    if (!result.error) window.loadAllData();
}

async function sendBroadcast() {
    var titleInput = document.getElementById('broadcastTitle');
    var messageInput = document.getElementById('broadcastMessage');
    var typeInput = document.getElementById('broadcastType');

    var title = titleInput ? titleInput.value.trim() : '';
    var message = messageInput ? messageInput.value.trim() : '';
    var type = typeInput ? typeInput.value : 'info';

    if (!title || !message) { window.showToast('⚠️ أدخل عنوان ومحتوى الإشعار'); return; }

    var insertData = {
        title: title,
        message: message,
        type: type,
        created_at: new Date().toISOString()
    };

    var result = await window.supabaseClient().from('notifications').insert([insertData]);

    window.showToast(result.error ? '❌ فشل: ' + result.error.message : '📨 تم إرسال الإشعار للجميع');
    if (!result.error) {
        if (titleInput) titleInput.value = '';
        if (messageInput) messageInput.value = '';
    }
}

async function sendPrivateMessage() {
    var recipientInput = document.getElementById('messageRecipient');
    var subjectInput = document.getElementById('messageSubject');
    var contentInput = document.getElementById('messageContent');

    var recipient = recipientInput ? recipientInput.value : '';
    var subject = subjectInput ? subjectInput.value.trim() : '';
    var content = contentInput ? contentInput.value.trim() : '';

    if (!recipient || !subject || !content) { window.showToast('⚠️ أدخل جميع البيانات'); return; }

    var insertData = {
        user_id: recipient,
        subject: subject,
        content: content,
        created_at: new Date().toISOString()
    };

    var result = await window.supabaseClient().from('messages').insert([insertData]);

    window.showToast(result.error ? '❌ فشل' : '💬 تم إرسال الرسالة');
    if (!result.error) {
        if (subjectInput) subjectInput.value = '';
        if (contentInput) contentInput.value = '';
    }
}

async function addNewTask() {
    var titleInput = document.getElementById('newTaskTitle');
    var priorityInput = document.getElementById('newTaskPriority');

    var title = titleInput ? titleInput.value.trim() : '';
    var priority = priorityInput ? priorityInput.value : 'medium';

    if (!title) { window.showToast('⚠️ أدخل عنوان المهمة'); return; }

    var insertData = {
        title: title,
        priority: priority,
        status: 'pending',
        created_at: new Date().toISOString()
    };

    var result = await window.supabaseClient().from('tasks').insert([insertData]);

    window.showToast(result.error ? '❌ فشل' : '✅ تمت إضافة المهمة');
    if (!result.error) {
        if (titleInput) titleInput.value = '';
        window.loadAllData();
    }
}

window.addService = addService;
window.editService = editService;
window.deleteService = deleteService;
window.addNewOrder = addNewOrder;
window.deleteUser = deleteUser;
window.editUser = editUser;
window.deleteAd = deleteAd;
window.adjustBalance = adjustBalance;
window.adjustPages = adjustPages;
window.sendWelcomeGift = sendWelcomeGift;
window.sendReward = sendReward;
window.sendBroadcast = sendBroadcast;
window.sendPrivateMessage = sendPrivateMessage;
window.addNewTask = addNewTask;
window.populateUserSelects = populateUserSelects;