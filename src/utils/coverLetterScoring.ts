/**
 * Cover Letter Scoring Engine
 * 
 * Provides real, calculated scores for cover letters based on:
 * - Personalization quality
 * - Tone analysis (formality, enthusiasm, confidence)
 * - Keyword alignment with job description
 * - Generic phrase detection
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CoverLetterScore {
  overall: number;
  breakdown: {
    personalization: number;
    toneMatch: number;
    keywordAlignment: number;
    professionalismScore: number;
  };
  toneAnalysis: {
    formality: number;        // 0-100 (0=casual, 100=formal)
    enthusiasm: number;       // 0-100
    confidence: number;       // 0-100
    recommendation: string;
  };
  personalizationDetails: {
    companyMentions: number;
    specificDetails: number;
    genericPhrases: number;
  };
  improvements: string[];
  strengths: string[];
  missingKeywords: string[];
}

// ============================================================================
// MAIN SCORING FUNCTION
// ============================================================================

export function calculateCoverLetterScore(
  coverLetter: string,
  companyName: string = '',
  jobDescription: string = '',
  industry: string = 'general'
): CoverLetterScore {
  // 1. Personalization Analysis
  const personalizationScore = calculatePersonalization(coverLetter, companyName);
  
  // 2. Tone Analysis
  const toneAnalysis = analyzeTone(coverLetter, industry);
  
  // 3. Keyword Alignment
  const keywordAlignment = jobDescription
    ? calculateKeywordAlignment(coverLetter, jobDescription)
    : { score: 70, missing: [] };
  
  // 4. Professionalism Score
  const professionalismScore = calculateProfessionalism(coverLetter);
  
  // 5. Calculate overall score (weighted average)
  const overall = Math.round(
    personalizationScore.score * 0.35 +
    toneAnalysis.score * 0.25 +
    keywordAlignment.score * 0.25 +
    professionalismScore * 0.15
  );
  
  // 6. Generate improvements and strengths
  const improvements = generateImprovements(
    personalizationScore,
    toneAnalysis,
    keywordAlignment,
    professionalismScore
  );
  
  const strengths = generateStrengths(
    personalizationScore,
    toneAnalysis,
    keywordAlignment,
    professionalismScore
  );
  
  return {
    overall,
    breakdown: {
      personalization: Math.round(personalizationScore.score),
      toneMatch: Math.round(toneAnalysis.score),
      keywordAlignment: Math.round(keywordAlignment.score),
      professionalismScore: Math.round(professionalismScore)
    },
    toneAnalysis: {
      formality: toneAnalysis.formality,
      enthusiasm: toneAnalysis.enthusiasm,
      confidence: toneAnalysis.confidence,
      recommendation: toneAnalysis.recommendation
    },
    personalizationDetails: {
      companyMentions: personalizationScore.companyMentions,
      specificDetails: personalizationScore.specificDetails,
      genericPhrases: personalizationScore.genericPhrases
    },
    improvements,
    strengths,
    missingKeywords: keywordAlignment.missing
  };
}

// ============================================================================
// PERSONALIZATION ANALYSIS
// ============================================================================

interface PersonalizationResult {
  score: number;
  companyMentions: number;
  specificDetails: number;
  genericPhrases: number;
}

function calculatePersonalization(
  coverLetter: string,
  companyName: string
): PersonalizationResult {
  let score = 50; // baseline
  
  // Count company mentions
  const companyMentions = companyName
    ? (coverLetter.match(new RegExp(companyName, 'gi')) || []).length
    : 0;
  
  if (companyMentions >= 3) score += 20;
  else if (companyMentions >= 2) score += 15;
  else if (companyMentions === 1) score += 5;
  else score -= 20; // penalty for no company mention
  
  // Detect specific details (company-specific information)
  const specificPatterns = [
    /recent (launch|announcement|achievement|initiative|product)/i,
    /(mission|values|culture|vision) of/i,
    /your (team|company|organization)'s work on/i,
    /(impressed|excited|inspired) by your/i
  ];
  
  let specificDetails = 0;
  specificPatterns.forEach(pattern => {
    if (pattern.test(coverLetter)) {
      specificDetails++;
      score += 10;
    }
  });
  
  // Detect generic phrases (penalties)
  const genericPhrases = [
    'to whom it may concern',
    'dear sir or madam',
    'i am writing to apply',
    'i would be a great fit',
    'i am a hard worker',
    'team player',
    'fast learner',
    '[company name]',
    '[position]',
    '[your name]'
  ];
  
  let genericCount = 0;
  genericPhrases.forEach(phrase => {
    if (coverLetter.toLowerCase().includes(phrase)) {
      genericCount++;
      score -= 10;
    }
  });
  
  return {
    score: Math.min(100, Math.max(0, score)),
    companyMentions,
    specificDetails,
    genericPhrases: genericCount
  };
}

// ============================================================================
// TONE ANALYSIS
// ============================================================================

interface ToneResult {
  score: number;
  formality: number;
  enthusiasm: number;
  confidence: number;
  recommendation: string;
}

function analyzeTone(coverLetter: string, industry: string): ToneResult {
  const lowerText = coverLetter.toLowerCase();
  
  // 1. Formality Analysis
  const formalWords = [
    'furthermore', 'moreover', 'consequently', 'therefore', 'accordingly',
    'professional', 'expertise', 'proficiency', 'competency', 'qualifications'
  ];
  
  const casualWords = [
    'awesome', 'cool', 'super', 'really', 'very', 'pretty',
    'stuff', 'things', 'got', 'gonna', 'wanna'
  ];
  
  const formalCount = formalWords.filter(w => lowerText.includes(w)).length;
  const casualCount = casualWords.filter(w => lowerText.includes(w)).length;
  
  const formality = Math.min(100, (formalCount / (formalCount + casualCount + 1)) * 150);
  
  // 2. Enthusiasm Analysis
  const enthusiasmMarkers = [
    'excited', 'passionate', 'thrilled', 'eager', 'enthusiastic',
    'love', 'inspired', 'motivated', 'driven', '!'
  ];
  
  const enthusiasmCount = enthusiasmMarkers.filter(m => lowerText.includes(m)).length;
  const enthusiasm = Math.min(100, enthusiasmCount * 15);
  
  // 3. Confidence Analysis
  const confidenceMarkers = [
    'i will', 'i can', 'i have successfully', 'i excel at',
    'proven track record', 'demonstrated ability', 'expertise in'
  ];
  
  const weakMarkers = [
    'i think', 'i believe', 'i hope', 'maybe', 'perhaps',
    'i would try', 'i might be able'
  ];
  
  const confidenceCount = confidenceMarkers.filter(m => lowerText.includes(m)).length;
  const weakCount = weakMarkers.filter(m => lowerText.includes(m)).length;
  
  const confidence = Math.min(100, Math.max(0, (confidenceCount * 20) - (weakCount * 15)));
  
  // 4. Industry-specific recommendations
  const industryStandards = {
    tech: { formality: 60, enthusiasm: 75, confidence: 80 },
    finance: { formality: 85, enthusiasm: 50, confidence: 75 },
    creative: { formality: 50, enthusiasm: 85, confidence: 70 },
    healthcare: { formality: 80, enthusiasm: 60, confidence: 75 },
    general: { formality: 70, enthusiasm: 65, confidence: 75 }
  };
  
  const standard = industryStandards[industry as keyof typeof industryStandards] || industryStandards.general;
  
  let recommendation = '';
  if (formality < standard.formality - 15) {
    recommendation = 'Increase formality for this industry';
  } else if (formality > standard.formality + 15) {
    recommendation = 'Tone is too formal - be more conversational';
  } else if (enthusiasm < standard.enthusiasm - 15) {
    recommendation = 'Show more enthusiasm and passion';
  } else if (confidence < standard.confidence - 15) {
    recommendation = 'Be more confident in your abilities';
  } else {
    recommendation = 'Tone is well-balanced for this industry';
  }
  
  // Calculate tone match score
  const formalityDiff = Math.abs(formality - standard.formality);
  const enthusiasmDiff = Math.abs(enthusiasm - standard.enthusiasm);
  const confidenceDiff = Math.abs(confidence - standard.confidence);
  
  const score = Math.max(0, 100 - (formalityDiff + enthusiasmDiff + confidenceDiff) / 3);
  
  return {
    score,
    formality: Math.round(formality),
    enthusiasm: Math.round(enthusiasm),
    confidence: Math.round(confidence),
    recommendation
  };
}

// ============================================================================
// KEYWORD ALIGNMENT
// ============================================================================

function calculateKeywordAlignment(
  coverLetter: string,
  jobDescription: string
): { score: number; missing: string[] } {
  const coverLetterWords = new Set(
    coverLetter.toLowerCase().split(/\W+/).filter(w => w.length > 3)
  );
  
  const jobWords = jobDescription.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  
  // Extract important keywords (skills, technologies, qualifications)
  const importantPatterns = [
    /\b[A-Z]{2,}\b/g,  // Acronyms
    /\b\w+\.\w+\b/g,   // Dotted notation (React.js)
    /\b(experience|skill|knowledge|proficiency) (in|with) \w+/gi
  ];
  
  const importantKeywords = new Set<string>();
  importantPatterns.forEach(pattern => {
    const matches = jobDescription.match(pattern);
    if (matches) {
      matches.forEach(m => importantKeywords.add(m.toLowerCase()));
    }
  });
  
  // Count matches
  let matchedCount = 0;
  const missing: string[] = [];
  
  importantKeywords.forEach(keyword => {
    if (coverLetterWords.has(keyword)) {
      matchedCount++;
    } else {
      missing.push(keyword);
    }
  });
  
  const score = importantKeywords.size > 0
    ? (matchedCount / importantKeywords.size) * 100
    : 70;
  
  return { score, missing: missing.slice(0, 10) };
}

// ============================================================================
// PROFESSIONALISM SCORE
// ============================================================================

function calculateProfessionalism(coverLetter: string): number {
  let score = 100;
  
  // Check for proper structure
  const hasGreeting = /dear|hello|hi/i.test(coverLetter);
  const hasClosing = /sincerely|regards|best|thank you/i.test(coverLetter);
  
  if (!hasGreeting) score -= 15;
  if (!hasClosing) score -= 15;
  
  // Check for spelling/grammar issues (basic)
  const commonErrors = [
    /\bi\b/g,  // lowercase 'i'
    /\s{2,}/g, // multiple spaces
    /[.!?]{2,}/g // multiple punctuation
  ];
  
  commonErrors.forEach(pattern => {
    const matches = coverLetter.match(pattern);
    if (matches && matches.length > 2) {
      score -= 10;
    }
  });
  
  // Check length (optimal: 250-400 words)
  const wordCount = coverLetter.split(/\s+/).length;
  if (wordCount < 200) score -= 15;
  else if (wordCount > 500) score -= 10;
  
  return Math.max(0, score);
}

// ============================================================================
// FEEDBACK GENERATION
// ============================================================================

function generateImprovements(
  personalization: PersonalizationResult,
  tone: ToneResult,
  keywords: { score: number; missing: string[] },
  professionalism: number
): string[] {
  const improvements: string[] = [];
  
  if (personalization.companyMentions < 2) {
    improvements.push('❌ Mention the company name at least 2-3 times');
  }
  
  if (personalization.specificDetails < 2) {
    improvements.push('⚠️ Add specific details about the company (recent news, products, values)');
  }
  
  if (personalization.genericPhrases > 0) {
    improvements.push('❌ Remove generic phrases - personalize your letter');
  }
  
  if (tone.score < 70) {
    improvements.push(`💡 ${tone.recommendation}`);
  }
  
  if (keywords.missing.length > 0) {
    improvements.push(`🎯 Include missing keywords: ${keywords.missing.slice(0, 5).join(', ')}`);
  }
  
  if (professionalism < 80) {
    improvements.push('⚠️ Improve professionalism: check greeting, closing, and formatting');
  }
  
  return improvements;
}

function generateStrengths(
  personalization: PersonalizationResult,
  tone: ToneResult,
  keywords: { score: number },
  professionalism: number
): string[] {
  const strengths: string[] = [];
  
  if (personalization.score >= 75) {
    strengths.push('✅ Well-personalized for the company');
  }
  
  if (tone.score >= 75) {
    strengths.push('✅ Appropriate tone for the industry');
  }
  
  if (keywords.score >= 75) {
    strengths.push('✅ Strong keyword alignment');
  }
  
  if (professionalism >= 85) {
    strengths.push('✅ Professional structure and formatting');
  }
  
  return strengths;
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
