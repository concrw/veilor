# Migration Notes for Security Hardening (Gate8)

## ⚠️ CRITICAL: Shared Database Risk

These migrations operate on the **shared DEEPPLOT production database** where VEILOR tables live in the `veilor` schema, not `public`.

**DO NOT APPLY UNTIL HUMAN APPROVES.**

## Tables Modified

### 1. `veilor.payment_history` (20260912000000_payment_tables_rls.sql)
- **Changes**: Drops existing RLS policies, revokes grants, adds restrictive SELECT-only policy
- **Risk**: May break existing queries if other services depend on different access patterns
- **Impact**: Authenticated users can only SELECT their own rows; all writes restricted to service_role

### 2. `veilor.lemonsqueezy_webhook_events` (20260912000000_payment_tables_rls.sql)
- **Changes**: Revokes all client grants (service_role only)
- **Risk**: Low - webhooks already use service_role
- **Impact**: Ensures no client access

### 3. New Tables Created (20260912000000_payment_tables_rls.sql)
- `veilor.paywall_events` - authenticated INSERT-only for tracking paywall interactions
- `veilor.interest_registrations` - authenticated INSERT-only for tracking interest signups

### 4. `veilor.user_roles` (20260912000002_admin_role_model.sql)
- **Changes**: Creates new table, seeds admin roles from SUPERADMIN_EMAILS
- **Risk**: Seeds 3 admin users by email; verify these emails are correct before running
- **Impact**: Enables role-based auth; paywall reads from this table

### 5. `veilor.b2b_coaches` (20260912000002_admin_role_model.sql)
- **Changes**: Drops `b2b_coaches_superadmin_write` policy, replaces with `b2b_coaches_admin_write` using `veilor.is_admin()`
- **Risk**: Admin writes now depend on `veilor.user_roles`; verify admin seeding is correct
- **Impact**: Removes email hardcoding from policy

### 6. All `veilor` SECURITY DEFINER Functions (20260912000001_veilor_functions_search_path.sql)
- **Changes**: Sets `search_path = veilor, public, pg_temp` on all SECURITY DEFINER functions in veilor schema
- **Risk**: May break functions that rely on unqualified references to tables in other schemas
- **Impact**: Prevents search_path attacks; best practice for SECURITY DEFINER

## New Functions Created

- `veilor.is_admin()` - Returns true if current user is admin
- `veilor.get_user_role(p_user_id)` - Returns role for given user (legacy compat)
- `veilor.check_user_access(p_user_id, p_feature)` - Checks feature access for given user (legacy compat)
- `veilor.current_user_role()` - Returns current user's role (client-safe, no user_id arg)
- `veilor.current_user_access(p_feature)` - Checks current user's feature access (client-safe)

## Pre-Migration Checklist

1. ✅ Verify admin emails in migration 20260912000002 line 45-47
2. ✅ Verify `veilor.payment_history` exists in production (not `public.payment_history`)
3. ✅ Verify `veilor.lemonsqueezy_webhook_events` exists in production (not `public.lemonsqueezy_webhook_events`)
4. ✅ Backup production DB
5. ✅ Test migrations on staging first
6. ✅ Verify no other services write to `payment_history` as non-service_role
7. ✅ Confirm LemonSqueezy webhook uses service_role key

## Post-Migration Steps

1. Deploy updated Edge Function: `supabase/functions/lemonsqueezy-webhook/index.ts`
   - Now upserts `veilor.user_roles` on subscription activate/update/cancel
2. Deploy frontend (src/App.tsx, src/hooks/useVeilorSubscription.ts)
   - Uses `current_user_role()` and `current_user_access()` RPCs
   - No more SUPERADMIN_EMAILS hardcoding
3. Verify admin access still works
4. Monitor logs for RLS policy violations

## Rollback Plan

If issues arise:
1. Revert Edge Function deployment
2. Run inverse migrations (DROP new policies/tables, restore old policies)
3. Rollback frontend deployment
4. Tag rollback SHA: `git tag gate8-rollback-$(date +%s) <parent-sha>`

## Evidence: Paywall Table

The paywall now reads from **`veilor.user_roles`** (created in migration 20260912000002).

Frontend queries via `useVeilorSubscription` → `current_user_role()` RPC → `veilor.user_roles.role`.

Webhook writes to `veilor.user_roles` on subscription events (order_created, subscription_created, subscription_cancelled/expired).
