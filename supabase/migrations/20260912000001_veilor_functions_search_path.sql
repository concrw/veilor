-- SECURITY DEFINER search_path Hardening
-- Set search_path = veilor, public, pg_temp for veilor-owned SECURITY DEFINER functions
-- to prevent search_path attacks

-- Find and harden all veilor-owned SECURITY DEFINER functions
DO $$
DECLARE
  fn RECORD;
BEGIN
  FOR fn IN
    SELECT
      n.nspname AS schema_name,
      p.proname AS function_name,
      pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'veilor'
      AND p.prosecdef = true
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %I.%I(%s) SET search_path = veilor, public, pg_temp',
      fn.schema_name,
      fn.function_name,
      fn.args
    );
    RAISE NOTICE 'Hardened search_path for %.%(%)', fn.schema_name, fn.function_name, fn.args;
  END LOOP;
END $$;

-- Note: This migration is idempotent and will harden any existing veilor SECURITY DEFINER functions.
-- Future veilor SECURITY DEFINER functions should include SET search_path in their CREATE FUNCTION statement.
