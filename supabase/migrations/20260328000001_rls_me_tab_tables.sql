-- ============================================================================
-- RLS & GRANT 설정: Me탭 관련 테이블 6개
-- 대상: tab_conversations, persona_instances, user_psych_map_snapshots,
--       relationship_entities, user_signals, crisis_flags
-- ============================================================================

-- 1. tab_conversations
ALTER TABLE veilor.tab_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own data" ON veilor.tab_conversations;
CREATE POLICY "Users can read own data"
  ON veilor.tab_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own data" ON veilor.tab_conversations;
CREATE POLICY "Users can insert own data"
  ON veilor.tab_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON veilor.tab_conversations TO authenticated;
GRANT ALL ON veilor.tab_conversations TO service_role;

-- 2. persona_instances
ALTER TABLE veilor.persona_instances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own data" ON veilor.persona_instances;
CREATE POLICY "Users can read own data"
  ON veilor.persona_instances
  FOR SELECT
  USING (auth.uid() = user_id);

GRANT SELECT ON veilor.persona_instances TO authenticated;
GRANT ALL ON veilor.persona_instances TO service_role;

-- 3. user_psych_map_snapshots
ALTER TABLE veilor.user_psych_map_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own data" ON veilor.user_psych_map_snapshots;
CREATE POLICY "Users can read own data"
  ON veilor.user_psych_map_snapshots
  FOR SELECT
  USING (auth.uid() = user_id);

GRANT SELECT ON veilor.user_psych_map_snapshots TO authenticated;
GRANT ALL ON veilor.user_psych_map_snapshots TO service_role;

-- 4. relationship_entities
ALTER TABLE veilor.relationship_entities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own data" ON veilor.relationship_entities;
CREATE POLICY "Users can read own data"
  ON veilor.relationship_entities
  FOR SELECT
  USING (auth.uid() = user_id);

GRANT SELECT ON veilor.relationship_entities TO authenticated;
GRANT ALL ON veilor.relationship_entities TO service_role;

-- 5. user_signals
ALTER TABLE veilor.user_signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own data" ON veilor.user_signals;
CREATE POLICY "Users can read own data"
  ON veilor.user_signals
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own data" ON veilor.user_signals;
CREATE POLICY "Users can insert own data"
  ON veilor.user_signals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON veilor.user_signals TO authenticated;
GRANT ALL ON veilor.user_signals TO service_role;

-- 6. crisis_flags
ALTER TABLE veilor.crisis_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own data" ON veilor.crisis_flags;
CREATE POLICY "Users can read own data"
  ON veilor.crisis_flags
  FOR SELECT
  USING (auth.uid() = user_id);

GRANT SELECT ON veilor.crisis_flags TO authenticated;
GRANT ALL ON veilor.crisis_flags TO service_role;
