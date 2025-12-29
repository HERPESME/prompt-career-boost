import { useState, useCallback } from 'react';
import { calculateATSScore, ATSScore, getScoreRating, getScoreColor } from '@/utils/atsScoring';

interface UseATSScoringReturn {
  score: ATSScore | null;
  isCalculating: boolean;
  calculateScore: (resumeText: string, jobDescription?: string) => void;
  rating: string;
  color: string;
}

/**
 * React hook for calculating ATS scores for resumes
 * 
 * @example
 * const { score, calculateScore, rating } = useATSScoring();
 * 
 * // Calculate score
 * calculateScore(resumeText, jobDescription);
 * 
 * // Display results
 * console.log(score?.overall); // 85
 * console.log(rating); // "Very Good"
 */
export function useATSScoring(): UseATSScoringReturn {
  const [score, setScore] = useState<ATSScore | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateScore = useCallback((resumeText: string, jobDescription: string = '') => {
    setIsCalculating(true);
    
    try {
      // Run scoring algorithm
      const result = calculateATSScore(resumeText, jobDescription);
      setScore(result);
    } catch (error) {
      console.error('Error calculating ATS score:', error);
      setScore(null);
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const rating = score ? getScoreRating(score.overall) : '';
  const color = score ? getScoreColor(score.overall) : 'gray';

  return {
    score,
    isCalculating,
    calculateScore,
    rating,
    color
  };
}
