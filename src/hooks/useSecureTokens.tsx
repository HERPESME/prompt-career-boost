
import { useState, useEffect } from 'react';
import { useAuthUser } from './useAuthUser';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TokenState {
  resume: number;
  coverLetter: number;
  interview: number;
}

export const useSecureTokens = () => {
  const { user } = useAuthUser();
  const [tokens, setTokens] = useState<TokenState>({ resume: 0, coverLetter: 0, interview: 0 });
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [currentTokenType, setCurrentTokenType] = useState<'resume' | 'cover-letter' | 'interview'>('resume');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTokens();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchTokens = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_tokens')
        .select('resume_tokens, cover_letter_tokens, interview_tokens')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no tokens record exists, create one
        if (error.code === 'PGRST116') {
          const { data: newTokens, error: insertError } = await supabase
            .from('user_tokens')
            .insert({
              user_id: user.id,
              resume_tokens: 3,
              cover_letter_tokens: 3,
              interview_tokens: 5
            })
            .select('resume_tokens, cover_letter_tokens, interview_tokens')
            .single();

          if (insertError) throw insertError;
          
          setTokens({
            resume: newTokens.resume_tokens,
            coverLetter: newTokens.cover_letter_tokens,
            interview: newTokens.interview_tokens
          });
        } else {
          throw error;
        }
      } else {
        setTokens({
          resume: data.resume_tokens,
          coverLetter: data.cover_letter_tokens,
          interview: data.interview_tokens
        });
      }
    } catch (error: any) {
      console.error('Error fetching tokens:', error);
      toast({
        title: "Error",
        description: "Failed to load your tokens. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const useToken = async (type: 'resume' | 'cover-letter' | 'interview'): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use this feature.",
        variant: "destructive",
      });
      return false;
    }

    const tokenKey = type === 'cover-letter' ? 'coverLetter' : type;
    const dbTokenKey = type === 'cover-letter' ? 'cover_letter_tokens' : `${type}_tokens`;
    
    if (tokens[tokenKey as keyof TokenState] <= 0) {
      setCurrentTokenType(type);
      setIsTokenModalOpen(true);
      return false;
    }

    try {
      // Decrement token in database
      const { data, error } = await supabase
        .from('user_tokens')
        .update({
          [dbTokenKey]: tokens[tokenKey as keyof TokenState] - 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select('resume_tokens, cover_letter_tokens, interview_tokens')
        .single();

      if (error) throw error;

      // Update local state
      setTokens({
        resume: data.resume_tokens,
        coverLetter: data.cover_letter_tokens,
        interview: data.interview_tokens
      });

      return true;
    } catch (error: any) {
      console.error('Error using token:', error);
      toast({
        title: "Error",
        description: "Failed to use token. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const addTokens = async (tokenPackage: { resume: number; coverLetter: number; interview: number }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_tokens')
        .update({
          resume_tokens: tokens.resume + tokenPackage.resume,
          cover_letter_tokens: tokens.coverLetter + tokenPackage.coverLetter,
          interview_tokens: tokens.interview + tokenPackage.interview,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select('resume_tokens, cover_letter_tokens, interview_tokens')
        .single();

      if (error) throw error;

      setTokens({
        resume: data.resume_tokens,
        coverLetter: data.cover_letter_tokens,
        interview: data.interview_tokens
      });

      toast({
        title: "Tokens Added",
        description: "Your tokens have been successfully added to your account.",
      });
    } catch (error: any) {
      console.error('Error adding tokens:', error);
      toast({
        title: "Error",
        description: "Failed to add tokens. Please try again.",
        variant: "destructive",
      });
    }
  };

  const closeTokenModal = () => {
    setIsTokenModalOpen(false);
  };

  return {
    tokens,
    useToken,
    addTokens,
    isTokenModalOpen,
    currentTokenType,
    closeTokenModal,
    loading,
    refreshTokens: fetchTokens
  };
};
