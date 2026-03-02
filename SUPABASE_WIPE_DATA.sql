-- ================================================================
-- JRADIANCE - DATA WIPE SCRIPT
-- ================================================================
-- ⚠️  WARNING: This will DELETE ALL YOUR DATA!
-- ================================================================
-- ONLY run this if you want to start fresh with empty tables.
-- Your auth.users will NOT be deleted (Supabase Auth is separate).
-- ================================================================

-- Delete all data from tables (in correct order due to foreign keys)
DELETE FROM public.admin_notifications;
DELETE FROM public.sales_analytics;
DELETE FROM public.issues;
DELETE FROM public.admin_activity_logs;
DELETE FROM public.order_items;
DELETE FROM public.orders;
DELETE FROM public.wishlist;
DELETE FROM public.cart_items;
DELETE FROM public.product_reviews;
DELETE FROM public.products;
DELETE FROM public.admin_staff;
DELETE FROM public.profiles;

-- Reset sequence
ALTER SEQUENCE public.order_number_seq RESTART WITH 1000;

-- Verify wipe
DO $$
DECLARE
  v_profiles integer;
  v_products integer;
  v_orders integer;
BEGIN
  SELECT COUNT(*) INTO v_profiles FROM public.profiles;
  SELECT COUNT(*) INTO v_products FROM public.products;
  SELECT COUNT(*) INTO v_orders FROM public.orders;
  
  RAISE NOTICE '✅ DATA WIPED!';
  RAISE NOTICE 'Profiles: %, Products: %, Orders: %', v_profiles, v_products, v_orders;
  RAISE NOTICE '⚠️  Auth users still exist in Supabase Auth (not deleted)';
END $$;

-- ================================================================
-- ✅ WIPE COMPLETE!
-- ================================================================
