// Re-export barrel — 기존 import 경로 호환성 유지
export {
  usePersonas,
  useAccessiblePersonas,
  usePersona,
  useMainPersona,
  useHasMultiplePersonas,
} from "./persona/usePersonaQueries";

export {
  useDetectPersonas,
  useUpdatePersona,
  useVerifyPersona,
  useDeactivatePersona,
  useSetActivePersona,
} from "./persona/usePersonaMutations";

export {
  usePersonaRelationships,
  useAnalyzePersonaRelationships,
} from "./persona/usePersonaRelationships";

export {
  usePersonaIkigai,
  useUpsertPersonaIkigai,
} from "./persona/usePersonaIkigai";

export {
  useBrandingStrategy,
  useSaveBrandingStrategy,
} from "./persona/usePersonaBranding";

export {
  usePersonaMilestones,
  useAllMilestones,
  useToggleMilestone,
  useCreateMilestone,
} from "./persona/usePersonaMilestones";

export {
  useGrowthSummary,
  usePersonaGrowthHistory,
  useRecordGrowthMetric,
} from "./persona/usePersonaGrowth";
