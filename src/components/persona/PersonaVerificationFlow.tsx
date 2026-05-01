import { useState } from "react";
import { useVerifyPersona, useUpdatePersona } from "@/hooks/usePersonas";
import { PersonaWithDetails } from "@/integrations/supabase/persona-types";
import { useLanguageContext } from "@/context/LanguageContext";

const S = {
  ko: {
    titleEdit: '페르소나 수정',
    titleVerify: '페르소나 검증',
    descEdit: 'AI가 제안한 내용을 수정할 수 있습니다',
    descVerify: 'AI가 분석한 페르소나가 정확한가요?',
    strengthSuffix: (n: number) => `${n}% 강도`,
    themeLabel: '테마 설명',
    keywordsLabel: '관련 키워드',
    btnAccept: '정확해요',
    btnEdit: '수정할래요',
    nameLabel: '페르소나 이름',
    namePlaceholder: '예: 돕는 나, 창작하는 나',
    descLabel: '테마 설명',
    descPlaceholder: '이 페르소나를 설명하는 문장을 작성하세요',
    cancel: '취소',
    saveVerify: '저장하고 검증 완료',
  },
  en: {
    titleEdit: 'Edit Persona',
    titleVerify: 'Verify Persona',
    descEdit: 'You can edit the AI-suggested details',
    descVerify: 'Is the AI-analyzed persona accurate?',
    strengthSuffix: (n: number) => `${n}% strength`,
    themeLabel: 'Theme Description',
    keywordsLabel: 'Related Keywords',
    btnAccept: 'Looks right',
    btnEdit: 'Edit it',
    nameLabel: 'Persona Name',
    namePlaceholder: 'e.g. Helper Me, Creative Me',
    descLabel: 'Theme Description',
    descPlaceholder: 'Write a sentence that describes this persona',
    cancel: 'Cancel',
    saveVerify: 'Save & Complete Verification',
  },
};
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Edit3 } from "lucide-react";

interface PersonaVerificationFlowProps {
  persona: PersonaWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified?: () => void;
}

export function PersonaVerificationFlow({
  persona,
  open,
  onOpenChange,
  onVerified,
}: PersonaVerificationFlowProps) {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(persona.persona_name);
  const [editedDescription, setEditedDescription] = useState(persona.theme_description);

  const { mutate: verifyPersona, isPending: verifyPending } = useVerifyPersona();
  const { mutate: updatePersona, isPending: updatePending } = useUpdatePersona();

  const handleVerify = (accept: boolean) => {
    if (accept) {
      verifyPersona(persona.id, {
        onSuccess: () => {
          onVerified?.();
          onOpenChange(false);
        },
      });
    } else {
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    updatePersona(
      {
        personaId: persona.id,
        updates: {
          persona_name: editedName,
          theme_description: editedDescription,
          is_user_verified: true,
        },
      },
      {
        onSuccess: () => {
          onVerified?.();
          onOpenChange(false);
          setIsEditing(false);
        },
      }
    );
  };

  const isPending = verifyPending || updatePending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? s.titleEdit : s.titleVerify}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? s.descEdit : s.descVerify}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isEditing ? (
            // Verification view
            <>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: persona.color_hex }}
                  >
                    <span className="text-white text-xl">
                      {persona.persona_archetype?.charAt(0) || "P"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{persona.persona_name}</h3>
                      <Badge variant="outline">{persona.persona_archetype}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {s.strengthSuffix(Math.round(persona.strength_score || 0))}
                    </p>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-muted/50">
                  <p className="text-sm font-medium mb-2">{s.themeLabel}</p>
                  <p className="text-sm">{persona.theme_description}</p>
                </div>

                {persona.keywords && persona.keywords.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">{s.keywordsLabel}</p>
                    <div className="flex flex-wrap gap-2">
                      {persona.keywords.slice(0, 8).map((kw) => (
                        <Badge key={kw.keyword} variant="secondary">
                          {kw.keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  onClick={() => handleVerify(true)}
                  disabled={isPending}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {s.btnAccept}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleVerify(false)}
                  disabled={isPending}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {s.btnEdit}
                </Button>
              </div>
            </>
          ) : (
            // Edit view
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="persona-name">{s.nameLabel}</Label>
                  <Input
                    id="persona-name"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder={s.namePlaceholder}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="persona-description">{s.descLabel}</Label>
                  <Textarea
                    id="persona-description"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder={s.descPlaceholder}
                    rows={4}
                    className="mt-2"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedName(persona.persona_name);
                    setEditedDescription(persona.theme_description);
                  }}
                  disabled={isPending}
                >
                  {s.cancel}
                </Button>
                <Button onClick={handleSaveEdit} disabled={isPending}>
                  {s.saveVerify}
                </Button>
              </DialogFooter>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
