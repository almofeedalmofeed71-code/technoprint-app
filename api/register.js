/**
 * TECHOPRINT 2026 - Registration API Route (Vercel Serverless)
 * FIXED VERSION - Correct Headers & Column Mapping
 */

const bcrypt = require('bcryptjs');

// استدعاء المفاتيح من إعدادات Vercel
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY; // مفتاح الباب
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // مفتاح الخزنة
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://technoprint-app.vercel.app';

module.exports = async function handler(req, res) {

    // ✅ إعدادات CORS للسماح للموقع فقط بالاتصال
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // ✅ التأكد من وجود المفاتيح في السيرفر
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_ANON_KEY) {
        console.error('❌ Missing environment variables');
        return res.status(500).json({ success: false, error: 'إعدادات السيرفر ناقصة (المفاتيح)' });
    }

    try {
        const { username, password, phone, governorate, address, category } = req.body;

        // 1. تشفير كلمة المرور للحماية
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. تجهيز البيانات لتطابق جداول السيرفر (Supabase)
        const profileData = {
            username: username,
            password: hashedPassword,
            phone: phone,
            governorate: governorate,
            address: address,
            category: category,
            role: 'user',
            balance_iqd: 0,        // الاسم الصحيح للعمود
            pages_count: 1000,     // الاسم الصحيح للعمود
            status: 'active',
            created_at: new Date().toISOString()
        };

        console.log('📤 Sending to Supabase Cloud...');

        // 3. إرسال البيانات باستخدام المفاتيح الصحيحة (فصل الـ apikey عن الـ Authorization)
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY, // المفتاح العام لفتح الباب
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, // المفتاح القوي لتجاوز القفل
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(profileData)
        });

        const insertText = await insertRes.text();

        if (insertRes.status === 201 || insertRes.status === 200) {
            console.log('✅ Success! User saved in Cloud.');
            return res.status(201).json({
                success: true,
                message: 'تم إنشاء الحساب بنجاح في السيرفر السحابي!'
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
};س