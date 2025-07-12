
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
    console.log('AI request received:', { type, promptLength: prompt?.length })

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!geminiApiKey) {
      console.log('GEMINI_API_KEY not found, using fallback response')
      return new Response(JSON.stringify({ 
        result: generateIntelligentResponse(prompt, type) 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Use Gemini 1.5 Flash for fast, cost-effective responses
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${getSystemPrompt(type)}\n\nUser Request: ${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    })

    if (!response.ok) {
      console.log('Gemini API error, status:', response.status)
      return new Response(JSON.stringify({ 
        result: generateIntelligentResponse(prompt, type) 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    console.log('Gemini response received successfully')
    
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || generateIntelligentResponse(prompt, type)

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in ai-chat function:', error)
    
    // Always provide intelligent fallback responses
    try {
      const { prompt, type } = await req.json()
      return new Response(JSON.stringify({ 
        result: generateIntelligentResponse(prompt, type) 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (parseError) {
      return new Response(JSON.stringify({ 
        result: "I'm here to help with your career development. Please try again with your request." 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }
})

function getSystemPrompt(type: string): string {
  switch (type) {
    case 'resume':
      return `You are an expert resume optimization specialist with deep knowledge of ATS systems and hiring practices across industries. 

Your expertise includes:
- ATS optimization and keyword strategy
- Industry-specific resume formatting
- Quantifying achievements and impact
- Modern resume best practices
- Tailoring content to job descriptions

Provide specific, actionable advice with concrete examples. Focus on measurable improvements and industry standards.`

    case 'cover-letter':
      return `You are a professional cover letter writing expert with extensive experience in helping candidates land interviews.

Your expertise includes:
- Compelling opening hooks and value propositions
- Company research and personalization strategies
- Storytelling techniques for career narratives
- Industry-specific communication styles
- Call-to-action optimization

Create engaging, personalized content that connects the candidate's experience to the employer's needs.`

    case 'interview':
      return `You are an experienced interview coach and hiring manager with deep insights into interview best practices.

Your expertise includes:
- STAR method and behavioral interview techniques
- Industry-specific interview preparation
- Confidence building and presentation skills
- Handling difficult questions and scenarios
- Post-interview follow-up strategies

Provide constructive feedback with specific improvement suggestions and practical examples.`

    default:
      return `You are a career development expert and professional coach specializing in job search strategy and career advancement.

Your expertise includes:
- Career planning and goal setting
- Professional networking strategies
- Skill development and learning paths
- Industry insights and market trends
- Job search optimization

Provide strategic, actionable guidance to help advance careers and achieve professional goals.`
  }
}

function generateIntelligentResponse(prompt: string, type: string): string {
  const lowerPrompt = prompt.toLowerCase()
  
  switch (type) {
    case 'resume':
      if (lowerPrompt.includes('software') || lowerPrompt.includes('developer') || lowerPrompt.includes('engineer') || lowerPrompt.includes('tech')) {
        return `**Technical Resume Optimization Strategy:**

**🎯 ATS Optimization:**
• Include specific programming languages, frameworks, and tools from the job description
• Use exact keyword matches (e.g., "JavaScript" not "JS")
• Add technical certifications and relevant education
• Include industry-standard section headers

**📊 Quantify Your Impact:**
• "Developed web application serving 10,000+ daily users"
• "Optimized database queries, reducing load time by 40%"
• "Led team of 5 developers on $2M project"
• "Automated testing processes, saving 15 hours/week"

**🏗️ Technical Projects Section:**
• Highlight your best 3-4 projects with tech stacks
• Include GitHub links and live demos
• Focus on problem-solving and business impact
• Show progression in complexity and responsibility

**💡 Pro Tips:**
• Lead with your strongest technical achievements
• Balance technical depth with business value
• Include relevant side projects and contributions
• Tailor each application to specific tech stack requirements`
      }
      
      if (lowerPrompt.includes('marketing') || lowerPrompt.includes('sales') || lowerPrompt.includes('business')) {
        return `**Marketing/Business Resume Enhancement:**

**📈 Results-Driven Content:**
• "Increased lead generation by 150% through targeted campaigns"
• "Managed $500K annual marketing budget with 25% ROI improvement"
• "Grew social media following from 1K to 50K in 18 months"
• "Achieved 120% of quarterly sales targets for 3 consecutive quarters"

**🎯 Strategic Skills Highlighting:**
• Digital marketing tools (HubSpot, Salesforce, Google Analytics)
• Campaign management and optimization
• Data analysis and reporting
• Cross-functional collaboration
• Customer relationship management

**📊 Campaign & Project Examples:**
• Multi-channel campaign management
• Brand positioning and messaging
• Market research and competitive analysis
• Customer acquisition and retention strategies

**💼 Professional Impact:**
Focus on revenue growth, cost savings, market expansion, and team leadership achievements.`
      }
      
      return `**Universal Resume Enhancement Framework:**

**🎯 Professional Summary (3-4 lines):**
• Start with your years of experience and key expertise
• Highlight your biggest professional achievement
• Include 2-3 core skills relevant to target roles
• End with your career objective or value proposition

**📊 Achievement-Focused Experience:**
• Replace job duties with specific accomplishments
• Use action verbs: "Achieved," "Implemented," "Led," "Optimized"
• Include metrics: percentages, dollar amounts, time savings
• Show career progression and increasing responsibility

**🛠️ Skills & Keywords:**
• Include both hard and soft skills relevant to your industry
• Match keywords from job descriptions
• Organize by relevance and proficiency level
• Include certifications and professional development

**📋 Formatting Best Practices:**
• Use consistent formatting and professional fonts
• Keep to 1-2 pages depending on experience level
• Include contact information and LinkedIn profile
• Ensure ATS compatibility with standard section headers`

    case 'cover-letter':
      if (lowerPrompt.includes('tech') || lowerPrompt.includes('software') || lowerPrompt.includes('developer')) {
        return `**Technical Cover Letter Template:**

**Opening Hook:**
"As a software engineer passionate about [specific technology/field], I was excited to discover the [Position Title] role at [Company]. Your team's work on [specific project/product] aligns perfectly with my experience in [relevant technology stack]."

**Technical Value Proposition:**
• Highlight your most relevant technical achievement
• Connect your experience to their tech stack
• Show understanding of their technical challenges
• Demonstrate problem-solving approach

**Example Body Paragraph:**
"In my previous role at [Company], I developed a [specific application/system] using [technologies] that [specific impact]. This experience directly applies to your need for [job requirement], and I'm excited about the opportunity to contribute to [specific company initiative]."

**Closing with Technical Interest:**
"I'd welcome the opportunity to discuss how my experience with [specific technologies] and passion for [relevant field] can contribute to [Company]'s continued innovation."

**Tech-Specific Tips:**
• Reference their GitHub, tech blog, or recent product releases
• Mention specific technologies from the job posting
• Include links to your portfolio or relevant projects
• Show genuine interest in their technical challenges`
      }
      
      return `**Professional Cover Letter Framework:**

**🎯 Compelling Opening (2-3 sentences):**
"I am excited to apply for the [Position] role at [Company]. Your recent [specific achievement/news] caught my attention, and I believe my [X years] of experience in [relevant field] makes me an ideal candidate to contribute to [specific company goal]."

**💼 Value-Driven Body (2 paragraphs):**

*Paragraph 1: Relevant Experience*
• Connect your background directly to job requirements
• Include one specific achievement with measurable results
• Show understanding of the company's needs and challenges

*Paragraph 2: Cultural Fit & Enthusiasm*
• Demonstrate knowledge of company values/mission
• Explain why you're specifically interested in this role
• Highlight unique qualifications or perspectives you bring

**🎯 Strong Closing:**
"I would welcome the opportunity to discuss how my experience in [specific area] and passion for [relevant field] can help [Company] achieve [specific goal]. Thank you for your consideration."

**📋 Essential Elements:**
• Personalize for each company and role
• Keep concise (3-4 paragraphs maximum)
• Include specific examples and achievements
• Show genuine enthusiasm and cultural fit
• Professional tone with personality showing through`

    case 'interview':
      if (lowerPrompt.includes('weakness') || lowerPrompt.includes('weaknesses')) {
        return `**Mastering the "Weakness" Question:**

**🎯 The Strategic Framework:**
1. Choose a real weakness that won't disqualify you
2. Show self-awareness and commitment to improvement
3. Demonstrate concrete steps you've taken
4. Highlight positive outcomes from your growth

**💪 Strong Example Response:**
"Early in my career, I struggled with delegation because I wanted to ensure everything met my high standards. This led to burnout and bottlenecks for my team.

I realized this wasn't sustainable, so I:
• Developed clear project briefs and success criteria
• Implemented regular check-ins rather than micromanaging
• Invested time in training team members on my standards
• Learned to focus on outcomes rather than process

Now I successfully manage larger projects while developing my team's capabilities. Last quarter, my team exceeded our goals by 15% while I maintained work-life balance."

**🚫 Avoid These Mistakes:**
• Fake weaknesses ("I'm too much of a perfectionist")
• Weaknesses crucial to the role
• Not showing improvement efforts
• Being too negative or oversharing

**✅ Good Weakness Categories:**
• Process improvements (delegation, time management)
• Communication styles (public speaking, feedback delivery)
• Technical skills you're actively developing
• Leadership areas you're growing into`
      }
      
      if (lowerPrompt.includes('tell me about yourself') || lowerPrompt.includes('introduce yourself')) {
        return `**"Tell Me About Yourself" - The Perfect Framework:**

**🎯 The 3-Part Structure (2-3 minutes):**

**1. Present (30-45 seconds):**
"I'm currently a [current role] at [company] where I [key responsibility/achievement]. In this role, I've [1-2 specific accomplishments with metrics]."

**2. Past (45-60 seconds):**
"My background includes [X years] of experience in [relevant field/industry]. Previously at [previous company], I [major accomplishment that's relevant to this role]. This experience taught me [relevant skill/lesson]."

**3. Future (30-45 seconds):**
"I'm excited about this opportunity because [specific reason related to the role/company]. I'm particularly drawn to [specific aspect of the job/company mission], and I believe my experience in [relevant area] would allow me to contribute to [specific goal/project]."

**💡 Pro Tips:**
• Practice until it flows naturally (not memorized)
• Tailor the content to each specific role
• Include metrics and specific achievements
• Connect your story to their needs
• End with enthusiasm for the opportunity
• Keep it professional but let personality show

**🎯 Example for Software Engineer:**
"I'm currently a Senior Software Engineer at TechCorp, where I lead the development of our customer-facing web platform serving over 100,000 users. I've increased system performance by 40% and reduced deployment time from hours to minutes.

Before this, I spent three years at StartupXYZ building their core product from scratch using React and Node.js. We grew from MVP to $1M ARR, and I learned the importance of scalable architecture and user-focused development.

I'm excited about this role because of your focus on innovative fintech solutions. Your recent work on mobile payments aligns perfectly with my passion for creating seamless user experiences, and I'd love to contribute to your next-generation platform."

Remember: This is your elevator pitch - make it compelling, relevant, and memorable!`
      }
      
      return `**Interview Excellence Masterclass:**

**🔥 Pre-Interview Preparation:**
• Research company mission, recent news, competitors, and culture
• Prepare 5-7 STAR method examples covering different competencies
• Practice answers aloud (record yourself if possible)
• Prepare 3-5 thoughtful questions about the role and company
• Plan your route and outfit in advance

**💬 During the Interview - Key Strategies:**

**Active Engagement:**
• Maintain confident eye contact and positive body language
• Listen actively and ask clarifying questions
• Build on interviewer's comments and show genuine interest
• Use the interviewer's name occasionally

**Answer Structure (STAR Method):**
• **Situation:** Set the context briefly
• **Task:** Explain your responsibility
• **Action:** Detail what you did (focus here)
• **Result:** Share measurable outcomes

**📊 Powerful Closing Questions:**
• "What does success look like in this role after 6 months?"
• "What are the biggest challenges facing the team right now?"
• "How does this role contribute to the company's strategic goals?"
• "What do you enjoy most about working here?"

**🎯 Post-Interview Follow-up:**
• Send personalized thank-you emails within 24 hours
• Reference specific conversation points
• Reiterate your interest and key qualifications
• Include any additional information you forgot to mention

**⚡ Confidence Boosters:**
• Arrive 10-15 minutes early
• Bring extra copies of your resume
• Take notes during the interview
• Smile and show enthusiasm
• Remember: they want you to succeed!`

    default:
      return `**Strategic Career Development Roadmap:**

**🎯 Career Planning Framework:**

**Phase 1: Self-Assessment (Month 1)**
• Identify your core strengths and transferable skills
• Define your values and non-negotiables
• Assess current market value and skill gaps
• Set 1-year and 5-year career objectives

**Phase 2: Market Research (Month 2)**
• Research target industries and companies
• Analyze job market trends and salary ranges
• Identify key decision-makers and influencers
• Map out ideal career trajectory and required skills

**Phase 3: Strategic Positioning (Months 3-4)**
• Optimize LinkedIn profile and professional brand
• Update resume and portfolio for target roles
• Begin strategic networking in target industry
• Start addressing identified skill gaps

**📈 Ongoing Professional Development:**
• Dedicate 5-10 hours weekly to skill development
• Attend industry events and join professional associations
• Seek mentorship and reverse mentoring opportunities
• Document achievements and maintain success portfolio

**🤝 Strategic Networking:**
• Aim for 2-3 meaningful professional connections monthly
• Engage authentically on professional platforms
• Offer value before asking for favors
• Maintain relationships with regular check-ins

**💡 Career Advancement Tips:**
• Volunteer for high-visibility projects
• Develop both technical and leadership skills
• Build cross-functional relationships
• Stay informed about industry trends and innovations
• Consider lateral moves for broader experience

Remember: Career development is a marathon, not a sprint. Focus on consistent progress and building valuable relationships along the way.`
  }
}
