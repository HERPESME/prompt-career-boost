
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
  const { user, loading: authLoading } = useAuthUser();
  const [tokens, setTokens] = useState<TokenState>({ resume: 0, coverLetter: 0, interview: 0 });
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [currentTokenType, setCurrentTokenType] = useState<'resume' | 'cover-letter' | 'interview'>('resume');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't fetch tokens if auth is still loading
    if (authLoading) {
      return;
    }

    if (user) {
      console.log('User authenticated, fetching tokens for user:', user.id);
      fetchTokens();
    } else {
      console.log('No user authenticated, setting loading to false');
      setLoading(false);
      // Reset tokens when user logs out
      setTokens({ resume: 0, coverLetter: 0, interview: 0 });
    }
  }, [user, authLoading]);

  const fetchTokens = async () => {
    if (!user) {
      console.log('No user available for token fetch');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching tokens from database for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_tokens')
        .select('resume_tokens, cover_letter_tokens, interview_tokens')
        .eq('user_id', user.id)
        .single();

      console.log('Token fetch result:', { data, error });

      if (error) {
        // If no tokens record exists, create one
        if (error.code === 'PGRST116') {
          console.log('No token record found, creating initial tokens');
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

          if (insertError) {
            console.error('Error creating initial tokens:', insertError);
            throw insertError;
          }
          
          console.log('Initial tokens created:', newTokens);
          setTokens({
            resume: newTokens.resume_tokens,
            coverLetter: newTokens.cover_letter_tokens,
            interview: newTokens.interview_tokens
          });
        } else {
          console.error('Database error fetching tokens:', error);
          throw error;
        }
      } else {
        console.log('Tokens loaded successfully:', data);
        setTokens({
          resume: data.resume_tokens,
          coverLetter: data.cover_letter_tokens,
          interview: data.interview_tokens
        });
      }
    } catch (error: any) {
      console.error('Error in fetchTokens:', error);
      
      // Don't show error toast if user is not authenticated
      if (user) {
        toast({
          title: "Error",
          description: `Failed to load your tokens: ${error.message || 'Unknown error'}. Please try refreshing the page.`,
          variant: "destructive",
        });
      }
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
      console.log(`Using ${type} token for user:`, user.id);
      
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

      if (error) {
        console.error('Error using token:', error);
        throw error;
      }

      console.log('Token used successfully, new balance:', data);

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
      console.log('Adding tokens for user:', user.id, tokenPackage);
      
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

      if (error) {
        console.error('Error adding tokens:', error);
        throw error;
      }

      console.log('Tokens added successfully:', data);

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
