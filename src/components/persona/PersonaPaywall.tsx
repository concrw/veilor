import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Lock, Crown } from "lucide-react";
import { useT } from "@/i18n/useT";
import { isNativeApp } from "@/lib/platform";

interface PersonaPaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personaCount: number;
  triggerContext: "discovery" | "ikigai" | "branding";
}

export function PersonaPaywall({
  open,
  onOpenChange,
  personaCount,
  triggerContext,
}: PersonaPaywallProps) {
  const t = useT();
  const s = t.personaPaywall;
  const nativeApp = isNativeApp();

  const triggerFn = s.triggers[triggerContext] ?? s.triggers.default;
  const message = triggerFn(personaCount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-primary" />
            <DialogTitle className="text-xl">{message.title}</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {message.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium">{s.freeLabel}</p>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {s.freeFeatures.map(f => <li key={f}>• {f}</li>)}
              </ul>
            </div>

            <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium">{s.proLabel}</p>
                <Badge variant="default" className="ml-auto text-xs">{s.recommended}</Badge>
              </div>
              <ul className="text-sm space-y-2 mb-4">
                {s.proFeatures(personaCount).map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {!nativeApp && (
              <p className="text-sm text-center text-muted-foreground">{s.webOnlyNotice}</p>
            )}
            {nativeApp && (
              <p className="text-sm text-center text-muted-foreground">{s.appNotice ?? s.webOnlyNotice}</p>
            )}
            <Button variant="outline" size="lg" className="w-full" onClick={() => onOpenChange(false)}>
              {s.ctaLater}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
