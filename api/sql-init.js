/**
 * TECHOPRINT 2026 - SQL EXECUTION API
 * Direct database updates via Supabase
 */

const SUPABASE_URL = 'https://rqzsokvhgjlftkouhphb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ2NTI0NywiZXhwIjoyMDkxMDQxMjQ3fQ.NuAG8xhCkYqsb-vZ-8K6Voe6p9oqBUIuVVrQrijpT7Y';

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { secret } = req.body;
        
        if (secret !== 'technoprint-admin-secret-2024') {
            return res.status(403).json({ success: false, error: 'غير مخول' });
        }

        // Step 1: Check if admin exists
        const checkRes = await fetch(
            `${SUPABASE_URL}/rest/v1/profiles?username=eq.admin&select=id,role`,
            {
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
                }
            }
        );
        
        const admins = await checkRes.json();
        console.log('📋 Admin check:', admins);
        
        let adminId;
        let action;
        
        if (admins && admins.length > 0) {
            // Admin exists - UPDATE
            adminId = admins[0].id;
            action = 'updated';
            
            const updateRes = await fetch(
                `${SUPABASE_URL}/rest/v1/profiles?id=eq.${adminId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_SERVICE_KEY,
                        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        role: 'admin',
                        balance_iqd: 9999999,
                        pages_count: 999999
                    })
                }
            );
            
            if (!updateRes.ok) {
                throw new Error('Update failed');
            }
        } else {
            // Create admin
            action = 'created';
            adminId = crypto.randomUUID();
            
            const createRes = await fetch(
                `${SUPABASE_URL}/rest/v1/profiles`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_SERVICE_KEY,
                        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        id: adminId,
                        username: 'admin',
                        password: 'technoprint2024',
                        phone: '+9647700000001',
                        governorate: 'baghdad',
                        address: 'Admin HQ',
                        category: 'عادي',
                        role: 'admin',
                        balance_iqd: 9999999,
                        pages_count: 999999,
                        status: 'active'
                    })
                }
            );
            
            if (!createRes.ok) {
                throw new Error('Create failed');
            }
        }
        
        return res.status(200).json({
            success: true,
            message: `Admin account ${action}`,
            adminId,
            role: 'admin',
            balance: 9999999,
            pages: 999999
        });

    } catch (err) {
        console.error('❌ SQL Init error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};