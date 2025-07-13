
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
    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }

    if (user) {
      console.log('User authenticated, fetching tokens for user:', user.id);
      fetchTokens();
    } else {
      console.log('No user authenticated, setting loading to false');
      setLoading(false);
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
      console.log('🔍 Fetching tokens from database for user:', user.id);
      
      // First, get all token records for this user (handling potential duplicates)
      const { data: allRecords, error: fetchError } = await supabase
        .from('user_tokens')
        .select('resume_tokens, cover_letter_tokens, interview_tokens, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('📊 Token fetch result:', { data: allRecords, error: fetchError });

      if (fetchError) {
        console.error('❌ Database error fetching tokens:', fetchError);
        throw fetchError;
      }

      if (!allRecords || allRecords.length === 0) {
        // No tokens record exists, create one
        console.log('🆕 No token record found, creating initial tokens');
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
          console.error('❌ Error creating initial tokens:', insertError);
          throw insertError;
        }
        
        console.log('✅ Initial tokens created:', newTokens);
        setTokens({
          resume: newTokens.resume_tokens,
          coverLetter: newTokens.cover_letter_tokens,
          interview: newTokens.interview_tokens
        });
      } else {
        // Handle duplicates by cleaning up and using the latest record
        const latestRecord = allRecords[0];
        
        if (allRecords.length > 1) {
          console.log(`🧹 Found ${allRecords.length} duplicate records, cleaning up...`);
          // Delete older duplicates
          const { error: deleteError } = await supabase
            .from('user_tokens')
            .delete()
            .eq('user_id', user.id)
            .neq('created_at', latestRecord.created_at);
          
          if (deleteError) {
            console.error('❌ Error cleaning up duplicates:', deleteError);
          } else {
            console.log('✅ Cleaned up duplicate token records');
          }
        }
        
        console.log('✅ Tokens loaded successfully:', latestRecord);
        setTokens({
          resume: latestRecord.resume_tokens,
          coverLetter: latestRecord.cover_letter_tokens,
          interview: latestRecord.interview_tokens
        });
      }
    } catch (error: any) {
      console.error('❌ Error in fetchTokens:', error);
      
      if (user) {
        toast({
          title: "Token Error",
          description: `Failed to load tokens: ${error.message}. Please refresh the page.`,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const useToken = async (type: 'resume' | 'cover-letter' | 'interview'): Promise<boolean> => {
    console.log(`🎯 Attempting to use ${type} token`);
    
    if (!user) {
      console.log('❌ No user authenticated for token usage');
      toast({
        title: "Authentication Required",
        description: "Please sign in to use this feature.",
        variant: "destructive",
      });
      return false;
    }

    const tokenKey = type === 'cover-letter' ? 'coverLetter' : type;
    const dbTokenKey = type === 'cover-letter' ? 'cover_letter_tokens' : `${type}_tokens`;
    const currentTokens = tokens[tokenKey as keyof TokenState];
    
    console.log(`💰 Current ${type} tokens:`, currentTokens);
    
    if (currentTokens <= 0) {
      console.log(`🚫 Insufficient ${type} tokens, showing modal`);
      setCurrentTokenType(type);
      setIsTokenModalOpen(true);
      return false;
    }

    try {
      console.log(`🔄 Consuming ${type} token for user:`, user.id);
      
      // Get the current token record (latest one)
      const { data: currentRecord, error: fetchError } = await supabase
        .from('user_tokens')
        .select('resume_tokens, cover_letter_tokens, interview_tokens, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (fetchError) {
        console.error('❌ Error fetching current tokens:', fetchError);
        throw fetchError;
      }
      
      const currentDbTokens = currentRecord[dbTokenKey];
      console.log(`🔍 Database verification - ${type} tokens:`, currentDbTokens);
      
      if (currentDbTokens <= 0) {
        console.log(`🚫 Token verification failed - insufficient tokens in database`);
        setCurrentTokenType(type);
        setIsTokenModalOpen(true);
        await fetchTokens(); // Refresh local state
        return false;
      }
      
      // Decrement token in database
      const { data: updatedRecord, error: updateError } = await supabase
        .from('user_tokens')
        .update({
          [dbTokenKey]: currentDbTokens - 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('created_at', currentRecord.created_at) // Ensure we update the correct record
        .select('resume_tokens, cover_letter_tokens, interview_tokens')
        .single();

      if (updateError) {
        console.error('❌ Error consuming token:', updateError);
        throw updateError;
      }

      console.log('✅ Token consumed successfully, new balances:', updatedRecord);

      // Update local state
      setTokens({
        resume: updatedRecord.resume_tokens,
        coverLetter: updatedRecord.cover_letter_tokens,
        interview: updatedRecord.interview_tokens
      });

      toast({
        title: "Token Used",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} token consumed. Remaining: ${updatedRecord[dbTokenKey]}`,
      });

      return true;
    } catch (error: any) {
      console.error('❌ Error using token:', error);
      toast({
        title: "Token Error",
        description: "Failed to consume token. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const addTokens = async (tokenPackage: { resume: number; coverLetter: number; interview: number }) => {
    if (!user) return;

    try {
      console.log('➕ Adding tokens for user:', user.id, tokenPackage);
      
      // Get the current record first
      const { data: currentRecord, error: fetchError } = await supabase
        .from('user_tokens')
        .select('resume_tokens, cover_letter_tokens, interview_tokens, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (fetchError) {
        console.error('❌ Error fetching current tokens for addition:', fetchError);
        throw fetchError;
      }
      
      const { data, error } = await supabase
        .from('user_tokens')
        .update({
          resume_tokens: currentRecord.resume_tokens + tokenPackage.resume,
          cover_letter_tokens: currentRecord.cover_letter_tokens + tokenPackage.coverLetter,
          interview_tokens: currentRecord.interview_tokens + tokenPackage.interview,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('created_at', currentRecord.created_at)
        .select('resume_tokens, cover_letter_tokens, interview_tokens')
        .single();

      if (error) {
        console.error('❌ Error adding tokens:', error);
        throw error;
      }

      console.log('✅ Tokens added successfully:', data);

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
      console.error('❌ Error adding tokens:', error);
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

  // Debug logging for token state
  useEffect(() => {
    console.log('🔄 Token state updated:', { tokens, loading, user: user?.id });
  }, [tokens, loading, user]);

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
