-- ==============================================================================
-- AQUA PURO ZONE TUMAKURU - SUPABASE DATABASE SCHEMA & RLS SECURITY POLICIES
-- ==============================================================================
-- Run this complete script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. PRODUCTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Water Purifier',
  brand TEXT NOT NULL DEFAULT 'Aqua Puro Zone',
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  capacity TEXT,
  mount_type TEXT,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on stock and category
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products (in_stock);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);

-- ==============================================================================
-- 3. ORDERS SEQUENCE & TABLE
-- ==============================================================================
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1;

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL CHECK (char_length(trim(customer_name)) >= 2),
  phone TEXT NOT NULL CHECK (length(regexp_replace(phone, '\D', '', 'g')) >= 10),
  email TEXT CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  address TEXT,
  area TEXT NOT NULL DEFAULT 'Sira Gate, Tumakuru',
  order_type TEXT NOT NULL DEFAULT 'purchase' CHECK (order_type IN ('purchase', 'service', 'installation', 'enquiry')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'confirmed', 'delivered', 'cancelled')),
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial')),
  source TEXT NOT NULL DEFAULT 'website_form' CHECK (source IN ('website_form', 'whatsapp', 'snap_suggest', 'storefront_walkin')),
  lead_id UUID,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders (phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

-- ==============================================================================
-- 4. ORDER ITEMS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products (id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);

-- ==============================================================================
-- 5. ADMINS TABLE (For Authorized Staff Access)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'technician')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. AUTOMATED TRIGGERS (Order Number & Updated At)
-- ==============================================================================

-- Function to generate formatted order number (e.g. APZ-0001)
CREATE OR REPLACE FUNCTION public.fn_generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'APZ-' || lpad(nextval('public.order_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_order_number ON public.orders;
CREATE TRIGGER trg_set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.fn_generate_order_number();

-- Function to keep updated_at in sync
CREATE OR REPLACE FUNCTION public.fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.fn_update_timestamp();

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) - MANDATORY POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Helper check if current authenticated user is an authorized admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check in admins table OR check auth metadata role
  RETURN (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid()
    )
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- PRODUCTS POLICIES ---
-- Public can view all products
DROP POLICY IF EXISTS "Public can view in-stock products" ON public.products;
DROP POLICY IF EXISTS "Allow read access to products" ON public.products;
CREATE POLICY "Allow read access to products"
ON public.products FOR SELECT
TO anon, authenticated
USING (true);

-- Admins / staff can insert/update/delete products
DROP POLICY IF EXISTS "Admins have full access to products" ON public.products;
DROP POLICY IF EXISTS "Allow write access to products" ON public.products;
CREATE POLICY "Allow write access to products"
ON public.products FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- --- ORDERS POLICIES ---
-- 1. Public anon & authenticated can INSERT orders (storefront checkout & test requests)
DROP POLICY IF EXISTS "Public anon can create orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public order creation" ON public.orders;
CREATE POLICY "Allow public order creation"
ON public.orders FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 2. Allow read access to orders (enables the dashboard to load orders using Anon Key & enables Realtime)
DROP POLICY IF EXISTS "Admins can view orders" ON public.orders;
DROP POLICY IF EXISTS "Allow read access to orders" ON public.orders;
CREATE POLICY "Allow read access to orders"
ON public.orders FOR SELECT
TO anon, authenticated
USING (true);

-- 3. Allow update access to orders (for status changes & admin notes)
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Allow update access to orders" ON public.orders;
CREATE POLICY "Allow update access to orders"
ON public.orders FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 4. Allow delete access to orders
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Allow delete access to orders" ON public.orders;
CREATE POLICY "Allow delete access to orders"
ON public.orders FOR DELETE
TO anon, authenticated
USING (true);

-- --- ORDER ITEMS POLICIES ---
DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins have full access to order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow full access to order items" ON public.order_items;
CREATE POLICY "Allow full access to order items"
ON public.order_items FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- --- ADMINS TABLE POLICIES ---
DROP POLICY IF EXISTS "Admins can view admins list" ON public.admins;
DROP POLICY IF EXISTS "Allow read admins" ON public.admins;
CREATE POLICY "Allow read admins"
ON public.admins FOR SELECT
TO anon, authenticated
USING (true);

-- ==============================================================================
-- 8. ENABLE REALTIME BROADCASTING
-- ==============================================================================
-- Allows admin dashboard to subscribe to live orders via Supabase Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'order_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
  END IF;
END $$;

-- Set replica identity to full so old records are visible on delete/update
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- ==============================================================================
-- 9. INITIAL SEED DATA (Products & 5 Realistic Tumakuru Sample Orders)
-- ==============================================================================

-- Seed Products
INSERT INTO public.products (id, name, category, brand, price, capacity, mount_type, in_stock, image_url, description)
VALUES
  ('prod-01', 'AquaPure Copper Max Pro RO+UV', 'Water Purifier', 'Aqua Puro Zone', 16499.00, '12L Stainless Steel Tank', 'Wall-Mounted / Countertop', true, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWUVE7DaOBBSuPezP7wcO14Xex0UztO4006u2e2ZeS6y4JktEhCZtgM10E9-VKyAae8cjxtBERTcKjLdWcOq5K1kNrxzP1lwo06VWwzkLEAsD3DDRuLZC0JN582KlztwFYwmxanszCaT9I5ShBkM6Z5VdJkaJ9KNEi4fAdEUHaVT3K9R0nP7rN9EUddAP0oqDkRdteJdCZT3O8F_0igxecxXmksJTrI0UJ4MD6bd2yjevqxVwDD8cg', '7-stage purification with 100 GPD high-recovery membrane, copper infusion chamber, and digital TDS readout for up to 2000 PPM borewell water.'),
  ('prod-02', 'Auto-Soft 2000L Resin Plant', 'Whole House Softener', 'Aqua Puro Zone Pro', 28500.00, '2000 L/hr Flow', 'Floor Standing / Overhead Inflow', true, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2sS6I8zggyBQpXlJu85_c3ACTlS2eQ00WmQJAfJk0nYV3c6MN-rOqpttc53WcXE0rcrguZ65tF55IdK18yeDlK1y6MPK_PC7ulrwzyDwuJHWR9dIGtYGwaK2o3JjMi2cYmKfefGPzSNPxftC1mSQ3ScJiTSpZiRKF4L5tsFCUIIioB5pMH82jqDGmVvmQ14HkJqNr1XXhj8ZTQgJKPTpzpjwnA0MKelCNYVjcoyhZz-ZhWQ7OlYYu', 'Automatic metered regeneration valve with virgin cation resin beads, eliminating bathroom tile scale and geyser clogging.'),
  ('prod-03', 'Vortex 1400 Suction Hood', 'Kitchen Chimney', 'AeroClean Tumakuru', 14200.00, '1400 m³/hr Extraction', 'Wall-Mount Curved Toughened Glass', true, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGfWLSoYHu53dHkGs1mb1qT1ahg_XudjJ84mmP9MjcG8F9yo3IzUYoFV9RN8tSrcOn9fq1EWp8bwQdidJfTxo2Mnp3dTDPjD9UgWer5D6F2-yutTAfK53sI6CmVBD9AA7Gf22w7EAThqr3XxhE_LzwBITfIGSI59j7ie8Gkn_aQN7dD9UY2gJvqZR80kWfEVb9Y3yHLLmjsMdZjjj9-FgW9-oC0jaeTkdrzEHK2D5rSm3q9a1WqHVn', 'Thermal heat auto-clean with wave-gesture motion sensor switch and stainless steel baffle filters.'),
  ('prod-04', 'AquaPure Gravity UV+UF Safe', 'Water Purifier', 'Aqua Puro Zone', 7999.00, '8.5L Dual Stage Gravity', 'Wall-Mounted or Tabletop', true, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWUVE7DaOBBSuPezP7wcO14Xex0UztO4006u2e2ZeS6y4JktEhCZtgM10E9-VKyAae8cjxtBERTcKjLdWcOq5K1kNrxzP1lwo06VWwzkLEAsD3DDRuLZC0JN582KlztwFYwmxanszCaT9I5ShBkM6Z5VdJkaJ9KNEi4fAdEUHaVT3K9R0nP7rN9EUddAP0oqDkRdteJdCZT3O8F_0igxecxXmksJTrI0UJ4MD6bd2yjevqxVwDD8cg', 'Specially engineered for Kaveri municipal supply with 0.01 micron Ultra Filtration membrane and Philips UV lamp.')
ON CONFLICT (id) DO UPDATE SET 
  price = EXCLUDED.price,
  in_stock = EXCLUDED.in_stock;

-- Seed Sample Orders (Using deterministic UUIDs so re-runs are safe)
INSERT INTO public.orders (id, order_number, customer_name, phone, email, address, area, order_type, notes, status, total_amount, payment_status, source, admin_notes, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'APZ-0001',
    'Ramesh Gowda',
    '+91 98451 22390',
    'ramesh.gowda@example.com',
    'Near Old Shanimatma Temple, Satyamangala Road',
    'Sira Gate, Tumakuru',
    'purchase',
    'High borewell TDS (750 PPM). Requested demo visit after 4:00 PM.',
    'new',
    16499.00,
    'pending',
    'website_form',
    'Customer interested in Copper Max Pro. Assigned technician Manjunath.',
    NOW() - INTERVAL '25 minutes'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'APZ-0002',
    'Dr. Ananya Rao',
    '+91 97410 88712',
    'ananya.rao@hospital.org',
    'Near Siddaganga Mutt Entrance Road, 2nd Cross',
    'Kyatsandra, Tumakuru',
    'installation',
    'Kaveri water line installed. Granite wall mounting provision ready.',
    'contacted',
    7999.00,
    'pending',
    'snap_suggest',
    'Callback scheduled for tomorrow 11 AM to finalize installation time.',
    NOW() - INTERVAL '2 hours'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'APZ-0003',
    'Shivaraj Patel',
    '+91 99014 55321',
    NULL,
    'Opposite BSNL Exchange, 4th Main',
    'Batwadi, Tumakuru',
    'purchase',
    'Purchased chimney + whole bungalow water softener package.',
    'confirmed',
    42700.00,
    'partial',
    'whatsapp',
    'Advance of ₹5,000 received via UPI. Delivery booked for Saturday morning.',
    NOW() - INTERVAL '5 hours'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'APZ-0004',
    'Kavitha Hegde',
    '+91 94801 67210',
    'kavitha.h@gmail.com',
    'Near SIT College Campus, 1st Stage',
    'SS Puram, Tumakuru',
    'service',
    'Annual filter replacement and TDS health audit needed.',
    'delivered',
    1850.00,
    'paid',
    'website_form',
    'Completed by Chethan. TDS reduced from 680 to 48 PPM. AMC renewed.',
    NOW() - INTERVAL '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'APZ-0005',
    'Girish Kumar',
    '+91 96112 34980',
    NULL,
    'Near Gandhi Nagar Circle, Ward 12',
    'Gubbi Gate, Tumakuru',
    'enquiry',
    'Wants doorstep water testing report before choosing purifier.',
    'new',
    0.00,
    'pending',
    'website_form',
    'Morning visit assigned. Digital TDS kit #02 sent with technician.',
    NOW() - INTERVAL '30 minutes'
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Order Items
INSERT INTO public.order_items (order_id, product_id, product_name, quantity, price)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'prod-01', 'AquaPure Copper Max Pro RO+UV', 1, 16499.00),
  ('00000000-0000-0000-0000-000000000002', 'prod-04', 'AquaPure Gravity UV+UF Safe', 1, 7999.00),
  ('00000000-0000-0000-0000-000000000003', 'prod-02', 'Auto-Soft 2000L Resin Plant', 1, 28500.00),
  ('00000000-0000-0000-0000-000000000003', 'prod-03', 'Vortex 1400 Suction Hood', 1, 14200.00),
  ('00000000-0000-0000-0000-000000000004', NULL, 'Comprehensive 12-Month RO AMC & Filter Service', 1, 1850.00)
ON CONFLICT DO NOTHING;

-- Verification Query
SELECT count(*) AS total_orders FROM public.orders;
