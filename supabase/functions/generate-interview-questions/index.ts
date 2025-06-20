
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

const MAX_REQUEST_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_TEXT_LENGTH = 200;
const VALID_INTERVIEW_TYPES = ['behavioral', 'technical', 'general', 'situational'];

function validateInput(position: string, companyName: string, interviewType: string): { isValid: boolean; error?: string } {
  if (!position || typeof position !== 'string' || position.length > MAX_TEXT_LENGTH) {
    return { isValid: false, error: 'Position is required and must be under 200 characters' };
  }
  
  if (companyName && (typeof companyName !== 'string' || companyName.length > MAX_TEXT_LENGTH)) {
    return { isValid: false, error: 'Company name must be under 200 characters' };
  }

  if (!interviewType || !VALID_INTERVIEW_TYPES.includes(interviewType)) {
    return { isValid: false, error: 'Interview type must be one of: ' + VALID_INTERVIEW_TYPES.join(', ') };
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

    const { position, companyName, interviewType } = await req.json()

    // Validate inputs
    const validation = validateInput(position, companyName || '', interviewType);
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
    const sanitizedPosition = sanitizeInput(position);
    const sanitizedCompanyName = companyName ? sanitizeInput(companyName) : '';

    const prompt = `
Generate 5-7 ${interviewType} interview questions for a ${sanitizedPosition} position${sanitizedCompanyName ? ` at ${sanitizedCompanyName}` : ''}.

Requirements:
1. Questions should be realistic and commonly asked
2. Vary difficulty levels (easy, medium, hard)
3. Include different question types within the interview category
4. Make questions specific to the role and industry

Return the response in this exact JSON format:
{
  "questions": [
    {
      "id": "1",
      "question": "Question text here",
      "type": "${interviewType}",
      "difficulty": "medium"
    }
  ]
}
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
            content: 'You are an experienced hiring manager and interview coach. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1500,
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

    let result;
    try {
      result = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      logSecurityEvent('JSON_PARSE_ERROR', { error: parseError.message });
      return new Response(JSON.stringify({ error: 'Invalid response format' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate response structure
    if (!result.questions || !Array.isArray(result.questions)) {
      logSecurityEvent('INVALID_RESPONSE_STRUCTURE', { result });
      return new Response(JSON.stringify({ error: 'Invalid response structure' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result), {
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
