/* TECHOPRINT 2026 - ENG I18N ENGINE */
/* LANGUAGE TRIO: Arabic, Kurdish, English */

const I18n = {
    current: 'ar',
    
    dict: {
        ar: {
            app: { name: 'TECHOPRINT 2026', loading: 'جاري التحميل...' },
            nav: { dashboard: 'لوحة التحكم', wallet: 'المحفظة', library: 'المكتبة', orders: 'الطلبات', tracking: 'تتبع الطلب', designer: 'المصممون', maintenance: 'الصيانة', printing: 'الطباعة', inks: 'الحبر' },
            auth: { login: 'تسجيل الدخول', register: 'إنشاء حساب', logout: 'خروج', email: 'البريد الالكتروني', password: 'كلمة المرور', enter: 'دخول' },
            wallet: { balance: 'الرصيد', deposit: 'إيداع', withdraw: 'سحب', iqd: 'IQD' },
            screens: { student: 'بوابة الطالب', teacher: 'بوابة المعلم', maintenance: 'الصيانة', printing: 'الطباعة', inks: 'الحبر', wallet: 'المحفظة' },
            common: { back: 'رجوع', admin: 'الأدمن', more: 'المزيد', welcome: 'مرحباً بك', home: 'الرئيسية', myOrders: 'طلباتي' }
        },
        ku: {
            app: { name: 'TECHOPRINT 2026', loading: 'بار دەکرێت...' },
            nav: { dashboard: 'داشبۆرد', wallet: 'سەرف', library: 'پارەگە', orders: 'داواکان', tracking: 'هەڵگر', designer: 'دیزاینەر', maintenance: 'چاککردن', printing: 'پرینت', inks: 'مەرکەز' },
            auth: { login: 'چوونەژوورەوە', register: 'دروستکردن', logout: 'چوونەدەر', email: 'ئیمەیڵ', password: 'تێپەرە', enter: 'بچۆ ژوورەوە' },
            wallet: { balance: 'سەرف', deposit: 'پارەدان', withdraw: 'رەوانەکردن', iqd: 'IQD' },
            screens: { student: 'دروازەی قوتابی', teacher: 'دروازەی مامۆستا', maintenance: 'چاککردن', printing: 'پرینت', inks: 'مەرکەز', wallet: 'سەرف' },
            common: { back: 'گەڕانەوە', admin: 'بەڕێوبەرایەتی', more: 'زیاتر', welcome: 'بەخێربێیت', home: 'سەرەتا', myOrders: 'داواکانم' }
        },
        en: {
            app: { name: 'TECHOPRINT 2026', loading: 'Loading...' },
            nav: { dashboard: 'Dashboard', wallet: 'Wallet', library: 'Library', orders: 'Orders', tracking: 'Track Order', designer: 'Designers', maintenance: 'Maintenance', printing: 'Printing', inks: 'Inks' },
            auth: { login: 'Login', register: 'Create Account', logout: 'Logout', email: 'Email', password: 'Password', enter: 'Enter' },
            wallet: { balance: 'Balance', deposit: 'Deposit', withdraw: 'Withdraw', iqd: 'IQD' },
            screens: { student: 'Student Portal', teacher: 'Teacher Portal', maintenance: 'Maintenance', printing: 'Printing', inks: 'Inks', wallet: 'Wallet' },
            common: { back: 'Back', admin: 'Admin', more: 'More', welcome: 'Welcome', home: 'Home', myOrders: 'My Orders' }
        }
    },
    
    init() {
        const saved = localStorage.getItem('tp-lang');
        if (saved && this.dict[saved]) this.current = saved;
        this.bindButtons();
    },
    
    set(lang) {
        if (!this.dict[lang]) return;
        this.current = lang;
        localStorage.setItem('tp-lang', lang);
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        document.querySelectorAll('.lang-btn, .vert-lang-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.lang === lang);
        });
    },
    
    t(key) {
        const k = key.split('.');
        let val = this.dict[this.current];
        for (const x of k) { if (val && val[x]) val = val[x]; else return key; }
        return val;
    },
    
    bindButtons() {
        document.querySelectorAll('.lang-btn[data-lang], .vert-lang-btn[data-lang]').forEach(btn => {
            btn.style.cursor = 'pointer';
            btn.onclick = () => this.set(btn.dataset.lang);
        });
    }
};

window.I18n = I18n;
