import type { Json } from './types';

export interface VeilrumUserProfile {
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
  created_at?: string | null;
  updated_at?: string | null;
}

export interface VeilrumPriperSession {
  id?: string;
  user_id: string;
  primary_mask?: string | null;
  secondary_masks?: Json | null;
  axis_scores?: Json | null;
  is_completed?: boolean | null;
  completed_at?: string | null;
  created_at?: string | null;
}

export interface VeilrumTabConversation {
  id?: string;
  user_id: string;
  tab?: string | null;
  stage?: string | null;
  role?: string | null;
  content?: string | null;
  created_at?: string | null;
}

export interface VeilrumCodetalkKeyword {
  id: string;
  keyword: string;
  day_number?: number | null;
  description?: string | null;
}

export interface VeilrumCodetalkEntry {
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
  codetalk_keywords?: Pick<VeilrumCodetalkKeyword, 'keyword' | 'day_number'> | null;
}

export interface VeilrumUserBoundary {
  id?: string;
  user_id: string;
  category: string;
  boundary_text?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
}

export interface VeilrumConsentChecklist {
  id?: string;
  user_id: string;
  condition_key: string;
  is_checked?: boolean | null;
  checked_at?: string | null;
  created_at?: string | null;
}

export interface VeilrumAnonAuthorMap {
  id?: string;
  real_user_id: string;
  anon_alias: string;
  context?: string | null;
  created_at?: string | null;
}

export interface VeilrumCommunityGroup {
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

export interface VeilrumCompatibilityMatch {
  id?: string;
  user_id: string;
  matched_user_id: string;
  matched_name?: string | null;
  compatibility_score?: number | null;
  match_reasons?: Json | null;
  match_type?: string | null;
}

export interface VeilrumPersonaZone {
  id?: string;
  user_id: string;
  sub_zone: string;
  is_enabled?: boolean | null;
}

export interface VeilrumCqResponse {
  user_id: string;
  question_key: string;
  answer?: Json | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface VeilrumDiveSession {
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
export interface VeilrumM43Framework {
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

export interface VeilrumM43Domain {
  id: string;
  code: string;
  name: string;
  division_id: string;
}

export interface VeilrumM43Division {
  id: string;
  code: string;
  name: string;
}

export interface VeilrumM43DomainQuestion {
  id: string;
  domain_id: string;
  question: string;
  keywords?: string[] | null;
  category?: string | null;
}

export interface VeilrumM43DomainAnswer {
  id?: string;
  domain_id: string;
  user_id?: string | null;
  session_id?: string | null;
  source?: string | null;
  answer: string;
  created_at?: string | null;
}

export interface VeilrumWhySession {
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

export interface VeilrumPrimePerspective {
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

export interface VeilrumPatternProfile {
  id: string;
  user_id: string;
  pattern_axis: string;
  score?: number | null;
  confidence?: number | null;
  trend?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface VeilrumPremiumTriggerEvent {
  id: string;
  user_id: string;
  trigger_type: string;
  created_at?: string | null;
}

export interface VeilrumWhyJobEntry {
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

export type VeilrumDatabase = {
  veilrum: {
    Tables: {
      user_profiles: {
        Row: VeilrumUserProfile;
        Insert: VeilrumUserProfile;
        Update: Partial<VeilrumUserProfile>;
        Relationships: [];
      };
      priper_sessions: {
        Row: VeilrumPriperSession;
        Insert: VeilrumPriperSession;
        Update: Partial<VeilrumPriperSession>;
        Relationships: [];
      };
      tab_conversations: {
        Row: VeilrumTabConversation;
        Insert: VeilrumTabConversation;
        Update: Partial<VeilrumTabConversation>;
        Relationships: [];
      };
      codetalk_keywords: {
        Row: VeilrumCodetalkKeyword;
        Insert: VeilrumCodetalkKeyword;
        Update: Partial<VeilrumCodetalkKeyword>;
        Relationships: [];
      };
      codetalk_entries: {
        Row: VeilrumCodetalkEntry;
        Insert: VeilrumCodetalkEntry;
        Update: Partial<VeilrumCodetalkEntry>;
        Relationships: [];
      };
      community_groups: {
        Row: VeilrumCommunityGroup;
        Insert: VeilrumCommunityGroup;
        Update: Partial<VeilrumCommunityGroup>;
        Relationships: [];
      };
      compatibility_matches: {
        Row: VeilrumCompatibilityMatch;
        Insert: VeilrumCompatibilityMatch;
        Update: Partial<VeilrumCompatibilityMatch>;
        Relationships: [];
      };
      persona_zones: {
        Row: VeilrumPersonaZone;
        Insert: VeilrumPersonaZone;
        Update: Partial<VeilrumPersonaZone>;
        Relationships: [];
      };
      cq_responses: {
        Row: VeilrumCqResponse;
        Insert: VeilrumCqResponse;
        Update: Partial<VeilrumCqResponse>;
        Relationships: [];
      };
      dive_sessions: {
        Row: VeilrumDiveSession;
        Insert: VeilrumDiveSession;
        Update: Partial<VeilrumDiveSession>;
        Relationships: [];
      };
      anon_author_map: {
        Row: VeilrumAnonAuthorMap;
        Insert: VeilrumAnonAuthorMap;
        Update: Partial<VeilrumAnonAuthorMap>;
        Relationships: [];
      };
      user_boundaries: {
        Row: VeilrumUserBoundary;
        Insert: VeilrumUserBoundary;
        Update: Partial<VeilrumUserBoundary>;
        Relationships: [];
      };
      consent_checklist: {
        Row: VeilrumConsentChecklist;
        Insert: VeilrumConsentChecklist;
        Update: Partial<VeilrumConsentChecklist>;
        Relationships: [];
      };
      // ── M43 테이블 ──
      m43_frameworks: {
        Row: VeilrumM43Framework;
        Insert: VeilrumM43Framework;
        Update: Partial<VeilrumM43Framework>;
        Relationships: [];
      };
      m43_domains: {
        Row: VeilrumM43Domain;
        Insert: VeilrumM43Domain;
        Update: Partial<VeilrumM43Domain>;
        Relationships: [];
      };
      m43_divisions: {
        Row: VeilrumM43Division;
        Insert: VeilrumM43Division;
        Update: Partial<VeilrumM43Division>;
        Relationships: [];
      };
      m43_domain_questions: {
        Row: VeilrumM43DomainQuestion;
        Insert: VeilrumM43DomainQuestion;
        Update: Partial<VeilrumM43DomainQuestion>;
        Relationships: [];
      };
      m43_domain_answers: {
        Row: VeilrumM43DomainAnswer;
        Insert: VeilrumM43DomainAnswer;
        Update: Partial<VeilrumM43DomainAnswer>;
        Relationships: [];
      };
      why_sessions: {
        Row: VeilrumWhySession;
        Insert: Omit<VeilrumWhySession, 'id'>;
        Update: Partial<VeilrumWhySession>;
        Relationships: [];
      };
      why_job_entries: {
        Row: VeilrumWhyJobEntry;
        Insert: Omit<VeilrumWhyJobEntry, 'id'>;
        Update: Partial<VeilrumWhyJobEntry>;
        Relationships: [];
      };
      prime_perspectives: {
        Row: VeilrumPrimePerspective;
        Insert: VeilrumPrimePerspective;
        Update: Partial<VeilrumPrimePerspective>;
        Relationships: [];
      };
      pattern_profiles: {
        Row: VeilrumPatternProfile;
        Insert: Omit<VeilrumPatternProfile, 'id'>;
        Update: Partial<VeilrumPatternProfile>;
        Relationships: [];
      };
      premium_trigger_events: {
        Row: VeilrumPremiumTriggerEvent;
        Insert: Omit<VeilrumPremiumTriggerEvent, 'id'>;
        Update: Partial<VeilrumPremiumTriggerEvent>;
        Relationships: [];
      };
      m43_user_question_logs: {
        Row: { id: string; user_id: string; raw_question?: string; matched_question_id?: string; matched_domain_id?: string; created_at?: string };
        Insert: { user_id: string; raw_question?: string; matched_question_id?: string; matched_domain_id?: string };
        Update: Partial<{ user_id: string; raw_question?: string; matched_question_id?: string; matched_domain_id?: string }>;
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
