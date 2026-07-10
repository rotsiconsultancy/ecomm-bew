-- Supplier marketplace foundation

-- ─── Existing enum-like constraints ──────────────────────────────────────────
DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role in ('admin', 'staff', 'wholesale', 'customer', 'supplier'));
END $$;

-- ─── Packages ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.supplier_packages (
  key                 text PRIMARY KEY,
  name                text NOT NULL,
  description         text,
  max_staff           integer NOT NULL DEFAULT 3,
  max_active_products integer NOT NULL DEFAULT 25,
  max_product_images  integer NOT NULL DEFAULT 5,
  analytics_level     text NOT NULL DEFAULT 'basic',
  is_active           boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.supplier_packages
  (key, name, description, max_staff, max_active_products, max_product_images, analytics_level)
VALUES
  ('starter', 'Starter', 'Default supplier package for new approved suppliers.', 3, 25, 5, 'basic'),
  ('growth', 'Growth', 'Expanded supplier package for growing catalogues and teams.', 10, 100, 8, 'standard'),
  ('enterprise', 'Enterprise', 'High-volume supplier package with expanded team and catalogue limits.', 50, 1000, 12, 'advanced')
ON CONFLICT (key) DO NOTHING;

-- ─── Supplier applications ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.supplier_applications (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name          text NOT NULL,
  contact_name          text NOT NULL,
  email                 text NOT NULL,
  phone                 text NOT NULL,
  kra_pin               text NOT NULL,
  registration_number   text NOT NULL,
  location              text NOT NULL,
  website_url           text,
  business_description  text NOT NULL,
  product_categories    text[] NOT NULL DEFAULT '{}',
  status                text NOT NULL DEFAULT 'pending'
                          CHECK (status in ('pending', 'approved', 'rejected')),
  reviewed_by           uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at           timestamptz,
  admin_notes           text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supplier_applications_status ON public.supplier_applications(status);
CREATE INDEX IF NOT EXISTS idx_supplier_applications_user_id ON public.supplier_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_supplier_applications_created_at ON public.supplier_applications(created_at DESC);

-- ─── Suppliers ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.suppliers (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name                  text NOT NULL,
  slug                          text UNIQUE NOT NULL,
  primary_contact_name          text NOT NULL,
  primary_email                 text NOT NULL,
  phone                         text NOT NULL,
  kra_pin                       text,
  registration_number           text,
  location                      text,
  website_url                   text,
  business_description          text,
  product_categories            text[] NOT NULL DEFAULT '{}',
  package_key                   text NOT NULL DEFAULT 'starter' REFERENCES public.supplier_packages(key),
  status                        text NOT NULL DEFAULT 'invited'
                                  CHECK (status in ('invited', 'active', 'suspended')),
  suspended_at                  timestamptz,
  suspended_by                  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  suspension_reason             text,
  created_from_application_id   uuid REFERENCES public.supplier_applications(id) ON DELETE SET NULL,
  created_at                    timestamptz NOT NULL DEFAULT now(),
  updated_at                    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_status ON public.suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_package_key ON public.suppliers(package_key);
CREATE INDEX IF NOT EXISTS idx_suppliers_slug ON public.suppliers(slug);

-- ─── Supplier members ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.supplier_members (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id        uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  user_id            uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email              text NOT NULL,
  member_role        text NOT NULL DEFAULT 'viewer'
                       CHECK (member_role in ('owner', 'manager', 'product_manager', 'fulfilment', 'viewer')),
  status             text NOT NULL DEFAULT 'invited'
                       CHECK (status in ('invited', 'active', 'removed')),
  invited_by         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invite_token_hash  text,
  invite_expires_at  timestamptz,
  accepted_at        timestamptz,
  removed_at         timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_supplier_members_active_user
  ON public.supplier_members(supplier_id, user_id)
  WHERE user_id IS NOT NULL AND status <> 'removed';
CREATE INDEX IF NOT EXISTS idx_supplier_members_supplier_id ON public.supplier_members(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_members_email ON public.supplier_members(email);
CREATE INDEX IF NOT EXISTS idx_supplier_members_token ON public.supplier_members(invite_token_hash) WHERE invite_token_hash IS NOT NULL;

-- ─── Regions and supplier delivery ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.delivery_regions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  region_type text NOT NULL DEFAULT 'city' CHECK (region_type in ('city', 'county', 'area')),
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.delivery_regions (name, region_type, sort_order)
VALUES
  ('Nairobi', 'city', 10),
  ('Kiambu', 'county', 20),
  ('Machakos', 'county', 30),
  ('Kajiado', 'county', 40),
  ('Mombasa', 'city', 50),
  ('Nakuru', 'city', 60),
  ('Kisumu', 'city', 70),
  ('Eldoret', 'city', 80)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.supplier_delivery_rules (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id        uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  region_id          uuid NOT NULL REFERENCES public.delivery_regions(id) ON DELETE RESTRICT,
  fee_strategy       text NOT NULL DEFAULT 'flat'
                        CHECK (fee_strategy in ('flat', 'cart_total', 'weight', 'order_size')),
  base_fee           numeric NOT NULL DEFAULT 0,
  free_over_amount   numeric,
  per_kg_fee         numeric,
  per_item_fee       numeric,
  min_fee            numeric,
  max_fee            numeric,
  lead_time_min_days integer NOT NULL DEFAULT 1,
  lead_time_max_days integer NOT NULL DEFAULT 3,
  is_active          boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_supplier_delivery_rules_active_region
  ON public.supplier_delivery_rules(supplier_id, region_id)
  WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_supplier_delivery_rules_supplier_id ON public.supplier_delivery_rules(supplier_id);

-- ─── Supplier notifications ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.supplier_notification_emails (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  label       text NOT NULL,
  email       text NOT NULL,
  events      text[] NOT NULL DEFAULT '{}',
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.supplier_notification_logs (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id             uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  event_key               text NOT NULL,
  recipient_email         text NOT NULL,
  subject                 text NOT NULL,
  status                  text NOT NULL DEFAULT 'pending',
  provider_message_id     text,
  related_order_id        uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  related_fulfilment_id   uuid,
  related_product_id      uuid REFERENCES public.products(id) ON DELETE SET NULL,
  error_message           text,
  created_at              timestamptz NOT NULL DEFAULT now()
);

-- ─── Product ownership and publishing control ────────────────────────────────
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_status text NOT NULL DEFAULT 'active'
  CHECK (product_status in ('active', 'inactive', 'paused_by_admin'));
UPDATE public.products SET product_status = 'active' WHERE product_status IS NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS fulfilment_type text NOT NULL DEFAULT 'stocked'
  CHECK (fulfilment_type in ('stocked', 'quote_only', 'preorder', 'made_to_order', 'supplier_fulfilled'));
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight_kg numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS length_cm numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS width_cm numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS height_cm numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS supplier_sku text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS paused_at timestamptz;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS paused_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS pause_reason text;

CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON public.products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_product_status ON public.products(product_status);

-- ─── Supplier fulfilments ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.supplier_fulfilments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  supplier_id         uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  fulfilment_owner    text NOT NULL DEFAULT 'supplier' CHECK (fulfilment_owner in ('bewama', 'supplier')),
  status              text NOT NULL DEFAULT 'new'
                        CHECK (status in ('new', 'accepted', 'rejected', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled_by_admin')),
  items               jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal_amount     numeric NOT NULL DEFAULT 0,
  delivery_fee        numeric NOT NULL DEFAULT 0,
  currency            text NOT NULL DEFAULT 'KES',
  delivery_region_id  uuid REFERENCES public.delivery_regions(id) ON DELETE SET NULL,
  lead_time_min_days  integer,
  lead_time_max_days  integer,
  rejected_reason     text,
  rejected_at         timestamptz,
  accepted_at         timestamptz,
  dispatched_at       timestamptz,
  delivered_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supplier_fulfilments_order_id ON public.supplier_fulfilments(order_id);
CREATE INDEX IF NOT EXISTS idx_supplier_fulfilments_supplier_id ON public.supplier_fulfilments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_fulfilments_status ON public.supplier_fulfilments(status);

-- ─── Quote support extension ─────────────────────────────────────────────────
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS quote_type text NOT NULL DEFAULT 'rfq'
  CHECK (quote_type in ('rfq', 'supplier_support'));
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS source_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS source_cart_snapshot jsonb;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS support_items jsonb;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS delivery_region_id uuid REFERENCES public.delivery_regions(id) ON DELETE SET NULL;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_quotes_quote_type ON public.quotes(quote_type);
CREATE INDEX IF NOT EXISTS idx_quotes_source_order_id ON public.quotes(source_order_id);

-- ─── Supplier performance ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.supplier_performance_events (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id            uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  event_type             text NOT NULL CHECK (event_type in ('warning', 'late_fulfilment', 'rejection', 'manual_note', 'auto_pause')),
  severity               text NOT NULL DEFAULT 'info' CHECK (severity in ('info', 'warning', 'critical')),
  related_fulfilment_id  uuid REFERENCES public.supplier_fulfilments(id) ON DELETE SET NULL,
  notes                  text,
  created_by             uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supplier_performance_events_supplier_id ON public.supplier_performance_events(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_performance_events_event_type ON public.supplier_performance_events(event_type);

-- ─── updated_at triggers ─────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_supplier_packages') THEN
    CREATE TRIGGER set_updated_at_supplier_packages BEFORE UPDATE ON public.supplier_packages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_supplier_applications') THEN
    CREATE TRIGGER set_updated_at_supplier_applications BEFORE UPDATE ON public.supplier_applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_suppliers') THEN
    CREATE TRIGGER set_updated_at_suppliers BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_supplier_members') THEN
    CREATE TRIGGER set_updated_at_supplier_members BEFORE UPDATE ON public.supplier_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_supplier_delivery_rules') THEN
    CREATE TRIGGER set_updated_at_supplier_delivery_rules BEFORE UPDATE ON public.supplier_delivery_rules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_supplier_notification_emails') THEN
    CREATE TRIGGER set_updated_at_supplier_notification_emails BEFORE UPDATE ON public.supplier_notification_emails FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_supplier_fulfilments') THEN
    CREATE TRIGGER set_updated_at_supplier_fulfilments BEFORE UPDATE ON public.supplier_fulfilments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- ─── RLS helpers ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_supplier_member(target_supplier_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.supplier_members
    WHERE supplier_id = target_supplier_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_supplier_owner_or_manager(target_supplier_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.supplier_members
    WHERE supplier_id = target_supplier_id
      AND user_id = auth.uid()
      AND status = 'active'
      AND member_role in ('owner', 'manager')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_supplier_products(target_supplier_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.supplier_members
    WHERE supplier_id = target_supplier_id
      AND user_id = auth.uid()
      AND status = 'active'
      AND member_role in ('owner', 'manager', 'product_manager')
  );
$$;

-- ─── RLS policies ────────────────────────────────────────────────────────────
ALTER TABLE public.supplier_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_delivery_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_notification_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_fulfilments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_performance_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "supplier_packages_read" ON public.supplier_packages FOR SELECT USING (true);
CREATE POLICY "delivery_regions_read" ON public.delivery_regions FOR SELECT USING (is_active OR public.is_admin_or_staff());

CREATE POLICY "supplier_applications_owner_read" ON public.supplier_applications FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_staff());
CREATE POLICY "supplier_applications_owner_insert" ON public.supplier_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "supplier_applications_admin_update" ON public.supplier_applications FOR UPDATE USING (public.is_admin_or_staff());

CREATE POLICY "suppliers_member_read" ON public.suppliers FOR SELECT USING (public.is_admin_or_staff() OR public.is_supplier_member(id));
CREATE POLICY "suppliers_admin_all" ON public.suppliers FOR ALL USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());
CREATE POLICY "suppliers_owner_update" ON public.suppliers FOR UPDATE USING (public.is_supplier_owner_or_manager(id));

CREATE POLICY "supplier_members_read" ON public.supplier_members FOR SELECT USING (public.is_admin_or_staff() OR public.is_supplier_member(supplier_id) OR user_id = auth.uid());
CREATE POLICY "supplier_members_owner_all" ON public.supplier_members FOR ALL USING (public.is_admin_or_staff() OR public.is_supplier_owner_or_manager(supplier_id)) WITH CHECK (public.is_admin_or_staff() OR public.is_supplier_owner_or_manager(supplier_id));

CREATE POLICY "supplier_delivery_rules_member_read" ON public.supplier_delivery_rules FOR SELECT USING (public.is_admin_or_staff() OR public.is_supplier_member(supplier_id));
CREATE POLICY "supplier_delivery_rules_owner_all" ON public.supplier_delivery_rules FOR ALL USING (public.is_admin_or_staff() OR public.is_supplier_owner_or_manager(supplier_id)) WITH CHECK (public.is_admin_or_staff() OR public.is_supplier_owner_or_manager(supplier_id));

CREATE POLICY "supplier_notification_emails_member_read" ON public.supplier_notification_emails FOR SELECT USING (public.is_admin_or_staff() OR public.is_supplier_member(supplier_id));
CREATE POLICY "supplier_notification_emails_owner_all" ON public.supplier_notification_emails FOR ALL USING (public.is_admin_or_staff() OR public.is_supplier_owner_or_manager(supplier_id)) WITH CHECK (public.is_admin_or_staff() OR public.is_supplier_owner_or_manager(supplier_id));

CREATE POLICY "supplier_notification_logs_member_read" ON public.supplier_notification_logs FOR SELECT USING (public.is_admin_or_staff() OR public.is_supplier_member(supplier_id));

CREATE POLICY "supplier_fulfilments_member_read" ON public.supplier_fulfilments FOR SELECT USING (public.is_admin_or_staff() OR fulfilment_owner = 'bewama' OR public.is_supplier_member(supplier_id));
CREATE POLICY "supplier_fulfilments_member_update" ON public.supplier_fulfilments FOR UPDATE USING (public.is_admin_or_staff() OR public.is_supplier_member(supplier_id));

CREATE POLICY "supplier_performance_admin_read" ON public.supplier_performance_events FOR SELECT USING (public.is_admin_or_staff());
CREATE POLICY "supplier_performance_admin_insert" ON public.supplier_performance_events FOR INSERT WITH CHECK (public.is_admin_or_staff());

-- Replace product visibility policy so admin-paused supplier products stay hidden.
DROP POLICY IF EXISTS "Anyone can read active products" ON public.products;
CREATE POLICY "Anyone can read active visible products"
  ON public.products FOR SELECT
  USING (is_active = true AND coalesce(product_status, 'active') = 'active');

CREATE POLICY "Supplier members can read own products"
  ON public.products FOR SELECT
  USING (supplier_id IS NOT NULL AND public.is_supplier_member(supplier_id));

CREATE POLICY "Supplier product managers can insert own products"
  ON public.products FOR INSERT
  WITH CHECK (supplier_id IS NOT NULL AND public.can_manage_supplier_products(supplier_id));

CREATE POLICY "Supplier product managers can update own products"
  ON public.products FOR UPDATE
  USING (supplier_id IS NOT NULL AND public.can_manage_supplier_products(supplier_id))
  WITH CHECK (supplier_id IS NOT NULL AND public.can_manage_supplier_products(supplier_id));
