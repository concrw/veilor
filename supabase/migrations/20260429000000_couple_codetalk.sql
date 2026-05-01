-- couple_codetalk_sessions: 파트너와 함께 하는 코드토크 세션
CREATE TABLE IF NOT EXISTS veilor.couple_codetalk_sessions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id   uuid        NOT NULL REFERENCES veilor.codetalk_keywords(id),
  keyword      text        NOT NULL,
  user_a_id    uuid        NOT NULL,
  user_b_id    uuid        NOT NULL,
  entry_a_id   uuid        REFERENCES veilor.codetalk_entries(id),
  entry_b_id   uuid        REFERENCES veilor.codetalk_entries(id),
  revealed_at  timestamptz,
  created_at   timestamptz DEFAULT now()
);

-- 인덱스: 유저별 세션 조회
CREATE INDEX IF NOT EXISTS idx_couple_codetalk_sessions_user_a
  ON veilor.couple_codetalk_sessions(user_a_id);
CREATE INDEX IF NOT EXISTS idx_couple_codetalk_sessions_user_b
  ON veilor.couple_codetalk_sessions(user_b_id);

-- RLS
ALTER TABLE veilor.couple_codetalk_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "couple_codetalk_sessions_select"
  ON veilor.couple_codetalk_sessions FOR SELECT
  USING (
    auth.uid() = user_a_id OR auth.uid() = user_b_id
  );

CREATE POLICY "couple_codetalk_sessions_insert"
  ON veilor.couple_codetalk_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_a_id);

CREATE POLICY "couple_codetalk_sessions_update"
  ON veilor.couple_codetalk_sessions FOR UPDATE
  USING (
    auth.uid() = user_a_id OR auth.uid() = user_b_id
  );
