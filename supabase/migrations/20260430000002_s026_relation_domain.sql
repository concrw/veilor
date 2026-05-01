-- S026 Relation 도메인 — relation_checkins 테이블
CREATE TABLE IF NOT EXISTS relation_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  warmth_score INTEGER NOT NULL CHECK (warmth_score BETWEEN 1 AND 10),
  energy_balance INTEGER NOT NULL CHECK (energy_balance BETWEEN -5 AND 5),
  note TEXT,
  lang TEXT DEFAULT 'ko',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE relation_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "relation_checkins_own" ON relation_checkins
  FOR ALL USING (auth.uid() = user_id);
