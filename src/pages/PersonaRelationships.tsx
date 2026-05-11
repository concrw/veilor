import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedBrandingStrategy } from "@/components/persona/UnifiedBrandingStrategy";
import { PersonaRelationshipGraph } from "@/components/persona/PersonaRelationshipGraph";
import { PersonaGrowthDashboard } from "@/components/persona/PersonaGrowthDashboard";
import { Network, Palette, TrendingUp } from "lucide-react";
import { useT } from '@/i18n/useT';


export default function PersonaRelationships() {
  const t = useT();
  const s = t.personaPages.personaRelationships;

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
