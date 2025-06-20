
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}

const MAX_REQUEST_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TEXT_LENGTH = 5000;

function validateInput(companyName: string, position: string, jobDescription: string): { isValid: boolean; error?: string } {
  if (!companyName || typeof companyName !== 'string' || companyName.length > 100) {
    return { isValid: false, error: 'Company name is required and must be under 100 characters' };
  }
  
  if (!position || typeof position !== 'string' || position.length > 100) {
    return { isValid: false, error: 'Position is required and must be under 100 characters' };
  }

  if (jobDescription && (typeof jobDescription !== 'string' || jobDescription.length > MAX_TEXT_LENGTH)) {
    return { isValid: false, error: 'Job description must be under 5000 characters' };
  }

  return { isValid: true };
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

function logSecurityEvent(event: string, details: any) {
  console.log(`[SECURITY] ${event}:`, JSON.stringify(details));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check request size
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      logSecurityEvent('REQUEST_TOO_LARGE', { contentLength });
      return new Response(JSON.stringify({ error: 'Request too large' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { companyName, position, jobDescription, resumeContent } = await req.json()

    // Validate inputs
    const validation = validateInput(companyName, position, jobDescription || '');
    if (!validation.isValid) {
      logSecurityEvent('INVALID_INPUT', { error: validation.error });
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      logSecurityEvent('MISSING_API_KEY', {});
      return new Response(JSON.stringify({ error: 'Service configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize inputs
    const sanitizedCompanyName = sanitizeInput(companyName);
    const sanitizedPosition = sanitizeInput(position);
    const sanitizedJobDescription = jobDescription ? sanitizeInput(jobDescription) : '';

    const prompt = `
Write a professional cover letter for:
- Company: ${sanitizedCompanyName}
- Position: ${sanitizedPosition}
- Job Description: ${sanitizedJobDescription || 'Not provided'}
${resumeContent ? `- Resume Content: ${JSON.stringify(resumeContent)}` : ''}

Requirements:
1. Professional tone and structure
2. Personalized for the specific company and role
3. Highlight relevant skills and experience
4. Show enthusiasm and cultural fit
5. Include specific examples and achievements
6. Keep it concise (3-4 paragraphs)

Format as a proper business letter with placeholder for candidate's contact information.
`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional career counselor and expert cover letter writer.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      logSecurityEvent('OPENAI_API_ERROR', { status: response.status, error: data.error?.message });
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const coverLetter = data.choices[0].message.content;

    if (!coverLetter || typeof coverLetter !== 'string') {
      logSecurityEvent('INVALID_RESPONSE_CONTENT', { coverLetter });
      return new Response(JSON.stringify({ error: 'Invalid response content' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ coverLetter }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    logSecurityEvent('UNHANDLED_ERROR', { error: error.message, stack: error.stack });
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
