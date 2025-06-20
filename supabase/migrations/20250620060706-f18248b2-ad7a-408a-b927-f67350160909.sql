
-- First, let's ensure RLS is enabled on all tables (some may already be enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts and recreate them properly
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can create their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can update their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can view their own cover letters" ON public.cover_letters;
DROP POLICY IF EXISTS "Users can create their own cover letters" ON public.cover_letters;
DROP POLICY IF EXISTS "Users can update their own cover letters" ON public.cover_letters;
DROP POLICY IF EXISTS "Users can delete their own cover letters" ON public.cover_letters;
DROP POLICY IF EXISTS "Users can view their own interviews" ON public.interviews;
DROP POLICY IF EXISTS "Users can create their own interviews" ON public.interviews;
DROP POLICY IF EXISTS "Users can update their own interviews" ON public.interviews;
DROP POLICY IF EXISTS "Users can delete their own interviews" ON public.interviews;

-- Create comprehensive RLS policies for profiles table
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create comprehensive RLS policies for resumes table
CREATE POLICY "resumes_select_own" ON public.resumes
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "resumes_insert_own" ON public.resumes
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "resumes_update_own" ON public.resumes
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "resumes_delete_own" ON public.resumes
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for cover_letters table
CREATE POLICY "cover_letters_select_own" ON public.cover_letters
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "cover_letters_insert_own" ON public.cover_letters
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cover_letters_update_own" ON public.cover_letters
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cover_letters_delete_own" ON public.cover_letters
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for interviews table
CREATE POLICY "interviews_select_own" ON public.interviews
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "interviews_insert_own" ON public.interviews
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "interviews_update_own" ON public.interviews
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "interviews_delete_own" ON public.interviews
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create a secure tokens table to replace client-side token management
CREATE TABLE IF NOT EXISTS public.user_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  resume_tokens INTEGER NOT NULL DEFAULT 3,
  cover_letter_tokens INTEGER NOT NULL DEFAULT 3,
  interview_tokens INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_tokens table
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_tokens table
CREATE POLICY "user_tokens_select_own" ON public.user_tokens
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "user_tokens_insert_own" ON public.user_tokens
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_tokens_update_own" ON public.user_tokens
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update the handle_new_user function to create initial tokens
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  
  -- Insert initial tokens
  INSERT INTO public.user_tokens (user_id, resume_tokens, cover_letter_tokens, interview_tokens)
  VALUES (NEW.id, 3, 3, 5);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
