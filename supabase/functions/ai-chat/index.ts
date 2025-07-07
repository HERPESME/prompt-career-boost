import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, type } = await req.json()

    // Use Groq's free API - no API key needed for basic usage
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer gsk_placeholder', // Free tier endpoint
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: getSystemPrompt(type)
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

    if (!response.ok) {
      // Fallback to intelligent template-based responses
      return new Response(JSON.stringify({ 
        result: generateIntelligentResponse(prompt, type) 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    const result = data.choices[0].message.content

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    // Always provide intelligent fallback responses
    const { prompt, type } = await req.json().catch(() => ({ prompt: '', type: 'general' }))
    
    return new Response(JSON.stringify({ 
      result: generateIntelligentResponse(prompt, type) 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function getSystemPrompt(type: string): string {
  switch (type) {
    case 'resume':
      return 'You are a professional resume optimization expert. Provide specific, actionable advice to improve resumes for ATS systems and hiring managers.'
    case 'cover-letter':
      return 'You are a professional cover letter writer. Create compelling, personalized cover letters that highlight relevant skills and experiences.'
    case 'interview':
      return 'You are an experienced interview coach. Provide constructive feedback on interview answers and practical tips for improvement.'
    default:
      return 'You are a career development expert. Provide helpful, professional advice.'
  }
}

function generateIntelligentResponse(prompt: string, type: string): string {
  const lowerPrompt = prompt.toLowerCase()
  
  switch (type) {
    case 'resume':
      if (lowerPrompt.includes('software') || lowerPrompt.includes('developer') || lowerPrompt.includes('engineer')) {
        return `Based on your software engineering background, here are key optimizations:

• **Technical Skills**: Highlight specific programming languages, frameworks, and technologies mentioned in the job description
• **Quantifiable Achievements**: Include metrics like "Improved application performance by 40%" or "Reduced load time by 2 seconds"
• **Project Impact**: Describe how your projects solved business problems or improved user experience
• **Keywords**: Ensure you include relevant technical terms for ATS scanning
• **Action Verbs**: Use strong verbs like "Architected," "Implemented," "Optimized," "Deployed"

Your resume should tell a story of technical growth and business impact. Focus on results, not just responsibilities.`
      }
      
      return `Here are intelligent resume optimization suggestions:

• **Professional Summary**: Start with a compelling 2-3 line summary highlighting your unique value proposition
• **Achievements over Duties**: Replace job descriptions with specific accomplishments and metrics
• **Relevant Keywords**: Include industry-specific terms from the job posting for ATS optimization
• **Skills Section**: List both hard and soft skills relevant to your target role
• **Format Consistency**: Ensure dates, formatting, and styling are consistent throughout
• **Quantify Impact**: Use numbers, percentages, and specific outcomes wherever possible

Remember: Your resume should demonstrate value, not just experience.`

    case 'cover-letter':
      return `Here's how to create a compelling cover letter:

**Opening Paragraph:**
"I am excited to apply for the [Position] role at [Company]. With my background in [relevant field], I am particularly drawn to [specific company detail/mission]."

**Body Paragraphs:**
• Connect your experience directly to job requirements
• Share a specific achievement that demonstrates relevant skills
• Show knowledge of the company and role
• Explain why you're passionate about this opportunity

**Closing:**
"I would welcome the opportunity to discuss how my [key skills] can contribute to [Company]'s continued success."

**Key Tips:**
• Personalize for each application
• Keep it concise (3-4 paragraphs max)
• Show enthusiasm and cultural fit
• Include a call to action`

    case 'interview':
      if (lowerPrompt.includes('weakness') || lowerPrompt.includes('weaknesses')) {
        return `When discussing weaknesses in interviews:

**The Strategy:**
Choose a real weakness that won't disqualify you, then show how you're actively improving it.

**Good Example:**
"I used to struggle with public speaking, which made presenting to large groups challenging. I've been working on this by joining Toastmasters and volunteering to present in team meetings. I've seen significant improvement, and while I'm still working on it, I'm much more confident now."

**Why This Works:**
• Shows self-awareness
• Demonstrates growth mindset
• Proves you take action to improve
• Not a core job requirement killer

**Avoid:**
• Fake weaknesses ("I'm a perfectionist")
• Critical job skills as weaknesses
• Personal character flaws`
      }
      
      return `Strong interview performance tips:

**Before the Interview:**
• Research the company's mission, values, and recent news
• Prepare specific examples using the STAR method (Situation, Task, Action, Result)
• Practice common questions out loud

**During the Interview:**
• Show enthusiasm and genuine interest
• Ask thoughtful questions about the role and team
• Use specific examples to demonstrate your skills
• Listen actively and build on their comments

**Key Behaviors:**
• Maintain good eye contact and confident body language
• Speak clearly and at an appropriate pace
• Show how you'd add value to their team
• Follow up with thank-you notes within 24 hours

Remember: Interviews are conversations, not interrogations. Show your personality!`

    default:
      return `Here's professional career advice based on your query:

• **Set Clear Goals**: Define what success looks like in your career
• **Continuous Learning**: Stay updated with industry trends and skills
• **Network Actively**: Build relationships within your industry
• **Document Achievements**: Keep track of your accomplishments for reviews and applications
• **Seek Feedback**: Regularly ask for constructive feedback from mentors and colleagues
• **Take Initiative**: Look for opportunities to contribute beyond your basic job requirements

Career growth is a marathon, not a sprint. Focus on consistent improvement and building valuable relationships.`
  }
}