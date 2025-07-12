
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAI = () => {
  const [loading, setLoading] = useState(false);

  const generateAIResponse = async (prompt: string, type: 'resume' | 'cover-letter' | 'interview' | 'general' = 'general'): Promise<string> => {
    if (!prompt.trim()) {
      toast({
        title: "Input Required",
        description: "Please provide your request or question.",
        variant: "destructive",
      });
      return '';
    }

    setLoading(true);
    console.log('Generating AI response with Gemini:', { type, promptLength: prompt.length });
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { prompt, type }
      });

      if (error) {
        console.error('AI service error:', error);
        throw new Error('AI service temporarily unavailable');
      }

      const result = data?.result || 'I apologize, but I cannot generate a response at this moment. Please try again.';
      
      console.log('AI response generated successfully');
      toast({
        title: "AI Response Generated",
        description: "Your request has been processed successfully!",
      });
      
      return result;
    } catch (error: any) {
      console.error('AI generation error:', error);
      toast({
        title: "AI Service Error",
        description: "Unable to generate AI response. Please try again in a moment.",
        variant: "destructive",
      });
      
      // Return a helpful fallback based on type
      return getFallbackResponse(type, prompt);
    } finally {
      setLoading(false);
    }
  };

  const analyzeResume = async (resumeContent: string, jobDescription?: string): Promise<{ score: number; feedback: string }> => {
    setLoading(true);
    
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
      
      // Extract score from response (look for patterns like "Score: 85" or "85/100")
      const scoreMatch = response.match(/(?:score|rating)[:;\s]*(\d{1,3})/i) || 
                        response.match(/(\d{1,3})(?:\/100|\s*%|\s*out\s*of\s*100)/i);
      
      let score = 75; // Default score
      if (scoreMatch) {
        const extractedScore = parseInt(scoreMatch[1]);
        if (extractedScore >= 0 && extractedScore <= 100) {
          score = extractedScore;
        }
      }

      console.log('Resume analysis completed:', { score, feedbackLength: response.length });
      
      return {
        score,
        feedback: response
      };
    } catch (error) {
      console.error('Resume analysis error:', error);
      return {
        score: 65,
        feedback: "Unable to analyze resume at this time. Please ensure your resume includes relevant keywords, quantified achievements, and proper formatting for ATS compatibility."
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    generateAIResponse,
    analyzeResume,
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
