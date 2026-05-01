import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { useLanguageContext } from "@/context/LanguageContext";

const S = {
  ko: {
    cardTitle: '개인 매칭 분석',
    cardDesc: '특정인과의 매칭률과 상호보완률을 확인해보세요',
    emailLabel: '분석하고 싶은 상대방 이메일',
    emailPlaceholder: '상대방의 이메일을 입력하세요',
    requesting: '요청중',
    request: '요청',
    errRequired: '이메일을 입력해주세요',
    errInvalid: '올바른 이메일 형식을 입력해주세요',
    condTitle: '📋 분석 조건',
    conditions: [
      '상대방이 V-File 회원이어야 합니다',
      '상대방이 Why 분석을 완료했어야 합니다',
      '상대방이 분석 요청을 수락해야 합니다',
      '양쪽 모두 데이터가 충분해야 신뢰할 수 있습니다',
    ],
    resultTitle: '💡 분석 결과로 알 수 있는 것',
    results: [
      { label: '매칭률', desc: '가치관, 관심사, 성향의 유사도' },
      { label: '상호보완률', desc: '서로의 부족한 부분을 채워줄 수 있는 정도' },
      { label: 'Prime Perspective 일치도', desc: '근본적 관점의 조화' },
      { label: '성장 시너지', desc: '함께 발전할 수 있는 영역' },
    ],
  },
  en: {
    cardTitle: 'Personal Match Analysis',
    cardDesc: 'Check your match rate and complementarity with a specific person',
    emailLabel: "Other person's email to analyze",
    emailPlaceholder: "Enter the other person's email",
    requesting: 'Requesting...',
    request: 'Request',
    errRequired: 'Please enter an email address',
    errInvalid: 'Please enter a valid email format',
    condTitle: '📋 Analysis Conditions',
    conditions: [
      'The other person must be a V-File member',
      'The other person must have completed Why analysis',
      'The other person must accept the analysis request',
      'Both sides need sufficient data for reliability',
    ],
    resultTitle: '💡 What Analysis Reveals',
    results: [
      { label: 'Match Rate', desc: 'Similarity in values, interests, and tendencies' },
      { label: 'Complementarity', desc: 'How well you fill each other\'s gaps' },
      { label: 'Prime Perspective Alignment', desc: 'Harmony of fundamental perspectives' },
      { label: 'Growth Synergy', desc: 'Areas where you can grow together' },
    ],
  },
} as const;

interface PersonalMatchRequestProps {
  onSubmit: (email: string) => void;
  isLoading: boolean;
}

export const PersonalMatchRequest = ({ onSubmit, isLoading }: PersonalMatchRequestProps) => {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
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