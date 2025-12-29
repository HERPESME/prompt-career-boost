/**
 * ATS Resume Scoring Engine
 * 
 * This module provides real, calculated ATS (Applicant Tracking System) scores
 * for resumes based on keyword matching, formatting, structure, and readability.
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ATSScore {
  overall: number;
  breakdown: {
    keywordMatch: number;
    formatting: number;
    structure: number;
    readability: number;
  };
  improvements: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  details: {
    totalKeywords: number;
    matchedCount: number;
    matchPercentage: number;
  };
}

interface KeywordMap {
  [keyword: string]: number; // keyword -> weight/frequency
}

interface SectionAnalysis {
  hasExperience: boolean;
  hasEducation: boolean;
  hasSkills: boolean;
  hasSummary: boolean;
  sectionsFound: string[];
  sectionsMissing: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'i', 'you', 'we', 'they', 'my', 'your',
  'our', 'their', 'this', 'these', 'those', 'am', 'been', 'being',
  'have', 'had', 'do', 'does', 'did', 'can', 'could', 'should', 'would'
]);

const STANDARD_SECTIONS = [
  'experience', 'work experience', 'professional experience', 'employment',
  'education', 'academic background',
  'skills', 'technical skills', 'core competencies',
  'summary', 'professional summary', 'profile', 'objective'
];

const ATS_UNFRIENDLY_PATTERNS = {
  tables: /\|.*\|/g,
  specialChars: /[►▪●■□◆]/g,
  multiColumn: /\t{2,}/g,
  graphics: /\[image\]|\[graphic\]|\[chart\]/gi
};

// Scoring weights
const WEIGHTS = {
  keywordMatch: 0.40,
  formatting: 0.25,
  structure: 0.20,
  readability: 0.15
};

// ============================================================================
// MAIN SCORING FUNCTION
// ============================================================================

export function calculateATSScore(
  resumeText: string,
  jobDescription: string = ''
): ATSScore {
  // 1. Keyword Analysis
  const keywordScore = jobDescription 
    ? analyzeKeywordMatch(resumeText, jobDescription)
    : { score: 70, matched: [], missing: [], total: 0, matchedCount: 0 };

  // 2. Format Analysis
  const formatScore = analyzeFormatting(resumeText);

  // 3. Structure Analysis
  const structureScore = analyzeStructure(resumeText);

  // 4. Readability Analysis
  const readabilityScore = calculateReadability(resumeText);

  // 5. Calculate weighted overall score
  const overall = Math.round(
    keywordScore.score * WEIGHTS.keywordMatch +
    formatScore.score * WEIGHTS.formatting +
    structureScore.score * WEIGHTS.structure +
    readabilityScore.score * WEIGHTS.readability
  );

  // 6. Compile improvements
  const improvements = [
    ...formatScore.issues,
    ...structureScore.issues,
    ...readabilityScore.issues
  ];

  if (jobDescription && keywordScore.missing.length > 0) {
    improvements.unshift(
      `Add ${Math.min(5, keywordScore.missing.length)} missing keywords: ${keywordScore.missing.slice(0, 5).join(', ')}`
    );
  }

  return {
    overall,
    breakdown: {
      keywordMatch: Math.round(keywordScore.score),
      formatting: Math.round(formatScore.score),
      structure: Math.round(structureScore.score),
      readability: Math.round(readabilityScore.score)
    },
    improvements,
    matchedKeywords: keywordScore.matched,
    missingKeywords: keywordScore.missing,
    details: {
      totalKeywords: keywordScore.total,
      matchedCount: keywordScore.matchedCount,
      matchPercentage: keywordScore.total > 0 
        ? Math.round((keywordScore.matchedCount / keywordScore.total) * 100)
        : 0
    }
  };
}

// ============================================================================
// KEYWORD EXTRACTION & MATCHING
// ============================================================================

function analyzeKeywordMatch(resumeText: string, jobDescription: string) {
  const jobKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractKeywords(resumeText);

  const matched: string[] = [];
  const missing: string[] = [];

  // Compare keywords
  for (const [keyword, weight] of Object.entries(jobKeywords)) {
    if (resumeKeywords[keyword.toLowerCase()]) {
      matched.push(keyword);
    } else {
      // Check for partial matches or synonyms
      const hasPartialMatch = Object.keys(resumeKeywords).some(rk => 
        rk.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(rk)
      );
      
      if (!hasPartialMatch) {
        missing.push(keyword);
      } else {
        matched.push(keyword);
      }
    }
  }

  const total = Object.keys(jobKeywords).length;
  const matchedCount = matched.length;
  const score = total > 0 ? (matchedCount / total) * 100 : 70;

  return { score, matched, missing, total, matchedCount };
}

function extractKeywords(text: string): KeywordMap {
  const keywords: KeywordMap = {};
  
  // 1. Clean and tokenize
  const cleaned = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = cleaned.split(' ');
  
  // 2. Extract unigrams (single words)
  for (const word of words) {
    if (word.length > 2 && !STOP_WORDS.has(word)) {
      keywords[word] = (keywords[word] || 0) + 1;
    }
  }
  
  // 3. Extract bigrams (two-word phrases)
  for (let i = 0; i < words.length - 1; i++) {
    const word1 = words[i];
    const word2 = words[i + 1];
    
    if (!STOP_WORDS.has(word1) && !STOP_WORDS.has(word2)) {
      const bigram = `${word1} ${word2}`;
      keywords[bigram] = (keywords[bigram] || 0) + 1;
    }
  }
  
  // 4. Extract trigrams (three-word phrases) - important for technical terms
  for (let i = 0; i < words.length - 2; i++) {
    const word1 = words[i];
    const word2 = words[i + 1];
    const word3 = words[i + 2];
    
    if (!STOP_WORDS.has(word1) && !STOP_WORDS.has(word3)) {
      const trigram = `${word1} ${word2} ${word3}`;
      keywords[trigram] = (keywords[trigram] || 0) + 1;
    }
  }
  
  // 5. Boost technical terms and skills
  const technicalPatterns = [
    /\b[A-Z]{2,}\b/g, // Acronyms (AWS, API, SQL)
    /\b\w+\.\w+\b/g,  // Dotted notation (React.js, Node.js)
    /\b\w+\/\w+\b/g,  // Slash notation (HTML/CSS, CI/CD)
  ];
  
  technicalPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const key = match.toLowerCase();
        keywords[key] = (keywords[key] || 0) + 2; // Boost weight
      });
    }
  });
  
  return keywords;
}

// ============================================================================
// FORMAT VALIDATION
// ============================================================================

function analyzeFormatting(resumeText: string): { score: number; issues: string[] } {
  let score = 100;
  const issues: string[] = [];

  // Check for tables
  if (ATS_UNFRIENDLY_PATTERNS.tables.test(resumeText)) {
    score -= 20;
    issues.push('❌ Tables detected - ATS may not parse correctly. Use simple text formatting.');
  }

  // Check for special characters/bullets
  const specialCharMatches = resumeText.match(ATS_UNFRIENDLY_PATTERNS.specialChars);
  if (specialCharMatches && specialCharMatches.length > 5) {
    score -= 10;
    issues.push('⚠️ Excessive special characters detected. Use standard bullets (•, -, *).');
  }

  // Check for multi-column layout indicators
  if (ATS_UNFRIENDLY_PATTERNS.multiColumn.test(resumeText)) {
    score -= 15;
    issues.push('❌ Multi-column layout detected. Use single-column format for ATS compatibility.');
  }

  // Check for graphics/images
  if (ATS_UNFRIENDLY_PATTERNS.graphics.test(resumeText)) {
    score -= 15;
    issues.push('❌ Graphics/images detected. Remove all visual elements for ATS parsing.');
  }

  // Check for consistent formatting (line length variance)
  const lines = resumeText.split('\n').filter(l => l.trim().length > 0);
  const lineLengths = lines.map(l => l.length);
  const avgLength = lineLengths.reduce((a, b) => a + b, 0) / lineLengths.length;
  const variance = lineLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lineLengths.length;
  
  if (variance > 5000) {
    score -= 5;
    issues.push('⚠️ Inconsistent formatting detected. Ensure uniform spacing and alignment.');
  }

  // Check for proper spacing
  const hasProperSpacing = /\n\n/.test(resumeText);
  if (!hasProperSpacing) {
    score -= 5;
    issues.push('💡 Add blank lines between sections for better readability.');
  }

  return { score: Math.max(0, score), issues };
}

// ============================================================================
// STRUCTURE ANALYSIS
// ============================================================================

function analyzeStructure(resumeText: string): { score: number; issues: string[] } {
  let score = 100;
  const issues: string[] = [];
  
  const lowerText = resumeText.toLowerCase();
  const sections = analyzeSections(lowerText);

  // Check for required sections
  if (!sections.hasExperience) {
    score -= 30;
    issues.push('❌ Missing "Experience" or "Work History" section - critical for ATS.');
  }

  if (!sections.hasEducation) {
    score -= 15;
    issues.push('⚠️ Missing "Education" section - add your academic background.');
  }

  if (!sections.hasSkills) {
    score -= 20;
    issues.push('❌ Missing "Skills" section - ATS heavily weights this section.');
  }

  if (!sections.hasSummary) {
    score -= 10;
    issues.push('💡 Consider adding a "Professional Summary" at the top.');
  }

  // Check section order (best practice: Summary, Experience, Education, Skills)
  const experienceIndex = lowerText.indexOf('experience');
  const educationIndex = lowerText.indexOf('education');
  const skillsIndex = lowerText.indexOf('skill');

  if (experienceIndex > -1 && educationIndex > -1 && experienceIndex > educationIndex) {
    score -= 5;
    issues.push('💡 Consider placing "Experience" before "Education" for better impact.');
  }

  // Check for contact information
  const hasEmail = /@/.test(resumeText);
  const hasPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);
  
  if (!hasEmail) {
    score -= 10;
    issues.push('❌ No email address detected. Add contact information at the top.');
  }
  
  if (!hasPhone) {
    score -= 5;
    issues.push('⚠️ No phone number detected. Include your contact number.');
  }

  return { score: Math.max(0, score), issues };
}

function analyzeSections(text: string): SectionAnalysis {
  const sectionsFound: string[] = [];
  
  const hasExperience = /\b(experience|employment|work history|professional experience)\b/i.test(text);
  const hasEducation = /\b(education|academic|degree|university|college)\b/i.test(text);
  const hasSkills = /\b(skills|technical skills|competencies|expertise)\b/i.test(text);
  const hasSummary = /\b(summary|profile|objective|about)\b/i.test(text);

  if (hasExperience) sectionsFound.push('Experience');
  if (hasEducation) sectionsFound.push('Education');
  if (hasSkills) sectionsFound.push('Skills');
  if (hasSummary) sectionsFound.push('Summary');

  const sectionsMissing = [];
  if (!hasExperience) sectionsMissing.push('Experience');
  if (!hasEducation) sectionsMissing.push('Education');
  if (!hasSkills) sectionsMissing.push('Skills');
  if (!hasSummary) sectionsMissing.push('Summary');

  return {
    hasExperience,
    hasEducation,
    hasSkills,
    hasSummary,
    sectionsFound,
    sectionsMissing
  };
}

// ============================================================================
// READABILITY ANALYSIS
// ============================================================================

function calculateReadability(resumeText: string): { score: number; issues: string[] } {
  let score = 100;
  const issues: string[] = [];

  const words = resumeText.split(/\s+/).filter(w => w.length > 0);
  const sentences = resumeText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0 || words.length === 0) {
    return { score: 50, issues: ['⚠️ Unable to analyze readability - ensure proper formatting.'] };
  }

  // Calculate average sentence length
  const avgSentenceLength = words.length / sentences.length;
  
  if (avgSentenceLength > 25) {
    score -= 15;
    issues.push('⚠️ Sentences are too long (avg: ' + Math.round(avgSentenceLength) + ' words). Aim for 15-20 words per sentence.');
  } else if (avgSentenceLength < 8) {
    score -= 5;
    issues.push('💡 Sentences are very short. Consider combining related ideas.');
  }

  // Calculate average word length
  const totalChars = words.reduce((sum, word) => sum + word.length, 0);
  const avgWordLength = totalChars / words.length;
  
  if (avgWordLength > 6) {
    score -= 10;
    issues.push('⚠️ Complex vocabulary detected. Use clear, concise language.');
  }

  // Check for passive voice indicators
  const passiveIndicators = ['was', 'were', 'been', 'being', 'is', 'are', 'am'];
  const passiveCount = words.filter(w => passiveIndicators.includes(w.toLowerCase())).length;
  const passiveRatio = passiveCount / words.length;
  
  if (passiveRatio > 0.05) {
    score -= 10;
    issues.push('💡 Reduce passive voice. Use action verbs (e.g., "Led team" instead of "Team was led by me").');
  }

  // Check for action verbs
  const actionVerbs = ['led', 'managed', 'developed', 'created', 'implemented', 'achieved', 'increased', 'improved', 'reduced', 'designed'];
  const actionVerbCount = words.filter(w => actionVerbs.includes(w.toLowerCase())).length;
  
  if (actionVerbCount < 5) {
    score -= 10;
    issues.push('💡 Add more action verbs to strengthen impact (Led, Managed, Developed, etc.).');
  }

  // Check for quantification
  const hasNumbers = /\d+/.test(resumeText);
  const numberCount = (resumeText.match(/\d+/g) || []).length;
  
  if (numberCount < 5) {
    score -= 15;
    issues.push('❌ Insufficient quantification. Add metrics, percentages, and numbers to achievements.');
  }

  return { score: Math.max(0, score), issues };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getScoreRating(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Improvement';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
}
