/**
 * TECHOPRINT 2026 - Orders API
 * Connected to Supabase orders table
 */

// Supabase Configuration
const SUPABASE_URL = 'https://avabozirwdefwtabywqo.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YWJvemlyd2RlZnd0YWJ5d3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjM1NDQsImV4cCI6MjA5MjQzOTU0NH0.boDU0pXR1MGYiJXF1Jos-w0uehKCCZHsKgxHP7nbQVY';

const express = require('express');
const router = express.Router();

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

// ==================== CREATE ORDER ====================
router.post('/', async (req, res) => {
    try {
        const { userId, username, serviceType, serviceName, price, status = 'pending' } = req.body;
        
        if (!userId || !serviceType || !serviceName || !price) {
            return res.json({ success: false, message: 'Missing required fields' });
        }
        
        // Create order in orders table
        const order = {
            user_id: userId,
            username: username || '',
            service_type: serviceType,
            service_name: serviceName,
            price: parseFloat(price),
            status: status,
            created_at: new Date().toISOString()
        };
        
        const result = await supabaseRequest(
            '/rest/v1/orders',
            {
                method: 'POST',
                body: JSON.stringify(order)
            }
        );
        
        res.json({
            success: true,
            message: 'Order created successfully',
            order: result
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.json({ success: false, message: 'Failed to create order' });
    }
});

// ==================== GET USER ORDERS ====================
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const orders = await supabaseRequest(
            `/rest/v1/orders?user_id=eq.${userId}&order=created_at.desc&select=*`,
            { method: 'GET' }
        );
        
        res.json({
            success: true,
            orders: orders || []
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.json({ success: false, message: 'Failed to get orders', orders: [] });
    }
});

// ==================== GET ALL ORDERS (Admin) ====================
router.get('/', async (req, res) => {
    try {
        const orders = await supabaseRequest(
            '/rest/v1/orders?order=created_at.desc&select=*',
            { method: 'GET' }
        );
        
        res.json({
            success: true,
            orders: orders || []
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.json({ success: false, message: 'Failed to get orders', orders: [] });
    }
});

// ==================== UPDATE ORDER STATUS ====================
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        await supabaseRequest(
            `/rest/v1/orders?id=eq.${id}`,
            {
                method: 'PATCH',
                body: JSON.stringify({ status: status })
            }
        );
        
        res.json({ success: true, message: 'Order status updated' });
    } catch (error) {
        console.error('Update order error:', error);
        res.json({ success: false, message: 'Failed to update order' });
    }
});

// ==================== DELETE ORDER ====================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await supabaseRequest(
            `/rest/v1/orders?id=eq.${id}`,
            { method: 'DELETE' }
        );
        
        res.json({ success: true, message: 'Order deleted' });
    } catch (error) {
        console.error('Delete order error:', error);
        res.json({ success: false, message: 'Failed to delete order' });
    }
});

module.exports = router;