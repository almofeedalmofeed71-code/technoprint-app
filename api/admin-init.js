/**
 * TECHOPRINT 2026 - Admin Initialization API
 * Creates/updates admin profile in Supabase
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rqzsokvhgjlftkouhphb.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ2NTI0NywiZXhwIjoyMDkxMDQxMjQ3fQ.NuAG8xhCkYqsb-vZ-8K6Voe6p9oqBUIuVVrQrijpT7Y';

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { secret } = req.body;
        
        // Verify secret key (for security)
        if (secret !== 'technoprint-admin-secret-2024') {
            return res.status(403).json({ success: false, error: 'غير مخول' });
        }

        // Check if admin exists
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
        
        if (admins && admins.length > 0) {
            // Admin exists - update role to admin
            const adminId = admins[0].id;
            
            await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${adminId}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: 'admin' })
            });
            
            return res.status(200).json({ 
                success: true, 
                message: 'تم تحديث صلاحية الأدمن',
                adminId 
            });
        } else {
            // Create new admin profile
            const adminId = crypto.randomUUID();
            
            const createRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
            body: JSON.stringify({
                    id: adminId,
                    username: 'hseenop9090',
                    password: 'op3120879',
                    phone: '+9647700000000',
                    governorate: 'baghdad',
                    address: 'Admin HQ',
                    category: 'عادي',
                    role: 'admin',
                    balance_iqd: 0,
                    pages_count: 0,
                    status: 'active'
                })
            });
            
            const created = await createRes.json();
            
            return res.status(201).json({ 
                success: true, 
                message: 'تم إنشاء حساب الأدمن',
                adminId 
            });
        }

    } catch (err) {
        console.error('❌ Admin init error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};