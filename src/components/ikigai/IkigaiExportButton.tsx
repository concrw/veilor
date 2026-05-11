/**
 * IkigaiExportButton Component
 * Exports Ikigai Venn diagram to PDF
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileDown, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useLanguageContext } from "@/context/LanguageContext";
import { useT } from "@/i18n/useT";

interface IkigaiExportButtonProps {
  diagramRef: React.RefObject<HTMLDivElement>;
  userName?: string;
  data: {
    love: string[];
    goodAt: string[];
    worldNeeds: string[];
    paidFor: string[];
  };
}

export function IkigaiExportButton({
  diagramRef,
  userName = "User",
  data,
}: IkigaiExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { language } = useLanguageContext();
  const t = useT();
  const s = t.ikigaiExport;

  const exportToPDF = async () => {
    if (!diagramRef.current) {
      toast({
        title: s.exportFailTitle,
        description: s.exportFailNoRef,
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      // Capture the diagram as canvas
      const canvas = await html2canvas(diagramRef.current, {
        scale: 2, // Higher quality
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Calculate dimensions to fit A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(
        (pdfWidth - 20) / imgWidth,
        (pdfHeight - 60) / imgHeight
      );
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      // Add title
      pdf.setFontSize(18);
      pdf.text(s.pdfTitle, pdfWidth / 2, 15, { align: "center" });

      // Add diagram
      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      // Add footer with metadata
      const footerY = pdfHeight - 10;
      pdf.setFontSize(9);
      pdf.setTextColor(128, 128, 128);
      pdf.text(s.pdfDateLabel(new Date().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US')), 10, footerY);
      pdf.text(`${userName}`, pdfWidth - 10, footerY, { align: "right" });

      // Save PDF
      const fileName = `IKIGAI_${userName}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);

      toast({
        title: s.exportDoneTitle,
        description: s.exportDonePdf(fileName),
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: s.exportFailTitle,
        description: s.exportFailPdf,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsJSON = () => {
    try {
      const exportData = {
        userName,
        exportDate: new Date().toISOString(),
        ikigaiData: data,
        completeness: {
          love: data.love.length,
          goodAt: data.goodAt.length,
          worldNeeds: data.worldNeeds.length,
          paidFor: data.paidFor.length,
          total:
            data.love.length +
            data.goodAt.length +
            data.worldNeeds.length +
            data.paidFor.length,
        },
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `IKIGAI_${userName}_${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: s.exportDoneTitle,
        description: s.exportDoneJson,
      });
    } catch (error) {
      console.error("JSON export error:", error);
      toast({
        title: s.exportFailTitle,
        description: s.exportFailJson,
        variant: "destructive",
      });
    }
  };

  const isDataEmpty =
    data.love.length === 0 &&
    data.goodAt.length === 0 &&
    data.worldNeeds.length === 0 &&
    data.paidFor.length === 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isExporting || isDataEmpty}
          className="gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {s.exporting}
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              {s.exportButton}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{s.formatLabel}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToPDF} className="gap-2">
          <FileDown className="w-4 h-4" />
          {s.exportPdf}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsJSON} className="gap-2">
          <FileDown className="w-4 h-4" />
          {s.exportJson}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
