
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

    // Get Gemini API key from Supabase secrets (secure)
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!geminiApiKey) {
      console.log('GEMINI_API_KEY not found, using fallback response')
      return new Response(JSON.stringify({ 
        result: generateIntelligentResponse(prompt, type) 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Use Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${getSystemPrompt(type)}\n\nUser Query: ${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    })

    if (!response.ok) {
      console.log('Gemini API error, using fallback response')
      return new Response(JSON.stringify({ 
        result: generateIntelligentResponse(prompt, type) 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || generateIntelligentResponse(prompt, type)

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in ai-chat function:', error)
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
      return 'You are a professional resume optimization expert. Provide specific, actionable advice to improve resumes for ATS systems and hiring managers. Focus on keywords, formatting, and quantifiable achievements.'
    case 'cover-letter':
      return 'You are a professional cover letter writer. Create compelling, personalized cover letters that highlight relevant skills and experiences for the specific job and company.'
    case 'interview':
      return 'You are an experienced interview coach. Provide constructive feedback on interview answers, suggest improvements, and offer practical tips for better performance.'
    default:
      return 'You are a career development expert. Provide helpful, professional advice for career growth and job search strategies.'
  }
}

function generateIntelligentResponse(prompt: string, type: string): string {
  const lowerPrompt = prompt.toLowerCase()
  
  switch (type) {
    case 'resume':
      if (lowerPrompt.includes('software') || lowerPrompt.includes('developer') || lowerPrompt.includes('engineer')) {
        return `**Resume Optimization for Software Engineering:**

• **Technical Skills Section**: List programming languages, frameworks, and tools prominently
• **Quantified Achievements**: Include metrics like "Improved app performance by 40%" or "Reduced load time by 2 seconds"
• **Project Impact**: Describe how your code solved business problems or improved user experience
• **ATS Keywords**: Include specific technologies mentioned in job descriptions
• **Action Verbs**: Use "Architected," "Implemented," "Optimized," "Deployed," "Collaborated"

**Key Tips:**
- Lead with your strongest technical accomplishments
- Show progression in complexity and responsibility
- Include relevant side projects or open-source contributions
- Keep technical jargon balanced with business impact`
      }
      
      return `**Professional Resume Enhancement:**

• **Summary Statement**: Create a compelling 2-3 line professional summary
• **Achievement-Focused**: Replace job duties with specific accomplishments and metrics
• **Keyword Optimization**: Include industry-relevant terms for ATS systems
• **Skills Balance**: Combine hard skills with relevant soft skills
• **Consistent Formatting**: Ensure uniform dates, fonts, and bullet points
• **Quantify Results**: Use numbers, percentages, and concrete outcomes

**Remember**: Your resume should demonstrate value and impact, not just experience.`

    case 'cover-letter':
      return `**Compelling Cover Letter Structure:**

**Opening (Hook):**
"I am excited to apply for the [Position] at [Company]. Your recent [specific company achievement/mission] aligns perfectly with my experience in [relevant field]."

**Body (Value Proposition):**
• Connect your specific achievements to job requirements
• Share a concrete example demonstrating relevant skills
• Show genuine knowledge of the company and role
• Explain your unique value and enthusiasm

**Closing (Call to Action):**
"I would welcome the opportunity to discuss how my [specific skills] can contribute to [Company]'s [specific goal/project]."

**Essential Elements:**
• Personalize for each application
• Keep concise (3-4 paragraphs maximum)
• Show cultural fit and genuine interest
• Include specific examples and achievements`

    case 'interview':
      if (lowerPrompt.includes('weakness') || lowerPrompt.includes('weaknesses')) {
        return `**Addressing Weaknesses Strategically:**

**The Framework:**
Choose a real weakness that won't disqualify you, then demonstrate active improvement.

**Strong Example:**
"Earlier in my career, I struggled with delegating tasks because I wanted to ensure quality. This led to burnout and missed deadlines. I've since learned to:
- Set clear expectations and deadlines
- Provide detailed briefs and check-in points  
- Trust team members' capabilities
- Focus on coaching rather than micromanaging

Now I can manage larger projects more effectively while developing my team."

**Why This Works:**
• Shows self-awareness and growth mindset
• Demonstrates concrete steps taken
• Proves positive outcomes
• Turns weakness into leadership strength`
      }
      
      return `**Interview Excellence Strategy:**

**Pre-Interview Preparation:**
• Research company mission, values, recent news, and competitors
• Prepare STAR method examples (Situation, Task, Action, Result)
• Practice answers aloud, especially for common questions
• Prepare thoughtful questions about role, team, and company culture

**During the Interview:**
• Show genuine enthusiasm and curiosity
• Use specific examples to demonstrate skills and achievements
• Listen actively and build on interviewer's comments
• Ask insightful questions that show strategic thinking

**Key Success Behaviors:**
• Maintain confident body language and eye contact
• Speak clearly and at appropriate pace
• Connect your experience to their specific needs
• Show how you'll add immediate and long-term value

**Follow-Up:**
Send personalized thank-you notes within 24 hours, referencing specific conversation points.`

    default:
      return `**Strategic Career Development:**

• **Goal Setting**: Define clear short-term (1 year) and long-term (3-5 year) career objectives
• **Skill Development**: Identify and develop both technical and soft skills relevant to your field
• **Strategic Networking**: Build authentic relationships within your industry and target companies
• **Achievement Documentation**: Maintain a record of accomplishments for performance reviews and applications
• **Feedback Integration**: Regularly seek constructive feedback and act on improvement areas
• **Proactive Contribution**: Look for opportunities to add value beyond basic job requirements

**Growth Mindset**: Focus on consistent improvement, learning from setbacks, and building valuable professional relationships.`
  }
}
