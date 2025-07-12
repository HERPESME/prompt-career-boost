
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAI = () => {
  const [loading, setLoading] = useState(false);

  const generateAIResponse = async (prompt: string, type: 'resume' | 'cover-letter' | 'interview'): Promise<string> => {
    setLoading(true);
    try {
      console.log('Calling AI service with type:', type);
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { prompt, type }
      });

      if (error) {
        console.error('AI service error:', error);
        throw new Error('AI service temporarily unavailable');
      }

      console.log('AI response received successfully');
      return data.result || 'Unable to generate response at this time.';
    } catch (error: any) {
      console.error('AI generation error:', error);
      toast({
        title: "AI Service Error",
        description: "Unable to generate AI response. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateAIResponse,
    loading
  };
};
