import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, X, Lightbulb, Sparkles } from "lucide-react";
import { useState } from "react";
import { useT } from '@/i18n/useT';


interface BrandNamingStepProps {
  brandNames: string[];
  selectedName: string;
  onNameSelect: (name: string) => void;
  onUpdateNames: (names: string[]) => void;
}

export const BrandNamingStep = ({
  brandNames,
  selectedName,
  onNameSelect,
  onUpdateNames
}: BrandNamingStepProps) => {
  const t = useT();
  const s = t.brandDomain.naming;

  const [customName, setCustomName] = useState("");
  const [favoriteWords, setFavoriteWords] = useState("");
  const [favoriteBrands, setFavoriteBrands] = useState("");

  const addCustomName = () => {
    if (customName.trim() && !brandNames.includes(customName.trim())) {
      onUpdateNames([...brandNames, customName.trim()]);
      setCustomName("");
    }
  };

  const removeName = (index: number) => {
    const newNames = brandNames.filter((_, i) => i !== index);
    onUpdateNames(newNames);

    // If the removed name was selected, clear selection
    if (selectedName === brandNames[index]) {
      onNameSelect("");
    }
  };

  const generateAdditionalNames = () => {
    // This would call an AI service to generate more names
    // based on favorite words and brands
    console.log("Generate names based on:", { favoriteWords, favoriteBrands });
    // For now, just add some sample names
    const newNames = [
      `${favoriteWords.split(',')[0]?.trim() || 'Creative'}Lab`,
      `${favoriteBrands.split(',')[0]?.trim() || 'Brand'}Style`,
      'InnovatePro'
    ].filter(name => !brandNames.includes(name));

    if (newNames.length > 0) {
      onUpdateNames([...brandNames, ...newNames]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4" />
          {s.cardTitle}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {s.cardDesc}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generated Names Selection */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">{s.aiSuggestedLabel}</Label>

          {brandNames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {brandNames.map((name, index) => (
                <div
                  key={index}
                  className={`relative border rounded-lg p-3 cursor-pointer transition-all hover:border-primary/50 ${
                    selectedName === name
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border bg-background/50'
                  }`}
                  onClick={() => onNameSelect(name)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 w-6 h-6 opacity-60 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeName(index);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  {selectedName === name && (
                    <Badge variant="default" className="absolute -top-2 -right-2 text-xs">
                      {s.selectedBadge}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-muted-foreground border rounded-lg bg-muted/20">
              {s.noAiNames}
            </div>
          )}
        </div>

        {/* Custom Name Input */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">{s.customInputLabel}</Label>
          <div className="flex gap-2">
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={s.customInputPlaceholder}
              className="text-xs"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addCustomName();
                }
              }}
            />
            <Button onClick={addCustomName} size="sm" className="text-xs h-8">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Name Generation Helper */}
        <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
          <h5 className="text-xs font-medium flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            {s.generateTitle}
          </h5>

          <div className="space-y-3">
            <div>
              <Label htmlFor="favorite-words" className="text-xs font-medium">
                {s.favoriteWordsLabel}
              </Label>
              <Input
                id="favorite-words"
                value={favoriteWords}
                onChange={(e) => setFavoriteWords(e.target.value)}
                placeholder={s.favoriteWordsPlaceholder}
                className="text-xs mt-1"
              />
            </div>

            <div>
              <Label htmlFor="favorite-brands" className="text-xs font-medium">
                {s.favoriteBrandsLabel}
              </Label>
              <Input
                id="favorite-brands"
                value={favoriteBrands}
                onChange={(e) => setFavoriteBrands(e.target.value)}
                placeholder={s.favoriteBrandsPlaceholder}
                className="text-xs mt-1"
              />
            </div>

            <Button
              onClick={generateAdditionalNames}
              variant="outline"
              size="sm"
              className="text-xs"
              disabled={!favoriteWords.trim() && !favoriteBrands.trim()}
            >
              {s.generateBtn}
            </Button>
          </div>
        </div>

        {/* Selected Name Preview */}
        <div className="border-t pt-4">
          <h5 className="text-xs font-medium mb-2">{s.selectedNameTitle}</h5>
          <div className="bg-background border rounded-lg p-4 text-center">
            {selectedName ? (
              <div>
                <div className="text-lg font-bold text-primary mb-2">{selectedName}</div>
                <p className="text-xs text-muted-foreground">
                  {s.selectedNameConfirm}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {s.noSelectedName}
              </p>
            )}
          </div>
        </div>

        {/* Naming Tips */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5" />
            <div>
              <h5 className="text-xs font-medium mb-1">{s.tipsTitle}</h5>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <strong>{s.tip1}</strong>{s.tip1Desc}</li>
                <li>• <strong>{s.tip2}</strong>{s.tip2Desc}</li>
                <li>• <strong>{s.tip3}</strong>{s.tip3Desc}</li>
                <li>• <strong>{s.tip4}</strong>{s.tip4Desc}</li>
                <li>• <strong>{s.tip5}</strong>{s.tip5Desc}</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
