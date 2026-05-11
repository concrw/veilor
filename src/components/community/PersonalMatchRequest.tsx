import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { useT } from '@/i18n/useT';

interface PersonalMatchRequestProps {
  onSubmit: (email: string) => void;
  isLoading: boolean;
}

export const PersonalMatchRequest = ({ onSubmit, isLoading }: PersonalMatchRequestProps) => {
  const t = useT();
  const s = t.communityDomain.personalMatchRequest;
  const [targetEmail, setTargetEmail] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = () => {
    const newErrors: string[] = [];

    if (!targetEmail.trim()) {
      newErrors.push(s.errRequired);
    } else if (!validateEmail(targetEmail.trim())) {
      newErrors.push(s.errInvalid);
    }

    setErrors(newErrors);

    if (newErrors.length === 0) {
      onSubmit(targetEmail.trim());
      setTargetEmail("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Search className="w-4 h-4" />
          {s.cardTitle}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {s.cardDesc}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="target-email" className="text-xs font-medium">
            {s.emailLabel}
          </Label>
          <div className="flex gap-2">
            <Input
              id="target-email"
              type="email"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={s.emailPlaceholder}
              className="text-xs"
              disabled={isLoading}
            />
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !targetEmail.trim()}
              size="sm"
              className="text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  {s.requesting}
                </>
              ) : (
                <>
                  <Search className="w-3 h-3 mr-1" />
                  {s.request}
                </>
              )}
            </Button>
          </div>
          
          {errors.length > 0 && (
            <div className="space-y-1">
              {errors.map((error, index) => (
                <div key={index} className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-muted/50 p-3 rounded-lg space-y-2">
          <h5 className="text-xs font-medium">{s.condTitle}</h5>
          <ul className="text-xs text-muted-foreground space-y-1">
            {s.conditions.map((cond, i) => (
              <li key={i}>• {cond}</li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <h5 className="text-xs font-medium mb-1 text-blue-800">{s.resultTitle}</h5>
          <ul className="text-xs text-blue-700 space-y-1">
            {s.results.map((r, i) => (
              <li key={i}>• <strong>{r.label}</strong>: {r.desc}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};