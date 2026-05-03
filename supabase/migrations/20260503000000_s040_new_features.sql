-- S040: Community Events, Change Training, Specialist Directory, Pair Trust, Content Import

-- 1. Community Events
CREATE TABLE IF NOT EXISTS veilor.community_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  domain text,
  event_date timestamptz,
  max_participants int,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS veilor.event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES veilor.community_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE veilor.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE veilor.event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_events_owner" ON veilor.community_events
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "community_events_public_read" ON veilor.community_events
  FOR SELECT USING (is_public = true);
CREATE POLICY "event_participants_owner" ON veilor.event_participants
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "event_participants_read" ON veilor.event_participants
  FOR SELECT USING (true);

-- 2. Change Training
CREATE TABLE IF NOT EXISTS veilor.change_training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number int NOT NULL,
  title text NOT NULL,
  description text,
  domain text,
  duration_minutes int DEFAULT 10,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS veilor.change_training_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES veilor.change_training_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_before int,
  mood_after int,
  note text,
  logged_at timestamptz DEFAULT now()
);

ALTER TABLE veilor.change_training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE veilor.change_training_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "change_training_sessions_owner" ON veilor.change_training_sessions
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "change_training_logs_owner" ON veilor.change_training_logs
  FOR ALL USING (auth.uid() = user_id);

-- 3. Specialist Directory
CREATE TABLE IF NOT EXISTS veilor.specialist_directory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text,
  specialty text[],
  bio text,
  avatar_url text,
  is_active boolean DEFAULT true,
  contact_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS veilor.specialist_handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  specialist_id uuid NOT NULL REFERENCES veilor.specialist_directory(id) ON DELETE CASCADE,
  reason text,
  status text DEFAULT 'pending',
  domain text,
  requested_at timestamptz DEFAULT now()
);

ALTER TABLE veilor.specialist_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE veilor.specialist_handoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "specialist_directory_read" ON veilor.specialist_directory
  FOR SELECT USING (is_active = true);
CREATE POLICY "specialist_handoffs_owner" ON veilor.specialist_handoffs
  FOR ALL USING (auth.uid() = user_id);

-- 4. Pair Trust
CREATE TABLE IF NOT EXISTS veilor.pair_trust_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grantor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grantee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trust_level int NOT NULL DEFAULT 1,
  domain text,
  note text,
  status text DEFAULT 'active',
  granted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(grantor_id, grantee_id)
);

CREATE TABLE IF NOT EXISTS veilor.pair_trust_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id uuid NOT NULL REFERENCES veilor.pair_trust_grants(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  actor_id uuid REFERENCES auth.users(id),
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE veilor.pair_trust_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE veilor.pair_trust_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pair_trust_grants_owner" ON veilor.pair_trust_grants
  FOR ALL USING (auth.uid() = grantor_id OR auth.uid() = grantee_id);
CREATE POLICY "pair_trust_events_read" ON veilor.pair_trust_events
  FOR SELECT USING (true);

-- 5. Content Import
CREATE TABLE IF NOT EXISTS veilor.import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_url text,
  source_type text DEFAULT 'url',
  raw_content text,
  status text DEFAULT 'pending',
  error_message text,
  domain text,
  lang text DEFAULT 'ko',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS veilor.imported_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES veilor.import_jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type text,
  content text,
  domain text,
  tags text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE veilor.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE veilor.imported_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "import_jobs_owner" ON veilor.import_jobs
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "imported_signals_owner" ON veilor.imported_signals
  FOR ALL USING (auth.uid() = user_id);
