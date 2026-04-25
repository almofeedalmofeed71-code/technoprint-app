/**
 * TECHOPRINT 2026 - Supabase Connection
 * Connected to: https://avabozirwdefwtabywqo.supabase.co
 */

const express = require('express');
const router = express.Router();

// Supabase Configuration
const SUPABASE_URL = 'https://avabozirwdefwtabywqo.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YWJvemlyd2RlZnd0YWJ5d3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjM1NDQsImV4cCI6MjA5MjQzOTU0NH0.boDU0pXR1MGYiJXF1Jos-w0uehKCCZHsKgxHP7nbQVY';

// Helper function to make Supabase requests
async function supabaseRequest(endpoint, options = {}) {
    const url = `${SUPABASE_URL}${endpoint}`;
    const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    return response.json();
}

// ==================== LOGIN ====================
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.json({ success: false, message: 'Username and password required' });
        }
        
        // Find user by username in profiles table
        const data = await supabaseRequest(
            `/rest/v1/profiles?username=eq.${username}&select=*`,
            { method: 'GET' }
        );
        
        if (!data || data.length === 0) {
            return res.json({ success: false, message: 'Invalid username or password' });
        }
        
        const user = data[0];
        
        // Verify password (stored as plain text for demo - in production use proper hashing)
        if (user.password !== password) {
            return res.json({ success: false, message: 'Invalid username or password' });
        }
        
        // Return user data with balance
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                phone: user.phone,
                balance: user.balance || 0,
                governorate: user.governorate,
                role: user.role || 'student'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.json({ success: false, message: 'Connection error' });
    }
});

// ==================== REGISTER ====================
router.post('/register', async (req, res) => {
    try {
        const { fullName, username, password, phone, governorate, address } = req.body;
        
        if (!fullName || !username || !password || !phone) {
            return res.json({ success: false, message: 'All fields required' });
        }
        
        // Check if username exists
        const existing = await supabaseRequest(
            `/rest/v1/profiles?username=eq.${username}&select=id`,
            { method: 'GET' }
        );
        
        if (existing && existing.length > 0) {
            return res.json({ success: false, message: 'Username already taken' });
        }
        
        // Create new profile
        const newUser = {
            username,
            password, // In production, hash this!
            full_name: fullName,
            phone,
            governorate: governorate || '',
            address: address || '',
            balance: 0,
            role: 'student',
            created_at: new Date().toISOString()
        };
        
        const result = await supabaseRequest(
            '/rest/v1/profiles',
            {
                method: 'POST',
                body: JSON.stringify(newUser)
            }
        );
        
        res.json({
            success: true,
            message: 'Registration successful!'
        });
    } catch (error) {
        console.error('Register error:', error);
        res.json({ success: false, message: 'Registration failed' });
    }
});

// ==================== GET PROFILE ====================
router.get('/profile/:username', async (req, res) => {
    try {
        const { username } = req.params;
        
        const data = await supabaseRequest(
            `/rest/v1/profiles?username=eq.${username}&select=*`,
            { method: 'GET' }
        );
        
        if (!data || data.length === 0) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        const user = data[0];
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                phone: user.phone,
                balance: user.balance || 0,
                governorate: user.governorate,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.json({ success: false, message: 'Error fetching profile' });
    }
});

// ==================== UPDATE BALANCE ====================
router.put('/balance/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { amount } = req.body;
        
        // Get current balance
        const current = await supabaseRequest(
            `/rest/v1/profiles?username=eq.${username}&select=balance`,
            { method: 'GET' }
        );
        
        if (!current || current.length === 0) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        const newBalance = (current[0].balance || 0) + amount;
        
        // Update balance
        await supabaseRequest(
            `/rest/v1/profiles?username=eq.${username}`,
            {
                method: 'PATCH',
                body: JSON.stringify({ balance: newBalance })
            }
        );
        
        res.json({ success: true, balance: newBalance });
    } catch (error) {
        console.error('Balance update error:', error);
        res.json({ success: false, message: 'Error updating balance' });
    }
});

module.exports = router;