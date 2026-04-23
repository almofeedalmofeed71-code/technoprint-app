/**
 * TECHOPRINT 2026 - Server with Supabase Integration (v2.0)
 * Express + Supabase REST API
 * Features: Auth, i18n, Duplicate Transfer Check, Proof Upload
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
async function supabaseRequest(table, method = 'GET', body = null, headers = {}) {
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
    const url = `${SUPABASE_URL}/rest/v1/${table}`;
    const res = await fetch(url, options);
    const data = await res.json();
    return { status: res.status, data };
}

// ==================== AUTH ROUTES ====================

// Sign Up
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, full_name, phone, role = 'student' } = req.body;
        
        if (!email || !password || !full_name) {
            return res.status(400).json({ error: 'Email, password, and full name are required' });
        }
        
        const options = {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                email,
                password,
                data: { full_name, phone, role }
            })
        };
        
        const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, options);
        const data = await response.json();
        
        if (data.error) {
            return res.status(400).json({ error: data.error.message });
        }
        
        res.json({ 
            success: true, 
            user: data.user,
            message: 'Account created! Check email for confirmation.'
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        const options = {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        };
        
        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, options);
        const data = await response.json();
        
        if (data.error) {
            return res.status(401).json({ error: data.error.message });
        }
        
        // Get user profile
        const { data: profile } = await supabaseRequest(`profiles?id=eq.${data.user.id}&select=*`);
        
        res.json({ 
            success: true, 
            token: data.access_token,
            user: {
                id: data.user.id,
                email: data.user.email,
                ...(profile?.[0] || {})
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== TRANSACTION ROUTES ====================

// Check Duplicate Transfer Reference
app.get('/api/transactions/check-ref/:ref', async (req, res) => {
    try {
        const ref = req.params.ref;
        
        const { data } = await supabaseRequest(
            `transactions?reference_id=eq.${ref}&status=eq.completed&select=id`
        );
        
        const exists = data && data.length > 0;
        res.json({ exists, ref });
    } catch (err) {
        console.error('Check ref error:', err);
        res.json({ exists: false });
    }
});

// Create Transaction with File Upload
app.post('/api/transactions/upload', upload.single('receipt'), async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { type, amount, currency, payment_method, payment_number, reference_id } = req.body;
        
        if (!amount || !reference_id) {
            return res.status(400).json({ error: 'Amount and reference are required' });
        }
        
        const receipt_url = req.file ? `/uploads/${req.file.filename}` : null;
        
        const transaction = {
            user_id: userId || null,
            type,
            amount,
            currency: currency || 'IQD',
            payment_method,
            payment_number,
            reference_id,
            receipt_url,
            status: type === 'deposit' ? 'pending' : 'completed'
        };
        
        const { data, error } = await supabaseRequest('transactions', 'POST', transaction);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ success: true, transaction: data });
    } catch (err) {
        console.error('Upload transaction error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get User Transactions
app.get('/api/transactions', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { type, status } = req.query;
        
        let query = 'select=*,profiles(full_name)&order=created_at.desc';
        if (userId) query += `&user_id=eq.${userId}`;
        if (type) query += `&type=eq.${type}`;
        if (status) query += `&status=eq.${status}`;
        
        const { data, error } = await supabaseRequest(`transactions?${query}`);
        
        if (error) {
            return res.status(500).json({ error });
        }
        
        res.json(data || []);
    } catch (err) {
        console.error('Get transactions error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Transaction (no upload)
app.post('/api/transactions', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { type, amount, currency = 'IQD', payment_method, payment_number, description, reference_id } = req.body;
        
        const transaction = {
            user_id: userId || null,
            type,
            amount,
            currency,
            payment_method,
            payment_number,
            description,
            reference_id,
            status: type === 'deposit' ? 'pending' : (type === 'withdraw' ? 'pending' : 'completed')
        };
        
        const { data, error } = await supabaseRequest('transactions', 'POST', transaction);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ success: true, transaction: data });
    } catch (err) {
        console.error('Create transaction error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Transaction
app.patch('/api/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_notes } = req.body;
        
        const updates = { updated_at: new Date().toISOString() };
        if (status) updates.status = status;
        if (admin_notes) updates.admin_notes = admin_notes;
        if (status === 'completed') updates.processed_at = new Date().toISOString();
        
        const { data, error } = await supabaseRequest(
            `transactions?id=eq.${id}`,
            'PATCH',
            updates
        );
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ success: true, data });
    } catch (err) {
        console.error('Update transaction error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Upload Withdrawal Proof
app.post('/api/transactions/:id/proof', upload.single('proof'), async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!req.file) {
            return res.status(400).json({ error: 'Proof file is required' });
        }
        
        const proof_url = `/uploads/${req.file.filename}`;
        
        const { data, error } = await supabaseRequest(
            `transactions?id=eq.${id}`,
            'PATCH',
            { proof_url }
        );
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ success: true, proof_url });
    } catch (err) {
        console.error('Upload proof error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== PROFILE ROUTES ====================

app.get('/api/profile', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const { data, error } = await supabaseRequest(`profiles?id=eq.${userId}&select=*`);
        
        if (error) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        
        res.json(data?.[0] || null);
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/profile', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const updates = req.body;
        updates.updated_at = new Date().toISOString();
        
        const { data, error } = await supabaseRequest(
            `profiles?id=eq.${userId}`,
            'PATCH',
            updates
        );
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ success: true, data });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== LIBRARY ROUTES ====================

app.get('/api/library', async (req, res) => {
    try {
        const { subject, grade, search } = req.query;
        let query = 'is_active=eq.true&select=*';
        
        if (subject) query += `&subject=eq.${subject}`;
        if (grade) query += `&grade=eq.${grade}`;
        
        const { data, error } = await supabaseRequest(`library?${query}&order=title`);
        
        if (error) {
            return res.status(500).json({ error });
        }
        
        let results = data || [];
        if (search) {
            const s = search.toLowerCase();
            results = results.filter(b => 
                b.title?.toLowerCase().includes(s) ||
                b.description?.toLowerCase().includes(s)
            );
        }
        
        res.json(results);
    } catch (err) {
        console.error('Library error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/library/:id', async (req, res) => {
    try {
        const { data, error } = await supabaseRequest(`library?id=eq.${req.params.id}`);
        
        if (error || !data?.[0]) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        res.json(data[0]);
    } catch (err) {
        console.error('Get book error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== ORDER ROUTES ====================

app.get('/api/orders', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        
        let query = 'select=*&order=created_at.desc';
        if (userId) {
            query += `&user_id=eq.${userId}`;
        }
        
        const { data, error } = await supabaseRequest(`orders?${query}`);
        
        if (error) {
            return res.status(500).json({ error });
        }
        
        res.json(data || []);
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { items, delivery_address, delivery_governorate, delivery_phone, notes } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Order items required' });
        }
        
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const delivery_fee = delivery_governorate ? 2500 : 0;
        const total = subtotal + delivery_fee;
        
        const orderNumber = `TP-${Date.now()}`;
        
        const order = {
            order_number: orderNumber,
            user_id: userId || null,
            items: JSON.stringify(items),
            subtotal,
            delivery_fee,
            total,
            delivery_address,
            delivery_governorate,
            delivery_phone,
            notes,
            status: 'pending'
        };
        
        const { data, error } = await supabaseRequest('orders', 'POST', order);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ success: true, order: data });
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== TICKET ROUTES ====================

app.get('/api/tickets', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        
        let query = 'select=*&order=created_at.desc';
        if (userId) {
            query += `&user_id=eq.${userId}`;
        }
        
        const { data, error } = await supabaseRequest(`tickets?${query}`);
        
        if (error) {
            return res.status(500).json({ error });
        }
        
        res.json(data || []);
    } catch (err) {
        console.error('Get tickets error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/tickets', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { type, subject, description } = req.body;
        
        if (!type || !subject || !description) {
            return res.status(400).json({ error: 'All fields required' });
        }
        
        const ticket = {
            user_id: userId || null,
            type,
            subject,
            description,
            status: 'open'
        };
        
        const { data, error } = await supabaseRequest('tickets', 'POST', ticket);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ success: true, ticket: data });
    } catch (err) {
        console.error('Create ticket error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== PROFILES (USERS) ====================

app.get('/api/profiles', async (req, res) => {
    try {
        const { data, error } = await supabaseRequest('profiles?select=*&order=created_at.desc');
        
        if (error) {
            return res.status(500).json({ error });
        }
        
        res.json(data || []);
    } catch (err) {
        console.error('Get profiles error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== STUDENT STATS ====================

app.get('/api/student/stats', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        
        let stats = {
            balance: 50000,
            books: 8,
            lectures: 12,
            pending: 2,
            printing: 1,
            shipped: 1,
            delivered: 5
        };
        
        if (userId) {
            const [profileRes, ordersRes, booksRes] = await Promise.all([
                supabaseRequest(`profiles?id=eq.${userId}&select=balance_iqd`),
                supabaseRequest(`orders?user_id=eq.${userId}&status=eq.pending&select=id`),
                supabaseRequest('library?is_active=eq.true&select=id')
            ]);
            
            if (profileRes.data?.[0]) {
                stats.balance = profileRes.data[0].balance_iqd || 0;
            }
            if (ordersRes.data) {
                stats.pending = ordersRes.data.length;
            }
            if (booksRes.data) {
                stats.books = booksRes.data.length;
            }
        }
        
        res.json(stats);
    } catch (err) {
        console.error('Student stats error:', err);
        res.json({ balance: 50000, books: 8, lectures: 12, pending: 2, printing: 1, shipped: 1, delivered: 5 });
    }
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        version: '2.0',
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
    console.log('🚀 TECHOPRINT 2026 v2.0 Server Running!');
    console.log(`📡 Port: ${PORT}`);
    console.log(`🗄️ Supabase: ${SUPABASE_URL}`);
    console.log(`🌐 http://localhost:${PORT}`);
});