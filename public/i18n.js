/**
 * TECHOPRINT 2026 - i18n (Multi-Language Support)
 * Arabic, Kurdish, English with RTL/LTR Support
 */

const translations = {
    ar: {
        // Navigation
        'nav.dashboard': 'لوحة التحكم',
        'nav.wallet': 'المحفظة',
        'nav.library': 'المكتبة',
        'nav.orders': 'الطلبات',
        'nav.transfer': 'التحويل',
        'nav.tracking': 'تتبع الطلب',
        'nav.designer': 'المصممون',
        'nav.support': 'الدعم',
        'nav.home': 'الرئيسية',
        'nav.adminDashboard': 'الرقابة المالية',
        'nav.adminUsers': 'إدارة المستخدمين',
        'nav.adminDelivery': 'إدارة التوصيل',
        
        // Common
        'common.back': 'رجوع',
        'common.more': 'المزيد',
        'common.admin': 'لوحة الأدمن',
        'common.loading': 'جاري التحميل...',
        'common.save': 'حفظ',
        'common.cancel': 'إلغاء',
        'common.delete': 'حذف',
        'common.edit': 'تعديل',
        'common.view': 'عرض',
        'common.submit': 'إرسال',
        
        // Auth
        'auth.registerTitle': 'إنشاء حساب جديد',
        'auth.loginTitle': 'تسجيل الدخول',
        'auth.fullName': 'الاسم الكامل',
        'auth.fullNamePlaceholder': 'أدخل اسمك الكامل',
        'auth.emailField': 'البريد الإلكتروني',
        'auth.phone': 'رقم الهاتف',
        'auth.phoneHint': 'ابدأ من الرقم 7 - مثال: 7701234567',
        'auth.password': 'كلمة المرور',
        'auth.confirmPassword': 'تأكيد كلمة المرور',
        'auth.role': 'الدور',
        'auth.registerButton': 'إنشاء حساب',
        'auth.loginButton': 'دخول',
        'auth.joinEmpire': 'انضم إلى TECHOPRINT 2026',
        'auth.haveAccount': 'لديك حساب؟',
        'auth.noAccount': 'ليس لديك حساب؟',
        'auth.loginNow': 'تسجيل الدخول',
        'auth.registerNow': 'سجل الآن',
        'auth.logout': 'تسجيل الخروج',
        
        // Roles
        'roles.student': 'طالب',
        'roles.teacher': 'معلم',
        'roles.admin': 'مدير',
        'roles.designer': 'مصمم',
        'roles.guest': 'زائر',
        
        // Dashboard
        'dashboard.welcome': 'مرحباً بك في',
        'dashboard.techoprint': 'TECHOPRINT 2026',
        'dashboard.subtitle': 'المنصة التعليمية الأولى في العراق - الطباعة والتوصيل',
        'dashboard.totalOrders': 'إجمالي الطلبات',
        'dashboard.totalBooks': 'الكتب المتاحة',
        'dashboard.activeOrders': 'طلبات نشطة',
        'dashboard.myWallet': 'المحفظة',
        'dashboard.browseLibrary': 'تصفح المكتبة',
        'dashboard.transferBalance': 'تحويل رصيد',
        'dashboard.trackOrder': 'تتبع الطلب',
        'dashboard.recentActivity': 'آخر النشاطات',
        'dashboard.noActivity': 'لا توجد نشاطات حتى الآن',
        
        // Wallet
        'wallet.title': '💰 محفظتي الذهبية',
        'wallet.balance': 'الرصيد:',
        'wallet.deposit': 'إيداع',
        'wallet.withdraw': 'سحب',
        'wallet.transactionHistory': 'سجل المعاملات',
        'wallet.noTransactions': 'لا توجد معاملات حتى الآن',
        'wallet.currentBalance': 'الرصيد الحالي',
        
        // Library
        'library.searchPlaceholder': '🔍 البحث في المكتبة...',
        'library.allSubjects': 'جميع المواد',
        'library.math': 'الرياضيات',
        'library.science': 'العلوم',
        'library.arabic': 'العربية',
        'library.english': 'الإنجليزية',
        'library.allGrades': 'جميع الصفوف',
        'library.noBooks': 'لا توجد كتب',
        
        // Orders
        'orders.title': '📦 طلباتي',
        'orders.all': 'الكل',
        'orders.pending': 'معلق',
        'orders.processing': 'قيد التنفيذ',
        'orders.outForDelivery': 'قيد التوصيل',
        'orders.delivered': 'تم التوصيل',
        'orders.noOrders': 'لا توجد طلبات',
        
        // Transfer
        'transfer.title': '🔄 تحويل رصيد',
        'transfer.recipientId': 'معرف المستخدم المستلم',
        'transfer.recipientPlaceholder': 'معرف المستخدم أو البريد الإلكتروني',
        'transfer.amount': 'المبلغ',
        'transfer.amountPlaceholder': 'أدخل المبلغ',
        'transfer.currency': 'العملة',
        'transfer.description': 'الوصف (اختياري)',
        'transfer.descriptionPlaceholder': 'أضف ملاحظة...',
        'transfer.submit': 'إرسال التحويل',
        'transfer.success': 'تم التحويل بنجاح!',
        
        // Tracking
        'tracking.title': '📍 تتبع الطلب',
        'tracking.orderNumber': 'رقم الطلب',
        'tracking.orderNumberPlaceholder': 'أدخل رقم الطلب',
        'tracking.track': 'تتبع',
        'tracking.notFound': 'لم يتم العثور على الطلب',
        
        // Support
        'support.title': '🎫 فتح تذكرة دعم',
        'support.type': 'نوع المشكلة',
        'support.general': 'استفسار عام',
        'support.receiptIssue': 'مشكلة في إيصال',
        'support.deliveryIssue': 'مشكلة في التوصيل',
        'support.customDesign': 'طلب تصميم مخصص',
        'support.subject': 'الموضوع',
        'support.subjectPlaceholder': 'موضوع التذكرة',
        'support.description': 'الوصف',
        'support.descriptionPlaceholder': 'وصف المشكلة...',
        'support.submit': 'إرسال التذكرة',
        'support.myTickets': 'تذاكري',
        
        // Designer
        'designer.title': '🎨 المصممون والمؤلفون',
        
        // Portal
        'portal.tagline': 'The Sovereign Educational Empire',
        'portal.subtitle': 'Choose your gateway to the empire',
        'portal.studentTitle': '🎓 بوابة الطالب',
        'portal.studentDesc': 'Your 4 Pillars: Library, Orders, Tracking, Upload',
        'portal.teacherTitle': '📚 Teacher Portal',
        'portal.designerTitle': '🎨 Designer Studio',
        'portal.publisherTitle': '📖 Publisher Portal',
        'portal.libraryTitle': '🌍 Global Library',
        'portal.aiTitle': '🤖 AI Center',
        'portal.deliveryTitle': '🚚 Delivery Portal',
        'portal.adminTitle': '👑 Sovereign Control',
        'portal.guestTitle': '👤 Guest Portal',
        'portal.langAR': 'العربية',
        'portal.langKU': 'کوردی',
        'portal.langEN': 'English',
        'portal.enterStudent': 'دخول الطالب',
        'portal.studentDash': 'بوابة الطالب',
        'portal.p1Title': '📚 المكتبة العالمية',
        'portal.p2Title': '📦 طلباتي',
        'portal.p3Title': '🚚 تتبع التوصيل',
        'portal.p4Title': '📤 مركز الرفع',
        'portal.fLibrary': 'المكتبة',
        'portal.fOrders': 'طلباتي',
        'portal.fTracking': 'التتبع',
        'portal.fUpload': 'رفع ملفات',
        'portal.browse': 'تصفح المكتبة',
        'portal.viewOrders': 'عرض الطلبات',
        'portal.openMap': 'فتح الخريطة',
        'portal.submitFile': 'إرسال للطباعة',
        'portal.pending': 'معلق',
        'portal.printing': 'قيد الطباعة',
        'portal.shipped': 'شحن',
        'portal.delivered': 'تم التسليم',
        'portal.priceCalc': 'حاسبة السعر',
        'portal.pages': 'عدد الصفحات',
        'portal.copies': 'عدد النسخ',
        'portal.paperType': 'نوع الورق',
        'portal.a4': 'A4 عادي',
        'portal.totalPrice': 'السعر الكلي',
        'portal.dropFiles': 'أسقط الملفات هنا أو اضغط للرفع',
        
        // Admin
        'admin.financialRadar': 'لوحة الرقابة المالية',
        'admin.totalTransactions': 'إجمالي المعاملات',
        'admin.pendingTransactions': 'المعاملات المعلقة',
        'admin.totalRevenueIQD': 'إجمالي الإيرادات (IQD)',
        'admin.pendingDeposits': 'الإيداعات المعلقة للمراجعة',
        'admin.pendingWithdrawals': 'طلبات السحب المعلقة',
        'admin.serverHealth': 'حالة الخادم',
        'admin.uptime': 'Uptime',
        'admin.memory': 'Memory',
        'admin.userManagement': 'إدارة المستخدمين',
        'admin.deliveryManagement': 'إدارة التوصيل',
        'admin.activeDeliveries': 'التوصيلات النشطة',
        'admin.user': 'المستخدم',
        'admin.email': 'البريد',
        'admin.role': 'الدور',
        'admin.status': 'الحالة',
        'admin.actions': 'إجراءات',
        'admin.approve': 'قبول',
        'admin.reject': 'رفض',
        'admin.active': 'نشط',
        'admin.inactive': 'غير نشط',
        'admin.noPendingDeposits': 'لا توجد إيداعات معلقة ✅',
        'admin.noPendingWithdrawals': 'لا توجد طلبات سحب معلقة ✅',
        
        // Deposit
        'deposit.amount': 'المبلغ بالدينار العراقي (IQD)',
        'deposit.currency': 'العملة',
        'deposit.phone': 'رقم Zain Cash',
        'deposit.refNumber': 'رقم الحوالة',
        'deposit.receipt': 'صورة الإيصال / الوصل',
        'deposit.submit': 'إرسال للإدارة',
        
        // Withdraw
        'withdraw.amount': 'المبلغ بالدينار العراقي (IQD)',
        'withdraw.currency': 'العملة',
        'withdraw.method': 'طريقة الاستلام',
        'withdraw.phone': 'رقم الهاتف',
        'withdraw.details': 'رقم البطاقة / الحساب',
        'withdraw.submit': 'طلب السحب',
        
        // Errors
        'errors.duplicateTransfer': 'رقم الحوالة مستخدم مسبقاً! يرجى إدخال رقم مختلف',
        'errors.invalidPhone': 'رقم الهاتف يجب أن يبدأ بـ 7 ويتكون من 10 أرقام',
        'errors.required': 'هذا الحقل مطلوب',
        'errors.invalidEmail': 'البريد الإلكتروني غير صالح',
        'errors.passwordMismatch': 'كلمة المرور غير متطابقة',
        
        // Messages
        'messages.welcome': 'مرحباً بك في TECHOPRINT 2026!',
        'messages.registerSuccess': 'تم إنشاء الحساب بنجاح!',
        'messages.loginSuccess': 'تم تسجيل الدخول بنجاح!',
        'messages.depositSubmitted': 'تم إرسال طلب الإيداع للمراجعة',
        'messages.withdrawSubmitted': 'تم إرسال طلب السحب',
        'messages.depositApproved': 'تم قبول الإيداع',
        'messages.depositRejected': 'تم رفض الإيداع',
        'messages.transferSuccess': 'تم التحويل بنجاح!',
        'messages.ticketSubmitted': 'تم إرسال التذكرة بنجاح!',
        'messages.error': 'حدث خطأ! يرجى المحاولة مرة أخرى',
        'messages.success': 'تمت العملية بنجاح',
        'messages.logout': 'تم تسجيل الخروج',
        
        // Portal
        'portal.tagline': 'The Sovereign Educational Empire',
        'portal.subtitle': 'Choose your gateway to the empire',
        'portal.studentTitle': '🎓 بوابة الطالب',
        'portal.studentDesc': 'Your 4 Pillars: Library, Orders, Tracking, Upload',
        'portal.enterStudent': 'دخول الطالب',
        'portal.fLibrary': 'المكتبة',
        'portal.fOrders': 'طلباتي',
        'portal.fTracking': 'التتبع',
        'portal.fUpload': 'رفع ملفات',
        'portal.langAR': 'العربية',
        'portal.langKU': 'کوردی',
        'portal.langEN': 'English'
    },
    
    ku: {
        // Navigation
        'nav.dashboard': 'داشبۆرد',
        'nav.wallet': 'تەلەفۆن',
        'nav.library': 'پارەگە',
        'nav.orders': 'داواکارییەکان',
        'nav.transfer': 'گواستنەوە',
        'nav.tracking': 'هەڵسووڕێنان',
        'nav.designer': 'دیزاینەر',
        'nav.support': 'پشتیوانی',
        'nav.home': 'سەرەتا',
        'nav.adminDashboard': 'سەرپەرشتی دارایی',
        'nav.adminUsers': 'بەڕێوەبەردی بەکارهێنەران',
        'nav.adminDelivery': 'بەڕێوەبەردی گەیاندن',
        
        // Common
        'common.back': 'گەڕانەوە',
        'common.more': 'هەڵبژاردن',
        'common.admin': 'بەڕێوەبەر',
        
        // Auth
        'auth.registerTitle': 'دروستکردنی هەژمار',
        'auth.loginTitle': 'چوونەژوورەوە',
        'auth.fullName': 'ناوی تەواو',
        'auth.emailField': 'ئیمەیڵ',
        'auth.phone': 'ژمارەی تەلەفۆن',
        'auth.password': 'وشەی نهێنی',
        'auth.registerButton': 'دروستکردن',
        'auth.loginButton': 'چوونەژوورەوە',
        'auth.haveAccount': 'هەژمارت هەیە؟',
        'auth.noAccount': 'هەژمارت نییە؟',
        'auth.loginNow': 'چوونەژوورەوە',
        'auth.registerNow': 'سەرێتی',
        
        // Roles
        'roles.student': 'قوتابی',
        'roles.teacher': 'مامۆستا',
        'roles.admin': 'بەڕێوەبەر',
        
        // Dashboard
        'dashboard.welcome': 'بەخێربێیت بۆ',
        'dashboard.techoprint': 'TECHOPRINT 2026',
        'dashboard.subtitle': 'پلاتفۆرمی فێرکاری یەکەم لە عێراق',
        'dashboard.totalOrders': 'کۆی داواکارییەکان',
        'dashboard.totalBooks': 'پارەگە بەردەست',
        'dashboard.activeOrders': 'داواکاری چالاک',
        'dashboard.myWallet': 'تەلەفۆنم',
        'dashboard.browseLibrary': 'بینینی پارەگە',
        'dashboard.transferBalance': 'گواستنەوەی ژمارە',
        'dashboard.trackOrder': 'هەڵسووڕێنان',
        'dashboard.recentActivity': 'چالاکی دوا',
        'dashboard.noActivity': 'هیچ چالاکییەک نییە',
        
        // Wallet
        'wallet.title': '💰 پارەholeی زێڕین',
        'wallet.balance': 'ژمارە:',
        'wallet.deposit': 'پارەدان',
        'wallet.withdraw': 'ئە withdrawalولەوەگرتن',
        'wallet.transactionHistory': 'مێژووی گواستنەوە',
        'wallet.noTransactions': 'هیچ گواستنەوەیەک نییە',
        
        // Messages
        'messages.welcome': 'بەخێربێیت بۆ TECHOPRINT 2026!',
        'messages.registerSuccess': 'هەژمار دروستکرا!',
        'messages.loginSuccess': 'بە سەرکەوتوویی چوویتە ژوورەوە!',
        'messages.error': 'هەڵەیەک ڕوویدا!',
        'messages.success': 'بە سەرکەوتوویی تەواو بوو'
    },
    
    en: {
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.wallet': 'Wallet',
        'nav.library': 'Library',
        'nav.orders': 'Orders',
        'nav.transfer': 'Transfer',
        'nav.tracking': 'Tracking',
        'nav.designer': 'Designers',
        'nav.support': 'Support',
        'nav.home': 'Home',
        'nav.adminDashboard': 'Financial Control',
        'nav.adminUsers': 'User Management',
        'nav.adminDelivery': 'Delivery Management',
        
        // Common
        'common.back': 'Back',
        'common.more': 'More',
        'common.admin': 'Admin Panel',
        
        // Auth
        'auth.registerTitle': 'Create Account',
        'auth.loginTitle': 'Login',
        'auth.fullName': 'Full Name',
        'auth.emailField': 'Email',
        'auth.phone': 'Phone Number',
        'auth.password': 'Password',
        'auth.registerButton': 'Register',
        'auth.loginButton': 'Login',
        'auth.haveAccount': 'Have an account?',
        'auth.noAccount': "Don't have an account?",
        'auth.loginNow': 'Login',
        'auth.registerNow': 'Register Now',
        
        // Roles
        'roles.student': 'Student',
        'roles.teacher': 'Teacher',
        'roles.admin': 'Admin',
        
        // Dashboard
        'dashboard.welcome': 'Welcome to',
        'dashboard.techoprint': 'TECHOPRINT 2026',
        'dashboard.subtitle': 'The First Educational Platform in Iraq',
        'dashboard.totalOrders': 'Total Orders',
        'dashboard.totalBooks': 'Available Books',
        'dashboard.activeOrders': 'Active Orders',
        'dashboard.myWallet': 'My Wallet',
        'dashboard.browseLibrary': 'Browse Library',
        'dashboard.transferBalance': 'Transfer Balance',
        'dashboard.trackOrder': 'Track Order',
        'dashboard.recentActivity': 'Recent Activity',
        'dashboard.noActivity': 'No activities yet',
        
        // Wallet
        'wallet.title': '💰 My Golden Wallet',
        'wallet.balance': 'Balance:',
        'wallet.deposit': 'Deposit',
        'wallet.withdraw': 'Withdraw',
        'wallet.transactionHistory': 'Transaction History',
        'wallet.noTransactions': 'No transactions yet',
        
        // Messages
        'messages.welcome': 'Welcome to TECHOPRINT 2026!',
        'messages.registerSuccess': 'Account created successfully!',
        'messages.loginSuccess': 'Logged in successfully!',
        'messages.error': 'An error occurred!',
        'messages.success': 'Success!'
    }
};

class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('techoprint_lang') || 'ar';
        this.translations = translations;
    }
    
    init() {
        this.applyLanguage(this.currentLang);
        this.updateUITranslations();
    }
    
    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('techoprint_lang', lang);
        this.applyLanguage(lang);
        this.updateUITranslations();
    }
    
    applyLanguage(lang) {
        const html = document.documentElement;
        
        // Apply RTL/LTR
        if (lang === 'ar' || lang === 'ku') {
            html.setAttribute('dir', 'rtl');
        } else {
            html.setAttribute('dir', 'ltr');
        }
        
        // Set lang attribute
        html.setAttribute('lang', lang);
        
        // Update language switcher buttons
        document.querySelectorAll('[data-lang]').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
            }
        });
        
        // Trigger language change event
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }
    
    updateUITranslations() {
        // Translate elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation) {
                el.textContent = translation;
            }
        });
        
        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);
            if (translation) {
                el.placeholder = translation;
            }
        });
    }
    
    t(key, fallback = '') {
        const lang = this.currentLang;
        return this.translations[lang]?.[key] || this.translations['ar']?.[key] || fallback || key;
    }
    
    getRoleName(role) {
        const roles = {
            'student': this.t('roles.student'),
            'teacher': this.t('roles.teacher'),
            'admin': this.t('roles.admin'),
            'designer': this.t('roles.designer'),
            'guest': this.t('roles.guest')
        };
        return roles[role] || role;
    }
    
    reload() {
        this.updateUITranslations();
    }
}

window.i18n = new I18n();

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    if (window.i18n) {
        window.i18n.init();
    }
});