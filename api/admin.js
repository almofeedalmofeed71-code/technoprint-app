// ===== TECHNO-CONTROL ADMIN API =====

const express = require('express');
const router = express.Router();
const { supabase } = require('./db');

// Admin credentials (in production, use environment variables)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'technoprint2024'
};

// Middleware to verify admin token
const verifyAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    // For demo mode, accept demo-token
    if (token === 'demo-token') {
        req.admin = { username: 'admin', role: 'super_admin' };
        return next();
    }
    
    // In production, verify against database
    try {
        const { data } = await supabase
            .from('admin_sessions')
            .select('*')
            .eq('token', token)
            .single();
        
        if (data) {
            req.admin = data;
            next();
        } else {
            res.status(401).json({ success: false, message: 'Invalid token' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Login endpoint
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const token = 'demo-token';
        res.json({
            success: true,
            token,
            user: {
                username: 'admin',
                role: 'super_admin',
                name: 'مدير النظام'
            }
        });
    } else {
        res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
    }
});

// Get all users
router.get('/users', verifyAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        res.json({ success: true, users: data });
    } catch (error) {
        // Return demo data if table doesn't exist
        res.json({ 
            success: true, 
            users: [
                { id: 1, name: 'أحمد محمد', phone: '07701234567', governorate: 'بغداد', balance: 150, pages: 500, status: 'active' },
                { id: 2, name: 'زينب علي', phone: '07712345678', governorate: 'البصرة', balance: 200, pages: 1000, status: 'active' },
                { id: 3, name: 'محمد خالد', phone: '07723456789', governorate: 'أربيل', balance: 75, pages: 300, status: 'active' },
                { id: 4, name: 'فاطمة سعيد', phone: '07734567890', governorate: 'نينوى', balance: 120, pages: 450, status: 'inactive' },
                { id: 5, name: 'عمر يوسف', phone: '07745678901', governorate: 'النجف', balance: 180, pages: 600, status: 'active' }
            ]
        });
    }
});

// Update user balance
router.post('/users/:id/balance', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { amount, action } = req.body;
    
    try {
        const { data: user } = await supabase
            .from('users')
            .select('balance')
            .eq('id', id)
            .single();
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const newBalance = action === 'add' 
            ? user.balance + parseInt(amount)
            : Math.max(0, user.balance - parseInt(amount));
        
        const { error } = await supabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', id);
        
        if (error) throw error;
        
        res.json({ success: true, newBalance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update user pages
router.post('/users/:id/pages', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { amount, action } = req.body;
    
    try {
        const { data: user } = await supabase
            .from('users')
            .select('pages')
            .eq('id', id)
            .single();
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const newPages = action === 'add' 
            ? user.pages + parseInt(amount)
            : Math.max(0, user.pages - parseInt(amount));
        
        const { error } = await supabase
            .from('users')
            .update({ pages: newPages })
            .eq('id', id);
        
        if (error) throw error;
        
        res.json({ success: true, newPages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Send gift to user
router.post('/users/:id/gift', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { balance, pages, type } = req.body;
    
    try {
        // Update user balance and pages
        const { data: user } = await supabase
            .from('users')
            .select('balance, pages')
            .eq('id', id)
            .single();
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        await supabase
            .from('users')
            .update({
                balance: user.balance + parseInt(balance),
                pages: user.pages + parseInt(pages)
            })
            .eq('id', id);
        
        // Log gift transaction
        await supabase
            .from('gift_transactions')
            .insert({
                user_id: id,
                type: type,
                balance_amount: parseInt(balance),
                pages_amount: parseInt(pages),
                sent_by: req.admin.username,
                created_at: new Date().toISOString()
            });
        
        res.json({ success: true, message: 'Gift sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get/Update configuration
router.get('/config', verifyAdmin, async (req, res) => {
    try {
        const { data } = await supabase
            .from('app_config')
            .select('*')
            .eq('id', 1)
            .single();
        
        res.json({ success: true, config: data || {} });
    } catch (error) {
        res.json({ success: true, config: {} });
    }
});

router.post('/config', verifyAdmin, async (req, res) => {
    const config = req.body;
    
    try {
        const { data } = await supabase
            .from('app_config')
            .upsert({ id: 1, ...config, updated_at: new Date().toISOString() })
            .select()
            .single();
        
        res.json({ success: true, config: data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Save ad
router.post('/ads', verifyAdmin, async (req, res) => {
    const { url, order } = req.body;
    
    try {
        const { data } = await supabase
            .from('ads')
            .insert({ url, order, created_at: new Date().toISOString() })
            .select()
            .single();
        
        res.json({ success: true, ad: data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete ad
router.delete('/ads/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    
    try {
        await supabase
            .from('ads')
            .delete()
            .eq('id', id);
        
        res.json({ success: true, message: 'Ad deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Send broadcast notification
router.post('/broadcast', verifyAdmin, async (req, res) => {
    const { title, message, type } = req.body;
    
    try {
        // Get all users
        const { data: users } = await supabase
            .from('users')
            .select('id');
        
        // Insert notification for each user
        const notifications = users.map(user => ({
            user_id: user.id,
            title,
            message,
            type,
            sent_by: req.admin.username,
            created_at: new Date().toISOString()
        }));
        
        await supabase
            .from('notifications')
            .insert(notifications);
        
        res.json({ success: true, sentTo: users.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Send private message
router.post('/message', verifyAdmin, async (req, res) => {
    const { userId, subject, content } = req.body;
    
    try {
        await supabase
            .from('messages')
            .insert({
                user_id: userId,
                subject,
                content,
                from_admin: true,
                sent_by: req.admin.username,
                created_at: new Date().toISOString()
            });
        
        res.json({ success: true, message: 'Message sent' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update portal status
router.post('/portals/:id/status', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { active } = req.body;
    
    try {
        const { data: config } = await supabase
            .from('app_config')
            .select('portal_status')
            .eq('id', 1)
            .single();
        
        const portalStatus = config?.portal_status || {};
        portalStatus[id] = active;
        
        await supabase
            .from('app_config')
            .update({ portal_status: portalStatus })
            .eq('id', 1);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;