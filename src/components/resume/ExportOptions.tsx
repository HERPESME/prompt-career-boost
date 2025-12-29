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
import { Download, FileText, Code, FileJson, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ResumeData } from "./ResumeBuilder";
import { generateLaTeXResume } from "./LaTeXGenerator";

interface ExportOptionsProps {
  resumeData: ResumeData;
  resumeTitle?: string;
  className?: string;
}

export function ExportOptions({ resumeData, resumeTitle = "resume", className = "" }: ExportOptionsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const hasContent = resumeData.personalInfo.fullName || 
    resumeData.summary || 
    resumeData.experience.some(e => e.company) ||
    resumeData.skills.length > 0;

  // Export as LaTeX
  const exportLaTeX = () => {
    setLoading("latex");
    try {
      const latex = generateLaTeXResume(resumeData);
      const blob = new Blob([latex], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resumeTitle.replace(/\s+/g, "_")}.tex`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "LaTeX Exported",
        description: "Compile with LaTeX to generate your PDF resume.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate LaTeX file.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  // Export as JSON (for backup/import)
  const exportJSON = () => {
    setLoading("json");
    try {
      const json = JSON.stringify(resumeData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resumeTitle.replace(/\s+/g, "_")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "JSON Exported",
        description: "Resume data saved as JSON for backup.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate JSON file.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  // Export as plain text resume
  const exportPlainText = () => {
    setLoading("txt");
    try {
      const { personalInfo, summary, experience, education, skills } = resumeData;
      
      let text = "";
      
      // Header
      if (personalInfo.fullName) {
        text += personalInfo.fullName.toUpperCase() + "\n";
        text += "=".repeat(personalInfo.fullName.length) + "\n\n";
      }
      
      // Contact info
      const contactParts = [
        personalInfo.email,
        personalInfo.phone,
        personalInfo.location,
      ].filter(Boolean);
      if (contactParts.length) {
        text += contactParts.join(" | ") + "\n";
      }
      if (personalInfo.linkedin) text += `LinkedIn: ${personalInfo.linkedin}\n`;
      if (personalInfo.portfolio) text += `Portfolio: ${personalInfo.portfolio}\n`;
      text += "\n";
      
      // Summary
      if (summary) {
        text += "PROFESSIONAL SUMMARY\n";
        text += "-".repeat(20) + "\n";
        text += summary + "\n\n";
      }
      
      // Skills
      if (skills.length > 0) {
        text += "SKILLS\n";
        text += "-".repeat(20) + "\n";
        text += skills.join(", ") + "\n\n";
      }
      
      // Experience
      const validExperience = experience.filter(e => e.company || e.position);
      if (validExperience.length > 0) {
        text += "PROFESSIONAL EXPERIENCE\n";
        text += "-".repeat(20) + "\n";
        validExperience.forEach(exp => {
          text += `${exp.position || "Position"}`;
          if (exp.company) text += ` | ${exp.company}`;
          if (exp.duration) text += ` (${exp.duration})`;
          text += "\n";
          if (exp.description) {
            exp.description.split("\n").forEach(line => {
              text += `  • ${line.trim()}\n`;
            });
          }
          text += "\n";
        });
      }
      
      // Education
      const validEducation = education.filter(e => e.institution || e.degree);
      if (validEducation.length > 0) {
        text += "EDUCATION\n";
        text += "-".repeat(20) + "\n";
        validEducation.forEach(edu => {
          text += edu.degree || "Degree";
          if (edu.institution) text += ` | ${edu.institution}`;
          if (edu.year) text += ` (${edu.year})`;
          text += "\n";
        });
      }

      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resumeTitle.replace(/\s+/g, "_")}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Text Exported",
        description: "Resume saved as plain text file.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate text file.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          className={`bg-slate-800 hover:bg-slate-900 text-white ${className}`}
          disabled={!hasContent || loading !== null}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export Resume
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={exportLaTeX} disabled={loading !== null}>
          <Code className="w-4 h-4 mr-2" />
          LaTeX (.tex)
          <span className="ml-auto text-xs text-slate-500">Pro</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={exportPlainText} disabled={loading !== null}>
          <FileText className="w-4 h-4 mr-2" />
          Plain Text (.txt)
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={exportJSON} disabled={loading !== null}>
          <FileJson className="w-4 h-4 mr-2" />
          JSON (.json)
          <span className="ml-auto text-xs text-slate-500">Backup</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
