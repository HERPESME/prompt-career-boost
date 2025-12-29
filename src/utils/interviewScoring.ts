/**
 * Interview Response Scoring Engine
 * 
 * Provides real, calculated scores for interview answers based on:
 * - STAR method structure validation
 * - Content specificity and quantification
 * - Relevance to job requirements
 * - Answer clarity and coherence
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface InterviewScore {
  overall: number;
  breakdown: {
    starStructure: number;
    specificity: number;
    quantification: number;
    relevance: number;
    clarity: number;
  };
  starAnalysis: {
    hasSituation: boolean;
    hasTask: boolean;
    hasAction: boolean;
    hasResult: boolean;
  };
  improvements: string[];
  strengths: string[];
  optimizedAnswer?: string;
}

// ============================================================================
// MAIN SCORING FUNCTION
// ============================================================================

export function calculateInterviewScore(
  answer: string,
  question: string,
  jobDescription: string = ''
): InterviewScore {
  // 1. STAR Structure Analysis
  const starAnalysis = analyzeSTARStructure(answer);
  
  // 2. Specificity Analysis
  const specificityScore = calculateSpecificity(answer);
  
  // 3. Quantification Analysis
  const quantificationScore = calculateQuantification(answer);
  
  // 4. Relevance Analysis
  const relevanceScore = jobDescription 
    ? calculateRelevance(answer, jobDescription)
    : 70; // baseline without job description
  
  // 5. Clarity Analysis
  const clarityScore = calculateClarity(answer);
  
  // 6. Calculate overall score (weighted average)
  const overall = Math.round(
    starAnalysis.score * 0.30 +
    specificityScore * 0.25 +
    quantificationScore * 0.20 +
    relevanceScore * 0.15 +
    clarityScore * 0.10
  );
  
  // 7. Generate improvements and strengths
  const improvements = generateImprovements(
    starAnalysis,
    specificityScore,
    quantificationScore,
    relevanceScore,
    clarityScore
  );
  
  const strengths = generateStrengths(
    starAnalysis,
    specificityScore,
    quantificationScore,
    relevanceScore,
    clarityScore
  );
  
  return {
    overall,
    breakdown: {
      starStructure: Math.round(starAnalysis.score),
      specificity: Math.round(specificityScore),
      quantification: Math.round(quantificationScore),
      relevance: Math.round(relevanceScore),
      clarity: Math.round(clarityScore)
    },
    starAnalysis: {
      hasSituation: starAnalysis.hasSituation,
      hasTask: starAnalysis.hasTask,
      hasAction: starAnalysis.hasAction,
      hasResult: starAnalysis.hasResult
    },
    improvements,
    strengths
  };
}

// ============================================================================
// STAR METHOD VALIDATION
// ============================================================================

interface STARAnalysis {
  hasSituation: boolean;
  hasTask: boolean;
  hasAction: boolean;
  hasResult: boolean;
  score: number;
}

function analyzeSTARStructure(answer: string): STARAnalysis {
  const lowerAnswer = answer.toLowerCase();
  
  // Situation indicators
  const situationPatterns = [
    /\b(when|while|during|at|in)\s+(my|our|the)\s+(previous|last|current)/i,
    /\b(faced|encountered|dealing with|working on)/i,
    /\b(situation|scenario|challenge|problem|issue)\b/i
  ];
  
  // Task indicators
  const taskPatterns = [
    /\b(responsible for|tasked with|needed to|had to|required to)/i,
    /\b(my (role|responsibility|job) was to)/i,
    /\b(goal|objective|target) was/i
  ];
  
  // Action indicators (strong action verbs)
  const actionPatterns = [
    /\b(i (led|managed|developed|created|implemented|designed|built|organized|coordinated))/i,
    /\b(i (analyzed|researched|investigated|identified|solved))/i,
    /\b(i (collaborated|communicated|presented|negotiated))/i
  ];
  
  // Result indicators
  const resultPatterns = [
    /\b(resulted in|led to|achieved|accomplished|delivered)/i,
    /\b(increased|decreased|improved|reduced|saved|generated)\s+\w+\s+by\s+\d+/i,
    /\b(as a result|consequently|ultimately|finally)/i,
    /\d+%|\$[\d,]+|[\d,]+\s+(users|customers|hours|days)/i
  ];
  
  const hasSituation = situationPatterns.some(pattern => pattern.test(answer));
  const hasTask = taskPatterns.some(pattern => pattern.test(answer));
  const hasAction = actionPatterns.some(pattern => pattern.test(answer));
  const hasResult = resultPatterns.some(pattern => pattern.test(answer));
  
  // Calculate score
  let score = 0;
  if (hasSituation) score += 25;
  if (hasTask) score += 25;
  if (hasAction) score += 30; // Action is most important
  if (hasResult) score += 20;
  
  return { hasSituation, hasTask, hasAction, hasResult, score };
}

// ============================================================================
// SPECIFICITY ANALYSIS
// ============================================================================

function calculateSpecificity(answer: string): number {
  let score = 50; // baseline
  
  // Increase score for specific details
  const specificIndicators = [
    /\d+%/g,                                    // percentages
    /\$[\d,]+/g,                               // dollar amounts
    /\d+\s+(users|customers|clients|people)/g, // scale metrics
    /(increased|decreased|improved|reduced)\s+\w+\s+by\s+\d+/g, // improvements
    /[A-Z][a-z]+\s+\d{4}/g,                   // dates (January 2023)
    /\b\d+\s+(months|weeks|days|hours)\b/g,   // time periods
  ];
  
  specificIndicators.forEach(pattern => {
    const matches = answer.match(pattern);
    if (matches) {
      score += Math.min(matches.length * 8, 40); // cap at +40
    }
  });
  
  // Decrease score for vague language
  const vagueTerms = [
    'various', 'multiple', 'several', 'many', 'some', 'a lot of',
    'things', 'stuff', 'etc', 'and so on'
  ];
  
  vagueTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    const matches = answer.match(regex);
    if (matches) {
      score -= matches.length * 5;
    }
  });
  
  return Math.min(100, Math.max(0, score));
}

// ============================================================================
// QUANTIFICATION ANALYSIS
// ============================================================================

function calculateQuantification(answer: string): number {
  let score = 0;
  
  // Count different types of metrics
  const percentages = (answer.match(/\d+%/g) || []).length;
  const dollarAmounts = (answer.match(/\$[\d,]+/g) || []).length;
  const numbers = (answer.match(/\b\d+\b/g) || []).length;
  const timeMetrics = (answer.match(/\d+\s+(months|weeks|days|hours|years)/g) || []).length;
  const scaleMetrics = (answer.match(/\d+\s+(users|customers|clients|people|employees)/g) || []).length;
  
  // Score based on quantity and variety of metrics
  score += Math.min(percentages * 15, 30);
  score += Math.min(dollarAmounts * 15, 30);
  score += Math.min(timeMetrics * 10, 20);
  score += Math.min(scaleMetrics * 10, 20);
  
  // Bonus for having multiple types of metrics
  const metricTypes = [percentages, dollarAmounts, timeMetrics, scaleMetrics].filter(x => x > 0).length;
  if (metricTypes >= 3) score += 20;
  else if (metricTypes === 2) score += 10;
  
  return Math.min(100, score);
}

// ============================================================================
// RELEVANCE ANALYSIS
// ============================================================================

function calculateRelevance(answer: string, jobDescription: string): number {
  const answerWords = answer.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const jobWords = jobDescription.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  
  // Find common words
  const commonWords = answerWords.filter(word => jobWords.includes(word));
  const relevanceRatio = commonWords.length / Math.max(jobWords.length, 1);
  
  return Math.min(100, relevanceRatio * 200); // Scale up
}

// ============================================================================
// CLARITY ANALYSIS
// ============================================================================

function calculateClarity(answer: string): number {
  let score = 100;
  
  const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = answer.split(/\s+/).filter(w => w.length > 0);
  
  if (sentences.length === 0 || words.length === 0) {
    return 50;
  }
  
  // Average sentence length (optimal: 15-25 words)
  const avgSentenceLength = words.length / sentences.length;
  if (avgSentenceLength > 30) {
    score -= 20;
  } else if (avgSentenceLength < 10) {
    score -= 10;
  }
  
  // Check for filler words
  const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally'];
  fillerWords.forEach(filler => {
    const count = (answer.toLowerCase().match(new RegExp(`\\b${filler}\\b`, 'g')) || []).length;
    score -= count * 5;
  });
  
  return Math.max(0, score);
}

// ============================================================================
// FEEDBACK GENERATION
// ============================================================================

function generateImprovements(
  star: STARAnalysis,
  specificity: number,
  quantification: number,
  relevance: number,
  clarity: number
): string[] {
  const improvements: string[] = [];
  
  // STAR structure improvements
  if (!star.hasSituation) {
    improvements.push('❌ Add context: Start with the situation or challenge you faced');
  }
  if (!star.hasTask) {
    improvements.push('❌ Clarify your role: Explain what you were specifically responsible for');
  }
  if (!star.hasAction) {
    improvements.push('❌ Detail your actions: Use strong action verbs (Led, Managed, Developed, etc.)');
  }
  if (!star.hasResult) {
    improvements.push('❌ Show impact: Include specific, measurable results');
  }
  
  // Specificity improvements
  if (specificity < 60) {
    improvements.push('⚠️ Be more specific: Replace vague terms with concrete details');
  }
  
  // Quantification improvements
  if (quantification < 50) {
    improvements.push('📊 Add metrics: Include numbers, percentages, or dollar amounts');
  }
  
  // Relevance improvements
  if (relevance < 60) {
    improvements.push('🎯 Increase relevance: Align your answer more closely with job requirements');
  }
  
  // Clarity improvements
  if (clarity < 70) {
    improvements.push('💡 Improve clarity: Use shorter sentences and remove filler words');
  }
  
  return improvements;
}

function generateStrengths(
  star: STARAnalysis,
  specificity: number,
  quantification: number,
  relevance: number,
  clarity: number
): string[] {
  const strengths: string[] = [];
  
  if (star.score >= 75) {
    strengths.push('✅ Strong STAR structure');
  }
  if (specificity >= 70) {
    strengths.push('✅ Specific and detailed');
  }
  if (quantification >= 70) {
    strengths.push('✅ Well-quantified with metrics');
  }
  if (relevance >= 70) {
    strengths.push('✅ Highly relevant to role');
  }
  if (clarity >= 80) {
    strengths.push('✅ Clear and concise');
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
