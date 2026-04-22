/**
 * TECHOPRINT 2026 - STUDENT PORTAL MODULE
 * 4 Pillars: Library | Orders | Tracking | Upload
 */
const StudentPortal = {
    render() {
        const mainContent = document.getElementById('pageContent');
        const pageTitle = document.getElementById('pageTitle');
        
        if (pageTitle) pageTitle.textContent = '🎓 بوابة الطالب';
        
        // Inject the 4 Pillars HTML
        mainContent.innerHTML = `
            <section class="page active">
                <div class="student-portal-full">
                    <!-- Header -->
                    <div class="glass-panel" style="padding: 24px; margin-bottom: 24px; text-align: center;">
                        <h1 class="gold-text" style="font-family: 'Amiri'; font-size: 2.5rem;">
                            🎓 بوابة الطالب
                        </h1>
                        <p style="color: var(--text-secondary); margin-top: 8px;">
                            منصتك التعليمية - 4 أعمدة
                        </p>
                        <div class="student-wallet-badge glass-panel">
                            <span>💰 الرصيد:</span>
                            <span class="gold-text" id="studentBalance">0 IQD</span>
                        </div>
                    </div>
                    
                    <!-- The 4 Pillars -->
                    <div class="four-pillars-grid">
                        
                        <!-- Pillar 1: Library -->
                        <div class="pillar glass-panel" onclick="Router.navigate('library')">
                            <div class="pillar-icon">📚</div>
                            <h3>المكتبة</h3>
                            <p>تصفح واشترِ الكتب</p>
                            <div class="pillar-stats">
                                <span>📖 <span id="libBooks">0</span> كتاب</span>
                                <span>🎥 <span id="libLectures">0</span> محاضرة</span>
                            </div>
                            <button class="pillar-btn">دخول</button>
                        </div>
                        
                        <!-- Pillar 2: Orders -->
                        <div class="pillar glass-panel" onclick="Router.navigate('orders')">
                            <div class="pillar-icon">📦</div>
                            <h3>طلباتي</h3>
                            <p>تتبع حالات الطلبات</p>
                            <div class="pillar-stats">
                                <span class="status-pending">⏳ <span id="ordPending">0</span></span>
                                <span class="status-printing">🖨️ <span id="ordPrinting">0</span></span>
                                <span class="status-delivered">✅ <span id="ordDelivered">0</span></span>
                            </div>
                            <button class="pillar-btn">عرض</button>
                        </div>
                        
                        <!-- Pillar 3: Tracking -->
                        <div class="pillar glass-panel" onclick="Router.navigate('tracking')">
                            <div class="pillar-icon">🚚</div>
                            <h3>التتبع</h3>
                            <p>GPS مباشر للتوصيل</p>
                            <div class="pillar-map-preview" id="pillarMapPreview">
                                <span>🗺️</span>
                            </div>
                            <button class="pillar-btn">فتح الخريطة</button>
                        </div>
                        
                        <!-- Pillar 4: Upload -->
                        <div class="pillar glass-panel" onclick="StudentPortal.showUploadModal()">
                            <div class="pillar-icon">📤</div>
                            <h3>رفع ملفات</h3>
                            <p>للطباعة المخصصة</p>
                            <div class="pillar-upload-zone">
                                <span>⬆️</span>
                            </div>
                            <button class="pillar-btn gold">رفع ملف</button>
                        </div>
                    </div>
                    
                    <!-- Quick Links -->
                    <div class="quick-links glass-panel">
                        <button onclick="Router.navigate('wallet')">💰 المحفظة</button>
                        <button onclick="Router.navigate('support')">🎫 الدعم</button>
                        <button onclick="Router.navigate('transfer')">🔄 التحويل</button>
                        <button onclick="showPortal()">🏠 الرئيسية</button>
                    </div>
                </div>
            </section>
        `;
        
        // Load student data
        this.loadData();
    },
    
    async loadData() {
        try {
            const res = await fetch('/api/student/stats');
            if (res.ok) {
                const data = await res.json();
                if (document.getElementById('studentBalance')) {
                    document.getElementById('studentBalance').textContent = `${(data.balance||0).toLocaleString()} IQD`;
                }
                if (document.getElementById('libBooks')) document.getElementById('libBooks').textContent = data.books || 0;
                if (document.getElementById('ordPending')) document.getElementById('ordPending').textContent = data.pending || 0;
                if (document.getElementById('ordPrinting')) document.getElementById('ordPrinting').textContent = data.printing || 0;
                if (document.getElementById('ordDelivered')) document.getElementById('ordDelivered').textContent = data.delivered || 0;
            }
        } catch(e) {
            // Demo data
            if (document.getElementById('studentBalance')) document.getElementById('studentBalance').textContent = '50,000 IQD';
            if (document.getElementById('libBooks')) document.getElementById('libBooks').textContent = '12';
            if (document.getElementById('ordPending')) document.getElementById('ordPending').textContent = '2';
            if (document.getElementById('ordPrinting')) document.getElementById('ordPrinting').textContent = '1';
            if (document.getElementById('ordDelivered')) document.getElementById('ordDelivered').textContent = '5';
        }
    },
    
    showUploadModal() {
        showToast('📤 مركز الرفع - ارفع ملفك للطباعة', 'info');
        const modal = document.createElement('div');
        modal.className = 'modal fullscreen-modal active';
        modal.innerHTML = `
            <div class="modal-content glass-panel">
                <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
                <h2 class="gold-text">📤 رفع ملف للطباعة</h2>
                
                <div class="price-calculator glass-panel">
                    <h4>💰 حاسبة السعر</h4>
                    <div class="calc-row">
                        <label>الصفحات:</label>
                        <input type="number" id="upPages" value="1" min="1">
                    </div>
                    <div class="calc-row">
                        <label>النسخ:</label>
                        <input type="number" id="upCopies" value="1" min="1">
                    </div>
                    <div class="calc-row">
                        <label>نوع الورق:</label>
                        <select id="upPaper">
                            <option value="500">A4 عادي - 500 IQD</option>
                            <option value="1000">A4 لامع - 1000 IQD</option>
                            <option value="1500">A3 - 1500 IQD</option>
                        </select>
                    </div>
                    <div class="calc-result">
                        <strong>السعر:</strong>
                        <span class="gold-text" id="upTotal">500 IQD</span>
                    </div>
                </div>
                
                <div class="upload-zone" onclick="document.getElementById('upFile').click()">
                    <input type="file" id="upFile" style="display:none" accept=".pdf,.doc,.docx,.jpg,.png">
                    <span style="font-size: 3rem;">📄</span>
                    <p>اضغط أو أسقط الملف هنا</p>
                    <small>PDF, DOC, JPG, PNG</small>
                </div>
                
                <button class="submit-btn gold-btn" onclick="StudentPortal.submitUpload()">
                    إرسال للطباعة
                </button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Calculator
        ['upPages','upCopies','upPaper'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => {
                const p = parseInt(document.getElementById('upPages').value) || 1;
                const c = parseInt(document.getElementById('upCopies').value) || 1;
                const r = parseInt(document.getElementById('upPaper').value) || 500;
                document.getElementById('upTotal').textContent = (p * c * r).toLocaleString() + ' IQD';
            });
        });
    },
    
    submitUpload() {
        const file = document.getElementById('upFile').files[0];
        if (!file) {
            showToast('يرجى اختيار ملف أولاً', 'error');
            return;
        }
        showToast(`✅ تم استلام: ${file.name}`, 'success');
        document.querySelector('.modal.fullscreen-modal')?.remove();
    }
};

// Make it globally accessible
window.StudentPortal = StudentPortal;
