/**
 * BrandStrategySummary Component
 * Visual summary of the complete brand strategy
 */

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Compass,
  MessageSquare,
  Users,
  DollarSign,
  Sparkles,
  FileText,
  Target,
  TrendingUp,
  Download,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useT } from '@/i18n/useT';


interface BrandStrategy {
  brand_direction: {
    field: string;
    positioning: string;
    core_message: string;
  };
  content_strategy: {
    topics: string[];
    formats: string[];
    channels: string[];
    cadence: string;
  };
  target_audience: {
    age_range: string;
    interests: string[];
    pain_points: string[];
    preferred_channels: string[];
  };
  brand_names: string[];
  revenue_model: {
    primary_model: string;
    price_points: string[];
    monetization_channels: string[];
  };
}

interface BrandStrategySummaryProps {
  strategy: BrandStrategy;
  selectedBrandName?: string;
  userName?: string;
}

export function BrandStrategySummary({
  strategy,
  selectedBrandName,
  userName = "User",
}: BrandStrategySummaryProps) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const t = useT();
  const s = t.brandDomain.strategy;

  const exportToPDF = async () => {
    if (!summaryRef.current) {
      toast({
        title: s.exportFailTitle,
        description: s.exportFailNotFound,
        variant: "destructive",
      });
      return;
    }

    try {
      const canvas = await html2canvas(summaryRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(
        (pdfWidth - 20) / imgWidth,
        (pdfHeight - 30) / imgHeight
      );
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 15;

      pdf.setFontSize(16);
      pdf.text(s.pdfTitle, pdfWidth / 2, 10, { align: "center" });

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      const footerY = pdfHeight - 10;
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      const locale = language === "ko" ? "ko-KR" : "en-US";
      pdf.text(s.pdfCreatedAt(new Date().toLocaleDateString(locale)), 10, footerY);
      pdf.text(`${userName}`, pdfWidth - 10, footerY, { align: "right" });

      const fileName = `${s.fileNamePrefix}_${selectedBrandName || userName}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);

      toast({
        title: s.exportSuccessTitle,
        description: s.exportSuccessDesc(fileName),
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: s.exportFailTitle,
        description: s.exportFailError,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Export Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={exportToPDF} className="gap-2">
          <Download className="w-4 h-4" />
          {s.exportBtn}
        </Button>
      </div>

      <div ref={summaryRef} className="space-y-4 bg-white p-4 rounded-lg">
        {/* Brand Identity Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-none">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <Sparkles className="w-8 h-8 mx-auto text-primary" />
              <h2 className="text-lg font-bold">
                {selectedBrandName || strategy.brand_names[0] || "My Brand"}
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {strategy.brand_direction.positioning}
              </p>
              <div className="bg-background/50 rounded-lg p-3 max-w-lg mx-auto">
                <p className="text-xs text-muted-foreground mb-1">{s.coreMessage}</p>
                <p className="text-sm font-medium">{strategy.brand_direction.core_message}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategy Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Brand Direction */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-500" />
                {s.brandDirection}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">{s.field}</p>
                <p className="text-sm font-medium">{strategy.brand_direction.field}</p>
              </div>
            </CardContent>
          </Card>

          {/* Target Audience */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                {s.targetAudience}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">{s.ageRange}</p>
                <p className="text-sm font-medium">{strategy.target_audience.age_range}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{s.interests}</p>
                <div className="flex flex-wrap gap-1">
                  {strategy.target_audience.interests.slice(0, 4).map((interest, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Strategy */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                {s.contentStrategy}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{s.mainTopics}</p>
                <div className="flex flex-wrap gap-1">
                  {strategy.content_strategy.topics.slice(0, 3).map((topic, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                  {strategy.content_strategy.topics.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{strategy.content_strategy.topics.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{s.channels}</p>
                <div className="flex flex-wrap gap-1">
                  {strategy.content_strategy.channels.map((channel, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs bg-purple-500/10">
                      {channel}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.publishCycle}</p>
                <p className="text-sm">{strategy.content_strategy.cadence}</p>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Model */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-500" />
                {s.revenueModel}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">{s.primaryModel}</p>
                <p className="text-sm font-medium">{strategy.revenue_model.primary_model}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{s.pricePolicy}</p>
                <div className="flex flex-wrap gap-1">
                  {strategy.revenue_model.price_points.slice(0, 3).map((price, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs bg-amber-500/10">
                      {price}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pain Points & Solutions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <Target className="w-4 h-4 text-red-500" />
              {s.painAndSolution}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-2 text-red-600">{s.customerPains}</p>
                <ul className="space-y-1">
                  {strategy.target_audience.pain_points.map((pain, idx) => (
                    <li key={idx} className="text-xs flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      {pain}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium mb-2 text-green-600">{s.solutionByContent}</p>
                <ul className="space-y-1">
                  {strategy.content_strategy.formats.map((format, idx) => (
                    <li key={idx} className="text-xs flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      {format}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brand Names */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-pink-500" />
              {s.brandNames}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {strategy.brand_names.map((name, idx) => (
                <Badge
                  key={idx}
                  variant={selectedBrandName === name ? "default" : "outline"}
                  className={`text-sm py-1 px-3 ${
                    selectedBrandName === name ? "bg-primary" : ""
                  }`}
                >
                  {name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Roadmap */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              {s.actionRoadmap}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="text-xs font-medium">{s.step1Title}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.step1Desc}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="text-xs font-medium">{s.step2Title}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.step2Desc(strategy.content_strategy.channels.slice(0, 2).join(", "))}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="text-xs font-medium">{s.step3Title}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.step3Desc(strategy.content_strategy.topics[0])}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <div>
                  <p className="text-xs font-medium">{s.step4Title}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.step4Desc(
                      strategy.revenue_model.monetization_channels[0],
                      strategy.revenue_model.primary_model
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
