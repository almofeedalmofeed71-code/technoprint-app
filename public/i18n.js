/**
 * TECHOPRINT 2026 - Multi-language Support (i18n)
 * Languages: Arabic (IQ), English (US), Kurdish Sorani (Central Kurdish - Arabic Script)
 * RTL Support for Arabic and Kurdish
 */

class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('techoprint_lang') || 'ar';
        this.translations = {};
        this.fallbackLang = 'ar';
        
        // Supported languages configuration
        this.languages = {
            ar: {
                name: 'العربية',
                nativeName: 'العربية',
                dir: 'rtl',
                flag: '🇮🇶'
            },
            en: {
                name: 'English',
                nativeName: 'English',
                dir: 'ltr',
                flag: '🇺🇸'
            },
            ku: {
                name: 'کوردی',
                nativeName: 'کوردی سۆرانی',
                dir: 'rtl',
                flag: '🇹🇯'
            }
        };
        
        this.loaded = false;
    }

    async init() {
        try {
            // Load all translations
            const langs = ['ar', 'en', 'ku'];
            const promises = langs.map(lang => 
                fetch(`locales/${lang}.json`)
                    .then(res => res.json())
                    .then(data => {
                        this.translations[lang] = data;
                    })
                    .catch(err => console.error(`[i18n] Failed to load ${lang}:`, err))
            );
            
            await Promise.all(promises);
            this.loaded = true;
            
            // Apply current language
            this.setLanguage(this.currentLang);
            
            console.log(`[i18n] Initialized with ${Object.keys(this.translations).length} languages`);
        } catch (error) {
            console.error('[i18n] Initialization failed:', error);
        }
    }

    setLanguage(lang) {
        if (!this.languages[lang]) {
            console.warn(`[i18n] Language ${lang} not supported, falling back to ${this.fallbackLang}`);
            lang = this.fallbackLang;
        }
        
        this.currentLang = lang;
        localStorage.setItem('techoprint_lang', lang);
        
        // Update document direction
        const dir = this.languages[lang].dir;
        document.documentElement.dir = dir;
        document.documentElement.lang = lang;
        
        // Apply translations to page
        this.translatePage();
        
        // Update language switcher if exists
        this.updateLanguageSwitcher();
        
        console.log(`[i18n] Language set to: ${lang} (${dir})`);
    }

    t(key, params = {}) {
        if (!this.loaded) {
            console.warn('[i18n] Translations not loaded yet');
            return key;
        }
        
        const translation = this.getNestedValue(this.translations[this.currentLang], key);
        
        if (translation === undefined) {
            // Try fallback language
            const fallback = this.getNestedValue(this.translations[this.fallbackLang], key);
            if (fallback !== undefined) {
                return this.interpolate(fallback, params);
            }
            console.warn(`[i18n] Missing translation: ${key}`);
            return key;
        }
        
        return this.interpolate(translation, params);
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    interpolate(template, params) {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    translatePage() {
        if (!this.loaded) return;
        
        // Translate elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation !== key) {
                el.textContent = translation;
            }
        });
        
        // Translate elements with data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);
            if (translation !== key) {
                el.placeholder = translation;
            }
        });
        
        // Translate elements with data-i18n-title attribute
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translation = this.t(key);
            if (translation !== key) {
                el.title = translation;
            }
        });
        
        // Update page title
        document.title = this.t('dashboard.techoprint') + ' - ' + this.t('nav.dashboard');
    }

    updateLanguageSwitcher() {
        const switcher = document.getElementById('languageSwitcher');
        if (!switcher) return;
        
        // Update active language indicator
        const buttons = switcher.querySelectorAll('.lang-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.lang === this.currentLang) {
                btn.classList.add('active');
            }
        });
    }

    getAvailableLanguages() {
        return Object.entries(this.languages).map(([code, config]) => ({
            code,
            ...config
        }));
    }

    getCurrentLanguage() {
        return {
            code: this.currentLang,
            ...this.languages[this.currentLang]
        };
    }

    getDirection() {
        return this.languages[this.currentLang]?.dir || 'rtl';
    }

    isRTL() {
        return this.getDirection() === 'rtl';
    }

    // Helper to get role name in current language
    getRoleName(role) {
        return this.t(`roles.${role}`) || role;
    }

    // Helper to get transaction type name
    getTransactionTypeName(type) {
        return this.t(`transactionTypes.${type}`) || type;
    }

    // Helper to get order status name
    getOrderStatusName(status) {
        // Map status keys to translation keys
        const statusMap = {
            'pending': 'orders.pending',
            'processing': 'orders.processing',
            'printing': 'orders.printing',
            'out_for_delivery': 'orders.outForDelivery',
            'delivered': 'orders.delivered',
            'cancelled': 'orders.cancelled'
        };
        
        const key = statusMap[status] || 'orders.pending';
        return this.t(key) || status;
    }

    // Helper to format numbers in current locale
    formatNumber(num) {
        const lang = this.currentLang;
        return new Intl.NumberFormat(lang === 'ku' ? 'ckb' : lang).format(num);
    }

    // Helper to format currency
    formatCurrency(amount, currency = 'IQD') {
        const formatted = this.formatNumber(amount);
        return `${formatted} ${currency}`;
    }

    // Reload translations (for dynamic content)
    reload() {
        this.translatePage();
    }
}

// Create global instance
window.i18n = new I18n();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.i18n.init();
});