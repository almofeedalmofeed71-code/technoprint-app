/* TECHOPRINT 2026 - I18N ENGINE MODULE */
/* Centralized Internationalization - FIXED BINDING */

const I18nEngine = {
    currentLang: 'ar',
    
    translations: {
        ar: {
            nav: { dashboard: 'لوحة التحكم', wallet: 'المحفظة', library: 'المكتبة', orders: 'الطلبات', tracking: 'تتبع الطلب', designer: 'المصممون' },
            auth: { loginTitle: 'تسجيل الدخول', registerTitle: 'إنشاء حساب جديد' },
            wallet: { balance: 'الرصيد:', deposit: 'إيداع رصيد', withdraw: 'سحب رصيد' },
            common: { back: 'رجوع', admin: 'لوحة الأدمن', more: 'المزيد' }
        },
        ku: {
            nav: { dashboard: 'داشبۆرد', wallet: 'سەرف', library: 'پارەگە', orders: 'داواکان', tracking: 'هە跟着', designer: 'دیزاینەر' },
            auth: { loginTitle: 'چوونەژوورەوە', registerTitle: 'دروستکردنی هەژمار' },
            wallet: { balance: 'سەرفەکە:', deposit: 'پارەدان', withdraw: 'رەوانەکردن' },
            common: { back: 'گەڕانەوە', admin: 'بەڕوەبەرایەتی', more: 'زیاتر' }
        },
        en: {
            nav: { dashboard: 'Dashboard', wallet: 'Wallet', library: 'Library', orders: 'Orders', tracking: 'Track Order', designer: 'Designers' },
            auth: { loginTitle: 'Login', registerTitle: 'Create Account' },
            wallet: { balance: 'Balance:', deposit: 'Deposit', withdraw: 'Withdraw' },
            common: { back: 'Back', admin: 'Admin Panel', more: 'More' }
        }
    },
    
    init() {
        this.loadSavedLanguage();
        this.bindLangButtons();
        console.log('[I18N] Engine initialized');
    },
    
    loadSavedLanguage() {
        const saved = localStorage.getItem('techprint-lang');
        if (saved && this.translations[saved]) {
            this.currentLang = saved;
        }
    },
    
    setLanguage(lang) {
        if (!this.translations[lang]) return;
        this.currentLang = lang;
        localStorage.setItem('techprint-lang', lang);
        this.updateUI();
        this.updateButtons();
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
    },
    
    updateUI() {
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
    
    bindLangButtons() {
        // Vertical sidebar buttons
        document.querySelectorAll('.vert-lang-btn[data-lang]').forEach(btn => {
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                this.setLanguage(lang);
            });
        });
        
        // Top bar language buttons
        document.querySelectorAll('.lang-btn[data-lang]').forEach(btn => {
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                this.setLanguage(lang);
            });
        });
    },
    
    updateButtons() {
        document.querySelectorAll('.lang-btn[data-lang], .vert-lang-btn[data-lang]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === this.currentLang);
        });
    }
};

// Export
window.I18nEngine = I18nEngine;
window.switchPortalLanguage = (lang) => I18nEngine.setLanguage(lang);
