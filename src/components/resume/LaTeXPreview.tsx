import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, FileText, Code } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface LaTeXPreviewProps {
  latex: string;
  className?: string;
  showCode?: boolean;
  onToggleCode?: () => void;
}

/**
 * LaTeX Preview Component
 * Renders LaTeX code as a styled preview that simulates what the compiled PDF would look like.
 * Since we can't compile LaTeX in the browser without heavy dependencies, this provides
 * a visual representation of the resume structure.
 */
export function LaTeXPreview({ latex, className = "", showCode = false, onToggleCode }: LaTeXPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate brief loading for visual feedback
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [latex]);

  // Parse LaTeX to extract content for preview
  const parsedContent = useMemo(() => {
    if (!latex) return null;

    try {
      // Extract personal info from header
      const nameMatch = latex.match(/\\(?:textbf|LARGE|huge)\s*\{([^}]+)\}/);
      const emailMatch = latex.match(/\\href\{mailto:([^}]+)\}/);
      const phoneMatch = latex.match(/(?:\\phone|\\mobile|phone:?|tel:?)\s*\{?([^}\n]+)\}?/i) ||
                         latex.match(/(\+?\d[\d\s\-()]{8,})/);
      const locationMatch = latex.match(/(?:\\location|location:?)\s*\{([^}]+)\}/i);
      const linkedinMatch = latex.match(/linkedin\.com\/in\/([^\s}]+)/i);
      
      // Extract sections
      const sections: { title: string; content: string }[] = [];
      const sectionMatches = latex.matchAll(/\\section\{([^}]+)\}([\s\S]*?)(?=\\section|\\end\{document\})/g);
      
      for (const match of sectionMatches) {
        sections.push({
          title: match[1].trim(),
          content: match[2].trim()
        });
      }

      // Extract subsection items (experience, education entries)
      const extractItems = (content: string) => {
        const items: { title: string; subtitle: string; date: string; description: string }[] = [];
        const itemMatches = content.matchAll(/\\resumeSubheading\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}/g);
        
        for (const match of itemMatches) {
          items.push({
            title: match[1].trim(),
            date: match[2].trim(),
            subtitle: match[3].trim(),
            description: "" // Description comes from resumeItem entries
          });
        }
        
        // Also try to get bullet points
        const bulletMatches = content.matchAll(/\\resumeItem\{([^}]+)\}/g);
        const bullets: string[] = [];
        for (const match of bulletMatches) {
          bullets.push(match[1].trim());
        }
        
        return { items, bullets };
      };

      return {
        name: nameMatch?.[1]?.replace(/\\textbf\{|\}/g, '').trim() || '',
        email: emailMatch?.[1] || latex.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || '',
        phone: phoneMatch?.[1]?.trim() || '',
        location: locationMatch?.[1] || '',
        linkedin: linkedinMatch?.[1] || '',
        sections,
        extractItems
      };
    } catch (e) {
      console.error('LaTeX parsing error:', e);
      return null;
    }
  }, [latex]);

  if (!latex) {
    return (
      <Card className={`p-8 ${className} bg-slate-50 border-dashed border-2 border-slate-200`}>
        <div className="flex flex-col items-center justify-center h-[600px] text-center">
          <FileText className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No LaTeX Generated</h3>
          <p className="text-sm text-slate-500 max-w-xs">
            Upload a resume or fill in the form to generate LaTeX preview.
          </p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center h-[600px]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
          <p className="text-sm text-slate-500">Rendering preview...</p>
        </div>
      </Card>
    );
  }

  // Show raw LaTeX code view
  if (showCode) {
    return (
      <Card className={`${className} overflow-hidden`}>
        <div className="p-2 bg-slate-800 flex items-center justify-between">
          <Badge variant="secondary" className="text-xs bg-slate-700 text-white">
            <Code className="w-3 h-3 mr-1" />
            LaTeX Code
          </Badge>
          {onToggleCode && (
            <Button variant="ghost" size="sm" onClick={onToggleCode} className="text-white hover:bg-slate-700">
              Show Preview
            </Button>
          )}
        </div>
        <Textarea
          value={latex}
          readOnly
          className="font-mono text-xs h-[600px] border-0 rounded-none resize-none bg-slate-900 text-green-400"
        />
      </Card>
    );
  }

  // Render visual preview based on parsed LaTeX
  return (
    <Card className={`bg-white shadow-lg overflow-hidden ${className}`}>
      <div className="p-6 min-h-[700px] font-serif text-[11px] leading-relaxed border border-slate-200">
        {parsedContent ? (
          <>
            {/* Header - Name and Contact */}
            <header className="text-center border-b-2 border-slate-800 pb-3 mb-4">
              {parsedContent.name && (
                <h1 className="text-xl font-bold text-slate-900 tracking-wide uppercase mb-2">
                  {parsedContent.name}
                </h1>
              )}
              <div className="flex flex-wrap items-center justify-center gap-2 text-slate-600 text-[10px]">
                {parsedContent.email && <span>{parsedContent.email}</span>}
                {parsedContent.phone && <span>• {parsedContent.phone}</span>}
                {parsedContent.location && <span>• {parsedContent.location}</span>}
                {parsedContent.linkedin && <span>• linkedin.com/in/{parsedContent.linkedin}</span>}
              </div>
            </header>

            {/* Render each section */}
            {parsedContent.sections.map((section, idx) => {
              const { items, bullets } = parsedContent.extractItems(section.content);
              
              return (
                <section key={idx} className="mb-4">
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
                    {section.title}
                  </h2>
                  
                  {items.length > 0 ? (
                    <div className="space-y-2">
                      {items.map((item, itemIdx) => (
                        <div key={itemIdx}>
                          <div className="flex justify-between items-baseline">
                            <div>
                              <span className="font-semibold text-slate-900">{item.title}</span>
                              {item.subtitle && <span className="text-slate-600 italic"> | {item.subtitle}</span>}
                            </div>
                            {item.date && <span className="text-slate-500 text-[9px]">{item.date}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : bullets.length > 0 ? (
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      {bullets.map((bullet, bIdx) => (
                        <li key={bIdx}>{bullet}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-700 text-[10px]">
                      {section.content
                        .replace(/\\[a-zA-Z]+\{|\}/g, '')
                        .replace(/\s+/g, ' ')
                        .trim()
                        .slice(0, 300)}
                    </p>
                  )}
                </section>
              );
            })}
          </>
        ) : (
          // Fallback: Show raw text preview
          <div className="whitespace-pre-wrap font-mono text-[9px] text-slate-600">
            {latex.slice(0, 2000)}
            {latex.length > 2000 && "..."}
          </div>
        )}
      </div>
    </Card>
  );
}
