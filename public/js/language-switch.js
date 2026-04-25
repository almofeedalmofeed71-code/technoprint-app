/**
 * TECHOPRINT 2026 - Language Switch Module
 * Arabic, Kurdish, and English language logic
 */

(function() {
    'use strict';
    
    // ===== LANGUAGE DATA =====
    const translations = {
        ar: {
            // UI Labels
            home: 'الرئيسية',
            portals: 'البوابات',
            wallet: 'المحفظة',
            orders: 'طلباتي',
            cards: 'البطاقات',
            settings: 'الإعدادات',
            register: 'تسجيل',
            login: 'دخول',
            logout: 'خروج',
            
            // Welcome
            welcome: 'مرحباً بك',
            guest: 'زائر',
            
            // Auth
            username: 'اسم المستخدم',
            password: 'كلمة المرور',
            phone: 'رقم الهاتف',
            province: 'المحافظة',
            address: 'العنوان',
            category: 'الفئة',
            
            // Portal names
            studentPortal: 'بوابة الطالب',
            libraryPortal: 'بوابة المكتبة',
            cardsPortal: 'بوابة البطاقات',
            servicesPortal: 'بوابة الخدمات',
            projectsPortal: 'بوابة المشاريع',
            trackingPortal: 'بوابة التتبع',
            
            // Messages
            required: 'هذا الحقل مطلوب',
            loginRequired: 'الرجاء تسجيل الدخول أولاً',
            success: 'تم بنجاح',
            error: 'حدث خطأ'
        },
        ku: {
            // UI Labels
            home: 'سەرەتا',
            portals: 'دەرگاکان',
            wallet: 'خەرجی',
            orders: 'داواکاریەکانم',
            cards: 'کارتەکان',
            settings: 'ڕێکخستنەکان',
            register: 'تۆمارکردن',
            login: 'چوونەژوورەوە',
            logout: 'چوونەدەرەوە',
            
            // Welcome
            welcome: 'بەخێرهات',
            guest: 'میوان',
            
            // Auth
            username: 'ناوی بەکار هێنەر',
            password: 'وشەی نهێنی',
            phone: 'ژمارەی تەلەفۆن',
            province: 'پارێزگا',
            address: 'ناونیشان',
            category: 'پۆلێن',
            
            // Portal names
            studentPortal: 'دەرگای قوتابی',
            libraryPortal: 'دەرگای کتێبخانە',
            cardsPortal: 'دەرگای کارتەکان',
            servicesPortal: 'دەرگای خزمەتگوزاریەکان',
            projectsPortal: 'دەرگای پرۆژەکان',
            trackingPortal: 'دەرگای بینینی',
            
            // Messages
            required: 'پێویستە',
            loginRequired: 'پێویستە بچیتە ژوورەوە',
            success: 'سەرکەوتوو بوو',
            error: 'هەڵە ڕوویدا'
        },
        en: {
            // UI Labels
            home: 'Home',
            portals: 'Portals',
            wallet: 'Wallet',
            orders: 'My Orders',
            cards: 'Cards',
            settings: 'Settings',
            register: 'Register',
            login: 'Login',
            logout: 'Logout',
            
            // Welcome
            welcome: 'Welcome',
            guest: 'Guest',
            
            // Auth
            username: 'Username',
            password: 'Password',
            phone: 'Phone',
            province: 'Province',
            address: 'Address',
            category: 'Category',
            
            // Portal names
            studentPortal: 'Student Portal',
            libraryPortal: 'Library Portal',
            cardsPortal: 'Cards Portal',
            servicesPortal: 'Services Portal',
            projectsPortal: 'Projects Portal',
            trackingPortal: 'Tracking Portal',
            
            // Messages
            required: 'Required',
            loginRequired: 'Please login first',
            success: 'Success',
            error: 'Error occurred'
        }
    };
    
    let currentLang = localStorage.getItem('technoprintLang') || 'ar';
    
    // ===== GET TRANSLATION =====
    function t(key) {
        return translations[currentLang]?.[key] || translations.ar[key] || key;
    }
    
    // ===== GET CURRENT LANGUAGE =====
    function getCurrentLang() {
        return currentLang;
    }
    
    // ===== SWITCH LANGUAGE =====
    function switchLang(lang) {
        if (!translations[lang]) return;
        
        currentLang = lang;
        localStorage.setItem('technoprintLang', lang);
        
        // Update HTML attributes
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : (lang === 'ku' ? 'rtl' : 'ltr');
        
        // Update language switcher buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            }
        });
        
        // Update all translatable elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = t(key);
        });
        
        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = t(key);
        });
        
        // Trigger language change event
        window.dispatchEvent(new CustomEvent('langChanged', { detail: { lang } }));
    }
    
    // ===== INIT =====
    function init() {
        // Set initial direction
        document.documentElement.dir = currentLang === 'ar' || currentLang === 'ku' ? 'rtl' : 'ltr';
        document.documentElement.lang = currentLang;
        
        // Setup language switcher buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                if (lang) switchLang(lang);
            });
            
            // Mark active
            if (btn.getAttribute('data-lang') === currentLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    // Export to window
    window.Lang = {
        t,
        getCurrentLang,
        switchLang,
        init
    };
    
    // Auto-init
    document.addEventListener('DOMContentLoaded', init);
    
})();