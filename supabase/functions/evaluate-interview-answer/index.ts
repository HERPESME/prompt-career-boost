
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

const MAX_REQUEST_SIZE = 3 * 1024 * 1024; // 3MB
const MAX_TEXT_LENGTH = 2000;
const VALID_QUESTION_TYPES = ['behavioral', 'technical', 'general', 'situational'];

function validateInput(question: string, answer: string, questionType: string, position: string): { isValid: boolean; error?: string } {
  if (!question || typeof question !== 'string' || question.length > MAX_TEXT_LENGTH) {
    return { isValid: false, error: 'Question is required and must be under 2000 characters' };
  }
  
  if (!answer || typeof answer !== 'string' || answer.length > MAX_TEXT_LENGTH) {
    return { isValid: false, error: 'Answer is required and must be under 2000 characters' };
  }

  if (!questionType || !VALID_QUESTION_TYPES.includes(questionType)) {
    return { isValid: false, error: 'Question type must be one of: ' + VALID_QUESTION_TYPES.join(', ') };
  }

  if (!position || typeof position !== 'string' || position.length > 200) {
    return { isValid: false, error: 'Position is required and must be under 200 characters' };
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

    const { question, answer, questionType, position } = await req.json()

    // Validate inputs
    const validation = validateInput(question, answer, questionType, position);
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
    const sanitizedQuestion = sanitizeInput(question);
    const sanitizedAnswer = sanitizeInput(answer);
    const sanitizedPosition = sanitizeInput(position);

    const prompt = `
Evaluate this interview answer as an experienced hiring manager:

Question: ${sanitizedQuestion}
Question Type: ${questionType}
Position: ${sanitizedPosition}
Candidate's Answer: ${sanitizedAnswer}

Please provide:
1. A score from 0-100 based on:
   - Relevance to the question
   - Clarity and structure
   - Use of specific examples
   - Demonstration of skills/experience
   - Overall communication quality

2. Constructive feedback including:
   - What was done well
   - Areas for improvement
   - Suggestions for a stronger answer

Return the response in this exact JSON format:
{
  "score": 85,
  "feedback": "Detailed feedback here..."
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
            content: 'You are an experienced hiring manager and interview coach. Always respond with valid JSON and provide constructive, actionable feedback.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800,
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
    if (typeof result.score !== 'number' || !result.feedback || typeof result.feedback !== 'string') {
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
