import { ResumeData } from "./ResumeBuilder";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

interface ResumePreviewProps {
  data: ResumeData;
  className?: string;
}

export function ResumePreview({ data, className = "" }: ResumePreviewProps) {
  const { personalInfo, summary, experience, education, skills } = data;
  
  // Check if resume has meaningful content
  const hasContent = personalInfo.fullName || personalInfo.email || summary || 
    experience.some(e => e.company || e.position) || 
    education.some(e => e.institution || e.degree) || 
    skills.length > 0;

  if (!hasContent) {
    return (
      <Card className={`p-8 ${className} bg-slate-50 border-dashed border-2 border-slate-200`}>
        <div className="flex flex-col items-center justify-center h-[600px] text-center">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Resume Preview</h3>
          <p className="text-sm text-slate-500 max-w-xs">
            Fill in your information on the left to see a live preview of your resume here.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`bg-white shadow-lg overflow-hidden ${className}`}>
      <div className="p-8 min-h-[800px] font-serif text-[11px] leading-relaxed">
        {/* Header - Name and Contact */}
        <header className="text-center border-b-2 border-slate-800 pb-4 mb-4">
          {personalInfo.fullName && (
            <h1 className="text-2xl font-bold text-slate-900 tracking-wide uppercase mb-2">
              {personalInfo.fullName}
            </h1>
          )}
          
          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-600 text-[10px]">
            {personalInfo.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {personalInfo.email}
              </span>
            )}
            {personalInfo.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {personalInfo.phone}
              </span>
            )}
            {personalInfo.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {personalInfo.location}
              </span>
            )}
            {personalInfo.linkedin && (
              <span className="flex items-center gap-1">
                <Linkedin className="w-3 h-3" />
                {personalInfo.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//i, '')}
              </span>
            )}
            {personalInfo.portfolio && (
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {personalInfo.portfolio.replace(/https?:\/\/(www\.)?/i, '')}
              </span>
            )}
          </div>
        </header>

        {/* Professional Summary */}
        {summary && (
          <section className="mb-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
              Professional Summary
            </h2>
            <p className="text-slate-700 text-justify">{summary}</p>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
              Technical Skills
            </h2>
            <p className="text-slate-700">
              {skills.join(" • ")}
            </p>
          </section>
        )}

        {/* Experience */}
        {experience.some(e => e.company || e.position) && (
          <section className="mb-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
              Professional Experience
            </h2>
            <div className="space-y-3">
              {experience.filter(e => e.company || e.position).map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="font-semibold text-slate-900">{exp.position}</span>
                      {exp.company && <span className="text-slate-700"> | {exp.company}</span>}
                    </div>
                    {exp.duration && (
                      <span className="text-slate-500 text-[9px] italic">{exp.duration}</span>
                    )}
                  </div>
                  {exp.description && (
                    <div className="mt-1 text-slate-700 pl-2">
                      {exp.description.split('\n').map((line, i) => (
                        <p key={i} className="flex items-start">
                          {line.trim().startsWith('•') || line.trim().startsWith('-') ? (
                            line
                          ) : line.trim() ? (
                            <>• {line}</>
                          ) : null}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.some(e => e.institution || e.degree) && (
          <section className="mb-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
              Education
            </h2>
            <div className="space-y-2">
              {education.filter(e => e.institution || e.degree).map((edu, index) => (
                <div key={index} className="flex justify-between items-baseline">
                  <div>
                    <span className="font-semibold text-slate-900">{edu.degree}</span>
                    {edu.institution && <span className="text-slate-700"> | {edu.institution}</span>}
                  </div>
                  {edu.year && (
                    <span className="text-slate-500 text-[9px] italic">{edu.year}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Card>
  );
}
