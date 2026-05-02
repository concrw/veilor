CREATE TABLE IF NOT EXISTS public.b2b_guardian_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trainee_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid NOT NULL,
  accessed_at timestamptz NOT NULL DEFAULT now(),
  access_type text NOT NULL DEFAULT 'view'
);

ALTER TABLE public.b2b_guardian_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guardian_own_log" ON public.b2b_guardian_access_log
  FOR SELECT USING (auth.uid() = guardian_user_id);

CREATE POLICY "guardian_insert_log" ON public.b2b_guardian_access_log
  FOR INSERT WITH CHECK (auth.uid() = guardian_user_id);
