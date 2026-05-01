-- ============================================================
-- sex_qa: 성 관련 Q&A 지식베이스
-- sex_topic_guides: 주제별 상담 가이드라인
-- ============================================================

-- Q&A 테이블
CREATE TABLE IF NOT EXISTS veilor.sex_qa (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category      TEXT NOT NULL,           -- 예: '성 불안', '빈도 차이', '첫 경험', '자위'
  question      TEXT NOT NULL,           -- 유저가 실제로 물어볼 법한 질문
  answer        TEXT NOT NULL,           -- VEILOR 톤앤매너 가이드라인 답변
  domain_codes  TEXT[] NOT NULL DEFAULT '{}',  -- 연관 RAG 도메인
  tags          TEXT[] DEFAULT '{}',     -- 세부 태그 (예: '불안', '파트너', '자기이해')
  vectorized    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 주제별 가이드라인 테이블
CREATE TABLE IF NOT EXISTS veilor.sex_topic_guides (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic         TEXT NOT NULL UNIQUE,    -- 예: '성 불안 상담 원칙', '성관계 빈도 차이 다루기'
  category      TEXT NOT NULL,           -- 상위 카테고리
  content       TEXT NOT NULL,           -- 가이드라인 본문 (답변 원칙 + 주의사항 + 예시)
  domain_codes  TEXT[] NOT NULL DEFAULT '{}',
  vectorized    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_sex_qa_category ON veilor.sex_qa(category);
CREATE INDEX IF NOT EXISTS idx_sex_qa_domain ON veilor.sex_qa USING GIN(domain_codes);
CREATE INDEX IF NOT EXISTS idx_sex_qa_vectorized ON veilor.sex_qa(vectorized) WHERE vectorized = FALSE;
CREATE INDEX IF NOT EXISTS idx_sex_topic_guides_category ON veilor.sex_topic_guides(category);
CREATE INDEX IF NOT EXISTS idx_sex_topic_guides_vectorized ON veilor.sex_topic_guides(vectorized) WHERE vectorized = FALSE;

-- RLS
ALTER TABLE veilor.sex_qa ENABLE ROW LEVEL SECURITY;
ALTER TABLE veilor.sex_topic_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_sex_qa"
  ON veilor.sex_qa FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "authenticated_read_sex_qa"
  ON veilor.sex_qa FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "service_role_all_sex_topic_guides"
  ON veilor.sex_topic_guides FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "authenticated_read_sex_topic_guides"
  ON veilor.sex_topic_guides FOR SELECT TO authenticated USING (TRUE);
