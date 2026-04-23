/**
 * TECHOPRINT 2026 - i18n (Multi-Language Support)
 * Arabic, Kurdish, English with RTL/LTR Support
 * Global sync across all sections
 */

const translations = {
    ar: {
        // Hero Section
        'hero.tagline': 'Techno Print 2026',
        'hero.subtitle': 'إعادة تعريف مستقبل الطباعة التعليمية في العراق',
        'hero.metrics': 'الدقة في كل بكسل',
        
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
        'common.login': 'تسجيل الدخول',
        'common.register': 'سجل الآن',
        'common.loading2': 'جاري التحميل...',
        'common.enter': 'دخول',
        'common.enterAdmin': 'دخول كمدير',
        
        // Auth
        'auth.registerTitle': 'إنشاء حساب جديد',
        'auth.loginTitle': 'تسجيل الدخول',
        'auth.username': 'اسم المستخدم',
        'auth.usernamePlaceholder': 'اختر اسماً مستعارة',
        'auth.fullName': 'الاسم الكامل',
        'auth.fullNamePlaceholder': 'أدخل اسمك الكامل',
        'auth.emailField': 'البريد الإلكتروني (اختياري)',
        'auth.phone': 'رقم الهاتف',
        'auth.phoneHint': 'ابدأ من الرقم 7 - مثال: 7701234567',
        'auth.password': 'كلمة المرور',
        'auth.confirmPassword': 'تأكيد كلمة المرور',
        'auth.role': 'الدور',
        'auth.governorate': 'المحافظة / العنوان',
        'auth.loginRequiredForOrder': 'يرجى تسجيل الدخول لإجراء الطلب',
        'auth.loginRequiredForPurchase': 'يرجى تسجيل الدخول للشراء',
        'auth.registerButton': 'إنشاء حساب',
        'auth.loginButton': 'دخول',
        'auth.loginInput': 'اسم المستخدم أو البريد',
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
        
        // Portal - All 9 Gates
        'portal.tagline': 'الإمبراطورية التعليمية السيادية',
        'portal.subtitle': 'اختر بوابتك إلى الإمبراطورية',
        'portal.studentTitle': '🎓 بوابة الطالب',
        'portal.studentDesc': '4 ركائز: المكتبة، الطلبات، التتبع، رفع الملفات',
        'portal.enterStudent': 'دخول الطالب',
        'portal.teacherTitle': '📚 بوابة المعلم',
        'portal.teacherDesc': 'رفع المحاضرات - إدارة الطلاب',
        'portal.designerTitle': '🎨 استوديو المصمم',
        'portal.designerDesc': 'تصاميم مخصصة - معرض الأعمال',
        'portal.publisherTitle': '📖 بوابة الناشر',
        'portal.publisherDesc': 'إدارة الكتب - عرض الأرباح',
        'portal.libraryTitle': '🌍 المكتبة العامة',
        'portal.libraryDesc': 'جميع الكتب - الترجمات',
        'portal.aiTitle': '🤖 مركز الذكاء الاصطناعي',
        'portal.aiDesc': 'التحليلات - التنبؤات',
        'portal.deliveryTitle': '🚚 بوابة التوصيل',
        'portal.deliveryDesc': 'GPS - الخريطة الحية',
        'portal.adminTitle': '👑 الرقابة السيادية',
        'portal.adminDesc': 'تحكم كامل - الرادار المالي',
        'portal.guestTitle': '👤 بوابة الضيف',
        'portal.guestDesc': 'تصفح فقط',
        'portal.langAR': 'العربية',
        'portal.langKU': 'کوردی',
        'portal.langEN': 'English',
        'portal.fLibrary': 'المكتبة',
        'portal.fOrders': 'طلباتي',
        'portal.fTracking': 'التتبع',
        'portal.fUpload': 'رفع ملفات',
        'portal.enter': 'دخول',
        'portal.enterAsAdmin': 'دخول كمدير',
        
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
        
        // Library
        'library.searchPlaceholder': '🔍 البحث في المكتبة...',
        'library.allSubjects': 'جميع المواد',
        'library.math': 'الرياضيات',
        'library.science': 'العلوم',
        'library.arabic': 'العربية',
        'library.english': 'الإنجليزية',
        'library.allGrades': 'جميع الصفوف',
        'library.noBooks': 'لا توجد كتب',
        'library.grades': 'جميع الصفوف',
        'library.grade1': 'الصف الأول',
        'library.grade2': 'الصف الثاني',
        'library.grade3': 'الصف الثالث',
        'library.buy': 'شراء',
        
        // Orders
        'orders.title': '📦 طلباتي',
        'orders.all': 'الكل',
        'orders.pending': 'معلق',
        'orders.processing': 'قيد التنفيذ',
        'orders.outForDelivery': 'قيد التوصيل',
        'orders.delivered': 'تم التوصيل',
        'orders.noOrders': 'لا توجد طلبات',
        'orders.buyNow': 'اشترِ الآن',
        'orders.orderNow': 'اطلب الآن',
        
        // Wallet
        'wallet.title': '💰 محفظتي الذهبية',
        'wallet.balance': 'الرصيد:',
        'wallet.deposit': 'إيداع',
        'wallet.withdraw': 'سحب',
        'wallet.transactionHistory': 'سجل المعاملات',
        'wallet.noTransactions': 'لا توجد معاملات حتى الآن',
        'wallet.currentBalance': 'الرصيد الحالي',
        
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
        'deposit.proof': 'إثبات السحب (وصل الحوالة)',
        
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
        'errors.usernameRequired': 'اسم المستخدم مطلوب (3 أحرف على الأقل)',
        
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
        'messages.addedToCart': 'تمت إضافة %s للسلة!',
        'messages.withdrawProofRequired': 'يرجى رفع صورة إثبات السحب أولاً!',
        'messages.withdrawApproved': 'تم قبول طلب السحب ورفع الإثبات بنجاح!'
    },
    
    ku: {
        // Hero Section
        'hero.tagline': 'Techno Print 2026',
        'hero.subtitle': 'لێدانی عێراقی ژمارەیی لە چاپکردنی فێرکاری',
        'hero.metrics': 'وردی • خێرایی • نوآوری',
        
        // Navigation
        'nav.dashboard': 'داشبۆرد',
        'nav.wallet': 'سەیوە',
        'nav.library': 'پارەگە',
        'nav.orders': 'داواکارییەکان',
        'nav.transfer': 'گواستنەوە',
        'nav.tracking': 'هەڵسووڕێنان',
        'nav.designer': 'دیزاینەر',
        'nav.support': 'پشتیوانی',
        'nav.home': 'سەرەتا',
        'nav.adminDashboard': 'کۆنتڕۆڵی دارایی',
        'nav.adminUsers': 'بەڕێوەبردنی بەکارهێنەران',
        'nav.adminDelivery': 'بەڕێوەبردنی گەیاندن',
        
        // Common
        'common.back': 'گەڕانەوە',
        'common.more': 'زیاتر',
        'common.admin': 'پانێلی ئەدمین',
        'common.loading': 'باردەکردن...',
        'common.save': 'پاراستن',
        'common.cancel': 'پاشگەزبوونەوە',
        'common.delete': 'سڕینەوە',
        'common.edit': 'دەستکاری',
        'common.view': 'بینین',
        'common.submit': 'ناردن',
        'common.login': 'چوونەژوورەوە',
        'common.register': 'تۆمارکردن',
        'common.loading2': 'باردەکردن...',
        'common.enter': 'داخلی',
        'common.enterAdmin': 'داخلی وەک ئەدمین',
        
        // Auth
        'auth.registerTitle': 'دروستکردنی هەژمار',
        'auth.loginTitle': 'چوونەژوورەوە',
        'auth.username': 'ناوی بەکارهێنەر',
        'auth.usernamePlaceholder': 'ناوێک هەڵبژێرە',
        'auth.fullName': 'ناوی تەواو',
        'auth.fullNamePlaceholder': 'ناوی تەواوت بنووسە',
        'auth.emailField': 'ئیمەیڵ (ئارەزەمندە)',
        'auth.phone': 'ژمارەی تەلەفۆن',
        'auth.phoneHint': 'بە 7 دەست پێبکە',
        'auth.password': 'وشەی نهێنی',
        'auth.confirmPassword': 'دووپاتکردنەوەی وشەی نهێنی',
        'auth.role': 'ڕۆڵ',
        'auth.governorate': 'پارێزگا',
        'auth.loginRequiredForOrder': 'تکایە بۆ داواکاری چوونەژوورەوە',
        'auth.loginRequiredForPurchase': 'تکایە بۆ کڕین چوونەژوورەوە',
        'auth.registerButton': 'دروستکردن',
        'auth.loginButton': 'چوونەژوورەوە',
        'auth.loginInput': 'ناوی بەکارهێنەر یان ئیمەیڵ',
        'auth.joinEmpire': 'پەیوەست بە TECHOPRINT 2026',
        'auth.haveAccount': 'هەژمارت هەیە؟',
        'auth.noAccount': 'هەژمارت نییە؟',
        'auth.loginNow': 'چوونەژوورەوە',
        'auth.registerNow': 'تۆمارکردن',
        'auth.logout': 'چوونەدەرەوە',
        
        // Roles
        'roles.student': 'خوێندکار',
        'roles.teacher': 'مامۆستا',
        'roles.admin': 'ئەدمین',
        'roles.designer': 'دیزاینەر',
        'roles.guest': 'میوان',
        
        // Portal - All 9 Gates
        'portal.tagline': 'ئیمپراتۆریەتی فێرکاری سەروەر',
        'portal.subtitle': 'دروازەکەت هەڵبژێرە',
        'portal.studentTitle': '🎓 دروازەی خوێندکار',
        'portal.studentDesc': '4 ستوونەکەت: پارەگە، داواکارییەکان، هەڵسووڕێنان، بارکردن',
        'portal.enterStudent': 'داخلی خوێندکار',
        'portal.teacherTitle': '📚 دروازەی مامۆستا',
        'portal.teacherDesc': 'بارکردنی وانەکان - بەڕێوەبردنی خوێندکاران',
        'portal.designerTitle': '🎨 ستۆدیۆی دیزاینەر',
        'portal.designerDesc': 'دیزاینی تایبەت - پۆرتفۆلیۆ',
        'portal.publisherTitle': '📖 دروازەی بڵاوکەرەوە',
        'portal.publisherDesc': 'بەڕێوەبردنی کتێبەکان - بینینی قازانج',
        'portal.libraryTitle': '🌍 پارەگەی گشتی',
        'portal.libraryDesc': 'هەموو کتێبەکان - وەرگێڕان',
        'portal.aiTitle': '🤖 ناوەندی AI',
        'portal.aiDesc': 'شیکردنەوە - پێشبینی',
        'portal.deliveryTitle': '🚚 دروازەی گەیاندن',
        'portal.deliveryDesc': 'GPS - نقشەی ژیان',
        'portal.adminTitle': '👑 کۆنتڕۆڵی سەروەر',
        'portal.adminDesc': 'کۆنتڕۆڵی تەواو - ڕاداری دارایی',
        'portal.guestTitle': '👤 دروازەی میوان',
        'portal.guestDesc': 'تەنها بینین',
        'portal.langAR': 'عربی',
        'portal.langKU': 'کوردی',
        'portal.langEN': 'ئینگلیزی',
        'portal.fLibrary': 'پارەگە',
        'portal.fOrders': 'داواکارییەکان',
        'portal.fTracking': 'هەڵسووڕێنان',
        'portal.fUpload': 'بارکردن',
        'portal.enter': 'داخلی',
        'portal.enterAsAdmin': 'داخلی وەک ئەدمین',
        
        // Dashboard
        'dashboard.welcome': 'بەخێربێیت بۆ',
        'dashboard.techoprint': 'TECHOPRINT 2026',
        'dashboard.subtitle': 'یەکەم پلاتفۆرمی فێرکاری لە عێراق',
        'dashboard.totalOrders': 'هەموو داواکارییەکان',
        'dashboard.totalBooks': 'کتێبە بەردەستەکان',
        'dashboard.activeOrders': 'داواکارییە چالاکەکان',
        'dashboard.myWallet': 'سەیوەکەم',
        'dashboard.browseLibrary': 'پارەگە',
        'dashboard.transferBalance': 'گواستنەوەی ڕاسەوار',
        'dashboard.trackOrder': 'هەڵسووڕێنانی داواکاری',
        'dashboard.recentActivity': 'چالاکی دوایین',
        'dashboard.noActivity': 'هیچ چالاکییەک نییە',
        
        // Library
        'library.searchPlaceholder': '🔍 گەڕان لە پارەگە...',
        'library.allSubjects': 'هەموو بەشەکان',
        'library.math': 'بیرکاری',
        'library.science': 'زانست',
        'library.arabic': 'عربی',
        'library.english': 'ئینگلیزی',
        'library.allGrades': 'هەموو پۆلەکان',
        'library.noBooks': 'کتێب نەدۆزرایەوە',
        'library.grades': 'هەموو پۆلەکان',
        'library.grade1': 'پۆلی یەکەم',
        'library.grade2': 'پۆلی دووەم',
        'library.grade3': 'پۆلی سێیەم',
        'library.buy': 'کڕین',
        
        // Orders
        'orders.title': '📦 داواکارییەکانم',
        'orders.all': 'هەموو',
        'orders.pending': 'چاوەڕێ',
        'orders.processing': 'لەبەرکردن',
        'orders.outForDelivery': 'لە گەیاندن',
        'orders.delivered': 'گەییشت',
        'orders.noOrders': 'هیچ داواکاریەک نییە',
        'orders.buyNow': 'کڕین',
        'orders.orderNow': 'داواکردن',
        
        // Wallet
        'wallet.title': '💰 سەیوەکەم',
        'wallet.balance': 'ڕاسەوار:',
        'wallet.deposit': 'پارەدان',
        'wallet.withdraw': 'ڕاکێشان',
        'wallet.transactionHistory': 'مێژووی گواستنەوە',
        'wallet.noTransactions': 'هیچ گواستنەوەیەک نییە',
        'wallet.currentBalance': 'ڕاسەواری ئێستا',
        
        // Transfer
        'transfer.title': '🔄 گواستنەوەی ڕاسەوار',
        'transfer.recipientId': 'IDی بەکارهێنەر',
        'transfer.recipientPlaceholder': 'ناو یان ئیمەیڵ',
        'transfer.amount': 'بڕ',
        'transfer.amountPlaceholder': 'بڕ بنووسە',
        'transfer.currency': 'دراو',
        'transfer.description': 'وەسف (ئارەزەمندە)',
        'transfer.descriptionPlaceholder': 'تێبینی زیاد بکە...',
        'transfer.submit': 'ناردنی گواستنەوە',
        'transfer.success': 'گواستنەوە بە سەرکەوتوویی!',
        
        // Tracking
        'tracking.title': '📍 هەڵسووڕێنانی داواکاری',
        'tracking.orderNumber': 'ژمارەی داواکاری',
        'tracking.orderNumberPlaceholder': 'ژمارەی داواکاری بنووسە',
        'tracking.track': 'هەڵسووڕێنان',
        'tracking.notFound': 'داواکاری نەدۆزرایەوە',
        
        // Support
        'support.title': '🎫 کردنەوەی تیکێتی پشتیوانی',
        'support.type': 'جۆری کێشە',
        'support.general': 'پرسیاری گشتی',
        'support.receiptIssue': 'کێشەی پسوولە',
        'support.deliveryIssue': 'کێشەی گەیاندن',
        'support.customDesign': 'داواکردنی دیزاینی تایبەت',
        'support.subject': 'بابەت',
        'support.subjectPlaceholder': 'بابەتی تیکێت',
        'support.description': 'وەسف',
        'support.descriptionPlaceholder': 'وەسفی کێشە...',
        'support.submit': 'ناردنی تیکێت',
        'support.myTickets': 'تیکێتەکانم',
        
        // Designer
        'designer.title': '🎨 دیزاینەران و نووسەران',
        
        // Admin
        'admin.financialRadar': 'ڕاداری دارایی',
        'admin.totalTransactions': 'هەموو گواستنەوەکان',
        'admin.pendingTransactions': 'گواستنەوەکانی چاوەڕێ',
        'admin.totalRevenueIQD': 'هەموو ئاڕادە (IQD)',
        'admin.pendingDeposits': 'پارەدانە چاوەڕێکراوەکان',
        'admin.pendingWithdrawals': 'داواکاری ڕاکێشانە چاوەڕێکراوەکان',
        'admin.serverHealth': 'سەروەخزمەت',
        'admin.uptime': 'کاتی کارکردن',
        'admin.memory': 'مێمۆری',
        'admin.userManagement': 'بەڕێوەبردنی بەکارهێنەران',
        'admin.deliveryManagement': 'بەڕێوەبردنی گەیاندن',
        'admin.activeDeliveries': 'گەیاندنە چالاکەکان',
        'admin.user': 'بەکارهێنەر',
        'admin.email': 'ئیمەیڵ',
        'admin.role': 'ڕۆڵ',
        'admin.status': 'دۆخ',
        'admin.actions': 'کردارەکان',
        'admin.approve': 'پەسەندکردن',
        'admin.reject': 'ڕەتکردنەوە',
        'admin.active': 'چالاک',
        'admin.inactive': 'ناچالاک',
        'admin.noPendingDeposits': 'هیچ پارەدانێکی چاوەڕێ نییە ✅',
        'admin.noPendingWithdrawals': 'هیچ داواکاری ڕاکێشانێکی چاوەڕێ نییە ✅',
        
        // Deposit
        'deposit.amount': 'بڕ بە دیناری عێراقی (IQD)',
        'deposit.currency': 'دراو',
        'deposit.phone': 'ژمارەی Zain Cash',
        'deposit.refNumber': 'ژمارەی ڕەسەن',
        'deposit.receipt': 'وێنەی پسوولە',
        'deposit.submit': 'ناردن بۆ بەڕێوەبردن',
        'deposit.proof': 'ئەسڵی ڕاکێشان (وصل الحوالة)',
        
        // Withdraw
        'withdraw.amount': 'بڕ بە دیناری عێراقی (IQD)',
        'withdraw.currency': 'دراو',
        'withdraw.method': 'ڕێگەی وەرگرتن',
        'withdraw.phone': 'ژمارەی تەلەفۆن',
        'withdraw.details': 'ژمارەی کارت/حسێب',
        'withdraw.submit': 'داواکردنی ڕاکێشان',
        
        // Errors
        'errors.duplicateTransfer': 'ژمارەی گواستنەوە بەکارهاتووە! تکایە ژمارەیەکی تر بنووسە',
        'errors.invalidPhone': 'ژمارەی تەلەفۆن دەبێت بە 7 دەست پێبکات',
        'errors.required': 'ئەم خانەیە پێویستە',
        'errors.invalidEmail': 'ئیمەیڵی ناوان',
        'errors.passwordMismatch': 'وشەی نهێنی هاوکێک نییە',
        'errors.usernameRequired': 'ناوی بەکارهێنەر پێویستە (بەلایەنی کەمەوە 3 پیت)',
        
        // Messages
        'messages.welcome': 'بەخێربێیت بۆ TECHOPRINT 2026!',
        'messages.registerSuccess': 'هەژمار بە سەرکەوتوویی دروستکرا!',
        'messages.loginSuccess': 'بە سەرکەوتوویی چوویتە ژوورەوە!',
        'messages.depositSubmitted': 'داواکاری پارەدان نێردرا',
        'messages.withdrawSubmitted': 'داواکاری ڕاکێشان نێردرا',
        'messages.depositApproved': 'پارەدان پەسەندکرا',
        'messages.depositRejected': 'پارەدان ڕەتکرایەوە',
        'messages.transferSuccess': 'گواستنەوە بە سەرکەوتوویی!',
        'messages.ticketSubmitted': 'تیکێت نێردرا!',
        'messages.error': 'کێشەیەک ڕوویدا! تکایە دووبارە هەوڵبدەرەوە',
        'messages.success': 'سەرکەوتوو',
        'messages.logout': 'چوونە دەرەوە',
        'messages.addedToCart': '%s بۆ سەیوە زیادکرا!',
        'messages.withdrawProofRequired': 'تکایە وێنەی ئەسڵی ڕاکێشان باربکە!',
        'messages.withdrawApproved': 'داواکاری ڕاکێشان پەسەندکرا و ئەسڵ بە سەرکەوتوویی باربکرا!'
    },
    
    en: {
        // Hero Section
        'hero.tagline': 'Techno Print 2026',
        'hero.subtitle': "Redefining the Future of Educational Printing in Iraq",
        'hero.metrics': 'Precision in every Pixel',
        
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
        'common.loading': 'Loading...',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.view': 'View',
        'common.submit': 'Submit',
        'common.login': 'Login',
        'common.register': 'Register',
        'common.loading2': 'Loading...',
        'common.enter': 'Enter',
        'common.enterAdmin': 'Enter as Admin',
        
        // Auth
        'auth.registerTitle': 'Create Account',
        'auth.loginTitle': 'Login',
        'auth.username': 'Username',
        'auth.usernamePlaceholder': 'Choose a username',
        'auth.fullName': 'Full Name',
        'auth.fullNamePlaceholder': 'Enter your full name',
        'auth.emailField': 'Email (Optional)',
        'auth.phone': 'Phone Number',
        'auth.phoneHint': 'Start with 7 - Example: 7701234567',
        'auth.password': 'Password',
        'auth.confirmPassword': 'Confirm Password',
        'auth.role': 'Role',
        'auth.governorate': 'Governorate',
        'auth.loginRequiredForOrder': 'Please login to place an order',
        'auth.loginRequiredForPurchase': 'Please login to purchase',
        'auth.registerButton': 'Register',
        'auth.loginButton': 'Login',
        'auth.loginInput': 'Username or Email',
        'auth.joinEmpire': 'Join TECHOPRINT 2026',
        'auth.haveAccount': 'Have an account?',
        'auth.noAccount': "Don't have an account?",
        'auth.loginNow': 'Login',
        'auth.registerNow': 'Register Now',
        'auth.logout': 'Logout',
        
        // Roles
        'roles.student': 'Student',
        'roles.teacher': 'Teacher',
        'roles.admin': 'Admin',
        'roles.designer': 'Designer',
        'roles.guest': 'Guest',
        
        // Portal - All 9 Gates
        'portal.tagline': 'The Sovereign Educational Empire',
        'portal.subtitle': 'Choose your gateway to the empire',
        'portal.studentTitle': '🎓 Student Portal',
        'portal.studentDesc': 'Your 4 Pillars: Library, Orders, Tracking, Upload',
        'portal.enterStudent': 'Enter Student',
        'portal.teacherTitle': '📚 Teacher Portal',
        'portal.teacherDesc': 'Upload lectures - Manage students',
        'portal.designerTitle': '🎨 Designer Studio',
        'portal.designerDesc': 'Custom designs - Portfolio',
        'portal.publisherTitle': '📖 Publisher Portal',
        'portal.publisherDesc': 'Manage books - View profits',
        'portal.libraryTitle': '🌍 Global Library',
        'portal.libraryDesc': 'All books - Translations',
        'portal.aiTitle': '🤖 AI Center',
        'portal.aiDesc': 'Analytics - Predictions',
        'portal.deliveryTitle': '🚚 Delivery Portal',
        'portal.deliveryDesc': 'GPS - Live map',
        'portal.adminTitle': '👑 Sovereign Control',
        'portal.adminDesc': 'Full control - Financial radar',
        'portal.guestTitle': '👤 Guest Portal',
        'portal.guestDesc': 'Browse only',
        'portal.langAR': 'Arabic',
        'portal.langKU': 'Kurdish',
        'portal.langEN': 'English',
        'portal.fLibrary': 'Library',
        'portal.fOrders': 'Orders',
        'portal.fTracking': 'Tracking',
        'portal.fUpload': 'Upload',
        'portal.enter': 'Enter',
        'portal.enterAsAdmin': 'Enter as Admin',
        
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
        
        // Library
        'library.searchPlaceholder': '🔍 Search the library...',
        'library.allSubjects': 'All Subjects',
        'library.math': 'Mathematics',
        'library.science': 'Science',
        'library.arabic': 'Arabic',
        'library.english': 'English',
        'library.allGrades': 'All Grades',
        'library.noBooks': 'No books found',
        'library.grades': 'All Grades',
        'library.grade1': 'Grade 1',
        'library.grade2': 'Grade 2',
        'library.grade3': 'Grade 3',
        'library.buy': 'Buy',
        
        // Orders
        'orders.title': '📦 My Orders',
        'orders.all': 'All',
        'orders.pending': 'Pending',
        'orders.processing': 'Processing',
        'orders.outForDelivery': 'Out for Delivery',
        'orders.delivered': 'Delivered',
        'orders.noOrders': 'No orders yet',
        'orders.buyNow': 'Buy Now',
        'orders.orderNow': 'Order Now',
        
        // Wallet
        'wallet.title': '💰 My Golden Wallet',
        'wallet.balance': 'Balance:',
        'wallet.deposit': 'Deposit',
        'wallet.withdraw': 'Withdraw',
        'wallet.transactionHistory': 'Transaction History',
        'wallet.noTransactions': 'No transactions yet',
        'wallet.currentBalance': 'Current Balance',
        
        // Transfer
        'transfer.title': '🔄 Transfer Balance',
        'transfer.recipientId': 'Recipient User ID',
        'transfer.recipientPlaceholder': 'Username or Email',
        'transfer.amount': 'Amount',
        'transfer.amountPlaceholder': 'Enter amount',
        'transfer.currency': 'Currency',
        'transfer.description': 'Description (Optional)',
        'transfer.descriptionPlaceholder': 'Add note...',
        'transfer.submit': 'Send Transfer',
        'transfer.success': 'Transfer successful!',
        
        // Tracking
        'tracking.title': '📍 Track Order',
        'tracking.orderNumber': 'Order Number',
        'tracking.orderNumberPlaceholder': 'Enter order number',
        'tracking.track': 'Track',
        'tracking.notFound': 'Order not found',
        
        // Support
        'support.title': '🎫 Open Support Ticket',
        'support.type': 'Issue Type',
        'support.general': 'General Inquiry',
        'support.receiptIssue': 'Receipt Issue',
        'support.deliveryIssue': 'Delivery Issue',
        'support.customDesign': 'Custom Design Request',
        'support.subject': 'Subject',
        'support.subjectPlaceholder': 'Ticket subject',
        'support.description': 'Description',
        'support.descriptionPlaceholder': 'Issue description...',
        'support.submit': 'Submit Ticket',
        'support.myTickets': 'My Tickets',
        
        // Designer
        'designer.title': '🎨 Designers & Authors',
        
        // Admin
        'admin.financialRadar': 'Financial Radar',
        'admin.totalTransactions': 'Total Transactions',
        'admin.pendingTransactions': 'Pending Transactions',
        'admin.totalRevenueIQD': 'Total Revenue (IQD)',
        'admin.pendingDeposits': 'Pending Deposits',
        'admin.pendingWithdrawals': 'Pending Withdrawals',
        'admin.serverHealth': 'Server Health',
        'admin.uptime': 'Uptime',
        'admin.memory': 'Memory',
        'admin.userManagement': 'User Management',
        'admin.deliveryManagement': 'Delivery Management',
        'admin.activeDeliveries': 'Active Deliveries',
        'admin.user': 'User',
        'admin.email': 'Email',
        'admin.role': 'Role',
        'admin.status': 'Status',
        'admin.actions': 'Actions',
        'admin.approve': 'Approve',
        'admin.reject': 'Reject',
        'admin.active': 'Active',
        'admin.inactive': 'Inactive',
        'admin.noPendingDeposits': 'No pending deposits ✅',
        'admin.noPendingWithdrawals': 'No pending withdrawals ✅',
        
        // Deposit
        'deposit.amount': 'Amount in Iraqi Dinar (IQD)',
        'deposit.currency': 'Currency',
        'deposit.phone': 'Zain Cash Number',
        'deposit.refNumber': 'Reference Number',
        'deposit.receipt': 'Receipt Image',
        'deposit.submit': 'Submit to Admin',
        'deposit.proof': 'Withdrawal Proof (Transfer Receipt)',
        
        // Withdraw
        'withdraw.amount': 'Amount in Iraqi Dinar (IQD)',
        'withdraw.currency': 'Currency',
        'withdraw.method': 'Receipt Method',
        'withdraw.phone': 'Phone Number',
        'withdraw.details': 'Card/Account Number',
        'withdraw.submit': 'Request Withdrawal',
        
        // Errors
        'errors.duplicateTransfer': 'Transfer reference already used! Please enter a different number',
        'errors.invalidPhone': 'Phone must start with 7 and be 10 digits',
        'errors.required': 'This field is required',
        'errors.invalidEmail': 'Invalid email address',
        'errors.passwordMismatch': 'Passwords do not match',
        'errors.usernameRequired': 'Username required (min 3 characters)',
        
        // Messages
        'messages.welcome': 'Welcome to TECHOPRINT 2026!',
        'messages.registerSuccess': 'Account created successfully!',
        'messages.loginSuccess': 'Logged in successfully!',
        'messages.depositSubmitted': 'Deposit request submitted for review',
        'messages.withdrawSubmitted': 'Withdrawal request submitted',
        'messages.depositApproved': 'Deposit approved',
        'messages.depositRejected': 'Deposit rejected',
        'messages.transferSuccess': 'Transfer successful!',
        'messages.ticketSubmitted': 'Ticket submitted successfully!',
        'messages.error': 'An error occurred! Please try again',
        'messages.success': 'Success!',
        'messages.logout': 'Logged out',
        'messages.addedToCart': '%s added to cart!',
        'messages.withdrawProofRequired': 'Please upload withdrawal proof first!',
        'messages.withdrawApproved': 'Withdrawal request approved and proof uploaded successfully!'
    }
};

// ==================== GLOBAL i18n CLASS ====================
class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('techoprint_lang') || 'ar';
        this.translations = translations;
        this.listeners = [];
    }
    
    init() {
        this.applyLanguage(this.currentLang);
        this.updateUITranslations();
        this.updatePortalTranslations();
    }
    
    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('techoprint_lang', lang);
        this.applyLanguage(lang);
        this.updateUITranslations();
        this.updatePortalTranslations();
        
        // Notify all listeners
        this.listeners.forEach(fn => fn(lang));
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
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
    }
    
    onLanguageChange(callback) {
        this.listeners.push(callback);
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
    
    updatePortalTranslations() {
        // Translate elements with data-i18n-portal
        document.querySelectorAll('[data-i18n-portal]').forEach(el => {
            const key = el.getAttribute('data-i18n-portal');
            const translation = this.t('portal.' + key);
            if (translation && translation !== 'portal.' + key) {
                el.textContent = translation;
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
        this.updatePortalTranslations();
    }
}

window.i18n = new I18n();

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    if (window.i18n && window.i18n.init) {
        window.i18n.init();
    }
});