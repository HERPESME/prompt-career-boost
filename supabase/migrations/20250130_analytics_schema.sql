-- Analytics Database Schema for CareerBoost AI
-- This schema supports storing and tracking all scoring metrics

-- ============================================================================
-- ATS SCORING HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS ats_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  keyword_score INTEGER NOT NULL CHECK (keyword_score >= 0 AND keyword_score <= 100),
  format_score INTEGER NOT NULL CHECK (format_score >= 0 AND format_score <= 100),
  structure_score INTEGER NOT NULL CHECK (structure_score >= 0 AND structure_score <= 100),
  readability_score INTEGER NOT NULL CHECK (readability_score >= 0 AND readability_score <= 100),
  matched_keywords TEXT[],
  missing_keywords TEXT[],
  improvements JSONB,
  job_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ats_scores_user_id ON ats_scores(user_id);
CREATE INDEX idx_ats_scores_created_at ON ats_scores(created_at DESC);

-- ============================================================================
-- INTERVIEW RESPONSE ANALYTICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS interview_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID,
  question_text TEXT NOT NULL,
  answer TEXT NOT NULL,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  star_score INTEGER NOT NULL CHECK (star_score >= 0 AND star_score <= 100),
  specificity_score INTEGER NOT NULL CHECK (specificity_score >= 0 AND specificity_score <= 100),
  quantification_score INTEGER NOT NULL CHECK (quantification_score >= 0 AND quantification_score <= 100),
  relevance_score INTEGER NOT NULL CHECK (relevance_score >= 0 AND relevance_score <= 100),
  clarity_score INTEGER NOT NULL CHECK (clarity_score >= 0 AND clarity_score <= 100),
  has_situation BOOLEAN DEFAULT FALSE,
  has_task BOOLEAN DEFAULT FALSE,
  has_action BOOLEAN DEFAULT FALSE,
  has_result BOOLEAN DEFAULT FALSE,
  improvements JSONB,
  strengths JSONB,
  job_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interview_analytics_user_id ON interview_analytics(user_id);
CREATE INDEX idx_interview_analytics_created_at ON interview_analytics(created_at DESC);

-- ============================================================================
-- COVER LETTER METRICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS cover_letter_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_letter_id UUID,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  personalization_score INTEGER NOT NULL CHECK (personalization_score >= 0 AND personalization_score <= 100),
  tone_match_score INTEGER NOT NULL CHECK (tone_match_score >= 0 AND tone_match_score <= 100),
  keyword_alignment_score INTEGER NOT NULL CHECK (keyword_alignment_score >= 0 AND keyword_alignment_score <= 100),
  professionalism_score INTEGER NOT NULL CHECK (professionalism_score >= 0 AND professionalism_score <= 100),
  formality INTEGER CHECK (formality >= 0 AND formality <= 100),
  enthusiasm INTEGER CHECK (enthusiasm >= 0 AND enthusiasm <= 100),
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  company_name TEXT,
  company_mentions INTEGER DEFAULT 0,
  specific_details INTEGER DEFAULT 0,
  generic_phrases_count INTEGER DEFAULT 0,
  missing_keywords TEXT[],
  improvements JSONB,
  strengths JSONB,
  industry TEXT,
  job_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cover_letter_metrics_user_id ON cover_letter_metrics(user_id);
CREATE INDEX idx_cover_letter_metrics_created_at ON cover_letter_metrics(created_at DESC);

-- ============================================================================
-- USER PROGRESS TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Resume Progress
  resume_avg_score DECIMAL(5,2) DEFAULT 0,
  resume_sessions_count INTEGER DEFAULT 0,
  resume_improvement_rate DECIMAL(5,2) DEFAULT 0,
  resume_last_score INTEGER,
  resume_best_score INTEGER,
  resume_last_session_date TIMESTAMP WITH TIME ZONE,
  
  -- Interview Progress
  interview_avg_score DECIMAL(5,2) DEFAULT 0,
  interview_sessions_count INTEGER DEFAULT 0,
  interview_improvement_rate DECIMAL(5,2) DEFAULT 0,
  interview_last_score INTEGER,
  interview_best_score INTEGER,
  interview_last_session_date TIMESTAMP WITH TIME ZONE,
  
  -- Cover Letter Progress
  cover_letter_avg_score DECIMAL(5,2) DEFAULT 0,
  cover_letter_sessions_count INTEGER DEFAULT 0,
  cover_letter_improvement_rate DECIMAL(5,2) DEFAULT 0,
  cover_letter_last_score INTEGER,
  cover_letter_best_score INTEGER,
  cover_letter_last_session_date TIMESTAMP WITH TIME ZONE,
  
  -- Overall Stats
  total_sessions INTEGER DEFAULT 0,
  strong_areas TEXT[],
  weak_areas TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE ats_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_letter_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- ATS Scores Policies
CREATE POLICY "Users can view their own ATS scores"
  ON ats_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ATS scores"
  ON ats_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ATS scores"
  ON ats_scores FOR UPDATE
  USING (auth.uid() = user_id);

-- Interview Analytics Policies
CREATE POLICY "Users can view their own interview analytics"
  ON interview_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interview analytics"
  ON interview_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview analytics"
  ON interview_analytics FOR UPDATE
  USING (auth.uid() = user_id);

-- Cover Letter Metrics Policies
CREATE POLICY "Users can view their own cover letter metrics"
  ON cover_letter_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cover letter metrics"
  ON cover_letter_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cover letter metrics"
  ON cover_letter_metrics FOR UPDATE
  USING (auth.uid() = user_id);

-- User Progress Policies
CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS FOR AUTOMATIC PROGRESS TRACKING
-- ============================================================================

-- Function to update user progress after ATS score insert
CREATE OR REPLACE FUNCTION update_resume_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_progress (user_id, resume_sessions_count, resume_last_score, resume_best_score, resume_last_session_date, total_sessions)
  VALUES (NEW.user_id, 1, NEW.overall_score, NEW.overall_score, NOW(), 1)
  ON CONFLICT (user_id) DO UPDATE SET
    resume_sessions_count = user_progress.resume_sessions_count + 1,
    resume_last_score = NEW.overall_score,
    resume_best_score = GREATEST(user_progress.resume_best_score, NEW.overall_score),
    resume_last_session_date = NOW(),
    total_sessions = user_progress.total_sessions + 1,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_resume_progress
AFTER INSERT ON ats_scores
FOR EACH ROW
EXECUTE FUNCTION update_resume_progress();

-- Function to update user progress after interview score insert
CREATE OR REPLACE FUNCTION update_interview_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_progress (user_id, interview_sessions_count, interview_last_score, interview_best_score, interview_last_session_date, total_sessions)
  VALUES (NEW.user_id, 1, NEW.overall_score, NEW.overall_score, NOW(), 1)
  ON CONFLICT (user_id) DO UPDATE SET
    interview_sessions_count = user_progress.interview_sessions_count + 1,
    interview_last_score = NEW.overall_score,
    interview_best_score = GREATEST(user_progress.interview_best_score, NEW.overall_score),
    interview_last_session_date = NOW(),
    total_sessions = user_progress.total_sessions + 1,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_interview_progress
AFTER INSERT ON interview_analytics
FOR EACH ROW
EXECUTE FUNCTION update_interview_progress();

-- Function to update user progress after cover letter score insert
CREATE OR REPLACE FUNCTION update_cover_letter_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_progress (user_id, cover_letter_sessions_count, cover_letter_last_score, cover_letter_best_score, cover_letter_last_session_date, total_sessions)
  VALUES (NEW.user_id, 1, NEW.overall_score, NEW.overall_score, NOW(), 1)
  ON CONFLICT (user_id) DO UPDATE SET
    cover_letter_sessions_count = user_progress.cover_letter_sessions_count + 1,
    cover_letter_last_score = NEW.overall_score,
    cover_letter_best_score = GREATEST(user_progress.cover_letter_best_score, NEW.overall_score),
    cover_letter_last_session_date = NOW(),
    total_sessions = user_progress.total_sessions + 1,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cover_letter_progress
AFTER INSERT ON cover_letter_metrics
FOR EACH ROW
EXECUTE FUNCTION update_cover_letter_progress();
