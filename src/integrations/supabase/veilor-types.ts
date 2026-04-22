import type { Json } from './types';
import type { PersonaProfile, PersonaRelationship } from './persona-types';

export interface VeilorUserProfile {
  user_id: string;
  nickname?: string | null;
  onboarding_step?: string | null;
  priper_completed?: boolean | null;
  primary_mask?: string | null;
  secondary_mask?: string | null;
  axis_scores?: Json | null;
  ai_companion_name?: string | null;
  held_last_emotion?: string | null;
  app_theme?: string | null;
  codetalk_day?: number | null;
  streak_count?: number | null;
  persona_contexts_completed?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface VeilorDmRoom {
  id: string;
  user_a_id: string;
  user_b_id: string;
  is_active: boolean;
  consent_a: boolean;
  consent_b: boolean;
  created_at?: string | null;
}

export interface VeilorPriperSession {
  id?: string;
  user_id: string;
  primary_mask?: string | null;
  secondary_masks?: Json | null;
  axis_scores?: Json | null;
  is_completed?: boolean | null;
  completed_at?: string | null;
  created_at?: string | null;
}

export interface VeilorTabConversation {
  id?: string;
  user_id: string;
  tab?: string | null;
  stage?: string | null;
  role?: string | null;
  content?: string | null;
  created_at?: string | null;
}

export interface VeilorCodetalkKeyword {
  id: string;
  keyword: string;
  day_number?: number | null;
  description?: string | null;
}

export interface VeilorCodetalkEntry {
  id?: string;
  user_id: string;
  keyword_id: string;
  keyword?: string | null;
  definition?: string | null;
  content?: string | null;
  imprinting_moment?: string | null;
  root_cause?: string | null;
  response?: string | null;
  is_public?: boolean | null;
  anon_alias?: string | null;
  entry_date?: string | null;
  created_at?: string | null;
  codetalk_keywords?: Pick<VeilorCodetalkKeyword, 'keyword' | 'day_number'> | null;
}

export interface VeilorUserBoundary {
  id?: string;
  user_id: string;
  category: string;
  boundary_text?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
}

export interface VeilorConsentChecklist {
  id?: string;
  user_id: string;
  condition_key: string;
  is_checked?: boolean | null;
  checked_at?: string | null;
  created_at?: string | null;
}

export interface VeilorAnonAuthorMap {
  id?: string;
  real_user_id: string;
  anon_alias: string;
  context?: string | null;
  created_at?: string | null;
}

export interface VeilorCommunityGroup {
  id: string;
  name: string;
  description?: string | null;
  theme?: string | null;
  creator_id?: string | null;
  member_count?: number | null;
  avg_sync_rate?: number | null;
  sort_order?: number | null;
  created_at?: string | null;
}

export interface VeilorCompatibilityMatch {
  id?: string;
  user_id: string;
  matched_user_id: string;
  matched_name?: string | null;
  compatibility_score?: number | null;
  match_reasons?: Json | null;
  match_type?: string | null;
}

export interface VeilorPersonaZone {
  id?: string;
  user_id: string;
  sub_zone: string;
  is_enabled?: boolean | null;
}

export interface VeilorCqResponse {
  user_id: string;
  question_key: string;
  answer?: Json | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface VeilorDiveSession {
  id?: string;
  user_id: string;
  mode?: string | null;
  emotion?: string | null;
  messages?: Json | null;
  conflict_summary?: string | null;
  context_summary?: string | null;
  held_keywords?: string[] | null;
  suggestion?: string | null;
  turn_count?: number | null;
  session_completed?: boolean | null;
  emotional_stability?: number | null;
  conflict_frequency?: number | null;
  recovery_speed_minutes?: number | null;
  ended_at?: string | null;
  created_at?: string | null;
}

// ── M43 연동 타입 ────────────────────────────────────────────────
export interface VeilorM43Framework {
  id: string;
  code: string;
  name: string;
  name_ko: string;
  description?: string | null;
  core_question?: string | null;
  type_count?: number | null;
  applicable_divisions?: string[] | null;
  status?: string | null;
}

export interface VeilorM43Domain {
  id: string;
  code: string;
  name: string;
  division_id: string;
}

export interface VeilorM43Division {
  id: string;
  code: string;
  name: string;
}

export interface VeilorM43DomainQuestion {
  id: string;
  domain_id: string;
  question: string;
  keywords?: string[] | null;
  category?: string | null;
}

export interface VeilorM43DomainAnswer {
  id?: string;
  domain_id: string;
  user_id?: string | null;
  session_id?: string | null;
  source?: string | null;
  answer: string;
  created_at?: string | null;
}

export interface VeilorWhySession {
  id: string;
  user_id: string;
  status?: string | null;
  current_step?: number | null;
  timer_started_at?: string | null;
  timer_ended_at?: string | null;
  prime_perspective?: string | null;
  happy_patterns?: Json | null;
  pain_patterns?: Json | null;
  value_alignment?: Json | null;
  m43_domain_matches?: Json | null;
  m43_framework_tags?: Json | null;
  m43_imprint_connections?: Json | null;
  m43_value_map?: Json | null;
  completed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface VeilorPrimePerspective {
  user_id: string;
  perspective_text?: string | null;
  persona_type?: string | null;
  attachment_type?: string | null;
  ikigai?: Json | null;
  brand_identity?: Json | null;
  m43_domain_codes?: string[] | null;
  m43_framework_codes?: string[] | null;
  data_source?: string | null;
  is_complete?: boolean | null;
  signal_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface VeilorPatternProfile {
  id: string;
  user_id: string;
  pattern_axis: string;
  score?: number | null;
  confidence?: number | null;
  trend?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface VeilorPremiumTriggerEvent {
  id: string;
  user_id: string;
  trigger_type: string;
  created_at?: string | null;
}

// ── user_wellness_scores 타입 ────────────────────────────────────
// 사용 위치: 코드베이스 전반 (V-NEED 욕구 점수 집계 결과 저장용)
export interface VeilorUserWellnessScore {
  id?: string;
  user_id: string;
  // V-NEED 12욕구 Desired (0~100)
  need_bio_slp_desired?: number | null;
  need_bio_eat_desired?: number | null;
  need_bio_sex_desired?: number | null;
  need_saf_sec_desired?: number | null;
  need_saf_ctl_desired?: number | null;
  need_con_bel_desired?: number | null;
  need_con_int_desired?: number | null;
  need_grw_ach_desired?: number | null;
  need_grw_rec_desired?: number | null;
  need_grw_pwr_desired?: number | null;
  need_exs_aut_desired?: number | null;
  need_exs_mng_desired?: number | null;
  // V-NEED 12욕구 Satisfied (0~100)
  need_bio_slp_satisfied?: number | null;
  need_bio_eat_satisfied?: number | null;
  need_bio_sex_satisfied?: number | null;
  need_saf_sec_satisfied?: number | null;
  need_saf_ctl_satisfied?: number | null;
  need_con_bel_satisfied?: number | null;
  need_con_int_satisfied?: number | null;
  need_grw_ach_satisfied?: number | null;
  need_grw_rec_satisfied?: number | null;
  need_grw_pwr_satisfied?: number | null;
  need_exs_aut_satisfied?: number | null;
  need_exs_mng_satisfied?: number | null;
  // 집계 결과
  top_deficit_codes?: string[] | null;   // 상위 3개 결핍 욕구 코드
  bio_sex_adjustment?: number | null;    // ANXIETY_FROZEN 시 BIO-SEX 조정값
  anxiety_frozen_detected?: boolean | null;
  assessed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface VeilorWhyJobEntry {
  id: string;
  session_id: string;
  user_id: string;
  job_name: string;
  definition?: string | null;
  first_memory?: string | null;
  category?: 'happy' | 'pain' | 'neutral' | null;
  reason?: string | null;
  has_experience?: boolean | null;
  experience_note?: string | null;
  sort_order: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export type VeilorDatabase = {
  veilor: {
    Tables: {
      user_profiles: {
        Row: VeilorUserProfile;
        Insert: VeilorUserProfile;
        Update: Partial<VeilorUserProfile>;
        Relationships: [];
      };
      priper_sessions: {
        Row: VeilorPriperSession;
        Insert: VeilorPriperSession;
        Update: Partial<VeilorPriperSession>;
        Relationships: [];
      };
      tab_conversations: {
        Row: VeilorTabConversation;
        Insert: VeilorTabConversation;
        Update: Partial<VeilorTabConversation>;
        Relationships: [];
      };
      codetalk_keywords: {
        Row: VeilorCodetalkKeyword;
        Insert: VeilorCodetalkKeyword;
        Update: Partial<VeilorCodetalkKeyword>;
        Relationships: [];
      };
      codetalk_entries: {
        Row: VeilorCodetalkEntry;
        Insert: VeilorCodetalkEntry;
        Update: Partial<VeilorCodetalkEntry>;
        Relationships: [];
      };
      community_groups: {
        Row: VeilorCommunityGroup;
        Insert: VeilorCommunityGroup;
        Update: Partial<VeilorCommunityGroup>;
        Relationships: [];
      };
      compatibility_matches: {
        Row: VeilorCompatibilityMatch;
        Insert: VeilorCompatibilityMatch;
        Update: Partial<VeilorCompatibilityMatch>;
        Relationships: [];
      };
      persona_zones: {
        Row: VeilorPersonaZone;
        Insert: VeilorPersonaZone;
        Update: Partial<VeilorPersonaZone>;
        Relationships: [];
      };
      cq_responses: {
        Row: VeilorCqResponse;
        Insert: VeilorCqResponse;
        Update: Partial<VeilorCqResponse>;
        Relationships: [];
      };
      dive_sessions: {
        Row: VeilorDiveSession;
        Insert: VeilorDiveSession;
        Update: Partial<VeilorDiveSession>;
        Relationships: [];
      };
      anon_author_map: {
        Row: VeilorAnonAuthorMap;
        Insert: VeilorAnonAuthorMap;
        Update: Partial<VeilorAnonAuthorMap>;
        Relationships: [];
      };
      user_boundaries: {
        Row: VeilorUserBoundary;
        Insert: VeilorUserBoundary;
        Update: Partial<VeilorUserBoundary>;
        Relationships: [];
      };
      consent_checklist: {
        Row: VeilorConsentChecklist;
        Insert: VeilorConsentChecklist;
        Update: Partial<VeilorConsentChecklist>;
        Relationships: [];
      };
      // ── M43 테이블 ──
      m43_frameworks: {
        Row: VeilorM43Framework;
        Insert: VeilorM43Framework;
        Update: Partial<VeilorM43Framework>;
        Relationships: [];
      };
      m43_domains: {
        Row: VeilorM43Domain;
        Insert: VeilorM43Domain;
        Update: Partial<VeilorM43Domain>;
        Relationships: [];
      };
      m43_divisions: {
        Row: VeilorM43Division;
        Insert: VeilorM43Division;
        Update: Partial<VeilorM43Division>;
        Relationships: [];
      };
      m43_domain_questions: {
        Row: VeilorM43DomainQuestion;
        Insert: VeilorM43DomainQuestion;
        Update: Partial<VeilorM43DomainQuestion>;
        Relationships: [];
      };
      m43_domain_answers: {
        Row: VeilorM43DomainAnswer;
        Insert: VeilorM43DomainAnswer;
        Update: Partial<VeilorM43DomainAnswer>;
        Relationships: [];
      };
      why_sessions: {
        Row: VeilorWhySession;
        Insert: Omit<VeilorWhySession, 'id'>;
        Update: Partial<VeilorWhySession>;
        Relationships: [];
      };
      why_job_entries: {
        Row: VeilorWhyJobEntry;
        Insert: Omit<VeilorWhyJobEntry, 'id'>;
        Update: Partial<VeilorWhyJobEntry>;
        Relationships: [];
      };
      prime_perspectives: {
        Row: VeilorPrimePerspective;
        Insert: VeilorPrimePerspective;
        Update: Partial<VeilorPrimePerspective>;
        Relationships: [];
      };
      pattern_profiles: {
        Row: VeilorPatternProfile;
        Insert: Omit<VeilorPatternProfile, 'id'>;
        Update: Partial<VeilorPatternProfile>;
        Relationships: [];
      };
      premium_trigger_events: {
        Row: VeilorPremiumTriggerEvent;
        Insert: Omit<VeilorPremiumTriggerEvent, 'id'>;
        Update: Partial<VeilorPremiumTriggerEvent>;
        Relationships: [];
      };
      m43_user_question_logs: {
        Row: { id: string; user_id: string; raw_question?: string; matched_question_id?: string; matched_domain_id?: string; created_at?: string };
        Insert: { user_id: string; raw_question?: string; matched_question_id?: string; matched_domain_id?: string };
        Update: Partial<{ user_id: string; raw_question?: string; matched_question_id?: string; matched_domain_id?: string }>;
        Relationships: [];
      };
      // ── 멀티페르소나 테이블 (persona-types.ts의 인터페이스 재사용) ──
      persona_profiles: {
        Row: PersonaProfile;
        Insert: Omit<PersonaProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PersonaProfile, 'id' | 'user_id'>>;
        Relationships: [];
      };
      persona_relationships: {
        Row: PersonaRelationship;
        Insert: Omit<PersonaRelationship, 'id' | 'created_at'>;
        Update: Partial<Omit<PersonaRelationship, 'id' | 'user_id'>>;
        Relationships: [];
      };
      // ── V-NEED 욕구 점수 집계 ──────────────────────────────────────
      user_wellness_scores: {
        Row: VeilorUserWellnessScore;
        Insert: Omit<VeilorUserWellnessScore, 'id'>;
        Update: Partial<Omit<VeilorUserWellnessScore, 'id' | 'user_id'>>;
        Relationships: [];
      };
      // ── DM 룸 ──────────────────────────────────────────────────────
      dm_rooms: {
        Row: VeilorDmRoom;
        Insert: Omit<VeilorDmRoom, 'id' | 'created_at'>;
        Update: Partial<Omit<VeilorDmRoom, 'id' | 'user_a_id' | 'user_b_id'>>;
        Relationships: [];
      };
      // ── B2B 테이블 ──────────────────────────────────────────────────
      b2b_orgs: {
        Row: B2BOrg;
        Insert: Omit<B2BOrg, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<B2BOrg, 'id'>>;
        Relationships: [];
      };
      b2b_org_members: {
        Row: B2BOrgMember;
        Insert: Omit<B2BOrgMember, 'id' | 'created_at'>;
        Update: Partial<Omit<B2BOrgMember, 'id'>>;
        Relationships: [];
      };
      b2b_org_admins: {
        Row: B2BOrgAdmin;
        Insert: Omit<B2BOrgAdmin, 'id' | 'created_at'>;
        Update: Partial<Omit<B2BOrgAdmin, 'id'>>;
        Relationships: [];
      };
      b2b_org_events: {
        Row: B2BOrgEvent;
        Insert: Omit<B2BOrgEvent, 'id' | 'created_at'>;
        Update: Partial<Omit<B2BOrgEvent, 'id'>>;
        Relationships: [];
      };
      b2b_checkin_sessions: {
        Row: B2BCheckinSession;
        Insert: Omit<B2BCheckinSession, 'id' | 'created_at'>;
        Update: Partial<Omit<B2BCheckinSession, 'id'>>;
        Relationships: [];
      };
      b2b_coaching_sessions: {
        Row: B2BCoachingSession;
        Insert: Omit<B2BCoachingSession, 'id' | 'created_at'>;
        Update: Partial<Omit<B2BCoachingSession, 'id'>>;
        Relationships: [];
      };
      b2b_coaches: {
        Row: B2BCoach;
        Insert: Omit<B2BCoach, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<B2BCoach, 'id'>>;
        Relationships: [];
      };
      b2b_coach_posts: {
        Row: B2BCoachPost;
        Insert: Omit<B2BCoachPost, 'id'>;
        Update: Partial<Omit<B2BCoachPost, 'id'>>;
        Relationships: [];
      };
      b2b_org_aggregate: {
        Row: B2BOrgAggregate;
        Insert: Omit<B2BOrgAggregate, 'id' | 'created_at'>;
        Update: Partial<Omit<B2BOrgAggregate, 'id'>>;
        Relationships: [];
      };
      b2b_trainee_profiles: {
        Row: B2BTraineeProfile;
        Insert: Omit<B2BTraineeProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<B2BTraineeProfile, 'id'>>;
        Relationships: [];
      };
      emotion_scores: {
        Row: VeilorEmotionScore;
        Insert: Omit<VeilorEmotionScore, 'id' | 'created_at'>;
        Update: Partial<Omit<VeilorEmotionScore, 'id'>>;
        Relationships: [];
      };
      emotion_checkins: {
        Row: VeilorEmotionCheckin;
        Insert: Omit<VeilorEmotionCheckin, 'id' | 'created_at'>;
        Update: Partial<Omit<VeilorEmotionCheckin, 'id'>>;
        Relationships: [];
      };
      b2b_reports: {
        Row: B2BReport;
        Insert: Omit<B2BReport, 'id' | 'created_at'>;
        Update: Partial<Omit<B2BReport, 'id'>>;
        Relationships: [];
      };
      dp_budget_log: {
        Row: DPBudgetLog;
        Insert: Omit<DPBudgetLog, 'id' | 'created_at'>;
        Update: Partial<Omit<DPBudgetLog, 'id'>>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      save_vent_session_summary: {
        Args: {
          p_user_id: string;
          p_emotion: string;
          p_messages: Json;
          p_suggestion: string;
          p_turn_count: number;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// ─────────────────────────────────────────────
// B2B 타입 정의
// ─────────────────────────────────────────────

export type B2BOrgType = 'sports' | 'entertainment' | 'corporate';
export type B2BOrgPlan = 'starter' | 'growth' | 'enterprise' | 'trainee_basic' | 'trainee_full';
export type B2BOrgStatus = 'active' | 'paused' | 'terminated';
export type B2BMemberType = 'member' | 'trainee' | 'admin';
export type B2BMemberStatus = 'active' | 'inactive' | 'released';
export type B2BAdminRole = 'owner' | 'manager' | 'viewer';
export type B2BTriggerType = 'scheduled' | 'event_pre' | 'event_post' | 'slump_auto' | 'manual';
export type B2BRiskLevel = 'normal' | 'low' | 'medium' | 'high';
export type B2BRoutingResult = 'coaching' | 'counseling' | 'self_care' | 'none';
export type B2BCoachStatus = 'candidate' | 'probation' | 'active' | 'suspended' | 'inactive';
export type B2BSessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export interface B2BOrg {
  id: string;
  name: string;
  org_type: B2BOrgType;
  plan: B2BOrgPlan;
  member_count: number;
  contract_start: string;
  contract_end?: string | null;
  status: B2BOrgStatus;
  meta?: Json;
  created_at: string;
  updated_at: string;
}

export interface B2BOrgMember {
  id: string;
  org_id: string;
  user_id: string;
  member_type: B2BMemberType;
  birth_year?: number | null;
  guardian_user_id?: string | null;
  guardian_consent_at?: string | null;
  status: B2BMemberStatus;
  joined_at: string;
  released_at?: string | null;
  meta?: Json;
  created_at: string;
}

export interface B2BOrgAdmin {
  id: string;
  org_id: string;
  user_id: string;
  role: B2BAdminRole;
  created_at: string;
}

export interface B2BOrgEvent {
  id: string;
  org_id: string;
  event_type: string;
  event_name: string;
  event_date: string;
  target_member_ids?: string[] | null;
  auto_checkin: boolean;
  checkin_schedule?: Json;
  meta?: Json;
  created_at: string;
}

export interface B2BCheckinSession {
  id: string;
  member_id: string;
  org_id: string;
  org_event_id?: string | null;
  trigger_type: B2BTriggerType;
  c_control?: number | null;
  c_commitment?: number | null;
  c_challenge?: number | null;
  c_confidence?: number | null;
  c_avg?: number | null;
  free_text?: string | null;
  risk_score: number;
  risk_level: B2BRiskLevel;
  routing_result?: B2BRoutingResult | null;
  days_to_event?: number | null;
  days_from_event?: number | null;
  meta?: Json;
  created_at: string;
}

export interface B2BCoachingSession {
  id: string;
  member_id: string;
  org_id: string;
  coach_id: string;
  trigger_checkin_id?: string | null;
  trigger_type?: string | null;
  session_type?: string | null;
  scheduled_at?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  duration_min?: number | null;
  status: B2BSessionStatus;
  member_rating?: number | null;
  coach_notes?: string | null;
  followup_needed: boolean;
  escalated_to_counseling: boolean;
  meta?: Json;
  created_at: string;
}

export interface B2BCoach {
  id: string;
  user_id: string;
  display_name: string;
  domains: string[];
  specialties?: string[];
  certifications?: string[];
  languages: string[];
  msk_affinity?: string[];
  bio?: string | null;
  status: B2BCoachStatus;
  avg_rating: number;
  session_count: number;
  max_members: number;
  current_members: number;
  meta?: Json;
  created_at: string;
  updated_at: string;
}

export interface B2BOrgAggregate {
  id: string;
  org_id: string;
  week_start: string;
  total_members: number;
  checkin_count: number;
  checkin_rate?: number | null;
  avg_duration_sec?: number | null;
  avg_c_control?: number | null;
  avg_c_commitment?: number | null;
  avg_c_challenge?: number | null;
  avg_c_confidence?: number | null;
  avg_4c?: number | null;
  risk_normal_count: number;
  risk_low_count: number;
  risk_medium_count: number;
  risk_high_count: number;
  coaching_sessions_count: number;
  coaching_avg_rating?: number | null;
  created_at: string;
}

export interface B2BTraineeProfile {
  id: string;
  member_id: string;
  org_id: string;
  birth_year: number;
  age_group: string;
  trainee_start_date?: string | null;
  specialty?: string | null;
  ltad_stage?: string | null;
  guardian_name?: string | null;
  guardian_contact?: string | null;
  status: string;
  debuted_at?: string | null;
  released_at?: string | null;
  release_reason?: string | null;
  meta?: Json;
  created_at: string;
  updated_at: string;
}

export interface VeilorEmotionScore {
  id: string;
  user_id: string;
  session_id?: string | null;
  input_text: string;
  top_emotions: Array<{ label: string; score: number }>;
  need_gaps: Record<string, number>;
  model_version: string;
  created_at: string;
}

export interface VeilorEmotionCheckin {
  id: string;
  user_id: string;
  emotion: string;
  score: number;
  note?: string | null;
  created_at: string;
}

export interface B2BReport {
  id: string;
  org_id: string;
  report_type: string;
  dp_epsilon: number;
  dp_delta: number;
  dp_mechanism: string;
  report_data: Json;
  created_at: string;
}

export interface DPBudgetLog {
  id: string;
  org_id: string;
  epsilon_used: number;
  mechanism: string;
  created_at: string;
}

// 온보딩 폼 입력 타입
export interface B2BOrgOnboardingInput {
  name: string;
  org_type: B2BOrgType;
  plan: B2BOrgPlan;
  contract_start: string;
  admin_email: string;
}

// 멤버 초대 입력 타입
export interface B2BMemberInviteInput {
  email: string;
  member_type: B2BMemberType;
  birth_year?: number;
}

// 4C 체크인 입력 타입
export interface B2BCheckinInput {
  org_id: string;
  org_event_id?: string;
  trigger_type: B2BTriggerType;
  c_control: number;
  c_commitment: number;
  c_challenge: number;
  c_confidence: number;
  free_text?: string;
}

// ── 코치 포스트 (소개 피드) ──────────────────────────────────────────
export interface B2BCoachPost {
  id: string;
  coach_id: string;
  user_id: string;
  title?: string | null;
  body: string;
  tags?: string[] | null;
  is_pinned?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

// ── 코치 포털 전용 타입 ──────────────────────────────────────────────

// 코치 관점 멤버 요약 (클라이언트 목록용)
export interface B2BCoachMemberSummary {
  member_id: string;
  org_id: string;
  org_name?: string;
  member_type: B2BMemberType;
  display_name?: string;
  latest_checkin_at?: string | null;
  latest_risk_level?: B2BRiskLevel | null;
  latest_c_avg?: number | null;
  sessions_count: number;
}

// 코치 관점 세션 상세 (멤버 정보 + 체크인 포함)
export interface B2BCoachSessionDetail extends B2BCoachingSession {
  member_name?: string;
  org_name?: string;
  trigger_checkin?: Pick<B2BCheckinSession, 'c_avg' | 'risk_level' | 'routing_result'> | null;
}
