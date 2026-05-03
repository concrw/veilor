-- b2b_orgs: 조직 어드민만 자신의 조직 조회/수정
ALTER TABLE veilor.b2b_orgs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "b2b_orgs_admin_access" ON veilor.b2b_orgs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM veilor.b2b_org_admins
      WHERE org_id = b2b_orgs.id AND user_id = auth.uid()
    )
  );

-- b2b_coaches: 활성 코치는 누구나 조회, 등록은 슈퍼어드민만
ALTER TABLE veilor.b2b_coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "b2b_coaches_public_read" ON veilor.b2b_coaches
  FOR SELECT USING (status = 'active');

CREATE POLICY "b2b_coaches_superadmin_write" ON veilor.b2b_coaches
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      'concrecrw@gmail.com',
      'elizabethcho1012@gmail.com'
    )
  );

-- b2b_coaching_sessions: 멤버 본인 + 담당 코치 + 조직 어드민만 조회
ALTER TABLE veilor.b2b_coaching_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "b2b_sessions_participant_access" ON veilor.b2b_coaching_sessions
  FOR ALL USING (
    member_id = auth.uid()
    OR coach_id = (SELECT user_id FROM veilor.b2b_coaches WHERE id = coach_id LIMIT 1)
    OR EXISTS (
      SELECT 1 FROM veilor.b2b_org_admins
      WHERE org_id = b2b_coaching_sessions.org_id AND user_id = auth.uid()
    )
  );

-- b2b_org_members: 본인 레코드 + 조직 어드민
ALTER TABLE veilor.b2b_org_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "b2b_org_members_self_read" ON veilor.b2b_org_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "b2b_org_members_admin_access" ON veilor.b2b_org_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM veilor.b2b_org_admins
      WHERE org_id = b2b_org_members.org_id AND user_id = auth.uid()
    )
  );
