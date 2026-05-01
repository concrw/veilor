-- S024: 다국어 데이터 레이어
-- 1. user_profiles 언어 다중선택 + 자동번역 컬럼
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['ko'],
  ADD COLUMN IF NOT EXISTS auto_translate BOOLEAN DEFAULT FALSE;

-- 기존 language 컬럼 마이그레이션 (컬럼 존재 시)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'language'
  ) THEN
    UPDATE user_profiles
    SET languages = ARRAY[language]
    WHERE (languages IS NULL OR languages = '{}') AND language IS NOT NULL;
  END IF;
END $$;

-- 2. 크레딧 테이블
CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 콘텐츠 테이블 lang 컬럼 추가
ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS lang TEXT DEFAULT 'ko';

ALTER TABLE codetalk_entries
  ADD COLUMN IF NOT EXISTS lang TEXT DEFAULT 'ko';

ALTER TABLE tab_conversations
  ADD COLUMN IF NOT EXISTS lang TEXT DEFAULT 'ko',
  ADD COLUMN IF NOT EXISTS translated_content JSONB DEFAULT '{}';

-- codetalk_keywords (마스터 데이터 - 언어별 분리)
ALTER TABLE codetalk_keywords
  ADD COLUMN IF NOT EXISTS lang TEXT DEFAULT 'ko';

-- 4. 기존 데이터 lang = 'ko' 설정
UPDATE community_posts SET lang = 'ko' WHERE lang IS NULL;
UPDATE codetalk_entries SET lang = 'ko' WHERE lang IS NULL;
UPDATE tab_conversations SET lang = 'ko' WHERE lang IS NULL;
UPDATE codetalk_keywords SET lang = 'ko' WHERE lang IS NULL;

-- 5. 인덱스
CREATE INDEX IF NOT EXISTS idx_community_posts_lang ON community_posts(lang);
CREATE INDEX IF NOT EXISTS idx_codetalk_entries_lang ON codetalk_entries(lang);
CREATE INDEX IF NOT EXISTS idx_tab_conversations_lang ON tab_conversations(lang);

-- 6. RLS (user_credits)
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_credits_self" ON user_credits;
CREATE POLICY "user_credits_self" ON user_credits
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "credit_transactions_self" ON credit_transactions;
CREATE POLICY "credit_transactions_self" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);
