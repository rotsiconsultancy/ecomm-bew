-- ============================================================================
-- Bewama Checkout System — companion products, influence config, payment methods
-- ============================================================================

-- 1. companion_rules — category-level companion suggestions
CREATE TABLE IF NOT EXISTS public.companion_rules (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_category       text NOT NULL,
  target_category       text NOT NULL,
  reason_copy           text NOT NULL DEFAULT '',
  points_multiplier     numeric NOT NULL DEFAULT 2.0,
  display_limit         integer NOT NULL DEFAULT 2,
  is_active             boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now()
);

-- 2. product_companions — product-level overrides
CREATE TABLE IF NOT EXISTS public.product_companions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id            uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  companion_product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order            integer NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_companions_product ON public.product_companions (product_id);

-- 3. checkout_config — single-row checkout configuration
CREATE TABLE IF NOT EXISTS public.checkout_config (
  id                          integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  influence_default_retail    boolean NOT NULL DEFAULT true,
  influence_default_wholesale boolean NOT NULL DEFAULT false,
  influence_intensity         text NOT NULL DEFAULT 'medium'
                                CHECK (influence_intensity IN ('low', 'medium', 'high')),
  show_companions             boolean NOT NULL DEFAULT true,
  show_scarcity               boolean NOT NULL DEFAULT true,
  show_social_proof           boolean NOT NULL DEFAULT true,
  show_points_overlay         boolean NOT NULL DEFAULT true,
  show_streak_reminder        boolean NOT NULL DEFAULT true,
  show_bundle_framing         boolean NOT NULL DEFAULT true,
  influence_toggle_label      text NOT NULL DEFAULT 'Smart suggestions — show me products and deals that match my order',
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

-- Seed the single config row
INSERT INTO public.checkout_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 4. post_purchase_config — post-purchase prompt cards
CREATE TABLE IF NOT EXISTS public.post_purchase_config (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_key      text UNIQUE NOT NULL,
  is_active       boolean NOT NULL DEFAULT true,
  points_value    integer NOT NULL DEFAULT 0,
  copy_text       text NOT NULL DEFAULT '',
  trigger_timing  text NOT NULL DEFAULT 'immediate'
                    CHECK (trigger_timing IN ('immediate', 'after_delivery')),
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Seed default post-purchase prompts
INSERT INTO public.post_purchase_config (prompt_key, is_active, points_value, copy_text, trigger_timing, sort_order) VALUES
  ('share_photo',      true,  300, 'Post a site photo when your materials arrive', 'after_delivery', 1),
  ('notif_monday',     true,   50, 'Get Monday deal alerts — never miss a price drop', 'immediate', 2),
  ('notif_price_alert', true,  50, 'Get notified when items you buy go on sale', 'immediate', 3),
  ('notif_new_sku',    true,   50, 'Be first to know about new products in your categories', 'immediate', 4),
  ('review_reminder',  true,  100, 'Share your experience — help other contractors choose right', 'after_delivery', 5),
  ('referral',         true,  400, 'Refer a friend — you both earn points when they order', 'immediate', 6)
ON CONFLICT (prompt_key) DO NOTHING;

-- 5. payment_methods — admin-configured payment options
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method_key      text UNIQUE NOT NULL
                    CHECK (method_key IN ('mpesa', 'card', 'cod', 'account')),
  label           text NOT NULL,
  is_active       boolean NOT NULL DEFAULT true,
  sort_order      integer NOT NULL DEFAULT 0,
  min_order_amount numeric NOT NULL DEFAULT 0,
  allowed_tiers   jsonb NOT NULL DEFAULT '["customer","wholesale","admin","staff"]'::jsonb,
  allowed_regions jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Seed default payment methods
INSERT INTO public.payment_methods (method_key, label, is_active, sort_order, min_order_amount, allowed_tiers) VALUES
  ('mpesa',   'M-Pesa',                    true,  1, 0,    '["customer","wholesale","admin","staff"]'::jsonb),
  ('card',    'Card Payment',              false, 2, 0,    '["customer","wholesale","admin","staff"]'::jsonb),
  ('cod',     'Cash on Delivery',          true,  3, 0,    '["customer","wholesale","admin","staff"]'::jsonb),
  ('account', 'Bill to Account (Net 30)',  false, 4, 5000, '["wholesale"]'::jsonb)
ON CONFLICT (method_key) DO NOTHING;

-- 6. Add influence_mode_enabled to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS influence_mode_enabled boolean;

-- 7. Add orders_last_30_days to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS orders_last_30_days integer NOT NULL DEFAULT 0;

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE public.companion_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_companions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_purchase_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- All checkout config tables: public read, service role write
CREATE POLICY "companion_rules_read" ON public.companion_rules FOR SELECT USING (true);
CREATE POLICY "product_companions_read" ON public.product_companions FOR SELECT USING (true);
CREATE POLICY "checkout_config_read" ON public.checkout_config FOR SELECT USING (true);
CREATE POLICY "post_purchase_config_read" ON public.post_purchase_config FOR SELECT USING (true);
CREATE POLICY "payment_methods_read" ON public.payment_methods FOR SELECT USING (true);

-- Service role insert/update/delete (handled by service client)
CREATE POLICY "companion_rules_service_all" ON public.companion_rules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "product_companions_service_all" ON public.product_companions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "checkout_config_service_all" ON public.checkout_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "post_purchase_config_service_all" ON public.post_purchase_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "payment_methods_service_all" ON public.payment_methods FOR ALL USING (true) WITH CHECK (true);
