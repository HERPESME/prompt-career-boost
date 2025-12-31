/**
 * LaTeX Template Library for Resume Builder
 * Contains multiple ATS-friendly templates that users can choose from
 */

import { ResumeData } from "./ResumeBuilder";

export type TemplateId = 'modern' | 'classic' | 'technical' | 'executive' | 'minimal';

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  description: string;
  preview: string; // URL or base64 preview image
  bestFor: string[];
}

export const TEMPLATE_OPTIONS: TemplateInfo[] = [
  {
    id: 'modern',
    name: 'Modern Professional',
    description: 'Clean, contemporary design with accent colors and clear sections',
    preview: '/templates/modern.png',
    bestFor: ['Tech', 'Marketing', 'Design', 'Startups']
  },
  {
    id: 'classic',
    name: 'Classic Traditional',
    description: 'Timeless format preferred by traditional industries',
    preview: '/templates/classic.png',
    bestFor: ['Finance', 'Law', 'Government', 'Healthcare']
  },
  {
    id: 'technical',
    name: 'Technical Focus',
    description: 'Emphasizes technical skills and projects',
    preview: '/templates/technical.png',
    bestFor: ['Software Engineering', 'Data Science', 'DevOps', 'Research']
  },
  {
    id: 'executive',
    name: 'Executive Summary',
    description: 'Leadership-focused with prominent achievements section',
    preview: '/templates/executive.png',
    bestFor: ['C-Suite', 'Directors', 'Senior Management', 'Consulting']
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Ultra-clean design with maximum ATS compatibility',
    preview: '/templates/minimal.png',
    bestFor: ['Any Industry', 'Career Change', 'Entry Level', 'ATS Priority']
  }
];

// Helper to escape LaTeX special characters
function escapeLatex(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[&%$#_{}]/g, '\\$&')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

// Helper to format bullet points from description text
function formatBulletPoints(description: string): string {
  if (!description) return '';
  return description
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const cleaned = line.trim().replace(/^[-•*]\s*/, '');
      return `\\resumeItem{${escapeLatex(cleaned)}}`;
    })
    .join('\n');
}

/**
 * Modern Professional Template
 * Features: Accent colors, icons, clean typography
 */
function generateModernTemplate(data: ResumeData): string {
  const { personalInfo, summary, experience, education, skills } = data;

  return `%-------------------------
% Modern Professional Resume Template
% ATS Optimized - Career Boost
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\usepackage{multicol}
\\usepackage[dvipsnames]{xcolor}
\\setlength{\\multicolsep}{-3.0pt}
\\setlength{\\columnsep}{-1pt}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.19in}
\\addtolength{\\topmargin}{-.7in}
\\addtolength{\\textheight}{1.4in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Section formatting with accent color
\\titleformat{\\section}{
  \\vspace{-4pt}\\color{MidnightBlue}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{MidnightBlue}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{1.0\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & \\textbf{\\small #2} \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

% Header
\\begin{center}
  {\\Huge \\scshape \\color{MidnightBlue}${escapeLatex(personalInfo.fullName) || 'Your Name'}} \\\\ \\vspace{5pt}
  \\small 
  ${personalInfo.phone ? `\\raisebox{-0.1\\height}\\faPhone\\ ${escapeLatex(personalInfo.phone)} ~` : ''}
  ${personalInfo.email ? `\\href{mailto:${personalInfo.email}}{\\raisebox{-0.2\\height}\\faEnvelope\\  \\underline{${escapeLatex(personalInfo.email)}}} ~` : ''}
  ${personalInfo.location ? `\\raisebox{-0.1\\height}\\faMapMarker*\\ ${escapeLatex(personalInfo.location)} ~` : ''}
  ${personalInfo.linkedin ? `\\href{${personalInfo.linkedin}}{\\raisebox{-0.2\\height}\\faLinkedin\\ \\underline{LinkedIn}}  ~` : ''}
  ${personalInfo.portfolio ? `\\href{${personalInfo.portfolio}}{\\raisebox{-0.2\\height}\\faGlobe\\ \\underline{Portfolio}}` : ''}
  \\vspace{-8pt}
\\end{center}

${summary ? `
%-----------PROFESSIONAL SUMMARY-----------
\\section{Professional Summary}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\item{
    ${escapeLatex(summary)}
  }
\\end{itemize}
\\vspace{-15pt}
` : ''}

%-----------EXPERIENCE-----------
\\section{Professional Experience}
\\resumeSubHeadingListStart
${experience.filter(exp => exp.company || exp.position).map(exp => `
  \\resumeSubheading
    {${escapeLatex(exp.company) || 'Company'}}{${escapeLatex(exp.duration) || 'Duration'}}
    {${escapeLatex(exp.position) || 'Position'}}{}
    \\resumeItemListStart
      ${formatBulletPoints(exp.description) || '\\resumeItem{Key responsibilities and achievements}'}
    \\resumeItemListEnd
`).join('')}
\\resumeSubHeadingListEnd
\\vspace{-15pt}

%-----------EDUCATION-----------
\\section{Education}
\\resumeSubHeadingListStart
${education.filter(edu => edu.institution || edu.degree).map(edu => `
  \\resumeSubheading
    {${escapeLatex(edu.institution) || 'Institution'}}{${escapeLatex(edu.year) || 'Year'}}
    {${escapeLatex(edu.degree) || 'Degree'}}{}
`).join('')}
\\resumeSubHeadingListEnd
\\vspace{-15pt}

%-----------SKILLS-----------
\\section{Technical Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\item{
    \\textbf{Skills}{: ${skills.length > 0 ? skills.map(s => escapeLatex(s)).join(', ') : 'Add your skills here'}}
  }
\\end{itemize}

\\end{document}`;
}

/**
 * Classic Traditional Template
 * Features: Traditional formatting, no colors, conservative layout
 */
function generateClassicTemplate(data: ResumeData): string {
  const { personalInfo, summary, experience, education, skills } = data;

  return `%-------------------------
% Classic Traditional Resume Template
% ATS Optimized - Career Boost
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\hrule \\vspace{-5pt}]

\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{
  \\item\\small{#1 \\vspace{-2pt}}
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

\\begin{center}
  \\textbf{\\Huge ${escapeLatex(personalInfo.fullName) || 'Your Name'}} \\\\ \\vspace{3pt}
  \\small ${[personalInfo.phone, personalInfo.email, personalInfo.location].filter(Boolean).map(escapeLatex).join(' $|$ ')}
  ${personalInfo.linkedin ? ` $|$ \\href{${personalInfo.linkedin}}{LinkedIn}` : ''}
  ${personalInfo.portfolio ? ` $|$ \\href{${personalInfo.portfolio}}{Portfolio}` : ''}
\\end{center}

${summary ? `
\\section{Summary}
${escapeLatex(summary)}
\\vspace{-10pt}
` : ''}

\\section{Experience}
\\resumeSubHeadingListStart
${experience.filter(exp => exp.company || exp.position).map(exp => `
  \\resumeSubheading
    {${escapeLatex(exp.position) || 'Position'}}{${escapeLatex(exp.duration) || 'Duration'}}
    {${escapeLatex(exp.company) || 'Company'}}{}
    \\resumeItemListStart
      ${formatBulletPoints(exp.description) || '\\resumeItem{Describe your achievements}'}
    \\resumeItemListEnd
`).join('')}
\\resumeSubHeadingListEnd

\\section{Education}
\\resumeSubHeadingListStart
${education.filter(edu => edu.institution || edu.degree).map(edu => `
  \\resumeSubheading
    {${escapeLatex(edu.degree) || 'Degree'}}{${escapeLatex(edu.year) || 'Year'}}
    {${escapeLatex(edu.institution) || 'Institution'}}{}
`).join('')}
\\resumeSubHeadingListEnd

\\section{Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\item{${skills.length > 0 ? skills.map(s => escapeLatex(s)).join(', ') : 'Add your skills here'}}
\\end{itemize}

\\end{document}`;
}

/**
 * Technical Focus Template
 * Features: Technical skills prominent, projects section, clean layout
 */
function generateTechnicalTemplate(data: ResumeData): string {
  const { personalInfo, summary, experience, education, skills } = data;

  return `%-------------------------
% Technical Resume Template
% ATS Optimized - Career Boost
%------------------------

\\documentclass[letterpaper,10pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\usepackage[dvipsnames]{xcolor}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.19in}
\\addtolength{\\topmargin}{-.7in}
\\addtolength{\\textheight}{1.4in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\color{NavyBlue}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{NavyBlue}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{\\item\\small{#1 \\vspace{-2pt}}}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{1.0\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & \\textbf{\\small #2} \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{1.001\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & \\textbf{\\small #2}\\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

\\begin{center}
  {\\Huge \\scshape ${escapeLatex(personalInfo.fullName) || 'Your Name'}} \\\\ \\vspace{4pt}
  \\small
  ${personalInfo.phone ? `\\faPhone\\ ${escapeLatex(personalInfo.phone)} ~` : ''}
  ${personalInfo.email ? `\\href{mailto:${personalInfo.email}}{\\faEnvelope\\ ${escapeLatex(personalInfo.email)}} ~` : ''}
  ${personalInfo.linkedin ? `\\href{${personalInfo.linkedin}}{\\faLinkedin\\ LinkedIn} ~` : ''}
  ${personalInfo.portfolio ? `\\href{${personalInfo.portfolio}}{\\faGithub\\ GitHub}` : ''}
  \\vspace{-8pt}
\\end{center}

%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\item{
    \\textbf{Languages \\& Frameworks}{: ${skills.length > 0 ? skills.map(s => escapeLatex(s)).join(', ') : 'Add your technical skills'}}
  }
\\end{itemize}
\\vspace{-15pt}

${summary ? `
%-----------SUMMARY-----------
\\section{Summary}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\item{${escapeLatex(summary)}}
\\end{itemize}
\\vspace{-15pt}
` : ''}

%-----------EXPERIENCE-----------
\\section{Experience}
\\resumeSubHeadingListStart
${experience.filter(exp => exp.company || exp.position).map(exp => `
  \\resumeSubheading
    {${escapeLatex(exp.company) || 'Company'}}{${escapeLatex(exp.duration) || 'Duration'}}
    {${escapeLatex(exp.position) || 'Position'}}{}
    \\resumeItemListStart
      ${formatBulletPoints(exp.description) || '\\resumeItem{Technical achievements and impact}'}
    \\resumeItemListEnd
`).join('')}
\\resumeSubHeadingListEnd
\\vspace{-15pt}

%-----------EDUCATION-----------
\\section{Education}
\\resumeSubHeadingListStart
${education.filter(edu => edu.institution || edu.degree).map(edu => `
  \\resumeSubheading
    {${escapeLatex(edu.institution) || 'Institution'}}{${escapeLatex(edu.year) || 'Year'}}
    {${escapeLatex(edu.degree) || 'Degree'}}{}
`).join('')}
\\resumeSubHeadingListEnd

\\end{document}`;
}

/**
 * Executive Template
 * Features: Leadership focus, prominent summary, achievement highlights
 */
function generateExecutiveTemplate(data: ResumeData): string {
  const { personalInfo, summary, experience, education, skills } = data;

  return `%-------------------------
% Executive Resume Template
% ATS Optimized - Career Boost
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\usepackage[dvipsnames]{xcolor}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.6in}
\\addtolength{\\textheight}{1.2in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\color{DarkSlateGray}\\scshape\\raggedright\\Large\\bfseries
}{}{0em}{}[\\color{DarkSlateGray}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{\\item\\small{#1 \\vspace{-2pt}}}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{1.0\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{\\large #1} & \\textbf{#2} \\\\
      \\textit{#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

\\begin{center}
  {\\Huge \\textbf{${escapeLatex(personalInfo.fullName) || 'Your Name'}}} \\\\ \\vspace{8pt}
  \\large ${personalInfo.location ? escapeLatex(personalInfo.location) : ''} \\\\
  \\vspace{4pt}
  \\small
  ${personalInfo.phone ? `${escapeLatex(personalInfo.phone)} ~|~ ` : ''}
  ${personalInfo.email ? `\\href{mailto:${personalInfo.email}}{${escapeLatex(personalInfo.email)}}` : ''}
  ${personalInfo.linkedin ? ` ~|~ \\href{${personalInfo.linkedin}}{LinkedIn}` : ''}
  \\vspace{-8pt}
\\end{center}

${summary ? `
%-----------EXECUTIVE SUMMARY-----------
\\section{Executive Summary}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\item{\\large ${escapeLatex(summary)}}
\\end{itemize}
\\vspace{-10pt}
` : ''}

%-----------LEADERSHIP EXPERIENCE-----------
\\section{Leadership Experience}
\\resumeSubHeadingListStart
${experience.filter(exp => exp.company || exp.position).map(exp => `
  \\resumeSubheading
    {${escapeLatex(exp.position) || 'Position'}}{${escapeLatex(exp.duration) || 'Duration'}}
    {${escapeLatex(exp.company) || 'Company'}}{}
    \\resumeItemListStart
      ${formatBulletPoints(exp.description) || '\\resumeItem{Leadership achievements and business impact}'}
    \\resumeItemListEnd
`).join('')}
\\resumeSubHeadingListEnd
\\vspace{-10pt}

%-----------EDUCATION-----------
\\section{Education}
\\resumeSubHeadingListStart
${education.filter(edu => edu.institution || edu.degree).map(edu => `
  \\resumeSubheading
    {${escapeLatex(edu.degree) || 'Degree'}}{${escapeLatex(edu.year) || 'Year'}}
    {${escapeLatex(edu.institution) || 'Institution'}}{}
`).join('')}
\\resumeSubHeadingListEnd
\\vspace{-10pt}

%-----------CORE COMPETENCIES-----------
\\section{Core Competencies}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\item{${skills.length > 0 ? skills.map(s => escapeLatex(s)).join(' \\textbullet{} ') : 'Leadership, Strategy, Operations'}}
\\end{itemize}

\\end{document}`;
}

/**
 * Minimal Clean Template
 * Features: Maximum ATS compatibility, simple formatting, no fancy elements
 */
function generateMinimalTemplate(data: ResumeData): string {
  const { personalInfo, summary, experience, education, skills } = data;

  // Process LinkedIn URL outside of template literal to avoid regex escape issues
  const linkedinDisplay = personalInfo.linkedin 
    ? ` | \\\\href{${personalInfo.linkedin}}{linkedin.com/in/${personalInfo.linkedin.split('/in/').pop() || ''}}`
    : '';

  return `%-------------------------
% Minimal Clean Resume Template
% Maximum ATS Compatibility - Career Boost
%------------------------

\\\\documentclass[letterpaper,11pt]{article}

\\\\usepackage[empty]{fullpage}
\\\\usepackage{titlesec}
\\\\usepackage{enumitem}
\\\\usepackage[hidelinks]{hyperref}
\\\\usepackage{fancyhdr}
\\\\usepackage[english]{babel}
\\\\usepackage{tabularx}
\\\\input{glyphtounicode}

\\\\pagestyle{fancy}
\\\\fancyhf{}
\\\\fancyfoot{}
\\\\renewcommand{\\\\headrulewidth}{0pt}
\\\\renewcommand{\\\\footrulewidth}{0pt}

\\\\addtolength{\\\\oddsidemargin}{-0.5in}
\\\\addtolength{\\\\evensidemargin}{-0.5in}
\\\\addtolength{\\\\textwidth}{1in}
\\\\addtolength{\\\\topmargin}{-.5in}
\\\\addtolength{\\\\textheight}{1.0in}

\\\\urlstyle{same}
\\\\raggedbottom
\\\\raggedright
\\\\setlength{\\\\tabcolsep}{0in}

\\\\titleformat{\\\\section}{\\\\vspace{-4pt}\\\\scshape\\\\raggedright\\\\large}{}{0em}{}[\\\\hrule \\\\vspace{-5pt}]

\\\\pdfgentounicode=1

\\\\newcommand{\\\\resumeItem}[1]{\\\\item\\\\small{#1 \\\\vspace{-2pt}}}

\\\\newcommand{\\\\resumeSubheading}[4]{
  \\\\vspace{-1pt}\\\\item
    \\\\begin{tabular*}{0.97\\\\textwidth}[t]{l@{\\\\extracolsep{\\\\fill}}r}
      \\\\textbf{#1} & #2 \\\\\\\\
      \\\\textit{\\\\small#3} & \\\\textit{\\\\small #4} \\\\\\\\
    \\\\end{tabular*}\\\\vspace{-5pt}
}

\\\\newcommand{\\\\resumeSubHeadingListStart}{\\\\begin{itemize}[leftmargin=0.1in, label={}]}
\\\\newcommand{\\\\resumeSubHeadingListEnd}{\\\\end{itemize}}
\\\\newcommand{\\\\resumeItemListStart}{\\\\begin{itemize}}
\\\\newcommand{\\\\resumeItemListEnd}{\\\\end{itemize}\\\\vspace{-5pt}}

\\\\begin{document}

% Simple header - maximum ATS compatibility
\\\\begin{center}
  \\\\textbf{\\\\LARGE ${escapeLatex(personalInfo.fullName) || 'Your Name'}} \\\\\\\\
  \\\\vspace{2pt}
  ${[personalInfo.phone, personalInfo.email, personalInfo.location].filter(Boolean).map(escapeLatex).join(' | ')}${linkedinDisplay}
\\\\end{center}

${summary ? `
\\\\section{Summary}
${escapeLatex(summary)}
` : ''}

\\\\section{Experience}
\\\\resumeSubHeadingListStart
${experience.filter(exp => exp.company || exp.position).map(exp => `
  \\\\resumeSubheading
    {${escapeLatex(exp.position) || 'Position'}}{${escapeLatex(exp.duration) || 'Duration'}}
    {${escapeLatex(exp.company) || 'Company'}}{}
    \\\\resumeItemListStart
      ${formatBulletPoints(exp.description) || '\\\\resumeItem{Key achievements}'}
    \\\\resumeItemListEnd
`).join('')}
\\\\resumeSubHeadingListEnd

\\\\section{Education}
\\\\resumeSubHeadingListStart
${education.filter(edu => edu.institution || edu.degree).map(edu => `
  \\\\resumeSubheading
    {${escapeLatex(edu.degree) || 'Degree'}}{${escapeLatex(edu.year) || 'Year'}}
    {${escapeLatex(edu.institution) || 'Institution'}}{}
`).join('')}
\\\\resumeSubHeadingListEnd

\\\\section{Skills}
${skills.length > 0 ? skills.map(s => escapeLatex(s)).join(', ') : 'Add your skills here'}

\\\\end{document}`;
}

/**
 * Main function to generate LaTeX from template
 */
export function generateLaTeXFromTemplate(templateId: TemplateId, resumeData: ResumeData): string {
  switch (templateId) {
    case 'modern':
      return generateModernTemplate(resumeData);
    case 'classic':
      return generateClassicTemplate(resumeData);
    case 'technical':
      return generateTechnicalTemplate(resumeData);
    case 'executive':
      return generateExecutiveTemplate(resumeData);
    case 'minimal':
      return generateMinimalTemplate(resumeData);
    default:
      return generateModernTemplate(resumeData);
  }
}

/**
 * Analyze resume content and suggest best template
 */
export function suggestTemplate(resumeData: ResumeData, extractedText?: string): TemplateId {
  const text = extractedText?.toLowerCase() || '';
  const skills = resumeData.skills.join(' ').toLowerCase();
  const allText = `${text} ${skills}`;
  
  // Tech keywords
  const techKeywords = ['software', 'developer', 'engineer', 'programming', 'javascript', 'python', 'react', 'node', 'aws', 'cloud', 'api', 'database', 'frontend', 'backend', 'devops'];
  const techScore = techKeywords.filter(k => allText.includes(k)).length;
  
  // Executive keywords
  const execKeywords = ['director', 'vp', 'vice president', 'ceo', 'cfo', 'cto', 'executive', 'chief', 'head of', 'leadership', 'strategy', 'board'];
  const execScore = execKeywords.filter(k => allText.includes(k)).length;
  
  // Traditional industry keywords
  const tradKeywords = ['attorney', 'lawyer', 'legal', 'finance', 'banking', 'investment', 'compliance', 'audit', 'accounting', 'government', 'federal'];
  const tradScore = tradKeywords.filter(k => allText.includes(k)).length;
  
  // Determine best template
  if (execScore >= 2) return 'executive';
  if (techScore >= 3) return 'technical';
  if (tradScore >= 2) return 'classic';
  if (techScore >= 1) return 'modern';
  
  return 'minimal'; // Default - maximum ATS compatibility
}

/**
 * Update specific fields in existing LaTeX code
 * This preserves the template structure while updating content
 */
export function updateLaTeXField(
  latexCode: string, 
  field: string, 
  newValue: string
): string {
  // This is a simplified implementation
  // In production, you'd want more sophisticated LaTeX parsing
  const escapedValue = escapeLatex(newValue);
  
  // Handle common field patterns
  switch (field) {
    case 'fullName':
      return latexCode.replace(
        /(\\Huge[^}]*\\scshape[^}]*\{?\\color\{[^}]+\})?([^}\\]+)(\}?\s*\\\\)/,
        `$1${escapedValue}$3`
      );
    default:
      return latexCode;
  }
}
