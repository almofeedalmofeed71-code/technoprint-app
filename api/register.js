/**
 * TECHOPRINT 2026 - Registration API Route (Vercel Serverless)
 * Uses SERVICE_ROLE_KEY to bypass RLS and write to profiles table
 */

const SUPABASE_URL = 'https://avabozirwdefwtabywqo.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YWJvemlyd2RlZnd0YWJ5d3FvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njg2MzU0NCwiZXhwIjoyMDkyNDM5NTQ0fQ.8cK3pJQ2mK9L5nF1vW2xZ4yQ6sT8hR3dA0mB7eC9uI4';

module.exports = async function handler(req, res) {
    // CORS headers
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
        const { username, password, phone, governorate, address, category } = req.body;
        
        console.log('📥 Registration request:', req.body);
        
        // Validate all 6 fields
        if (!username || !password || !phone || !governorate || !address || !category) {
            return res.status(400).json({ 
                success: false,
                error: 'جميع الحقول الستة مطلوبة (المستخدم، كلمة المرور، الهاتف، المحافظة، العنوان، الفئة)' 
            });
        }
        
        // Check if username exists
        const checkRes = await fetch(
            `${SUPABASE_URL}/rest/v1/profiles?username=eq.${encodeURIComponent(username)}&select=id`,
            {
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
                }
            }
        );
        const existing = await checkRes.json();
        
        if (existing && existing.length > 0) {
            return res.status(400).json({ 
                success: false,
                error: 'اسم المستخدم موجود مسبقاً' 
            });
        }
        
        // Generate UUID for new user
        const userId = crypto.randomUUID();
        
        // Create profile with EXACT column names
        const profileData = {
            id: userId,
            username: username,
            password: password,
            phone: phone,
            governorate: governorate,
            address: address,
            category: category,
            role: 'user',
            balance_iqd: 0,
            pages_count: 1000,
            status: 'active',
            created_at: new Date().toISOString()
        };
        
        console.log('📤 Creating profile:', profileData);
        
        // Insert into Supabase using SERVICE_ROLE_KEY (bypasses RLS)
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(profileData)
        });
        
        const insertText = await insertRes.text();
        console.log('📥 Insert response:', insertRes.status, insertText);
        
        if (insertRes.status === 201 || insertRes.status === 200) {
            const created = insertText ? JSON.parse(insertText) : { id: userId };
            
            return res.status(201).json({
                success: true,
                user: {
                    id: userId,
                    username: username,
                    phone: phone,
                    governorate: governorate,
                    category: category,
                    balance_iqd: 0,
                    pages_count: 1000
                },
                message: 'تم إنشاء الحساب بنجاح!'
            });
        } else {
            return res.status(500).json({ 
                success: false,
                error: insertText 
            });
        }
        
    } catch (err) {
        console.error('❌ Registration error:', err);
        return res.status(500).json({ 
            success: false,
            error: 'خطأ في الخادم: ' + err.message 
        });
    }
};