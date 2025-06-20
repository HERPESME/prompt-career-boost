
export const SecurityUtils = {
  // Input validation
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 100;
  },

  validateText: (text: string, maxLength: number = 1000): boolean => {
    return typeof text === 'string' && text.length <= maxLength;
  },

  // Input sanitization
  sanitizeInput: (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  },

  sanitizeHtml: (html: string): string => {
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
               .replace(/<[^>]*>/g, '');
  },

  // Rate limiting helpers
  createRateLimiter: (maxRequests: number, windowMs: number) => {
    const requests = new Map();

    return (key: string): boolean => {
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean old entries
      for (const [reqKey, timestamps] of requests.entries()) {
        const filtered = timestamps.filter((t: number) => t > windowStart);
        if (filtered.length === 0) {
          requests.delete(reqKey);
        } else {
          requests.set(reqKey, filtered);
        }
      }

      // Check current key
      const userRequests = requests.get(key) || [];
      const recentRequests = userRequests.filter((t: number) => t > windowStart);

      if (recentRequests.length >= maxRequests) {
        return false; // Rate limited
      }

      // Add current request
      recentRequests.push(now);
      requests.set(key, recentRequests);
      return true; // Allowed
    };
  },

  // Content Security helpers
  isValidJsonStructure: (obj: any, requiredFields: string[]): boolean => {
    if (!obj || typeof obj !== 'object') return false;
    return requiredFields.every(field => obj.hasOwnProperty(field));
  },

  // Password strength validation
  validatePasswordStrength: (password: string): { score: number; feedback: string[]; isValid: boolean } => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push("At least 8 characters");
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One uppercase letter");
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One lowercase letter");
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push("One number");
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One special character");
    }

    return {
      score,
      feedback,
      isValid: score >= 4
    };
  }
};
