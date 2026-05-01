-- ═══════════════════════════════════════════════════════════
-- MIGRATION: couple_talk feature
-- schema: veilor
-- ═══════════════════════════════════════════════════════════

-- [1] 카드 마스터 데이터
CREATE TABLE IF NOT EXISTS veilor.couple_talk_cards (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category       text NOT NULL CHECK (category IN ('story','heart','future','desire','sex')),
  question_text  text NOT NULL,
  question_order int  NOT NULL DEFAULT 0,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- [2] 커플 세션
CREATE TABLE IF NOT EXISTS veilor.couple_talk_sessions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b_id               uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invite_token            text UNIQUE,
  invite_token_expires_at timestamptz,
  sex_deck_consent_a      boolean NOT NULL DEFAULT false,
  sex_deck_consent_b      boolean NOT NULL DEFAULT false,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- [3] 답변
CREATE TABLE IF NOT EXISTS veilor.couple_talk_answers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid NOT NULL REFERENCES veilor.couple_talk_sessions(id) ON DELETE CASCADE,
  card_id     uuid NOT NULL REFERENCES veilor.couple_talk_cards(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer_text text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, card_id, user_id)
);

-- ── 인덱스 ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ct_sessions_user_a ON veilor.couple_talk_sessions(user_a_id);
CREATE INDEX IF NOT EXISTS idx_ct_sessions_user_b ON veilor.couple_talk_sessions(user_b_id);
CREATE INDEX IF NOT EXISTS idx_ct_answers_session  ON veilor.couple_talk_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_ct_answers_user     ON veilor.couple_talk_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_ct_cards_category   ON veilor.couple_talk_cards(category, question_order);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE veilor.couple_talk_cards    ENABLE ROW LEVEL SECURITY;
ALTER TABLE veilor.couple_talk_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE veilor.couple_talk_answers  ENABLE ROW LEVEL SECURITY;

-- cards: 인증 유저 누구나 활성 카드 조회
CREATE POLICY "ct_cards_select" ON veilor.couple_talk_cards
  FOR SELECT TO authenticated USING (is_active = true);

-- sessions: 세션의 user_a 또는 user_b만 접근
CREATE POLICY "ct_sessions_select" ON veilor.couple_talk_sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "ct_sessions_insert" ON veilor.couple_talk_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_a_id);

CREATE POLICY "ct_sessions_update" ON veilor.couple_talk_sessions
  FOR UPDATE TO authenticated
  USING  (auth.uid() = user_a_id OR auth.uid() = user_b_id)
  WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- answers: 세션 참여자만 조회, 본인 답변만 삽입/수정
CREATE POLICY "ct_answers_select" ON veilor.couple_talk_answers
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM veilor.couple_talk_sessions s
      WHERE s.id = session_id
        AND (s.user_a_id = auth.uid() OR s.user_b_id = auth.uid())
    )
  );

CREATE POLICY "ct_answers_insert" ON veilor.couple_talk_answers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ct_answers_update" ON veilor.couple_talk_answers
  FOR UPDATE TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── GRANT ─────────────────────────────────────────────────────
GRANT SELECT                    ON veilor.couple_talk_cards    TO authenticated;
GRANT SELECT, INSERT, UPDATE    ON veilor.couple_talk_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE    ON veilor.couple_talk_answers  TO authenticated;
GRANT ALL ON veilor.couple_talk_cards    TO service_role;
GRANT ALL ON veilor.couple_talk_sessions TO service_role;
GRANT ALL ON veilor.couple_talk_answers  TO service_role;

-- ── 카드 마스터 데이터 seed ───────────────────────────────────

-- story (우리의 이야기) 10개
INSERT INTO veilor.couple_talk_cards (category, question_text, question_order) VALUES
('story', '처음 만났을 때 상대방의 어떤 점이 가장 먼저 눈에 들어왔나요?', 1),
('story', '우리 둘이 함께한 가장 웃겼던 순간을 하나 떠올려보세요.', 2),
('story', '내가 힘들었을 때 파트너가 해준 말 중 아직도 기억에 남는 말이 있나요?', 3),
('story', '우리의 루틴 중 내가 가장 좋아하는 것은 무엇인가요?', 4),
('story', '파트너의 어떤 습관이 처음에는 낯설었지만 지금은 정이 든 것이 있나요?', 5),
('story', '우리가 함께 해본 것 중 가장 기억에 남는 여행이나 나들이는?', 6),
('story', '파트너에게 "고마워"라고 말하고 싶었지만 제대로 전하지 못한 순간이 있나요?', 7),
('story', '우리가 처음으로 다퉜을 때 어떤 이야기였는지 기억하나요? 지금 생각하면 어때요?', 8),
('story', '파트너와 함께 있을 때 "이 사람이다"라고 느꼈던 구체적인 순간이 있나요?', 9),
('story', '우리 관계에서 아직 해보지 않았지만 함께 만들고 싶은 추억이 있다면?', 10);

-- heart (마음속 이야기) 10개
INSERT INTO veilor.couple_talk_cards (category, question_text, question_order) VALUES
('heart', '나는 언제 파트너에게 가장 안전하다고 느끼나요?', 1),
('heart', '관계에서 내가 가장 두려워하는 것은 무엇인가요?', 2),
('heart', '파트너에게 솔직하게 말하지 못한 감정이 지금 하나 있다면 무엇인가요?', 3),
('heart', '내가 화가 났을 때 실제로 필요로 하는 것은 무엇인가요 — 공간, 위로, 아니면 해결?', 4),
('heart', '파트너가 나를 오해하고 있다고 느끼는 부분이 있다면?', 5),
('heart', '나는 언제 관계 안에서 가장 외롭다고 느끼나요?', 6),
('heart', '내가 사랑을 가장 잘 느끼는 방식(언어, 행동, 시간, 선물, 스킨십)은 무엇인가요?', 7),
('heart', '파트너에게 "나를 이렇게 알아줬으면 해"라고 말하고 싶은 것이 있나요?', 8),
('heart', '나는 갈등이 생겼을 때 주로 어떻게 반응하나요 — 회피, 직면, 아니면 다른 방식?', 9),
('heart', '우리 관계에서 내가 감사하게 여기지만 표현하지 못했던 것은 무엇인가요?', 10);

-- future (미래 이야기) 10개
INSERT INTO veilor.couple_talk_cards (category, question_text, question_order) VALUES
('future', '5년 후 우리의 하루는 어떤 모습이면 좋겠나요?', 1),
('future', '함께 꼭 이루고 싶은 목표나 꿈이 있다면 하나만 말해보세요.', 2),
('future', '우리 관계에서 더 키워나가고 싶은 부분이 있다면 무엇인가요?', 3),
('future', '노후에 우리 둘이 함께 있는 모습을 상상한다면 어떤 장면이 떠오르나요?', 4),
('future', '파트너가 개인적으로 이루었으면 하는 꿈이 있나요? 그것을 어떻게 응원하고 싶나요?', 5),
('future', '우리 둘이 함께 배워보고 싶거나 도전해보고 싶은 것이 있나요?', 6),
('future', '관계에서 바꾸고 싶은 한 가지 패턴이 있다면?', 7),
('future', '나는 우리 관계가 10년 뒤에 어떤 방식으로 더 단단해지기를 바라나요?', 8),
('future', '내가 파트너에게 가장 주고 싶은 미래는 무엇인가요?', 9),
('future', '우리가 함께라면 가능할 것 같은, 혼자라면 못 할 것 같은 일이 있나요?', 10);

-- desire (욕망 이야기) 10개
INSERT INTO veilor.couple_talk_cards (category, question_text, question_order) VALUES
('desire', '파트너에게 원하지만 잘 요청하지 못하는 것이 있나요?', 1),
('desire', '우리 관계에서 내 경계선이 어디에 있는지 파트너가 알고 있다고 생각하나요?', 2),
('desire', '내가 파트너에게 가장 원하는 감정적인 경험은 무엇인가요?', 3),
('desire', '우리가 함께 있을 때 나를 가장 설레게 하는 순간은 언제인가요?', 4),
('desire', '파트너에게 더 많이 원하는 것과 더 적게 원하는 것을 각각 하나씩 말해본다면?', 5),
('desire', '내가 관계에서 포기했거나 억눌러온 욕구가 있다면 무엇인가요?', 6),
('desire', '나는 파트너에게 어떤 방식으로 인정받고 싶나요?', 7),
('desire', '우리가 더 자주 했으면 하는 것이 있다면 하나만 말해보세요.', 8),
('desire', '파트너가 나를 놀라게 해줬으면 하는 방식이 있나요?', 9),
('desire', '나는 관계에서 지금 어떤 것이 가장 필요하다고 느끼나요?', 10);

-- sex (섹스 이야기) 20개
INSERT INTO veilor.couple_talk_cards (category, question_text, question_order) VALUES
('sex', '나에게 섹스는 주로 어떤 의미인가요 — 연결, 해방, 즐거움, 아니면 다른 무언가?', 1),
('sex', '내가 성적으로 가장 편안하게 느끼는 상황이나 분위기는 어떤 건가요?', 2),
('sex', '파트너에게 성적으로 원하지만 아직 제대로 말하지 못한 것이 있나요?', 3),
('sex', '우리 둘 사이에서 내가 "이건 하지 않겠다"라고 분명히 느끼는 경계가 있나요?', 4),
('sex', '내가 성적으로 가장 설레는 순간은 어떤 순간인가요?', 5),
('sex', '지금까지 해본 것 중 우리에게 가장 잘 맞았다고 느낀 것은 무엇인가요?', 6),
('sex', '파트너가 내 몸에 대해 알아줬으면 하는 것이 있나요?', 7),
('sex', '성적인 관계에서 내가 가장 중요하게 생각하는 것은 무엇인가요?', 8),
('sex', '우리가 성적으로 더 가까워지기 위해 바꾸거나 시도해볼 수 있다고 생각하는 것이 있나요?', 9),
('sex', '섹스 전후로 파트너에게 원하는 것이 있다면 무엇인가요?', 10),
('sex', '내가 성적으로 "아직 탐색하지 않은 영역"이라고 느끼는 것이 있나요?', 11),
('sex', '파트너가 나를 원한다는 것을 가장 잘 느끼는 순간은 언제인가요?', 12),
('sex', '성적인 면에서 나에게 가장 어렵거나 불편한 주제는 무엇인가요?', 13),
('sex', '나는 어떤 방식으로 성적인 의사를 표현하는 편인가요? 직접적인가요, 간접적인가요?', 14),
('sex', '우리의 성생활에서 내가 더 자주 있었으면 하는 것이 있다면?', 15),
('sex', '파트너와 함께였기 때문에 가능했던, 기억에 남는 성적인 경험이 있나요?', 16),
('sex', '내 안에 있는 성적인 판타지 중 파트너와 공유해본 적 없는 것이 있나요?', 17),
('sex', '성적인 관계에서 내가 가장 취약하다고 느끼는 순간은 언제인가요?', 18),
('sex', '우리가 성적으로 소통하는 방식 중 잘 작동한다고 느끼는 것은 무엇인가요?', 19),
('sex', '이 카드 덱을 사용한 오늘의 대화에서 파트너에 대해 새로 알게 된 것이 있나요?', 20);
