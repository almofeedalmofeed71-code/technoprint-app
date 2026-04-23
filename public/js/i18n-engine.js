/* TECHOPRINT 2026 - I18N ENGINE MODULE */
/* Centralized Internationalization Engine */

const I18nEngine = {
    currentLang: 'ar',
    
    translations: {
        ar: {
            nav: { dashboard: 'لوحة التحكم', wallet: 'المحفظة', library: 'المكتبة', orders: 'الطلبات', transfer: 'التحويل', tracking: 'تتبع الطلب', designer: 'المصممون', support: 'الدعم', home: 'الرئيسية' },
            auth: { loginTitle: 'تسجيل الدخول', registerTitle: 'إنشاء حساب جديد', logout: 'تسجيل الخروج' },
            wallet: { balance: 'الرصيد:', deposit: 'إيداع رصيد', withdraw: 'سحب رصيد' },
            common: { back: 'رجوع', admin: 'لوحة الأدمن', more: 'المزيد', loading: 'جاري التحميل...' }
        },
        ku: {
            nav: { dashboard: 'داشبۆرد', wallet: 'سەرف', library: 'پارەگە', orders: 'داواکان', transfer: 'رەوانەکردن', tracking: 'هە跟着', designer: 'دیزاینەر', support: 'پشتیوانی' },
            auth: { loginTitle: 'چوونەژوورەوە', registerTitle: 'دروستکردنی هەژمار', logout: 'چوونەدەرەوە' },
            wallet: { balance: 'سەرفەکە:', deposit: 'پارەدان', withdraw: 'رەوانەکردن' },
            common: { back: 'گەڕانەوە', admin: 'بەڕێوەبەرایەتی', more: 'زیاتر', loading: 'بارکردن...' }
        },
        en: {
            nav: { dashboard: 'Dashboard', wallet: 'Wallet', library: 'Library', orders: 'Orders', transfer: 'Transfer', tracking: 'Track Order', designer: 'Designers', support: 'Support', home: 'Home' },
            auth: { loginTitle: 'Login', registerTitle: 'Create Account', logout: 'Logout' },
            wallet: { balance: 'Balance:', deposit: 'Deposit', withdraw: 'Withdraw' },
            common: { back: 'Back', admin: 'Admin Panel', more: 'More', loading: 'Loading...' }
        }
    },
    
    init() {
        this.loadSavedLanguage();
        this.bindLangSwitchers();
        console.log('[I18N] Engine initialized');
    },
    
    loadSavedLanguage() {
        const saved = localStorage.getItem('techprint-lang');
        if (saved && this.translations[saved]) {
            this.currentLang = saved;
        }
        this.applyLanguage();
    },
    
    setLanguage(lang) {
        if (!this.translations[lang]) return;
        this.currentLang = lang;
        localStorage.setItem('techprint-lang', lang);
        this.applyLanguage();
        this.updateLangSwitchers();
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
    },
    
    applyLanguage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const value = this.get(key);
            if (value) el.textContent = value;
        });
    },
    
    get(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        for (const k of keys) {
            if (value && value[k]) value = value[k];
            else return null;
        }
        return value;
    },
    
    bindLangSwitchers() {
        document.querySelectorAll('.lang-btn[data-lang], .vert-lang-btn[data-lang]').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                this.setLanguage(lang);
            });
        });
    },
    
    updateLangSwitchers() {
        document.querySelectorAll('.lang-btn[data-lang], .vert-lang-btn[data-lang]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === this.currentLang);
        });
    }
};

// Export to global
window.I18nEngine = I18nEngine;
window.initLanguages = () => I18nEngine.init();
window.switchPortalLanguage = (lang) => I18nEngine.setLanguage(lang);
