-- S025: Work Domain + TBQC 시스템

-- 워크리스트 태스크
CREATE TABLE IF NOT EXISTS work_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  status TEXT DEFAULT 'todo', -- 'todo' | 'in_progress' | 'done' | 'rolled_over'
  pause_count INTEGER DEFAULT 0,
  mental_snapshot JSONB DEFAULT '{}', -- { energy, mood, focus } at task start
  lang TEXT DEFAULT 'ko',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  rolled_over_from UUID REFERENCES work_tasks(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 주간 스프린트
CREATE TABLE IF NOT EXISTS work_sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  goals JSONB DEFAULT '[]', -- [{ title, done }]
  tbqc_accuracy NUMERIC,
  completion_rate NUMERIC,
  mental_avg JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- user_profiles에 domain 컬럼 추가
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS domain TEXT DEFAULT 'self';

-- RLS
ALTER TABLE work_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "work_tasks_own" ON work_tasks
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE work_sprints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "work_sprints_own" ON work_sprints
  FOR ALL USING (auth.uid() = user_id);
