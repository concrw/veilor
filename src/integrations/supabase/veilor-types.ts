import type { Json } from './types';

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
  created_at?: string | null;
  updated_at?: string | null;
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
