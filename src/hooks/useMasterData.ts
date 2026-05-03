import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguageContext } from '@/context/LanguageContext';

interface SocialNeed {
  id: string;
  need_text: string;
  category: string;
  is_active: boolean;
  sort_order: number;
}

interface CustomerCohort {
  id: string;
  segment: string;
  pain_points: string;
  category: string;
  is_active: boolean;
  sort_order: number;
}

interface SkillCategory {
  id: string;
  category_name: string;
  color_code: string;
  is_active: boolean;
  sort_order: number;
}

interface MasterData {
  socialNeeds: SocialNeed[];
  customerCohorts: CustomerCohort[];
  skillCategories: SkillCategory[];
  loading: boolean;
  error: string | null;
}

export const useMasterData = (): MasterData => {
  const { language } = useLanguageContext();
  const isEn = language === 'en';
  const [socialNeeds, setSocialNeeds] = useState<SocialNeed[]>([]);
  const [customerCohorts, setCustomerCohorts] = useState<CustomerCohort[]>([]);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMasterData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 사회적 가치 로드
      const { data: socialNeedsData, error: socialNeedsError } = await supabase
        .from('social_needs_master')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (socialNeedsError) {
        throw new Error(`${isEn ? 'Social values load failed' : '사회적 가치 로드 실패'}: ${socialNeedsError.message}`);
      }

      // 고객 코호트 로드
      const { data: cohortsData, error: cohortsError } = await supabase
        .from('customer_cohorts_master')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (cohortsError) {
        throw new Error(`${isEn ? 'Customer cohort load failed' : '고객 코호트 로드 실패'}: ${cohortsError.message}`);
      }

      // 스킬 카테고리 로드
      const { data: skillCategoriesData, error: skillCategoriesError } = await supabase
        .from('skill_categories_master')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (skillCategoriesError) {
        throw new Error(`${isEn ? 'Skill categories load failed' : '스킬 카테고리 로드 실패'}: ${skillCategoriesError.message}`);
      }

      setSocialNeeds(socialNeedsData || []);
      setCustomerCohorts(cohortsData || []);
      setSkillCategories(skillCategoriesData || []);

    } catch (err) {
      console.error('Master data loading error:', err);
      setError(err instanceof Error ? err.message : (isEn ? 'An error occurred while loading master data.' : '마스터 데이터 로드 중 오류가 발생했습니다.'));
      
      // Fallback 데이터 제공
      setSocialNeeds([
        { id: 'fallback-1', need_text: isEn ? 'Climate action'     : '기후 변화 대응', category: isEn ? 'Environment' : '환경', is_active: true, sort_order: 1 },
        { id: 'fallback-2', need_text: isEn ? 'Digital equity'     : '디지털 격차 해소', category: isEn ? 'Technology' : '기술', is_active: true, sort_order: 2 },
        { id: 'fallback-3', need_text: isEn ? 'Mental health care' : '멘탈 헬스 케어', category: isEn ? 'Health' : '건강', is_active: true, sort_order: 3 },
      ]);

      setCustomerCohorts([
        { id: 'fallback-1', segment: isEn ? 'Busy professionals' : '바쁜 직장인', pain_points: isEn ? 'Time pressure, work stress' : '시간 부족, 업무 스트레스', category: isEn ? 'Professional' : '직장인', is_active: true, sort_order: 1 },
        { id: 'fallback-2', segment: isEn ? 'Senior adults'      : '시니어층',   pain_points: isEn ? 'Digital adaptation, loneliness' : '디지털 적응, 외로움', category: isEn ? 'Senior' : '시니어', is_active: true, sort_order: 2 },
      ]);

      setSkillCategories([
        { id: 'fallback-1', category_name: isEn ? 'Technology'    : '기술', color_code: '#3B82F6', is_active: true, sort_order: 1 },
        { id: 'fallback-2', category_name: isEn ? 'Creative'      : '창작', color_code: '#10B981', is_active: true, sort_order: 2 },
        { id: 'fallback-3', category_name: isEn ? 'Communication' : '소통', color_code: '#F59E0B', is_active: true, sort_order: 3 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  return {
    socialNeeds,
    customerCohorts,
    skillCategories,
    loading,
    error
  };
};

// 개별 데이터 타입 export
export type { SocialNeed, CustomerCohort, SkillCategory };