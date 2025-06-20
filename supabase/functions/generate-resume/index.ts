
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

const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_JOB_DESCRIPTION_LENGTH = 10000;
const MAX_RESUME_DATA_SIZE = 50000;

function validateInput(jobDescription: string, currentData: any): { isValid: boolean; error?: string } {
  // Validate job description
  if (!jobDescription || typeof jobDescription !== 'string') {
    return { isValid: false, error: 'Job description is required and must be a string' };
  }
  
  if (jobDescription.length > MAX_JOB_DESCRIPTION_LENGTH) {
    return { isValid: false, error: 'Job description is too long' };
  }

  // Validate current data
  if (!currentData || typeof currentData !== 'object') {
    return { isValid: false, error: 'Current resume data is required and must be an object' };
  }

  // Check data size
  const dataSize = JSON.stringify(currentData).length;
  if (dataSize > MAX_RESUME_DATA_SIZE) {
    return { isValid: false, error: 'Resume data is too large' };
  }

  // Validate structure
  if (!currentData.personalInfo || typeof currentData.personalInfo !== 'object') {
    return { isValid: false, error: 'Personal information is required' };
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

    const { jobDescription, currentData } = await req.json()

    // Validate inputs
    const validation = validateInput(jobDescription, currentData);
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
    const sanitizedJobDescription = sanitizeInput(jobDescription);

    const prompt = `
You are a professional resume writer and ATS optimization expert. 

Given this job description:
${sanitizedJobDescription}

And this current resume data:
${JSON.stringify(currentData, null, 2)}

Please:
1. Optimize the resume content to match the job description
2. Add relevant keywords for ATS optimization
3. Improve the professional summary
4. Enhance work experience descriptions with quantifiable achievements
5. Calculate an ATS compatibility score (0-100)

Return the response in this exact JSON format:
{
  "optimizedResume": {
    "personalInfo": { ... },
    "summary": "...",
    "experience": [...],
    "education": [...],
    "skills": [...]
  },
  "atsScore": 85
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
            content: 'You are a professional resume writer and ATS optimization expert. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
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
    if (!result.optimizedResume || typeof result.atsScore !== 'number') {
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
