-- Payment & Conversion Tables RLS Hardening
-- Restrict payment_history, paywall_events, interest_registrations, lemonsqueezy_webhook_events
-- to minimum necessary client access
<<<<<<< HEAD
-- 
-- IMPORTANT: These tables live in the VEILOR schema in the shared DEEPPLOT production DB
=======
>>>>>>> beb270f (feat: remove SUPERADMIN_EMAILS hardcoding and use role-based auth)

-- ============================================================================
-- 1. payment_history: authenticated can only SELECT own rows
-- ============================================================================

-- Drop existing overly permissive policies
<<<<<<< HEAD
DROP POLICY IF EXISTS "Users can view their own payment history" ON veilor.payment_history;
DROP POLICY IF EXISTS "Admin can view all payment history" ON veilor.payment_history;

-- Revoke broad table-level grants
REVOKE ALL ON veilor.payment_history FROM anon, authenticated;

-- Authenticated users: SELECT only own rows
GRANT SELECT ON veilor.payment_history TO authenticated;

CREATE POLICY "payment_history_select_own"
  ON veilor.payment_history
=======
DROP POLICY IF EXISTS "Users can view their own payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Admin can view all payment history" ON public.payment_history;

-- Revoke broad table-level grants
REVOKE ALL ON public.payment_history FROM anon, authenticated;

-- Authenticated users: SELECT only own rows
GRANT SELECT ON public.payment_history TO authenticated;

CREATE POLICY "payment_history_select_own"
  ON public.payment_history
>>>>>>> beb270f (feat: remove SUPERADMIN_EMAILS hardcoding and use role-based auth)
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Writes remain service_role/webhook only (no client INSERT/UPDATE/DELETE)

-- ============================================================================
-- 2. paywall_events: authenticated can INSERT only own rows
-- ============================================================================

CREATE TABLE IF NOT EXISTS veilor.paywall_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('shown', 'dismissed', 'interest_registered', 'converted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_paywall_events_user_id ON veilor.paywall_events(user_id);
CREATE INDEX IF NOT EXISTS idx_paywall_events_created_at ON veilor.paywall_events(created_at DESC);

ALTER TABLE veilor.paywall_events ENABLE ROW LEVEL SECURITY;

-- Revoke default grants
REVOKE ALL ON veilor.paywall_events FROM anon, authenticated;

-- Authenticated users: INSERT only (with user_id = auth.uid() enforced by policy)
GRANT INSERT ON veilor.paywall_events TO authenticated;

CREATE POLICY "paywall_events_insert_own"
  ON veilor.paywall_events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- No SELECT for clients; analytics/admin queries use service_role

-- ============================================================================
-- 3. interest_registrations: authenticated can INSERT only own rows
-- ============================================================================

CREATE TABLE IF NOT EXISTS veilor.interest_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  tier TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interest_registrations_user_id ON veilor.interest_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_interest_registrations_email ON veilor.interest_registrations(email);
CREATE INDEX IF NOT EXISTS idx_interest_registrations_created_at ON veilor.interest_registrations(created_at DESC);

ALTER TABLE veilor.interest_registrations ENABLE ROW LEVEL SECURITY;

-- Revoke default grants
REVOKE ALL ON veilor.interest_registrations FROM anon, authenticated;

-- Authenticated users: INSERT only (with user_id = auth.uid() enforced by policy)
GRANT INSERT ON veilor.interest_registrations TO authenticated;

CREATE POLICY "interest_registrations_insert_own"
  ON veilor.interest_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- ============================================================================
-- 4. lemonsqueezy_webhook_events: service_role only (already has policy)
-- ============================================================================

-- Existing policy "service_role only" is correct; ensure no client grants
<<<<<<< HEAD
REVOKE ALL ON veilor.lemonsqueezy_webhook_events FROM anon, authenticated;

-- Policy already exists:
-- CREATE POLICY "service_role only" ON veilor.lemonsqueezy_webhook_events
=======
REVOKE ALL ON public.lemonsqueezy_webhook_events FROM anon, authenticated;

-- Policy already exists:
-- CREATE POLICY "service_role only" ON public.lemonsqueezy_webhook_events
>>>>>>> beb270f (feat: remove SUPERADMIN_EMAILS hardcoding and use role-based auth)
--   FOR ALL USING (auth.role() = 'service_role');
