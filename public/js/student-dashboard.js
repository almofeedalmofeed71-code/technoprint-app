/**
 * TECHOPRINT 2026 - Student Portal
 * Live data from Supabase
 */

const StudentPortal = {

  // تحميل كل بيانات الطالب
  async load() {
    const user = Auth.isLoggedIn();
    if (!user) {
      Nav.go('dashboard');
      return;
    }

    // عرض بيانات الطالب
    const nameEl = document.getElementById('studentName');
    const catEl  = document.getElementById('studentCategory');
    if (nameEl) nameEl.textContent = 'مرحبا ' + (user.username || '');
    if (catEl)  catEl.textContent  = user.category || 'طالب';

    // جلب البيانات الحية
    await this.loadBalance();
    await this.loadServices();
    await this.loadOrders();
    await this.loadNotifications();
    await this.loadPrices();
    await this.loadFileBasket();

    // حساب المجموع تلقائيا عند تغيير الخيارات
    setTimeout(() => {
      const typeEl  = document.getElementById('printType');
      const pagesEl = document.getElementById('printPages');
      const totalEl = document.getElementById('orderTotal');
      const calc = () => {
        const settings = window.LIVE_SETTINGS || {};
        const priceMap = {
          A4_black: parseInt(settings['price_a4_black']) || 250,
          A4_color: parseInt(settings['price_a4_color']) || 500,
          A3_black: parseInt(settings['price_a3_black']) || 500,
          A3_color: parseInt(settings['price_a3_color']) || 1000
        };
        const pages = parseInt(pagesEl?.value) || 1;
        const price = priceMap[typeEl?.value] || 250;
        if (totalEl) totalEl.textContent = (price * pages).toLocaleString('ar-IQ') + ' IQD';
      };
      if (typeEl)  typeEl.addEventListener('change', calc);
      if (pagesEl) pagesEl.addEventListener('input', calc);
      calc();
    }, 500);
  },

  // تحميل الرصيد الحي
  async loadBalance() {
    const user = Auth.isLoggedIn();
    if (!user?.id) return;
    try {
      const res = await fetch(
        `https://rqzsokvhgjlftkouhphb.supabase.co/rest/v1/profiles?id=eq.${user.id}&select=balance_iqd,pages_count`,
        { headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY'
        }}
      );
      const data = await res.json();
      if (data?.[0]) {
        const balEl = document.getElementById('studentBalance');
        const pgEl  = document.getElementById('studentPages');
        if (balEl) balEl.textContent = (data[0].balance_iqd || 0).toLocaleString('ar-IQ');
        if (pgEl)  pgEl.textContent  = (data[0].pages_count || 0).toLocaleString('ar-IQ');
        // تحديث localStorage
        const session = Auth.isLoggedIn();
        if (session) {
          session.balance_iqd  = data[0].balance_iqd  || 0;
          session.pages_count  = data[0].pages_count  || 0;
          localStorage.setItem('technoprintSession', JSON.stringify(session));
        }
      }
    } catch(e) { console.warn('loadBalance:', e); }
  },

  // تحميل الخدمات من السيرفر
  async loadServices() {
    const grid = document.getElementById('studentServicesGrid');
    if (!grid) return;
    try {
      const services = window.LIVE_SERVICES || [];
      if (!services.length) {
        grid.innerHTML = '<p style="color:#888;text-align:center;grid-column:1/-1;">لا توجد خدمات متاحة</p>';
        return;
      }
      grid.innerHTML = services.map(s => `
        <div class="glass-card" style="padding:15px;text-align:center;cursor:pointer;"
             onclick="StudentPortal.selectService('${s.name}')">
          <p style="font-size:28px;margin:0;">${s.icon || '&#x1F4C4;'}</p>
          <p style="color:#D4AF37;margin:5px 0;font-size:14px;font-weight:bold;">${s.name}</p>
          <p style="color:#2ecc71;margin:0;font-size:13px;">${(s.price || 0).toLocaleString('ar-IQ')} IQD</p>
        </div>
      `).join('');
    } catch(e) { console.warn('loadServices:', e); }
  },

  // اختيار خدمة
  selectService(name) {
    const select = document.getElementById('printType');
    if (select) {
      for (let opt of select.options) {
        if (opt.text.includes(name)) { select.value = opt.value; break; }
      }
    }
    document.getElementById('printPages')?.scrollIntoView({ behavior: 'smooth' });
  },

  // تحميل الاسعار
  async loadPrices() {
    const settings = window.LIVE_SETTINGS || {};
    const set = (id, key, def) => {
      const el = document.getElementById(id);
      if (el) el.textContent = settings[key] || def;
    };
    set('priceA4Black', 'price_a4_black', '250');
    set('priceA4Color', 'price_a4_color', '500');
    set('priceA3Black', 'price_a3_black', '500');
    set('priceA3Color', 'price_a3_color', '1000');
  },

  // تحميل الطلبات
  async loadOrders() {
    const container = document.getElementById('studentOrdersList');
    if (!container) return;
    const user = Auth.isLoggedIn();
    if (!user?.id) return;
    try {
      const res = await fetch(
        `https://rqzsokvhgjlftkouhphb.supabase.co/rest/v1/orders?user_id=eq.${user.id}&order=created_at.desc&limit=5&select=*`,
        { headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY'
        }}
      );
      const orders = await res.json();
      if (!orders?.length) {
        container.innerHTML = '<p style="color:#888;text-align:center;">لا توجد طلبات بعد</p>';
        return;
      }
      const statusMap = { pending:'&#x23F3; قيد الانتظار', completed:'&#x2705; مكتمل', cancelled:'&#x1F534; ملغي' };
      container.innerHTML = orders.map(o => `
        <div style="background:#1a1a00;border:1px solid #333;border-radius:10px;padding:12px;margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="color:#fff;font-size:14px;">${o.print_type || 'طباعة'} - ${o.pages || 1} صفحة</span>
            <span style="color:#D4AF37;font-size:12px;">${statusMap[o.status] || o.status}</span>
          </div>
          <div style="color:#888;font-size:12px;margin-top:5px;">
            &#x1F4B0; ${(o.total_price || 0).toLocaleString('ar-IQ')} IQD
            - ${new Date(o.created_at).toLocaleDateString('ar-IQ')}
          </div>
        </div>
      `).join('');
    } catch(e) { console.warn('loadOrders:', e); }
  },

  // تحميل الاشعارات
  async loadNotifications() {
    const container = document.getElementById('studentNotifsList');
    if (!container) return;
    try {
      const notes = await DB.getNotifications();
      if (!notes?.length) {
        container.innerHTML = '<p style="color:#888;text-align:center;">لا توجد اشعارات</p>';
        return;
      }
      container.innerHTML = notes.map(n => `
        <div style="background:#0a0a1a;border:1px solid #D4AF37;border-radius:10px;padding:12px;margin-bottom:8px;">
          <p style="color:#D4AF37;margin:0;font-weight:bold;">&#x1F4E2; ${n.title}</p>
          <p style="color:#ccc;margin:5px 0 0;font-size:13px;">${n.message || ''}</p>
          <p style="color:#555;font-size:11px;margin:5px 0 0;">${new Date(n.created_at).toLocaleDateString('ar-IQ')}</p>
        </div>
      `).join('');
    } catch(e) { console.warn('loadNotifications:', e); }
  },

  // سلة الملفات المرسلة من المدرسين والمكتبة
  async loadFileBasket() {
    const container = document.getElementById('fileBasketList');
    if (!container) return;
    const user = Auth.isLoggedIn();
    if (!user?.id) return;

    try {
      const res = await fetch(
        `https://rqzsokvhgjlftkouhphb.supabase.co/rest/v1/messages?user_id=eq.${user.id}&order=created_at.desc&limit=10&select=*`,
        { headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY'
        }}
      );
      const msgs = await res.json();
      if (!msgs?.length) {
        container.innerHTML = '<p style="color:#888;text-align:center;padding:15px;">لا توجد ملفات في السلة</p>';
        return;
      }
      container.innerHTML = msgs.map(m => `
        <div style="background:#0d0d00;border:1px solid #D4AF37;border-radius:10px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:10px;">
          <span style="font-size:28px;">&#x1F4C4;</span>
          <div style="flex:1;">
            <p style="color:#D4AF37;margin:0;font-weight:bold;">${m.subject || 'ملف'}</p>
            <p style="color:#888;margin:4px 0 0;font-size:12px;">${m.content || ''}</p>
            <p style="color:#555;font-size:11px;margin:3px 0 0;">&#x1F4C5; ${new Date(m.created_at).toLocaleDateString('ar-IQ')}</p>
          </div>
          <button onclick="StudentPortal.printFile('${m.id}','${m.subject}')"
            style="background:#D4AF37;color:#000;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:12px;font-family:Amiri,serif;">
            &#x1F5A8; طباعة
          </button>
        </div>
      `).join('');
    } catch(e) { console.warn('loadFileBasket:', e); }
  },

  // طباعة ملف من السلة
  async printFile(fileId, fileName) {
    const user = Auth.isLoggedIn();
    if (!user) return;
    if (!confirm(`&#x1F5A8; طلب طباعة\n&#x1F4C4; ${fileName}\n\nهل تريد اضافته لقائمة الطباعة؟`)) return;

    const settings = window.LIVE_SETTINGS || {};
    const price = parseInt(settings['price_a4_black']) || 250;

    try {
      const res = await fetch(
        'https://rqzsokvhgjlftkouhphb.supabase.co/rest/v1/orders',
        {
          method: 'POST',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id: user.id,
            customer_name: user.username,
            phone: user.phone,
            print_type: 'A4_black',
            pages: 1,
            total_price: price,
            color: 'اسود',
            status: 'pending',
            created_at: new Date().toISOString()
          })
        }
      );
      if (res.ok || res.status === 201) {
        alert('&#x2705; تم اضافة الملف لقائمة الطباعة!');
        await this.loadOrders();
      }
    } catch(e) { alert('&#x274C; خطا في الاتصال'); }
  },

  // رفع ملف للطباعة
  handleFileUpload(input) {
    const file = input?.files?.[0];
    if (!file) return;
    
    const nameEl    = document.getElementById('uploadedFileName');
    const sizeEl    = document.getElementById('uploadedFileSize');
    const preview   = document.getElementById('filePreviewBox');
    const pagesEl   = document.getElementById('printPages');
    const totalEl   = document.getElementById('orderTotal');
    const settings  = window.LIVE_SETTINGS || {};
    
    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = (file.size / 1024).toFixed(0) + ' KB';
    if (preview) preview.style.display = 'block';
    
    // تقدير عدد الصفحات بحسب حجم الملف
    let estimatedPages = 1;
    const sizeMB = file.size / (1024 * 1024);
    
    if (file.type === 'application/pdf') {
      estimatedPages = Math.max(1, Math.ceil(sizeMB * 8));
    } else if (file.type.includes('word')) {
      estimatedPages = Math.max(1, Math.ceil(sizeMB * 15));
    } else if (file.type.includes('image')) {
      estimatedPages = 1;
    }
    
    if (pagesEl) pagesEl.value = estimatedPages;
    
    // حساب السعر
    const priceMap = {
      A4_black: parseInt(settings['price_a4_black']) || 250,
      A4_color: parseInt(settings['price_a4_color']) || 500,
      A3_black: parseInt(settings['price_a3_black']) || 500,
      A3_color: parseInt(settings['price_a3_color']) || 1000
    };
    const typeEl = document.getElementById('printType');
    const price = priceMap[typeEl?.value] || 250;
    const total = price * estimatedPages;
    
    if (totalEl) totalEl.textContent = total.toLocaleString('ar-IQ') + ' IQD';
    
    // عرض ملخص للمستخدم
    const pagesInfoEl = document.getElementById('estimatedPages');
    if (pagesInfoEl) pagesInfoEl.textContent = estimatedPages + ' صفحة تقريبا';
    
    console.log('File:', file.name, '| Pages:', estimatedPages, '| Total:', total);
  },

  // ارسال طلب طباعة
  async submitOrder() {
    const user = Auth.isLoggedIn();
    if (!user) { alert('يجب تسجيل الدخول اولا'); return; }

    const type  = document.getElementById('printType')?.value  || 'A4_black';
    const pages = parseInt(document.getElementById('printPages')?.value) || 1;
    const notes = document.getElementById('printNotes')?.value || '';

    const settings = window.LIVE_SETTINGS || {};
    const priceMap = {
      A4_black: parseInt(settings['price_a4_black']) || 250,
      A4_color: parseInt(settings['price_a4_color']) || 500,
      A3_black: parseInt(settings['price_a3_black']) || 500,
      A3_color: parseInt(settings['price_a3_color']) || 1000
    };
    const total = (priceMap[type] || 250) * pages;

    if (!confirm(`تاكيد الطلب\n${pages} صفحة\nالمجموع: ${total.toLocaleString('ar-IQ')} IQD`)) return;

    try {
      const res = await fetch(
        'https://rqzsokvhgjlftkouhphb.supabase.co/rest/v1/orders',
        {
          method: 'POST',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id:       user.id,
            customer_name: user.username,
            phone:         user.phone,
            print_type:    type,
            pages:         pages,
            total_price:   total,
            color:         type.includes('color') ? 'ملون' : 'اسود',
            status:        'pending',
            created_at:    new Date().toISOString()
          })
        }
      );

      if (res.ok || res.status === 201) {
        alert('تم ارسال طلبك بنجاح!\nسيتم معالجته قريبا');
        document.getElementById('printPages').value = '1';
        document.getElementById('printNotes').value = '';
        await this.loadOrders();
      } else {
        const err = await res.text();
        alert('فشل الطلب: ' + err);
      }
    } catch(e) {
      alert('خطا في الاتصال');
      console.error('submitOrder:', e);
    }
  }
};

window.StudentPortal = StudentPortal;