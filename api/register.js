/**
 * TECHOPRINT 2026 - Registration API Route (Vercel Serverless)
 * NEW SUPABASE PROJECT - rqzsokvhgjlftkouhphb
 */

const bcrypt = require('bcryptjs');

// NEW SUPABASE CREDENTIALS - rqzsokvhgjlftkouhphb
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rqzsokvhgjlftkouhphb.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY';
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

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_ANON_KEY) {
        console.error('❌ Missing environment variables');
        return res.status(500).json({ success: false, error: 'إعدادات السيرفر ناقصة' });
    }

    try {
        const { username, password, phone, governorate, address, category } = req.body;

        // Validate required fields
        if (!username || !password || !phone || !governorate || !address || !category) {
            return res.status(400).json({ 
                success: false, 
                error: 'جميع الحقول الستة مطلوبة' 
            });
        }

        // Check if username exists
        const checkRes = await fetch(
            `${SUPABASE_URL}/rest/v1/profiles?username=eq.${encodeURIComponent(username)}&select=id`,
            {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            }
        );
        const existing = await checkRes.json();

        if (existing && existing.length > 0) {
            return res.status(400).json({ success: false, error: 'اسم المستخدم موجود مسبقاً' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate UUID
        const userId = crypto.randomUUID();

        // Profile data - EXACT column names
        const profileData = {
            id: userId,
            username: username,
            password: hashedPassword,
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

        console.log('📤 NEW Project:', SUPABASE_URL);
        console.log('📤 Profile:', profileData);

        // Insert using ANON for apikey + SERVICE for Authorization
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(profileData)
        });

        const insertText = await insertRes.text();
        console.log('📥 Insert response:', insertRes.status, insertText);

        if (insertRes.status === 201 || insertRes.status === 200) {
            console.log('✅ SUCCESS! User saved in NEW cloud.');
            return res.status(201).json({
                success: true,
                message: 'تم إنشاء الحساب بنجاح!',
                user: { id: userId, username, balance_iqd: 0, pages_count: 1000 }
            });
        } else {
            console.error('❌ Supabase Error:', insertText);
            return res.status(500).json({
                success: false,
                error: 'السيرفر رفض البيانات: ' + insertText
            });
        }

    } catch (err) {
        console.error('❌ Server Crash:', err);
        return res.status(500).json({
            success: false,
            error: 'خطأ داخلي: ' + err.message
        });
    }
};