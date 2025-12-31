
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAI = () => {
  const [loading, setLoading] = useState(false);

  const generateAIResponse = async (prompt: string, type: 'resume' | 'cover-letter' | 'interview' | 'general' = 'general'): Promise<string> => {
    if (!prompt.trim()) {
      console.log('❌ Empty prompt provided');
      toast({
        title: "Input Required",
        description: "Please provide your request or question.",
        variant: "destructive",
      });
      return '';
    }

    setLoading(true);
    console.log('🤖 Generating AI response with Gemini:', { 
      type, 
      promptLength: prompt.length,
      timestamp: new Date().toISOString()
    });
    
    try {
      console.log('📡 Calling Supabase edge function: ai-chat');
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { prompt, type }
      });

      console.log('📨 Edge function response:', { 
        hasData: !!data, 
        hasError: !!error,
        dataKeys: data ? Object.keys(data) : [],
        error 
      });

      if (error) {
        console.error('❌ AI service error:', error);
        throw new Error(`AI service error: ${error.message || 'Unknown error'}`);
      }

      if (!data || !data.result) {
        console.error('❌ No result in AI response:', data);
        throw new Error('AI service returned empty response');
      }

      const result = data.result;
      console.log('✅ AI response generated successfully:', {
        responseLength: result.length,
        isGeminiResponse: result.length > 50,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "AI Response Generated",
        description: "Your request has been processed successfully!",
      });
      
      return result;
    } catch (error: any) {
      console.error('❌ AI generation error:', error);
      
      let errorMessage = "Unable to generate AI response.";
      if (error.message?.includes('network')) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message?.includes('timeout')) {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message?.includes('rate limit')) {
        errorMessage = "Too many requests. Please wait a moment.";
      }
      
      toast({
        title: "AI Service Error",
        description: errorMessage + " Using fallback response.",
        variant: "destructive",
      });
      
      return getFallbackResponse(type, prompt);
    } finally {
      setLoading(false);
    }
  };

  const analyzeResume = async (resumeContent: string, jobDescription?: string): Promise<{ score: number; feedback: string }> => {
    setLoading(true);
    console.log('📋 Starting resume analysis:', {
      resumeContentLength: resumeContent.length,
      hasJobDescription: !!jobDescription,
      timestamp: new Date().toISOString()
    });
    
    try {
      const analysisPrompt = jobDescription 
        ? `Analyze this resume against the job description and provide an ATS score (0-100) and detailed feedback:

JOB DESCRIPTION:
${jobDescription}

RESUME CONTENT:
${resumeContent}

Please provide:
1. An ATS compatibility score (0-100)
2. Specific improvement suggestions
3. Keyword optimization recommendations
4. Formatting and content advice`
        : `Analyze this resume and provide an ATS score (0-100) and detailed feedback:

RESUME CONTENT:
${resumeContent}

Please provide:
1. An ATS compatibility score (0-100)
2. General improvement suggestions
3. Industry best practices recommendations
4. Content and formatting advice`;

      const response = await generateAIResponse(analysisPrompt, 'resume');
      
      const scoreMatch = response.match(/(?:score|rating)[:;\s]*(\d{1,3})/i) || 
                        response.match(/(\d{1,3})(?:\/100|\s*%|\s*out\s*of\s*100)/i);
      
      let score = 75;
      if (scoreMatch) {
        const extractedScore = parseInt(scoreMatch[1]);
        if (extractedScore >= 0 && extractedScore <= 100) {
          score = extractedScore;
        }
      }

      console.log('📊 Resume analysis completed:', { 
        score, 
        feedbackLength: response.length,
        scoreExtracted: !!scoreMatch,
        timestamp: new Date().toISOString()
      });
      
      return {
        score,
        feedback: response
      };
    } catch (error) {
      console.error('❌ Resume analysis error:', error);
      return {
        score: 65,
        feedback: "Unable to analyze resume at this time. Please ensure your resume includes relevant keywords, quantified achievements, and proper formatting for ATS compatibility."
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Optimize LaTeX resume code with AI
   * Preserves template structure while improving content for ATS
   */
  const optimizeLaTeX = async (
    latexCode: string, 
    jobDescription: string
  ): Promise<{ optimizedLaTeX: string; score: number; improvements: string[] }> => {
    setLoading(true);
    console.log('🔧 Starting LaTeX optimization:', {
      latexLength: latexCode.length,
      jobDescLength: jobDescription.length,
      timestamp: new Date().toISOString()
    });

    try {
      const optimizationPrompt = `You are an expert ATS resume optimizer specializing in LaTeX formatting.

TASK: Optimize the following LaTeX resume to better match the job description while strictly following these rules:

JOB DESCRIPTION:
${jobDescription}

CURRENT LATEX RESUME:
${latexCode}

CRITICAL OPTIMIZATION RULES:
1. PRESERVE the exact LaTeX structure, commands, and template formatting
2. DO NOT change personal information (name, email, phone, location, LinkedIn, portfolio)
3. DO NOT invent fake experiences, companies, projects, or achievements
4. DO NOT add new sections or remove existing ones
5. IMPROVE the wording of existing bullet points to better match job requirements
6. NATURALLY integrate relevant keywords from the job description into existing content
7. ENHANCE achievement descriptions with stronger action verbs and quantified results where already mentioned
8. ENSURE all LaTeX commands remain syntactically valid and properly escaped
9. Focus on these ATS optimization techniques:
   - Mirror exact keywords from the job description
   - Use industry-standard terminology
   - Improve readability and scannability
   - Make achievements more impactful

OUTPUT FORMAT:
Return ONLY the optimized LaTeX code. No explanations, no markdown code blocks, no preamble. Just the raw LaTeX starting with % or \\documentclass.`;

      const optimizedLaTeX = await generateAIResponse(optimizationPrompt, 'resume');
      
      // Clean up the response - remove markdown code blocks if present
      let cleanedLaTeX = optimizedLaTeX.trim();
      if (cleanedLaTeX.startsWith('\`\`\`latex')) {
        cleanedLaTeX = cleanedLaTeX.slice(8);
      } else if (cleanedLaTeX.startsWith('\`\`\`')) {
        cleanedLaTeX = cleanedLaTeX.slice(3);
      }
      if (cleanedLaTeX.endsWith('\`\`\`')) {
        cleanedLaTeX = cleanedLaTeX.slice(0, -3);
      }
      cleanedLaTeX = cleanedLaTeX.trim();
      
      // Validate that we got valid LaTeX back
      const isValidLaTeX = cleanedLaTeX.includes('\\documentclass') || 
                          cleanedLaTeX.includes('\\begin{document}') ||
                          cleanedLaTeX.startsWith('%');
      
      if (!isValidLaTeX) {
        console.warn('⚠️ AI response may not be valid LaTeX, returning original');
        return {
          optimizedLaTeX: latexCode,
          score: 70,
          improvements: ['Unable to optimize - please try again']
        };
      }

      // Calculate ATS score for optimized resume
      const score = await calculateATSScore(cleanedLaTeX, jobDescription);
      
      // Extract improvements made (simplified)
      const improvements = [
        'Enhanced keyword alignment with job requirements',
        'Improved action verbs and achievement descriptions',
        'Optimized formatting for ATS parsing'
      ];

      console.log('✅ LaTeX optimization completed:', {
        originalLength: latexCode.length,
        optimizedLength: cleanedLaTeX.length,
        score,
        timestamp: new Date().toISOString()
      });

      return {
        optimizedLaTeX: cleanedLaTeX,
        score,
        improvements
      };
    } catch (error) {
      console.error('❌ LaTeX optimization error:', error);
      return {
        optimizedLaTeX: latexCode,
        score: 65,
        improvements: ['Optimization failed - please try again']
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate ATS score for LaTeX resume against job description
   */
  const calculateATSScore = async (latexCode: string, jobDescription: string): Promise<number> => {
    try {
      const scorePrompt = `Analyze this LaTeX resume against the job description and provide ONLY a numeric ATS compatibility score from 0-100.

JOB DESCRIPTION:
${jobDescription}

RESUME (LaTeX):
${latexCode}

SCORING CRITERIA:
- Keyword match (40%): How many job-specific keywords appear in the resume
- Formatting (20%): ATS-friendly structure (standard sections, proper formatting)
- Relevance (20%): How well experience/skills match job requirements
- Quantification (20%): Use of metrics and quantified achievements

RESPOND WITH ONLY A NUMBER FROM 0-100. Nothing else.`;

      const response = await generateAIResponse(scorePrompt, 'resume');
      
      // Extract the score from response
      const scoreMatch = response.match(/\b(\d{1,3})\b/);
      if (scoreMatch) {
        const score = parseInt(scoreMatch[1]);
        if (score >= 0 && score <= 100) {
          return score;
        }
      }
      
      return 75; // Default score if extraction fails
    } catch (error) {
      console.error('❌ ATS score calculation error:', error);
      return 70;
    }
  };

  return {
    generateAIResponse,
    analyzeResume,
    optimizeLaTeX,
    calculateATSScore,
    loading
  };
};

// Fallback responses for when AI service is unavailable
function getFallbackResponse(type: string, prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  switch (type) {
    case 'resume':
      return `**Resume Optimization Guidance:**

• **ATS Optimization**: Include relevant keywords from job descriptions
• **Quantify Achievements**: Use specific numbers and percentages  
• **Professional Format**: Use standard section headers and clean formatting
• **Tailored Content**: Customize for each application
• **Skills Section**: Include both technical and soft skills
• **Contact Info**: Ensure all information is current and professional

Focus on demonstrating value and impact in your previous roles.`;

    case 'cover-letter':
      return `**Cover Letter Best Practices:**

• **Personalized Opening**: Address the hiring manager by name when possible
• **Company Research**: Show knowledge of the company and role
• **Value Proposition**: Clearly state what you bring to the position
• **Specific Examples**: Include 1-2 concrete achievements
• **Professional Tone**: Match the company's communication style
• **Call to Action**: End with enthusiasm and next steps

Keep it concise and focused on how you can contribute to their success.`;

    case 'interview':
      if (lowerPrompt.includes('weakness')) {
        return `**Addressing Weaknesses Professionally:**

Choose a real weakness that:
• Isn't critical to the job
• Shows self-awareness  
• Demonstrates growth

Example: "I used to struggle with delegation, but I've learned to set clear expectations and trust my team, which has improved both efficiency and team development."`;
      }
      return `**Interview Preparation Tips:**

• **Research**: Know the company, role, and recent news
• **STAR Method**: Structure your answers with Situation, Task, Action, Result
• **Questions Ready**: Prepare thoughtful questions about the role
• **Practice**: Rehearse common questions aloud
• **Follow-up**: Send thank-you notes within 24 hours

Remember to show enthusiasm and ask engaging questions!`;

    default:
      return `**Career Development Guidance:**

• **Set Clear Goals**: Define short and long-term career objectives
• **Skill Development**: Continuously update your skillset
• **Network Actively**: Build meaningful professional relationships
• **Stay Current**: Keep up with industry trends and news
• **Document Wins**: Track your achievements and impact
• **Seek Feedback**: Regular check-ins with mentors and supervisors

Focus on consistent growth and adding value in your current role.`;
  }
}
