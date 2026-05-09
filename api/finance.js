/**
 * TECHOPRINT - Financial API Routes
 * Payments, Schools Report, Material Analysis
 * Version: 2.0.0
 */

const express = require('express');
const router = express.Router();

// ==================== PAYMENTS API ====================

// Get all payments
router.get('/payments', async (req, res) => {
    try {
        const { data } = await supabaseRequest('payments?order=created_at.desc');
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single payment
router.get('/payments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data } = await supabaseRequest(`payments?id=eq.${id}`);
        res.json(data?.[0] || null);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create payment
router.post('/payments', async (req, res) => {
    try {
        const payment = req.body;
        payment.id = payment.id || 'PAY_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        payment.created_at = new Date().toISOString();
        
        const { data } = await supabaseRequest('payments', 'POST', payment);
        res.json({ success: true, payment: data });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update payment
router.patch('/payments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        updates.updated_at = new Date().toISOString();
        
        await supabaseRequest(`payments?id=eq.${id}`, 'PATCH', updates);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete payment
router.delete('/payments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await supabaseRequest(`payments?id=eq.${id}`, 'DELETE');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== SCHOOLS REPORT API ====================

// Get schools report
router.get('/schools/report', async (req, res) => {
    try {
        const { startDate, endDate, schoolId } = req.query;
        
        let query = 'orders?select=*';
        
        // Filter by school if provided
        if (schoolId) {
            query += `&school_id=eq.${schoolId}`;
        }
        
        // Filter by date range if provided
        if (startDate) {
            query += `&created_at=gte.${startDate}`;
        }
        if (endDate) {
            query += `&created_at=lte.${endDate}`;
        }
        
        query += '&order=created_at.desc';
        
        const { data: orders } = await supabaseRequest(query);
        
        // Calculate report data
        const report = {
            totalOrders: orders?.length || 0,
            totalRevenue: orders?.reduce((sum, o) => sum + (o.price || 0), 0) || 0,
            ordersByStatus: {},
            ordersByType: {},
            dailyBreakdown: {}
        };
        
        // Group by status
        orders?.forEach(order => {
            const status = order.status || 'unknown';
            report.ordersByStatus[status] = (report.ordersByStatus[status] || 0) + 1;
            
            const type = order.card_type || 'unknown';
            report.ordersByType[type] = (report.ordersByType[type] || 0) + 1;
            
            const date = order.created_at?.split('T')[0] || 'unknown';
            if (!report.dailyBreakdown[date]) {
                report.dailyBreakdown[date] = { count: 0, revenue: 0 };
            }
            report.dailyBreakdown[date].count++;
            report.dailyBreakdown[date].revenue += order.price || 0;
        });
        
        res.json(report);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get school details
router.get('/schools/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data } = await supabaseRequest(`schools?id=eq.${id}`);
        res.json(data?.[0] || null);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all schools
router.get('/schools', async (req, res) => {
    try {
        const { data } = await supabaseRequest('schools?order=name');
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== MATERIAL ANALYSIS API ====================

// Get material analysis report
router.get('/materials/analysis', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let query = 'print_orders?select=*';
        if (startDate) query += `&created_at=gte.${startDate}`;
        if (endDate) query += `&created_at=lte.${endDate}`;
        
        const { data: orders } = await supabaseRequest(query + '&order=created_at.desc');
        
        // Calculate using sheet-based accounting
        const analysis = orders?.map(order => {
            const sheets = order.pageCount || 1;
            const isDuplex = order.duplex === 'double';
            
            // Cost calculations
            const pages = isDuplex ? sheets * 2 : sheets;
            const paperCost = sheets * 100; // 100 IQD per sheet
            const inkCost = pages * 50; // 50 IQD per page
            const coverCost = order.hasCover ? sheets * 150 : 0; // 150 IQD per cover
            const totalOperationalCost = paperCost + inkCost + coverCost;
            
            // Revenue
            const revenue = order.total || 0;
            
            // Profits
            const grossProfit = revenue - totalOperationalCost;
            const netProfit = grossProfit - coverCost;
            
            return {
                orderId: order.id,
                date: order.created_at,
                sheets,
                pages,
                paperCost,
                inkCost,
                coverCount: order.hasCover ? sheets : 0,
                coverCost,
                totalOperationalCost,
                revenue,
                grossProfit,
                netProfit,
                status: order.status
            };
        }) || [];
        
        // Summary
        const summary = {
            totalOrders: analysis.length,
            totalSheets: analysis.reduce((sum, a) => sum + a.sheets, 0),
            totalPages: analysis.reduce((sum, a) => sum + a.pages, 0),
            totalPaperCost: analysis.reduce((sum, a) => sum + a.paperCost, 0),
            totalInkCost: analysis.reduce((sum, a) => sum + a.inkCost, 0),
            totalCoverCost: analysis.reduce((sum, a) => sum + a.coverCost, 0),
            totalOperationalCost: analysis.reduce((sum, a) => sum + a.totalOperationalCost, 0),
            totalRevenue: analysis.reduce((sum, a) => sum + a.revenue, 0),
            totalGrossProfit: analysis.reduce((sum, a) => sum + a.grossProfit, 0),
            totalNetProfit: analysis.reduce((sum, a) => sum + a.netProfit, 0)
        };
        
        res.json({ analysis, summary });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== INVENTORY MOVEMENTS API ====================

// Get all movements
router.get('/inventory/movements', async (req, res) => {
    try {
        const { type, itemId } = req.query;
        
        let query = 'inventory_movements?order=created_at.desc';
        if (type) query += `&type=eq.${type}`;
        if (itemId) query += `&item_id=eq.${itemId}`;
        
        const { data } = await supabaseRequest(query);
        
        // Filter out deleted (unless specifically requested)
        const activeMovements = data?.filter(m => !m.deleted) || [];
        
        res.json(activeMovements);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create movement (IN or OUT)
router.post('/inventory/movements', async (req, res) => {
    try {
        const { type, itemId, quantity, reason } = req.body;
        
        if (!type || !itemId || !quantity) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        if (!['IN', 'OUT'].includes(type)) {
            return res.status(400).json({ error: 'Invalid movement type' });
        }
        
        const movement = {
            id: 'MOV_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type,
            item_id: itemId,
            quantity,
            reason: reason || '',
            created_at: new Date().toISOString(),
            deleted: false
        };
        
        const { data } = await supabaseRequest('inventory_movements', 'POST', movement);
        
        // Update inventory quantity
        const { data: item } = await supabaseRequest(`inventory?id=eq.${itemId}&select=quantity`);
        
        if (item && item[0]) {
            const newQty = type === 'IN' 
                ? item[0].quantity + quantity 
                : item[0].quantity - quantity;
            
            await supabaseRequest(`inventory?id=eq.${itemId}`, 'PATCH', { quantity: newQty });
        }
        
        res.json({ success: true, movement: data });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete movement (revert quantity) - NEW FUNCTIONALITY
router.delete('/inventory/movements/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get the movement first
        const { data: movement } = await supabaseRequest(`inventory_movements?id=eq.${id}`);
        
        if (!movement || !movement[0]) {
            return res.status(404).json({ error: 'Movement not found' });
        }
        
        if (movement[0].deleted) {
            return res.status(400).json({ error: 'Movement already deleted' });
        }
        
        // Mark as deleted
        await supabaseRequest(`inventory_movements?id=eq.${id}`, 'PATCH', {
            deleted: true,
            deleted_at: new Date().toISOString()
        });
        
        // Revert inventory quantity
        const { data: item } = await supabaseRequest(`inventory?id=eq.${movement[0].item_id}&select=quantity`);
        
        if (item && item[0]) {
            const revertQty = movement[0].type === 'IN'
                ? item[0].quantity - movement[0].quantity
                : item[0].quantity + movement[0].quantity;
            
            await supabaseRequest(`inventory?id=eq.${movement[0].item_id}`, 'PATCH', { quantity: revertQty });
        }
        
        res.json({ success: true, message: 'Movement deleted and quantity reverted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== FINANCIAL BREAKDOWN API ====================

// Get financial breakdown for an order
router.get('/financial/breakdown/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const { data: order } = await supabaseRequest(`orders?id=eq.${orderId}`);
        
        if (!order || !order[0]) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const o = order[0];
        
        // Calculate breakdown using sheet-based formula
        const sheets = o.pageCount || 1;
        const isDuplex = o.duplex === 'double';
        const pages = isDuplex ? sheets * 2 : sheets;
        
        const breakdown = {
            paperCost: sheets * 100,
            inkCost: pages * 50,
            coverCost: o.hasCover ? sheets * 150 : 0,
            totalOperationalCost: (sheets * 100) + (pages * 50) + (o.hasCover ? sheets * 150 : 0),
            deliveryFee: 3000,
            bindingCost: o.bindingCost || 0,
            subtotal: o.total || 0 - 3000,
            total: o.total || 0,
            revenue: o.price || 0,
            profit: (o.price || 0) - ((sheets * 100) + (pages * 50) + (o.hasCover ? sheets * 150 : 0))
        };
        
        res.json(breakdown);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;