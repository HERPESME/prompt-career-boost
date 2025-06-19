
import { useState, useEffect } from 'react';
import { useAuthUser } from './useAuthUser';

interface TokenState {
  resume: number;
  coverLetter: number;
  interview: number;
}

const INITIAL_FREE_TOKENS: TokenState = {
  resume: 3,
  coverLetter: 3,
  interview: 5
};

export const useTokens = () => {
  const { user } = useAuthUser();
  const [tokens, setTokens] = useState<TokenState>(INITIAL_FREE_TOKENS);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [currentTokenType, setCurrentTokenType] = useState<'resume' | 'cover-letter' | 'interview'>('resume');

  useEffect(() => {
    if (user) {
      // Load tokens from localStorage or API
      const savedTokens = localStorage.getItem(`tokens_${user.id}`);
      if (savedTokens) {
        setTokens(JSON.parse(savedTokens));
      } else {
        // First time user, set initial free tokens
        localStorage.setItem(`tokens_${user.id}`, JSON.stringify(INITIAL_FREE_TOKENS));
        setTokens(INITIAL_FREE_TOKENS);
      }
    }
  }, [user]);

  const useToken = (type: 'resume' | 'cover-letter' | 'interview'): boolean => {
    const tokenKey = type === 'cover-letter' ? 'coverLetter' : type;
    
    if (tokens[tokenKey as keyof TokenState] <= 0) {
      setCurrentTokenType(type);
      setIsTokenModalOpen(true);
      return false;
    }

    const newTokens = {
      ...tokens,
      [tokenKey]: tokens[tokenKey as keyof TokenState] - 1
    };
    
    setTokens(newTokens);
    
    if (user) {
      localStorage.setItem(`tokens_${user.id}`, JSON.stringify(newTokens));
    }
    
    return true;
  };

  const addTokens = (tokenPackage: { resume: number; coverLetter: number; interview: number }) => {
    const newTokens = {
      resume: tokens.resume + tokenPackage.resume,
      coverLetter: tokens.coverLetter + tokenPackage.coverLetter,
      interview: tokens.interview + tokenPackage.interview
    };
    
    setTokens(newTokens);
    
    if (user) {
      localStorage.setItem(`tokens_${user.id}`, JSON.stringify(newTokens));
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
    closeTokenModal
  };
};
