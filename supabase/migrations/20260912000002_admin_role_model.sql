-- Admin Role Model (replace frontend email hardcoding)
-- Creates veilor.user_roles table, admin functions, and current-user RPCs

-- ============================================================================
-- 1. veilor.user_roles table (references auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS veilor.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'basic' CHECK (role IN ('free', 'basic', 'pro', 'premium', 'researcher', 'admin')),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_user_roles_role ON veilor.user_roles(role);

ALTER TABLE veilor.user_roles ENABLE ROW LEVEL SECURITY;

-- Revoke default grants
REVOKE ALL ON veilor.user_roles FROM anon, authenticated;

-- Authenticated users: SELECT only own row
GRANT SELECT ON veilor.user_roles TO authenticated;

CREATE POLICY "user_roles_select_own"
  ON veilor.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can manage all roles (via service_role or admin-only functions)

-- ============================================================================
-- 2. Seed admin roles for SUPERADMIN_EMAILS
-- ============================================================================

-- Insert admin roles for the emails currently hardcoded in src/App.tsx
INSERT INTO veilor.user_roles (user_id, role, notes)
SELECT
  id,
  'admin',
  'Seeded from SUPERADMIN_EMAILS'
FROM auth.users
WHERE email IN (
  'concrecrw@gmail.com',
  'elizabethcho1012@gmail.com',
  'e2e.test.1777802660865@gmail.com'
)
ON CONFLICT (user_id) DO UPDATE
  SET role = 'admin',
      notes = COALESCE(veilor.user_roles.notes || '; ', '') || 'Confirmed admin';

-- ============================================================================
-- 3. veilor.is_admin() - returns true if current user is admin
-- ============================================================================

CREATE OR REPLACE FUNCTION veilor.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = veilor, public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM veilor.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION veilor.is_admin() TO authenticated;

-- ============================================================================
-- 4. veilor.get_user_role(p_user_id) - returns role for a given user
-- ============================================================================

CREATE OR REPLACE FUNCTION veilor.get_user_role(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = veilor, public, pg_temp
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role
  FROM veilor.user_roles
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_role, 'basic');
END;
$$;

-- Keep old signature for compatibility, but restrict client access
-- (will be replaced by current_user_role below)
GRANT EXECUTE ON FUNCTION veilor.get_user_role(UUID) TO authenticated;

-- ============================================================================
-- 5. veilor.check_user_access(p_user_id, p_feature) - checks feature access
-- ============================================================================

CREATE OR REPLACE FUNCTION veilor.check_user_access(p_user_id UUID, p_feature TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = veilor, public, pg_temp
AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := veilor.get_user_role(p_user_id);

  -- Feature access rules
  CASE p_feature
    WHEN 'ai_insights' THEN
      RETURN v_role IN ('premium', 'researcher', 'admin');
    WHEN 'pattern_history' THEN
      RETURN v_role IN ('premium', 'researcher', 'admin');
    WHEN 'researcher_view' THEN
      RETURN v_role IN ('researcher', 'admin');
    WHEN 'export_data' THEN
      RETURN v_role IN ('premium', 'researcher', 'admin');
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$;

-- Keep old signature for compatibility, but restrict client access
-- (will be replaced by current_user_access below)
GRANT EXECUTE ON FUNCTION veilor.check_user_access(UUID, TEXT) TO authenticated;

-- ============================================================================
-- 6. Current-user wrapper RPCs (no user_id argument from client)
-- ============================================================================

-- veilor.current_user_role() - returns current user's role
CREATE OR REPLACE FUNCTION veilor.current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = veilor, public, pg_temp
AS $$
BEGIN
  RETURN veilor.get_user_role(auth.uid());
END;
$$;

GRANT EXECUTE ON FUNCTION veilor.current_user_role() TO authenticated;

-- veilor.current_user_access(p_feature) - checks current user's feature access
CREATE OR REPLACE FUNCTION veilor.current_user_access(p_feature TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = veilor, public, pg_temp
AS $$
BEGIN
  RETURN veilor.check_user_access(auth.uid(), p_feature);
END;
$$;

GRANT EXECUTE ON FUNCTION veilor.current_user_access(TEXT) TO authenticated;

-- ============================================================================
-- 7. Optionally revoke direct client execute on UUID-argument versions
--    (commented out for backwards compatibility during migration)
-- ============================================================================

-- REVOKE EXECUTE ON FUNCTION veilor.get_user_role(UUID) FROM authenticated, anon;
-- REVOKE EXECUTE ON FUNCTION veilor.check_user_access(UUID, TEXT) FROM authenticated, anon;

-- ============================================================================
-- 8. Replace b2b_coaches write policy email hardcoding with veilor.is_admin()
-- ============================================================================

-- Drop old policy
DROP POLICY IF EXISTS "b2b_coaches_superadmin_write" ON veilor.b2b_coaches;

-- Create new policy using veilor.is_admin()
CREATE POLICY "b2b_coaches_admin_write"
  ON veilor.b2b_coaches
  FOR ALL
  TO authenticated
  USING (veilor.is_admin());
