-- psych_papers: 논문 원본 메타
CREATE TABLE IF NOT EXISTS veilor.psych_papers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  authors      TEXT[] NOT NULL DEFAULT '{}',
  year         INT,
  journal      TEXT,
  abstract     TEXT,
  domain_codes TEXT[] NOT NULL DEFAULT '{}',
  chunked      BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- psych_paper_chunks: 청킹 결과 + 임베딩 여부
CREATE TABLE IF NOT EXISTS veilor.psych_paper_chunks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id     UUID NOT NULL REFERENCES veilor.psych_papers(id) ON DELETE CASCADE,
  chunk_index  INT NOT NULL,
  chunk_type   TEXT NOT NULL DEFAULT 'abstract',
  content      TEXT NOT NULL,
  domain_codes TEXT[] NOT NULL DEFAULT '{}',
  token_count  INT,
  vectorized   BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_psych_paper_chunks_paper_id
  ON veilor.psych_paper_chunks (paper_id);

CREATE INDEX IF NOT EXISTS idx_psych_paper_chunks_vectorized
  ON veilor.psych_paper_chunks (vectorized) WHERE vectorized = false;

CREATE INDEX IF NOT EXISTS idx_psych_papers_domain_codes
  ON veilor.psych_papers USING gin (domain_codes);

-- RLS
ALTER TABLE veilor.psych_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE veilor.psych_paper_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated read psych_papers"
  ON veilor.psych_papers FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_role all psych_papers"
  ON veilor.psych_papers FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "authenticated read psych_paper_chunks"
  ON veilor.psych_paper_chunks FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_role all psych_paper_chunks"
  ON veilor.psych_paper_chunks FOR ALL USING (auth.role() = 'service_role');
