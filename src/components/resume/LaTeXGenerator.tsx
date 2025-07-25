
import { ResumeData } from "./ResumeBuilder";

interface LaTeXGeneratorProps {
  resumeData: ResumeData;
  onGenerate: (latexCode: string) => void;
}

export const generateLaTeXResume = (resumeData: ResumeData): string => {
  const { personalInfo, summary, experience, education, skills } = resumeData;

  return `%-------------------------
% Resume in Latex
% Author : AlgoUniversity
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

%----------FONT OPTIONS----------
% sans-serif
% \\usepackage[sfdefault]{FiraSans}
% \\usepackage[sfdefault]{roboto}
% \\usepackage[sfdefault]{noto-sans}
% \\usepackage[default]{sourcesanspro}

% serif
% \\usepackage{CormorantGaramond}
% \\usepackage{charter}

\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
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

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\color{BrickRed}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{BrickRed}\\titlerule \\vspace{-5pt}]

% Ensure that generate pdf is machine readable/ATS parsable
\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\classesList}[4]{
    \\item\\small{
        {#1 #2 #3 #4 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{1.0\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & \\textbf{\\small #2} \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{1.001\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & \\textbf{\\small #2}\\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\begin{document}

\\begin{center}
  {\\Huge \\scshape ${personalInfo.fullName || 'Your Name'}} \\\\ \\vspace{5pt}
  \\small \\raisebox{-0.1\\height}\\faPhone\\ ${personalInfo.phone || '+1 234 567 8900'}~ \\href{mailto:${personalInfo.email || 'your.email@gmail.com'}}{\\raisebox{-0.2\\height}\\faEnvelope\\  \\underline{${personalInfo.email || 'your.email@gmail.com'}}} ~
  ${personalInfo.linkedin ? `\\href{${personalInfo.linkedin}}{\\raisebox{-0.2\\height}\\faLinkedin\\ \\underline{LinkedIn}}  ~` : ''}
  ${personalInfo.portfolio ? `\\href{${personalInfo.portfolio}}{\\raisebox{-0.2\\height}\\faGithub\\ \\underline{Portfolio}}` : ''}
  \\vspace{-8pt}
\\end{center}

\\vspace{-10pt}

${summary ? `%-----------PROFESSIONAL SUMMARY-----------
\\section{Professional Summary}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\item{
    ${summary.replace(/\n/g, ' ').replace(/[&%$#_{}~^\\]/g, '\\$&')}
  }
\\end{itemize}
\\vspace{-15pt}

` : ''}

%-----------EDUCATION-----------
\\section{Education}
\\resumeSubHeadingListStart
${education.map(edu => `\\resumeSubheading
{${(edu.institution || 'University Name').replace(/[&%$#_{}~^\\]/g, '\\$&')}}{${(edu.year || '2020 - 2024').replace(/[&%$#_{}~^\\]/g, '\\$&')}}
{${(edu.degree || 'Bachelor of Science').replace(/[&%$#_{}~^\\]/g, '\\$&')}}{}`).join('\n')}
\\resumeSubHeadingListEnd
\\vspace{-15pt}

% -----------EXPERIENCE-----------
\\section{Work Experience}
\\resumeSubHeadingListStart
${experience.map(exp => `\\resumeSubheading
{${(exp.company || 'Company Name').replace(/[&%$#_{}~^\\]/g, '\\$&')}}{${(exp.duration || 'Jan 2023 -- Present').replace(/[&%$#_{}~^\\]/g, '\\$&')}}
{${(exp.position || 'Software Engineer').replace(/[&%$#_{}~^\\]/g, '\\$&')}}{Remote}
\\resumeItemListStart
${exp.description ? exp.description.split('\n').filter(line => line.trim()).map(line => 
  `\\resumeItem{${line.trim().replace(/[&%$#_{}~^\\]/g, '\\$&')}}`
).join('\n') : '\\resumeItem{Description of role and achievements}'}
\\resumeItemListEnd`).join('\n\n')}
\\resumeSubHeadingListEnd
\\vspace{-16pt}

%-----------PROGRAMMING SKILLS-----------
\\section{Technical Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\item{
    \\textbf{Skills}{: ${skills.length > 0 ? skills.join(', ') : 'Python, JavaScript, React, Node.js'}}
  }
\\end{itemize}
\\vspace{-15pt}

\\end{document}`;
};

export const LaTeXGenerator = ({ resumeData, onGenerate }: LaTeXGeneratorProps) => {
  const handleGenerate = () => {
    const latexCode = generateLaTeXResume(resumeData);
    onGenerate(latexCode);
  };

  return null; // This is a utility component
};
