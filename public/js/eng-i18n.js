/* TECHOPRINT 2026 - ENG I18N ENGINE */
/* Translation Logic ONLY (AR, KU, EN) */

const I18n = {
    current: 'ar',
    
    dict: {
        ar: {
            nav: { dashboard: 'لوحة التحكم', wallet: 'المحفظة', library: 'المكتبة', orders: 'الطلبات' },
            auth: { login: 'تسجيل الدخول', register: 'إنشاء حساب', logout: 'خروج' },
            wallet: { balance: 'الرصيد', deposit: 'إيداع', withdraw: 'سحب' },
            common: { back: 'رجوع', admin: 'الأدمن', more: 'المزيد', welcome: 'مرحباً بك' }
        },
        ku: {
            nav: { dashboard: 'داشبۆرد', wallet: 'سەرف', library: 'پارەگە', orders: 'داواکان' },
            auth: { login: 'چوونەژوورەوە', register: 'دروستکردن', logout: 'چوونەدەر' },
            wallet: { balance: 'سەرف', deposit: 'پارەدان', withdraw: 'رەوانەکردن' },
            common: { back: 'گەڕانەوە', admin: 'بەڕێوبەرایەتی', more: 'زیاتر', welcome: 'بەخێربێیت' }
        },
        en: {
            nav: { dashboard: 'Dashboard', wallet: 'Wallet', library: 'Library', orders: 'Orders' },
            auth: { login: 'Login', register: 'Register', logout: 'Logout' },
            wallet: { balance: 'Balance', deposit: 'Deposit', withdraw: 'Withdraw' },
            common: { back: 'Back', admin: 'Admin', more: 'More', welcome: 'Welcome' }
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
