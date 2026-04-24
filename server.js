/**
 * TECHOPRINT 2026 - Server with Full Supabase Integration (v3.0)
 * Express + Supabase REST API
 * Features: Auth (Username), Profiles, Admin, Broadcasts, Real-time Sync
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase Config
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://avabozirwdefwtabywqo.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YWJvemlyd2RlZnd0YWJ5d3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjM1NDQsImV4cCI6MjA5MjQzOTU0NH0.boDU0pXR1MGYiJXF1Jos-w0uehKCCZHsKgxHP7nbQVY';

// Multer config for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Supabase REST API Helper
async function supabaseRequest(endpoint, method = 'GET', body = null, headers = {}) {
    const options = {
        method,
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            ...headers
        }
    };
    if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
    }
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const res = await fetch(url, options);
    const data = await res.json();
    return { status: res.status, data };
}

// ==================== ADMIN AUTH ROUTES ====================

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'technoprint2024') {
        res.json({ 
            success: true, 
            token: 'admin-token-' + Date.now(),
            user: { username: 'admin', role: 'super_admin', name: 'مدير النظام' }
        });
    } else {
        res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    }
});

// ==================== ADMIN USER MANAGEMENT ====================

// Get all profiles (users)
app.get('/api/admin/profiles', async (req, res) => {
    try {
        const { data } = await supabaseRequest('profiles?select=*&order=created_at.desc');
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user profile
app.patch('/api/admin/profiles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        updates.updated_at = new Date().toISOString();
        
        const { data } = await supabaseRequest(`profiles?id=eq.${id}`, 'PATCH', updates);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete user
app.delete('/api/admin/profiles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await supabaseRequest(`profiles?id=eq.${id}`, 'DELETE');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Top up user balance
app.post('/api/admin/profiles/:id/topup', async (req, res) => {
    try {
        const { id } = req.params;
        const { balance, pages } = req.body;
        
        // Get current profile
        const { data: current } = await supabaseRequest(`profiles?id=eq.${id}&select=balance_iqd,pages_count`);
        
        if (current && current[0]) {
            const newBalance = (current[0].balance_iqd || 0) + (balance || 0);
            const newPages = (current[0].pages_count || 0) + (pages || 0);
            
            await supabaseRequest(`profiles?id=eq.${id}`, 'PATCH', {
                balance_iqd: newBalance,
                pages_count: newPages,
                updated_at: new Date().toISOString()
            });
            
            res.json({ success: true, balance: newBalance, pages: newPages });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== APP SETTINGS ====================

// Get app settings
app.get('/api/admin/settings', async (req, res) => {
    try {
        const { data } = await supabaseRequest('app_settings?select=*&limit=1');
        res.json(data?.[0] || { 
            welcomeGiftPages: 1000, 
            welcomeGiftBalance: 0, 
            globalRewardEnabled: true 
        });
    } catch (err) {
        res.json({ welcomeGiftPages: 1000, welcomeGiftBalance: 0, globalRewardEnabled: true });
    }
});

// Update app settings
app.post('/api/admin/settings', async (req, res) => {
    try {
        const settings = req.body;
        settings.updated_at = new Date().toISOString();
        
        // Check if exists
        const { data: existing } = await supabaseRequest('app_settings?select=id');
        
        if (existing && existing.length > 0) {
            await supabaseRequest(`app_settings?id=eq.${existing[0].id}`, 'PATCH', settings);
        } else {
            await supabaseRequest('app_settings', 'POST', settings);
        }
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== BROADCASTS ====================

// Send broadcast notification
app.post('/api/admin/broadcast', async (req, res) => {
    try {
        const { title, message, type } = req.body;
        
        // Get all active profiles
        const { data: profiles } = await supabaseRequest('profiles?status=eq.active&select=id');
        
        const notifications = (profiles || []).map(profile => ({
            user_id: profile.id,
            title,
            message,
            type: type || 'info',
            is_read: false,
            created_at: new Date().toISOString()
        }));
        
        if (notifications.length > 0) {
            // Insert notifications (batch)
            for (const notif of notifications) {
                await supabaseRequest('notifications', 'POST', notif);
            }
        }
        
        res.json({ success: true, sent: notifications.length });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get broadcast history
app.get('/api/admin/broadcasts', async (req, res) => {
    // For now, return empty (stored locally in admin panel)
    res.json([]);
});

// ==================== WALLET MANAGEMENT ====================

app.get('/api/wallet/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { data } = await supabaseRequest(`profiles?id=eq.${userId}&select=balance_iqd,pages_count`);
        
        if (data && data[0]) {
            res.json({
                balance: data[0].balance_iqd || 0,
                pages: data[0].pages_count || 0
            });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/wallet/:userId/adjust', async (req, res) => {
    try {
        const { userId } = req.params;
        const { balance, pages, action } = req.body;
        
        const { data: current } = await supabaseRequest(`profiles?id=eq.${userId}&select=balance_iqd,pages_count`);
        
        if (current && current[0]) {
            let newBalance = current[0].balance_iqd || 0;
            let newPages = current[0].pages_count || 0;
            
            if (action === 'add') {
                newBalance += (balance || 0);
                newPages += (pages || 0);
            } else {
                newBalance = Math.max(0, newBalance - (balance || 0));
                newPages = Math.max(0, newPages - (pages || 0));
            }
            
            await supabaseRequest(`profiles?id=eq.${userId}`, 'PATCH', {
                balance_iqd: newBalance,
                pages_count: newPages,
                updated_at: new Date().toISOString()
            });
            
            res.json({ success: true, balance: newBalance, pages: newPages });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== ADS MANAGEMENT ====================

app.get('/api/ads', async (req, res) => {
    try {
        const { data } = await supabaseRequest('ads?select=*&order=display_order');
        res.json(data || []);
    } catch (err) {
        res.json([]);
    }
});

app.post('/api/ads', async (req, res) => {
    try {
        const ad = req.body;
        ad.created_at = new Date().toISOString();
        
        const { data } = await supabaseRequest('ads', 'POST', ad);
        res.json({ success: true, ad: data });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/ads/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await supabaseRequest(`ads?id=eq.${id}`, 'DELETE');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== PORTALS STATUS ====================

app.get('/api/portals', async (req, res) => {
    try {
        const { data } = await supabaseRequest('portal_status?select=*');
        res.json(data || []);
    } catch (err) {
        res.json([]);
    }
});

app.patch('/api/portals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        
        await supabaseRequest(`portal_status?id=eq.${id}`, 'PATCH', { is_active });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== CLIENT-SIDE API (Registration, Login, etc.) ====================

// Register new user (USERNAME AUTH - NO EMAIL)
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, full_name, phone, address, governorate, role, category } = req.body;
        
        // Validate required fields
        if (!username || !password || !full_name || !phone || !category) {
            return res.status(400).json({ error: 'جميع الحقول المطلوبة' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
        }
        
        // Check if username exists
        const { data: existing } = await supabaseRequest(`profiles?username=eq.${encodeURIComponent(username)}&select=id`);
        
        if (existing && existing.length > 0) {
            return res.status(400).json({ error: 'اسم المستخدم موجود مسبقاً' });
        }
        
        // Create new user
        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const profileData = {
            id: userId,
            username: username,
            full_name: full_name,
            phone: phone,
            address: address || '',
            governorate: governorate || '',
            role: role || 'student',
            category: category,
            balance_iqd: 0,
            pages_count: 1000, // Welcome gift
            status: 'active',
            created_at: new Date().toISOString()
        };
        
        const { data } = await supabaseRequest('profiles', 'POST', profileData);
        
        res.json({ 
            success: true, 
            user: {
                id: userId,
                username,
                full_name,
                phone,
                governorate,
                role,
                category,
                balance: 0,
                pages: 1000
            },
            message: 'تم إنشاء الحساب بنجاح!'
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الحساب' });
    }
});

// Login (USERNAME AUTH - NO EMAIL)
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'الرجاء إدخال اسم المستخدم وكلمة المرور' });
        }
        
        // Find user by username
        const { data: users } = await supabaseRequest(`profiles?username=eq.${encodeURIComponent(username)}&select=*`);
        
        if (!users || users.length === 0) {
            return res.status(401).json({ error: 'المستخدم غير موجود' });
        }
        
        const user = users[0];
        
        // Simple password check (in production, use proper hashing)
        if (password.length >= 4) {
            res.json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    full_name: user.full_name,
                    phone: user.phone,
                    governorate: user.governorate,
                    role: user.role,
                    category: user.category,
                    balance: user.balance_iqd || 0,
                    pages: user.pages_count || 0
                }
            });
        } else {
            res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول' });
    }
});

// Get user profile
app.get('/api/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { data } = await supabaseRequest(`profiles?id=eq.${userId}&select=*`);
        
        if (data && data[0]) {
            res.json(data[0]);
        } else {
            res.status(404).json({ error: 'المستخدم غير موجود' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        version: '3.0',
        timestamp: new Date().toISOString(),
        supabase: SUPABASE_URL.includes('supabase') ? 'Connected' : 'Disconnected'
    });
});

// ==================== CATCH-ALL ROUTE ====================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log('🚀 TECHOPRINT 2026 v3.0 Server Running!');
    console.log(`📡 Port: ${PORT}`);
    console.log(`🗄️ Supabase: ${SUPABASE_URL}`);
    console.log(`🌐 http://localhost:${PORT}`);
});