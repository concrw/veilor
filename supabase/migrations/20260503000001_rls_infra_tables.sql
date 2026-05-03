-- RLS 활성화: 론칭 전 미설정 3개 테이블

-- user_group_memberships: 유저 소유 데이터
ALTER TABLE veilor.user_group_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ugm_owner" ON veilor.user_group_memberships
  FOR ALL USING (auth.uid() = user_id);

-- response_cache: Edge Function(service_role) 전용 — 유저 직접 접근 차단
ALTER TABLE veilor.response_cache ENABLE ROW LEVEL SECURITY;

-- response_templates: 공개 읽기 허용, 쓰기는 service_role만
ALTER TABLE veilor.response_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "response_templates_public_read" ON veilor.response_templates
  FOR SELECT USING (true);
