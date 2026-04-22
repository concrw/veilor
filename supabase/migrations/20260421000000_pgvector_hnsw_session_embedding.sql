-- Phase 2: pgvector HNSW 인덱스 + 세션 임베딩 컬럼
-- 목적: 감정 유사도 검색 성능 향상 (IVFFlat → HNSW) + KURE-v1 세션 임베딩 저장

-- 0. pgvector 확장 (이미 활성화되어 있으면 no-op)
CREATE EXTENSION IF NOT EXISTS vector;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. m43_domain_questions: 기존 IVFFlat → HNSW 교체
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 기존 IVFFlat 인덱스 제거 (존재하면)
DROP INDEX IF EXISTS veilor.idx_m43_questions_embedding_ivfflat;
DROP INDEX IF EXISTS veilor.idx_m43_domain_questions_embedding;

-- HNSW 인덱스: 쿼리 속도 우선 (recall ≥ 0.95 @ ef_search=64)
-- m=16: 그래프 연결수, ef_construction=64: 빌드 시 탐색 너비
CREATE INDEX IF NOT EXISTS idx_m43_questions_embedding_hnsw
  ON veilor.m43_domain_questions
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. dive_sessions: KURE-v1 세션 임베딩 컬럼 추가
--    차원: 1024 (KURE-v1 출력 차원)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALTER TABLE veilor.dive_sessions
  ADD COLUMN IF NOT EXISTS session_embedding vector(1024);

-- HNSW 인덱스 (세션 간 유사도 검색용 — "3주 전과 유사한 패턴" 탐지)
CREATE INDEX IF NOT EXISTS idx_dive_sessions_embedding_hnsw
  ON veilor.dive_sessions
  USING hnsw (session_embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. emotion_scores: KOTE 44개 감정 분류 결과 저장 테이블
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS veilor.emotion_scores (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id    uuid REFERENCES veilor.dive_sessions(id) ON DELETE SET NULL,
  input_text    text NOT NULL,
  -- 상위 5개 감정 레이블 + 점수 (JSONB 배열: [{label, score}])
  top_emotions  jsonb NOT NULL DEFAULT '[]',
  -- M43 V-NEED 매핑 결과
  need_gaps     jsonb DEFAULT '{}',
  model_version text NOT NULL DEFAULT 'kote-kcelectra-v1',
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_emotion_scores_user_created
  ON veilor.emotion_scores (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_emotion_scores_session
  ON veilor.emotion_scores (session_id)
  WHERE session_id IS NOT NULL;

-- RLS 활성화
ALTER TABLE veilor.emotion_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own emotion scores"
  ON veilor.emotion_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "service role full access emotion scores"
  ON veilor.emotion_scores FOR ALL
  USING (auth.role() = 'service_role');

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. fn_similar_sessions: 유사 세션 검색 RPC
--    사용: held-chat이 과거 패턴 참조 시 호출
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION veilor.fn_similar_sessions(
  p_user_id     uuid,
  p_embedding   vector(1024),
  p_limit       int DEFAULT 3,
  p_threshold   float DEFAULT 0.75
)
RETURNS TABLE (
  session_id       uuid,
  created_at       timestamptz,
  emotion          text,
  context_summary  text,
  held_keywords    text[],
  similarity       float
)
LANGUAGE sql STABLE AS $$
  SELECT
    id            AS session_id,
    created_at,
    emotion,
    context_summary,
    held_keywords,
    1 - (session_embedding <=> p_embedding) AS similarity
  FROM veilor.dive_sessions
  WHERE user_id = p_user_id
    AND session_embedding IS NOT NULL
    AND session_completed = true
    AND 1 - (session_embedding <=> p_embedding) >= p_threshold
  ORDER BY session_embedding <=> p_embedding
  LIMIT p_limit;
$$;

COMMENT ON FUNCTION veilor.fn_similar_sessions IS
  'KURE-v1 임베딩 기반 유사 세션 검색. held-chat에서 과거 패턴 참조 시 사용.';
