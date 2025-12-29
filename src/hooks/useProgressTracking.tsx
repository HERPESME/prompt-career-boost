import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProgressData {
  // Resume
  resumeAvgScore: number;
  resumeSessionsCount: number;
  resumeImprovementRate: number;
  resumeLastScore: number | null;
  resumeBestScore: number | null;
  
  // Interview
  interviewAvgScore: number;
  interviewSessionsCount: number;
  interviewImprovementRate: number;
  interviewLastScore: number | null;
  interviewBestScore: number | null;
  
  // Cover Letter
  coverLetterAvgScore: number;
  coverLetterSessionsCount: number;
  coverLetterImprovementRate: number;
  coverLetterLastScore: number | null;
  coverLetterBestScore: number | null;
  
  // Overall
  totalSessions: number;
  strongAreas: string[];
  weakAreas: string[];
}

export function useProgressTracking(userId: string | undefined) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchProgress();
  }, [userId]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setProgress({
          resumeAvgScore: Number(data.resume_avg_score) || 0,
          resumeSessionsCount: data.resume_sessions_count || 0,
          resumeImprovementRate: Number(data.resume_improvement_rate) || 0,
          resumeLastScore: data.resume_last_score,
          resumeBestScore: data.resume_best_score,
          
          interviewAvgScore: Number(data.interview_avg_score) || 0,
          interviewSessionsCount: data.interview_sessions_count || 0,
          interviewImprovementRate: Number(data.interview_improvement_rate) || 0,
          interviewLastScore: data.interview_last_score,
          interviewBestScore: data.interview_best_score,
          
          coverLetterAvgScore: Number(data.cover_letter_avg_score) || 0,
          coverLetterSessionsCount: data.cover_letter_sessions_count || 0,
          coverLetterImprovementRate: Number(data.cover_letter_improvement_rate) || 0,
          coverLetterLastScore: data.cover_letter_last_score,
          coverLetterBestScore: data.cover_letter_best_score,
          
          totalSessions: data.total_sessions || 0,
          strongAreas: data.strong_areas || [],
          weakAreas: data.weak_areas || []
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  };

  const saveATSScore = async (scoreData: any) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('ats_scores')
        .insert({
          user_id: userId,
          overall_score: scoreData.overall,
          keyword_score: scoreData.breakdown.keywordMatch,
          format_score: scoreData.breakdown.formatting,
          structure_score: scoreData.breakdown.structure,
          readability_score: scoreData.breakdown.readability,
          matched_keywords: scoreData.matchedKeywords,
          missing_keywords: scoreData.missingKeywords,
          improvements: scoreData.improvements,
          job_description: scoreData.jobDescription || null
        });

      if (error) throw error;
      await fetchProgress(); // Refresh progress
    } catch (err) {
      console.error('Error saving ATS score:', err);
    }
  };

  const saveInterviewScore = async (scoreData: any, question: string, answer: string, jobDescription?: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('interview_analytics')
        .insert({
          user_id: userId,
          question_text: question,
          answer: answer,
          overall_score: scoreData.overall,
          star_score: scoreData.breakdown.starStructure,
          specificity_score: scoreData.breakdown.specificity,
          quantification_score: scoreData.breakdown.quantification,
          relevance_score: scoreData.breakdown.relevance,
          clarity_score: scoreData.breakdown.clarity,
          has_situation: scoreData.starAnalysis.hasSituation,
          has_task: scoreData.starAnalysis.hasTask,
          has_action: scoreData.starAnalysis.hasAction,
          has_result: scoreData.starAnalysis.hasResult,
          improvements: scoreData.improvements,
          strengths: scoreData.strengths,
          job_description: jobDescription || null
        });

      if (error) throw error;
      await fetchProgress(); // Refresh progress
    } catch (err) {
      console.error('Error saving interview score:', err);
    }
  };

  const saveCoverLetterScore = async (scoreData: any, companyName?: string, jobDescription?: string, industry?: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('cover_letter_metrics')
        .insert({
          user_id: userId,
          overall_score: scoreData.overall,
          personalization_score: scoreData.breakdown.personalization,
          tone_match_score: scoreData.breakdown.toneMatch,
          keyword_alignment_score: scoreData.breakdown.keywordAlignment,
          professionalism_score: scoreData.breakdown.professionalismScore,
          formality: scoreData.toneAnalysis.formality,
          enthusiasm: scoreData.toneAnalysis.enthusiasm,
          confidence: scoreData.toneAnalysis.confidence,
          company_name: companyName || null,
          company_mentions: scoreData.personalizationDetails.companyMentions,
          specific_details: scoreData.personalizationDetails.specificDetails,
          generic_phrases_count: scoreData.personalizationDetails.genericPhrases,
          missing_keywords: scoreData.missingKeywords,
          improvements: scoreData.improvements,
          strengths: scoreData.strengths,
          industry: industry || 'general',
          job_description: jobDescription || null
        });

      if (error) throw error;
      await fetchProgress(); // Refresh progress
    } catch (err) {
      console.error('Error saving cover letter score:', err);
    }
  };

  return {
    progress,
    loading,
    error,
    saveATSScore,
    saveInterviewScore,
    saveCoverLetterScore,
    refreshProgress: fetchProgress
  };
}
