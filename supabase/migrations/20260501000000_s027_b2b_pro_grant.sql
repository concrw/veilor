-- S027: B2B Pro 자동 부여 + TBQC 집계 뷰

-- 1. user_profiles에 subscription_tier 컬럼 추가
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free'
  CHECK (subscription_tier IN ('free', 'pro', 'elite'));

-- 2. B2B 초대 토큰 테이블
CREATE TABLE IF NOT EXISTS b2b_invite_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES b2b_orgs(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  token         TEXT NOT NULL UNIQUE,
  member_type   TEXT NOT NULL DEFAULT 'member',
  birth_year    INT,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  accepted_at   TIMESTAMPTZ,
  user_id       UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE b2b_invite_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "b2b_invite_tokens_admin" ON b2b_invite_tokens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM b2b_org_admins
      WHERE org_id = b2b_invite_tokens.org_id
        AND user_id = auth.uid()
    )
  );

-- 수락 대기 토큰은 누구나 SELECT 가능 (링크로 접근 시 유효성 확인)
CREATE POLICY "b2b_invite_tokens_pending_read" ON b2b_invite_tokens
  FOR SELECT USING (status = 'pending');

-- 수락한 유저는 자신의 토큰 조회 가능
CREATE POLICY "b2b_invite_tokens_self_read" ON b2b_invite_tokens
  FOR SELECT USING (user_id = auth.uid());

-- 로그인한 유저는 pending 토큰을 accepted로 업데이트 가능 (수락 플로우)
CREATE POLICY "b2b_invite_tokens_accept" ON b2b_invite_tokens
  FOR UPDATE USING (status = 'pending' AND auth.uid() IS NOT NULL);

-- 3. TBQC 집계 뷰 (b2b_org_members ↔ work_tasks — 익명 집계)
CREATE OR REPLACE VIEW b2b_org_work_aggregate AS
SELECT
  bom.org_id,
  DATE_TRUNC('week', wt.created_at)                        AS week_start,
  COUNT(wt.id)                                             AS total_tasks,
  COUNT(CASE WHEN wt.status = 'done' THEN 1 END)          AS done_tasks,
  ROUND(
    100.0 * COUNT(CASE WHEN wt.status = 'done' THEN 1 END)
    / NULLIF(COUNT(wt.id), 0), 1
  )                                                        AS completion_rate,
  AVG(
    CASE
      WHEN wt.estimated_minutes > 0 AND wt.actual_minutes > 0
      THEN 1.0 - LEAST(
        ABS(wt.actual_minutes - wt.estimated_minutes)::FLOAT / wt.estimated_minutes, 1.0
      )
    END
  )                                                        AS avg_tbqc_accuracy,
  COUNT(CASE WHEN wt.status = 'rolled_over' THEN 1 END)   AS rollover_count,
  COUNT(DISTINCT wt.user_id)                               AS active_member_count
FROM b2b_org_members bom
JOIN work_tasks wt ON wt.user_id = bom.user_id
WHERE bom.status = 'active'
  AND wt.created_at >= NOW() - INTERVAL '8 weeks'
GROUP BY bom.org_id, DATE_TRUNC('week', wt.created_at);

GRANT SELECT ON b2b_org_work_aggregate TO authenticated;
