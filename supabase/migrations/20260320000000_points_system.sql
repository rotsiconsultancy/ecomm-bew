-- ============================================================================
-- Bewama Points System — 3 tables + seed data
-- Run via Supabase SQL Editor or supabase db push
-- ============================================================================

-- 1. points_config — admin-controlled action settings
CREATE TABLE IF NOT EXISTS public.points_config (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_key    text UNIQUE NOT NULL,
  label         text NOT NULL,
  points_value  integer NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 2. points_ledger — every earn / redeem event
CREATE TABLE IF NOT EXISTS public.points_ledger (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_key    text NOT NULL,
  order_id      uuid,
  points        integer NOT NULL,
  note          text,
  status        text NOT NULL DEFAULT 'confirmed',   -- 'confirmed' | 'pending'
  claimed_at    timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 3. points_claims — prevents double-claiming
CREATE TABLE IF NOT EXISTS public.points_claims (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_key    text NOT NULL,
  reference_id  text,
  claimed_at    timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint: one claim per (user, action, reference).
-- COALESCE handles NULL reference_id so uniqueness still applies.
CREATE UNIQUE INDEX IF NOT EXISTS uq_points_claims_user_action_ref
  ON public.points_claims (user_id, action_key, COALESCE(reference_id, ''));

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_points_ledger_user   ON public.points_ledger (user_id);
CREATE INDEX IF NOT EXISTS idx_points_ledger_status ON public.points_ledger (status);
CREATE INDEX IF NOT EXISTS idx_points_claims_user   ON public.points_claims (user_id);

-- ============================================================================
-- Seed points_config with default actions
-- ============================================================================
INSERT INTO public.points_config (action_key, label, points_value, is_active) VALUES
  ('signup',         'Sign Up Bonus',        200,  true),
  ('first_order',    'First Order Bonus',    500,  true),
  ('purchase',       'Purchase (per KES50)',    1,  true),
  ('subscribe',      'Subscribe for updates (KES50)',    1,  true),
  ('daily_login',    'Daily Login',            5,  true),
  ('login_streak_7', '7-Day Login Streak',    50,  true),
  ('review_text',    'Write a Review',       100,  true),
  ('review_photo',   'Post a Site Photo',    300,  true),
  ('social_tag',     'Tag Us on Social',     150,  true),
  ('referral',       'Referral Converts',    400,  true),
  ('admin_grant',    'Admin Grant',            0,  true)
ON CONFLICT (action_key) DO NOTHING;

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE public.points_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_claims ENABLE ROW LEVEL SECURITY;

-- points_config: anyone can read, only service role can write
CREATE POLICY "points_config_read" ON public.points_config
  FOR SELECT USING (true);

-- points_ledger: users see own rows, service role sees all
CREATE POLICY "points_ledger_select_own" ON public.points_ledger
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "points_ledger_service_insert" ON public.points_ledger
  FOR INSERT WITH CHECK (true);

-- points_claims: users see own rows, service role inserts
CREATE POLICY "points_claims_select_own" ON public.points_claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "points_claims_service_insert" ON public.points_claims
  FOR INSERT WITH CHECK (true);
