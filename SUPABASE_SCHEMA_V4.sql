-- ================================================================
-- JRADIANCE E-Commerce - PRODUCTION SCHEMA v5.0
-- ================================================================
-- COMPLETE FIX FOR ALL DATABASE ISSUES
-- Safe to run multiple times - Won't delete existing data
-- ================================================================


-- ================================================================
-- PART 1: DROP EXISTING POLICIES (Safe - Won't delete data)
-- ================================================================

-- Drop policies only (not tables or data)
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_chief_admin" ON public.profiles;

DROP POLICY IF EXISTS "admin_staff_select_admin" ON public.admin_staff;
DROP POLICY IF EXISTS "admin_staff_insert_chief_admin" ON public.admin_staff;
DROP POLICY IF EXISTS "admin_staff_update_chief_admin" ON public.admin_staff;

DROP POLICY IF EXISTS "products_select_public" ON public.products;
DROP POLICY IF EXISTS "products_select_admin" ON public.products;
DROP POLICY IF EXISTS "products_insert_admin" ON public.products;
DROP POLICY IF EXISTS "products_update_admin" ON public.products;
DROP POLICY IF EXISTS "products_delete_admin" ON public.products;

DROP POLICY IF EXISTS "cart_items_select_own" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_insert_own" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_update_own" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_delete_own" ON public.cart_items;

DROP POLICY IF EXISTS "wishlist_select_own" ON public.wishlist;
DROP POLICY IF EXISTS "wishlist_insert_own" ON public.wishlist;
DROP POLICY IF EXISTS "wishlist_delete_own" ON public.wishlist;

DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
DROP POLICY IF EXISTS "orders_select_admin" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;

DROP POLICY IF EXISTS "order_items_select_own" ON public.order_items;
DROP POLICY IF EXISTS "order_items_select_admin" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_authenticated" ON public.order_items;

DROP POLICY IF EXISTS "product_reviews_select_public" ON public.product_reviews;
DROP POLICY IF EXISTS "product_reviews_insert_own" ON public.product_reviews;
DROP POLICY IF EXISTS "product_reviews_update_own" ON public.product_reviews;
DROP POLICY IF EXISTS "product_reviews_delete_own_admin" ON public.product_reviews;

DROP POLICY IF EXISTS "admin_activity_logs_select_admin" ON public.admin_activity_logs;
DROP POLICY IF EXISTS "admin_activity_logs_insert_system" ON public.admin_activity_logs;
DROP POLICY IF EXISTS "admin_activity_logs_manage_admin" ON public.admin_activity_logs;

DROP POLICY IF EXISTS "issues_select_own_admin" ON public.issues;
DROP POLICY IF EXISTS "issues_insert_authenticated" ON public.issues;
DROP POLICY IF EXISTS "issues_update_admin" ON public.issues;
DROP POLICY IF EXISTS "issues_delete_chief_admin" ON public.issues;

DROP POLICY IF EXISTS "sales_analytics_select_admin" ON public.sales_analytics;
DROP POLICY IF EXISTS "sales_analytics_manage_chief_admin" ON public.sales_analytics;

DROP POLICY IF EXISTS "admin_notifications_select_own" ON public.admin_notifications;
DROP POLICY IF EXISTS "admin_notifications_insert_system" ON public.admin_notifications;
DROP POLICY IF EXISTS "admin_notifications_update_own" ON public.admin_notifications;

-- Drop storage policies
DROP POLICY IF EXISTS "Public View Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Public View Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to own avatar folder" ON storage.objects;

-- Drop triggers (recreate them fresh)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS update_admin_staff_updated_at ON public.admin_staff;
DROP TRIGGER IF EXISTS deduct_stock_on_order_item ON public.order_items;
DROP TRIGGER IF EXISTS restore_stock_on_order_cancel ON public.orders;
DROP TRIGGER IF EXISTS generate_product_slug ON public.products;
DROP TRIGGER IF EXISTS mark_verified_purchase_review ON public.product_reviews;
DROP TRIGGER IF EXISTS log_order_status_change ON public.orders;
DROP TRIGGER IF EXISTS notify_on_payment ON public.orders;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.log_admin_action(uuid,text,text,uuid,jsonb);
DROP FUNCTION IF EXISTS public.generate_order_number();
DROP FUNCTION IF EXISTS public.deduct_stock_on_order_item();
DROP FUNCTION IF EXISTS public.restore_stock_on_order_cancel();
DROP FUNCTION IF EXISTS public.generate_product_slug();
DROP FUNCTION IF EXISTS public.mark_verified_purchase_review();
DROP FUNCTION IF EXISTS public.log_order_status_change();
DROP FUNCTION IF EXISTS public.check_low_stock_alerts(integer);
DROP FUNCTION IF EXISTS public.create_payment_notification();


-- ================================================================
-- PART 2: ENSURE TABLES EXIST (Won't delete existing data)
-- ================================================================

-- Create types if they don't exist
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
  CREATE TYPE public.user_role AS ENUM ('customer', 'admin', 'agent', 'chief_admin');
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
  CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned');
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
  CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
END IF; END $$;

-- Create tables with IF NOT EXISTS (won't delete existing data)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  phone text,
  role public.user_role DEFAULT 'customer',
  avatar_url text,
  date_of_birth date,
  gender text,
  preferred_language text DEFAULT 'en',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_staff (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  staff_id text UNIQUE,
  department text,
  position text,
  manager_id uuid REFERENCES public.admin_staff(id),
  permissions jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  description text,
  category text NOT NULL,
  price decimal(10, 2) NOT NULL,
  discount_price decimal(10, 2),
  stock_quantity integer DEFAULT 0,
  sku text UNIQUE,
  images jsonb DEFAULT '[]'::jsonb,
  attributes jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES public.admin_staff(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  title text,
  review_text text,
  is_verified_purchase boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  added_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  subtotal decimal(10, 2) NOT NULL,
  tax decimal(10, 2) DEFAULT 0,
  shipping_cost decimal(10, 2) DEFAULT 0,
  total_amount decimal(10, 2) NOT NULL,
  discount_applied decimal(10, 2) DEFAULT 0,
  status public.order_status DEFAULT 'pending',
  payment_status public.payment_status DEFAULT 'pending',
  notes text,
  shipping_address text,
  billing_address text,
  estimated_delivery_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  product_name text NOT NULL,
  quantity integer NOT NULL,
  unit_price decimal(10, 2) NOT NULL,
  total_price decimal(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- CRITICAL FIX: admin_id is NULLABLE (customers can place orders)
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES public.admin_staff(id),  -- ← NULLABLE!
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  changes jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('bug', 'complaint', 'feature_request')),
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'pending', 'solved', 'closed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  reported_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES public.admin_staff(id) ON DELETE SET NULL,
  resolved_by uuid REFERENCES public.admin_staff(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  customer_email text,
  customer_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sales_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_revenue decimal(10, 2) NOT NULL DEFAULT 0,
  total_orders integer NOT NULL DEFAULT 0,
  completed_orders integer NOT NULL DEFAULT 0,
  cancelled_orders integer NOT NULL DEFAULT 0,
  average_order_value decimal(10, 2) NOT NULL DEFAULT 0,
  top_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(period_start, period_end)
);

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('new_order', 'payment_received', 'order_updated', 'low_stock', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  related_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- PART 3: CREATE INDEXES (Safe - Won't delete data)
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON public.wishlist(product_id);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON public.product_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON public.admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_type ON public.issues(type);
CREATE INDEX IF NOT EXISTS idx_issues_assigned_to ON public.issues(assigned_to);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON public.issues(priority);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON public.issues(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sales_analytics_period ON public.sales_analytics(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_admin_id ON public.admin_notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON public.admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON public.admin_notifications(created_at DESC);


-- ================================================================
-- PART 4: CREATE SEQUENCE
-- ================================================================

CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1000 INCREMENT BY 1;


-- ================================================================
-- PART 5: FUNCTIONS (Fixed versions)
-- ================================================================

-- Handle new user registration (FIXED - creates/updates profile for ALL users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    (COALESCE(NEW.raw_user_meta_data->>'role', 'customer'))::public.user_role,
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  admin_id uuid,
  action text,
  resource_type text DEFAULT NULL,
  resource_id uuid DEFAULT NULL,
  changes jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.admin_activity_logs (admin_id, action, resource_type, resource_id, changes)
  VALUES (admin_id, action, resource_type, resource_id, changes);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate unique order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text AS $$
DECLARE
  v_order_number text;
BEGIN
  SELECT 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('public.order_number_seq')::text, 6, '0')
  INTO v_order_number;
  RETURN v_order_number;
END;
$$ LANGUAGE plpgsql;

-- Generate unique product slug
CREATE OR REPLACE FUNCTION public.generate_product_slug()
RETURNS trigger AS $$
DECLARE
  v_slug text;
  v_counter integer := 0;
  v_unique_slug text;
BEGIN
  v_slug := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := REGEXP_REPLACE(v_slug, '^-+|-+$', '', 'g');
  
  IF v_slug = '' THEN
    v_slug := 'product-' || substr(NEW.id::text, 1, 8);
  END IF;
  
  v_unique_slug := v_slug;
  
  WHILE EXISTS (
    SELECT 1 FROM public.products 
    WHERE slug = v_unique_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) LOOP
    v_counter := v_counter + 1;
    v_unique_slug := v_slug || '-' || v_counter;
  END LOOP;
  
  NEW.slug := v_unique_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Deduct stock on order
CREATE OR REPLACE FUNCTION public.deduct_stock_on_order_item()
RETURNS trigger AS $$
BEGIN
  UPDATE public.products 
  SET stock_quantity = stock_quantity - NEW.quantity, updated_at = now()
  WHERE id = NEW.product_id;
  
  IF (SELECT stock_quantity FROM public.products WHERE id = NEW.product_id) < 10 THEN
    INSERT INTO public.admin_activity_logs (action, resource_type, resource_id, changes)
    VALUES ('low_stock_alert', 'products', NEW.product_id, 
      jsonb_build_object('remaining_stock', (SELECT stock_quantity FROM public.products WHERE id = NEW.product_id)));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Restore stock on order cancel
CREATE OR REPLACE FUNCTION public.restore_stock_on_order_cancel()
RETURNS trigger AS $$
BEGIN
  IF (OLD.status NOT IN ('cancelled', 'returned') AND NEW.status IN ('cancelled', 'returned')) THEN
    UPDATE public.products p
    SET stock_quantity = stock_quantity + oi.quantity, updated_at = now()
    FROM public.order_items oi
    WHERE oi.order_id = OLD.id AND oi.product_id = p.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Mark verified purchase reviews
CREATE OR REPLACE FUNCTION public.mark_verified_purchase_review()
RETURNS trigger AS $$
DECLARE
  v_is_verified boolean := false;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON oi.order_id = o.id
    WHERE oi.product_id = NEW.product_id AND o.user_id = NEW.user_id
      AND o.status = 'delivered' AND o.payment_status = 'completed'
  ) INTO v_is_verified;
  
  NEW.is_verified_purchase := v_is_verified;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Log order status changes
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS trigger AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.admin_activity_logs (action, resource_type, resource_id, changes)
    VALUES ('order_status_changed', 'orders', NEW.id, 
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Get low stock products
CREATE OR REPLACE FUNCTION public.check_low_stock_alerts(
  p_threshold integer DEFAULT 10
)
RETURNS TABLE (
  product_id uuid,
  product_name text,
  current_stock integer,
  sku text
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.stock_quantity, p.sku
  FROM public.products p
  WHERE p.stock_quantity <= p_threshold AND p.is_active = true
  ORDER BY p.stock_quantity ASC;
END;
$$ LANGUAGE plpgsql;

-- Create payment notification for admins
CREATE OR REPLACE FUNCTION public.create_payment_notification()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.admin_notifications (admin_id, type, title, message, related_order_id)
  SELECT 
    p.id as admin_id,
    'payment_received' as type,
    '💰 New Paid Order!' as title,
    'Order ' || NEW.order_number || ' worth ₦' || NEW.total_amount || ' has been paid' as message,
    NEW.id as related_order_id
  FROM public.profiles p
  WHERE p.role IN ('admin', 'chief_admin') AND p.is_active = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ================================================================
-- PART 6: TRIGGERS
-- ================================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_staff_updated_at BEFORE UPDATE ON public.admin_staff
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER generate_product_slug
  BEFORE INSERT OR UPDATE OF name ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.generate_product_slug();

CREATE TRIGGER deduct_stock_on_order_item
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.deduct_stock_on_order_item();

CREATE TRIGGER restore_stock_on_order_cancel
  AFTER UPDATE ON public.orders
  FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.restore_stock_on_order_cancel();

CREATE TRIGGER mark_verified_purchase_review
  BEFORE INSERT OR UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.mark_verified_purchase_review();

CREATE TRIGGER log_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.log_order_status_change();

CREATE TRIGGER notify_on_payment
  AFTER UPDATE ON public.orders
  FOR EACH ROW WHEN (OLD.payment_status = 'pending' AND NEW.payment_status = 'completed')
  EXECUTE FUNCTION public.create_payment_notification();


-- ================================================================
-- PART 7: ROW LEVEL SECURITY POLICIES (Fixed)
-- ================================================================

-- PROFILES POLICIES (Users MUST be able to read their own profile!)
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_chief_admin" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.admin_staff WHERE id = auth.uid() AND position = 'Chief Administrator'));

-- ADMIN STAFF POLICIES
CREATE POLICY "admin_staff_select_admin" ON public.admin_staff FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'agent', 'chief_admin')));
CREATE POLICY "admin_staff_insert_chief_admin" ON public.admin_staff FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'chief_admin'));
CREATE POLICY "admin_staff_update_chief_admin" ON public.admin_staff FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'chief_admin'));

-- PRODUCTS POLICIES
CREATE POLICY "products_select_public" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "products_select_admin" ON public.products FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'agent', 'chief_admin')));
CREATE POLICY "products_insert_admin" ON public.products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'agent', 'chief_admin')));
CREATE POLICY "products_update_admin" ON public.products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'agent', 'chief_admin')));
CREATE POLICY "products_delete_admin" ON public.products FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'chief_admin')));

-- CART ITEMS POLICIES
CREATE POLICY "cart_items_select_own" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cart_items_insert_own" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cart_items_update_own" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cart_items_delete_own" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- WISHLIST POLICIES
CREATE POLICY "wishlist_select_own" ON public.wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wishlist_insert_own" ON public.wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wishlist_delete_own" ON public.wishlist FOR DELETE USING (auth.uid() = user_id);

-- ORDERS POLICIES (Checkout needs INSERT!)
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_select_admin" ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'agent', 'chief_admin')));
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update_admin" ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'agent', 'chief_admin')));

-- ORDER ITEMS POLICIES (Checkout needs INSERT!)
CREATE POLICY "order_items_select_own" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()));
CREATE POLICY "order_items_select_admin" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'agent', 'chief_admin')));
CREATE POLICY "order_items_insert_authenticated" ON public.order_items FOR INSERT TO authenticated
WITH CHECK (true);

-- PRODUCT REVIEWS POLICIES
CREATE POLICY "product_reviews_select_public" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "product_reviews_insert_own" ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "product_reviews_update_own" ON public.product_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "product_reviews_delete_own_admin" ON public.product_reviews FOR DELETE USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'chief_admin')));

-- ADMIN ACTIVITY LOGS POLICIES (admin_id is NULLABLE!)
CREATE POLICY "admin_activity_logs_select_admin" ON public.admin_activity_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'chief_admin')));
CREATE POLICY "admin_activity_logs_insert_system" ON public.admin_activity_logs FOR INSERT TO authenticated
WITH CHECK (true);
CREATE POLICY "admin_activity_logs_manage_admin" ON public.admin_activity_logs FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'chief_admin')));

-- ISSUES POLICIES
CREATE POLICY "issues_select_own_admin" ON public.issues FOR SELECT USING (
  reported_by = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() 
  AND role IN ('admin', 'agent', 'chief_admin')));
CREATE POLICY "issues_insert_authenticated" ON public.issues FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "issues_update_admin" ON public.issues FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'agent', 'chief_admin')));
CREATE POLICY "issues_delete_chief_admin" ON public.issues FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'chief_admin'));

-- SALES ANALYTICS POLICIES
CREATE POLICY "sales_analytics_select_admin" ON public.sales_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'agent', 'chief_admin')));
CREATE POLICY "sales_analytics_manage_chief_admin" ON public.sales_analytics FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'chief_admin'));

-- ADMIN NOTIFICATIONS POLICIES
CREATE POLICY "admin_notifications_select_own" ON public.admin_notifications FOR SELECT TO authenticated
USING (admin_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'agent', 'chief_admin')
));
CREATE POLICY "admin_notifications_insert_system" ON public.admin_notifications FOR INSERT TO authenticated
WITH CHECK (true);
CREATE POLICY "admin_notifications_update_own" ON public.admin_notifications FOR UPDATE TO authenticated
USING (admin_id = auth.uid());


-- ================================================================
-- PART 8: GRANTS
-- ================================================================

GRANT USAGE ON SCHEMA public TO PUBLIC;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.cart_items TO authenticated;
GRANT ALL ON public.wishlist TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.product_reviews TO authenticated;
GRANT ALL ON public.order_items TO authenticated;
GRANT ALL ON public.admin_staff TO authenticated;
GRANT ALL ON public.issues TO authenticated;
GRANT ALL ON public.sales_analytics TO authenticated;
GRANT ALL ON public.admin_activity_logs TO authenticated;
GRANT ALL ON public.admin_notifications TO authenticated;

GRANT EXECUTE ON FUNCTION public.handle_new_user TO postgres, authenticated;
GRANT EXECUTE ON FUNCTION public.log_admin_action TO postgres, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_order_number TO postgres, authenticated;
GRANT EXECUTE ON FUNCTION public.check_low_stock_alerts TO postgres, authenticated;

GRANT USAGE ON SEQUENCE public.order_number_seq TO authenticated;


-- ================================================================
-- PART 9: STORAGE POLICIES
-- ================================================================

-- PRODUCT-IMAGES BUCKET
CREATE POLICY "Public View Product Images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated Upload Product Images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Authenticated Update Product Images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated Delete Product Images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');

-- AVATARS BUCKET
CREATE POLICY "Public View Avatars" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated Upload Avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated Update Avatars" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'avatars' AND ((storage.foldername(name))[1] = auth.uid()::text OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'chief_admin'))));
CREATE POLICY "Authenticated Delete Avatars" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'avatars' AND ((storage.foldername(name))[1] = auth.uid()::text OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'chief_admin'))));
CREATE POLICY "Users can upload to own avatar folder" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);


-- ================================================================
-- PART 10: FIX EXISTING USERS WITHOUT PROFILES
-- ================================================================

-- Create profiles for any auth.users without profiles
INSERT INTO public.profiles (id, email, full_name, role, is_active)
SELECT 
  au.id,
  au.email,
  COALESCE(split_part(au.email, '@', 1), 'User'),
  'customer',
  true
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- Activate all products
UPDATE public.products SET is_active = true WHERE is_active IS NOT true;


-- ================================================================
-- PART 11: VERIFICATION
-- ================================================================

DO $$
DECLARE
  v_users integer;
  v_profiles integer;
  v_products integer;
BEGIN
  SELECT COUNT(*) INTO v_users FROM auth.users;
  SELECT COUNT(*) INTO v_profiles FROM public.profiles;
  SELECT COUNT(*) INTO v_products FROM public.products WHERE is_active = true;
  
  RAISE NOTICE '✅ SCHEMA READY!';
  RAISE NOTICE 'Users: %, Profiles: %, Active Products: %', v_users, v_profiles, v_products;
  
  IF v_users > v_profiles THEN
    RAISE WARNING '⚠️  Some users missing profiles - check Part 10 fix';
  END IF;
END $$;

-- ================================================================
-- ✅ COMPLETE! Test login and checkout now!
-- ================================================================
