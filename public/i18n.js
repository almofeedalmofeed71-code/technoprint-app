/* TECHOPRINT 2026 - I18N ENGINE */
/* Complete Arabic/Kurdish/English Translations */

const translations = {
    ar: {
        student_gate: 'بوابة الطالب',
        student_desc: 'ادارة طلباتك ومتابعة الطباعة',
        wallet_gate: 'المحفظة',
        wallet_desc: 'ادارة رصيدك وتحويل الاموال',
        login_gate: 'تسجيل الدخول',
        login_desc: 'ادخل حسابك او انشئ جديد',
        my_orders: 'طلباتي',
        wallet_nav: 'المحفظة',
        library_nav: 'المكتبة',
        track_nav: 'التتبع',
        print_nav: 'الطباعة',
        support_nav: 'الدعم',
        teacher_nav: 'المعلم',
        inks_nav: 'الحبر',
        settings_nav: 'الاعدادات',
        home: 'الرئيسية',
        wallet_btn: 'المحفظة',
        library_btn: 'المكتبة',
        orders_btn: 'طلباتي',
        login_title: 'تسجيل الدخول',
        login_btn: 'دخول',
        back: 'رجوع'
    },
    ku: {
        student_gate: 'دروازەی قوتابی',
        student_desc: 'بەڕێوەبردنی داواکارییەکان',
        wallet_gate: 'سندووق',
        wallet_desc: 'بەڕێوەبردنی هاوکێشەکەت',
        login_gate: 'چوونەژوورەوە',
        login_desc: 'بچۆ ژوورەوە یان هەژمارێک دروست بکە',
        my_orders: 'داواکارییەکانم',
        wallet_nav: 'سندووق',
        library_nav: 'پەرتووکخانە',
        track_nav: 'بینین',
        print_nav: 'چاپکردن',
        support_nav: 'پشتگری',
        teacher_nav: 'مامۆستا',
        inks_nav: 'مرەج',
        settings_nav: 'ڕێکخستنەکان',
        home: 'سەرەتا',
        wallet_btn: 'سندووق',
        library_btn: 'پەرتووکخانە',
        orders_btn: 'داواکارییەکان',
        login_title: 'چوونەژوورەوە',
        login_btn: 'بچۆ ژوورەوە',
        back: 'گەڕانەوە'
    },
    en: {
        student_gate: 'Student Portal',
        student_desc: 'Manage your orders and track printing',
        wallet_gate: 'Wallet',
        wallet_desc: 'Manage your balance and transfers',
        login_gate: 'Login',
        login_desc: 'Sign in or create account',
        my_orders: 'My Orders',
        wallet_nav: 'Wallet',
        library_nav: 'Library',
        track_nav: 'Track',
        print_nav: 'Print',
        support_nav: 'Support',
        teacher_nav: 'Teacher',
        inks_nav: 'Inks',
        settings_nav: 'Settings',
        home: 'Home',
        wallet_btn: 'Wallet',
        library_btn: 'Library',
        orders_btn: 'My Orders',
        login_title: 'Login',
        login_btn: 'Sign In',
        back: 'Back'
    }
};

const I18n = {
    current: 'ar',
    
    set(lang) {
        if (!translations[lang]) return;
        this.current = lang;
        this.apply();
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
    },
    
    apply() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (translations[this.current][key]) {
                el.textContent = translations[this.current][key];
            }
        });
    },
    
    t(key) {
        return translations[this.current][key] || key;
    }
};

window.I18n = I18n;
window.i18nSet = (l) => I18n.set(l);
