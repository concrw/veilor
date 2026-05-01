import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedBrandingStrategy } from "@/components/persona/UnifiedBrandingStrategy";
import { PersonaRelationshipGraph } from "@/components/persona/PersonaRelationshipGraph";
import { PersonaGrowthDashboard } from "@/components/persona/PersonaGrowthDashboard";
import { Network, Palette, TrendingUp } from "lucide-react";
import { useLanguageContext } from "@/context/LanguageContext";

const S = {
  ko: {
    pageTitle: '페르소나 관계 분석 | V-File',
    metaDesc: '여러 페르소나 간의 시너지를 분석하고 통합 브랜딩 전략을 수립하세요',
    heading: '페르소나 통합 분석',
    subheading: '여러 페르소나의 관계를 분석하고 성장을 추적하세요',
    tabRelationships: '관계 분석',
    tabBranding: '브랜딩 전략',
    tabGrowth: '성장 추적',
  },
  en: {
    pageTitle: 'Persona Relationship Analysis | V-File',
    metaDesc: 'Analyze synergies between multiple personas and build an integrated branding strategy',
    heading: 'Persona Integrated Analysis',
    subheading: 'Analyze relationships between personas and track growth',
    tabRelationships: 'Relationships',
    tabBranding: 'Branding Strategy',
    tabGrowth: 'Growth Tracking',
  },
};

export default function PersonaRelationships() {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  return (
    <>
      <Helmet>
        <title>{s.pageTitle}</title>
        <meta
          name="description"
          content={s.metaDesc}
        />
        <link rel="canonical" href={`${window.location.origin}/personas/relationships`} />
      </Helmet>

      <main className="min-h-screen bg-background text-foreground px-4 pb-24 pt-6">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">{s.heading}</h1>
          <p className="text-muted-foreground">
            {s.subheading}
          </p>
        </header>

        <Tabs defaultValue="relationships" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="relationships">
              <Network className="w-4 h-4 mr-2" />
              {s.tabRelationships}
            </TabsTrigger>
            <TabsTrigger value="branding">
              <Palette className="w-4 h-4 mr-2" />
              {s.tabBranding}
            </TabsTrigger>
            <TabsTrigger value="growth">
              <TrendingUp className="w-4 h-4 mr-2" />
              {s.tabGrowth}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="relationships">
            <PersonaRelationshipGraph />
          </TabsContent>

          <TabsContent value="branding">
            <UnifiedBrandingStrategy />
          </TabsContent>

          <TabsContent value="growth">
            <PersonaGrowthDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
