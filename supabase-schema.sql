-- TECHOPRINT 2026 - SUPABASE DATABASE SCHEMA
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/avabozirwdefwtabywqo/sql

-- =============================================
-- PROFILES TABLE (Students, Teachers, Admins)
-- =============================================
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'designer', 'admin')),
    avatar_url TEXT,
    balance_iqd DECIMAL(12,2) DEFAULT 0,
    balance_usd DECIMAL(10,2) DEFAULT 0,
    governorate TEXT,
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- LIBRARY TABLE (Books & Lectures)
-- =============================================
CREATE TABLE library (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    grade INTEGER,
    author_id UUID REFERENCES profiles(id),
    cover_url TEXT,
    file_url TEXT,
    price_iqd DECIMAL(10,2) DEFAULT 0,
    price_usd DECIMAL(8,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ORDERS TABLE (Printing Requests)
-- =============================================
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'printing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled')),
    items JSONB NOT NULL DEFAULT '[]',
    subtotal DECIMAL(12,2) DEFAULT 0,
    delivery_fee DECIMAL(8,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    currency TEXT DEFAULT 'IQD',
    delivery_address TEXT,
    delivery_governorate TEXT,
    delivery_phone TEXT,
    notes TEXT,
    estimated_delivery DATE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TRANSACTIONS TABLE (Financial Tracking)
-- =============================================
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdraw', 'transfer_sent', 'transfer_received', 'order_payment', 'order_refund', 'earning')),
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'IQD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    reference_id TEXT,
    reference_type TEXT,
    payment_method TEXT,
    payment_number TEXT,
    receipt_url TEXT,
    description TEXT,
    admin_notes TEXT,
    processed_by UUID REFERENCES profiles(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TICKETS TABLE (Support)
-- =============================================
CREATE TABLE tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('support', 'receipt_issue', 'delivery_issue', 'custom_design', 'complaint')),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_to UUID REFERENCES profiles(id),
    response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DELIVERIES TABLE (GPS Tracking)
-- =============================================
CREATE TABLE deliveries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES profiles(id),
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'picked_up', 'in_transit', 'delivered', 'failed')),
    current_lat DECIMAL(10,8),
    current_lng DECIMAL(11,8),
    pickup_time TIMESTAMP WITH TIME ZONE,
    delivery_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_library_subject ON library(subject);
CREATE INDEX idx_library_grade ON library(grade);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) - ENABLE
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE library ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Profiles: Users can view/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Library: Anyone can view active books
CREATE POLICY "Anyone can view active library" ON library
    FOR SELECT USING (is_active = true);

-- Orders: Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

-- Orders: Users can create their own orders
CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions: Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Tickets: Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON tickets
    FOR SELECT USING (auth.uid() = user_id);

-- Tickets: Users can create their own tickets
CREATE POLICY "Users can create tickets" ON tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- FUNCTION: Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- SAMPLE DATA: Demo Books
-- =============================================
INSERT INTO library (title, description, subject, grade, price_iqd, cover_url) VALUES
('رياضيات الصف الأول', 'كتاب الرياضيات للصف الأول الإعدادي', 'math', 1, 2500, NULL),
('العلوم الطبيعية', 'كتاب العلوم للصف الأول', 'science', 1, 3000, NULL),
('اللغة العربية', 'كتاب اللغة العربية', 'arabic', 1, 2000, NULL),
('الإنجليزية العامة', 'English for Beginners', 'english', 1, 3500, NULL),
('الفيزياء', 'كتاب الفيزياء للصف الثاني', 'physics', 2, 4000, NULL),
('الكيمياء', 'كتاب الكيمياء للصف الثاني', 'chemistry', 2, 3800, NULL),
('التاريخ', 'تاريخ العراق والعالم', 'history', 1, 2200, NULL),
('الجغرافيا', 'جغرافيا العراق', 'geography', 1, 2300, NULL);

-- =============================================
-- CONFIRMATION
-- =============================================
SELECT '✅ TECHOPRINT 2026 Schema Created Successfully!' AS status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
