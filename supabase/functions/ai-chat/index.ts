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
    console.log('🤖 AI request received:', { 
      type, 
      promptLength: prompt?.length,
      timestamp: new Date().toISOString(),
      hasPrompt: !!prompt
    })

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!geminiApiKey) {
      console.log('⚠️ GEMINI_API_KEY not found, using fallback response')
      return new Response(JSON.stringify({ 
        result: generateIntelligentResponse(prompt, type) 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('🔑 Gemini API key found, making request to Gemini API')

    // Use Gemini 1.5 Flash for fast, cost-effective responses
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`
    
    const requestBody = {
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
    }

    console.log('📡 Making request to Gemini API...')
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    console.log('📨 Gemini API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Gemini API error:', response.status, errorText)
      return new Response(JSON.stringify({ 
        result: generateIntelligentResponse(prompt, type) 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    console.log('✅ Gemini response received:', {
      hasCandidates: !!data.candidates,
      candidatesLength: data.candidates?.length || 0,
      timestamp: new Date().toISOString()
    })
    
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || generateIntelligentResponse(prompt, type)
    
    console.log('📤 Returning AI response:', {
      resultLength: result.length,
      isFromGemini: !!data.candidates?.[0]?.content?.parts?.[0]?.text,
      timestamp: new Date().toISOString()
    })

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('❌ Error in ai-chat function:', error)
    
    // Always provide intelligent fallback responses
    try {
      const { prompt, type } = await req.json()
      return new Response(JSON.stringify({ 
        result: generateIntelligentResponse(prompt, type) 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (parseError) {
      console.error('❌ Parse error in fallback:', parseError)
      return new Response(JSON.stringify({ 
        result: "I'm here to help with your career development. Please try again with your request." 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }
})

// Enhanced prompt engineering with context awareness and structured output
function getSystemPrompt(type: string, context?: any): string {
  const baseContext = `You are a world-class AI career coach with 15+ years of experience helping professionals across all industries and experience levels.

CORE PRINCIPLES:
1. Provide specific, actionable advice (not generic platitudes)
2. Use concrete examples and data-driven insights
3. Tailor responses to user's industry, experience level, and goals
4. Focus on measurable outcomes and success metrics
5. Maintain professional yet approachable tone

`;

  switch (type) {
    case 'resume':
      return baseContext + `SPECIALIZED ROLE: Elite Resume Optimization Specialist

EXPERTISE AREAS:
• ATS (Applicant Tracking System) Optimization
  - Keyword density and placement strategies
  - ATS-friendly formatting (avoiding tables, graphics, headers/footers)
  - Section header standardization
  - File format optimization (PDF vs DOCX)

• Achievement Quantification Framework
  - CAR Method (Challenge-Action-Result)
  - STAR Method (Situation-Task-Action-Result)
  - XYZ Formula (Accomplished X by doing Y, resulting in Z)
  - Metric identification (revenue, efficiency, scale, impact)

• Industry-Specific Optimization
  - Tech: Focus on tech stack, scalability, system design
  - Finance: Emphasize compliance, risk management, ROI
  - Marketing: Highlight campaigns, conversion rates, growth metrics
  - Healthcare: Stress patient outcomes, compliance, certifications
  - Sales: Showcase quota attainment, pipeline management, revenue

• Modern Resume Best Practices (2024-2025)
  - Hybrid chronological-functional format
  - Skills-based keywords above the fold
  - LinkedIn URL optimization
  - Portfolio/GitHub integration for technical roles
  - Removing outdated elements (objective statements, references)

RESPONSE STRUCTURE:
1. Quick Assessment: Identify 2-3 immediate improvements
2. Detailed Analysis: Break down each section with specific suggestions
3. ATS Score Prediction: Estimate compatibility (0-100)
4. Priority Actions: Rank improvements by impact
5. Industry Benchmarks: Compare to top performers in the field

CONTEXT AWARENESS:
${context?.experienceLevel ? `- Experience Level: ${context.experienceLevel}` : ''}
${context?.industry ? `- Target Industry: ${context.industry}` : ''}
${context?.targetRole ? `- Target Role: ${context.targetRole}` : ''}
${context?.currentRole ? `- Current Role: ${context.currentRole}` : ''}

OUTPUT FORMAT: Provide structured, scannable advice using:
- ✅ Do's and ❌ Don'ts
- 📊 Metrics and benchmarks
- 💡 Pro tips and insider insights
- 🎯 Specific examples for their industry`;

    case 'cover-letter':
      return baseContext + `SPECIALIZED ROLE: Master Cover Letter Strategist

EXPERTISE AREAS:
• Psychological Hooks & Engagement
  - Pattern interrupts (unconventional openings)
  - Storytelling frameworks (Hero's Journey, Problem-Solution)
  - Emotional resonance techniques
  - Curiosity gaps and compelling questions

• Company Research Integration
  - Recent news, funding rounds, product launches
  - Company culture and values alignment
  - Pain points and challenges (from job description)
  - Competitive positioning and market trends

• Personalization Strategies
  - Hiring manager research (LinkedIn, company blog)
  - Department-specific challenges
  - Role-specific value propositions
  - Cultural fit demonstration

• Tone Calibration
  - Formal: Traditional industries (law, finance, government)
  - Professional-Friendly: Corporate (tech, consulting, healthcare)
  - Enthusiastic: Startups, creative agencies, nonprofits
  - Creative: Marketing, design, media, entertainment

• Structure Optimization
  - Opening Hook (2-3 sentences): Grab attention immediately
  - Value Proposition (1 paragraph): Why you're uniquely qualified
  - Proof Points (1-2 paragraphs): Specific achievements with metrics
  - Cultural Fit (1 paragraph): Alignment with company mission/values
  - Call-to-Action (2-3 sentences): Clear next steps, enthusiasm

ADVANCED TECHNIQUES:
• The "T-Method": Match job requirements to your qualifications in table format
• The "Story Arc": Use narrative structure to make your case memorable
• The "Research Drop": Mention specific company initiatives to show genuine interest
• The "Mutual Connection": Reference shared connections or experiences

CONTEXT AWARENESS:
${context?.companyName ? `- Target Company: ${context.companyName}` : ''}
${context?.jobTitle ? `- Job Title: ${context.jobTitle}` : ''}
${context?.industry ? `- Industry: ${context.industry}` : ''}
${context?.tone ? `- Preferred Tone: ${context.tone}` : ''}

OUTPUT FORMAT: Provide:
1. Opening Hook Options (3 variations)
2. Complete Cover Letter Draft
3. Tone Analysis & Recommendations
4. Personalization Opportunities
5. Final Polish Checklist`;

    case 'interview':
      return baseContext + `SPECIALIZED ROLE: Elite Interview Performance Coach

EXPERTISE AREAS:
• STAR Method Mastery
  - Situation: Set context concisely (10-15 seconds)
  - Task: Define your responsibility clearly
  - Action: Detail YOUR specific actions (60-70% of answer)
  - Result: Quantify outcomes with metrics

• Behavioral Interview Techniques
  - Competency-based question patterns
  - Leadership principles (Amazon's 16, Google's, etc.)
  - Conflict resolution frameworks
  - Team collaboration scenarios
  - Failure/learning questions

• Technical Interview Prep
  - System design communication
  - Problem-solving verbalization
  - Trade-off analysis articulation
  - Complexity analysis explanation

• Industry-Specific Question Banks
  - Tech: System design, coding, architecture, scalability
  - Consulting: Case interviews, market sizing, frameworks
  - Finance: Valuation, market knowledge, risk assessment
  - Product: Product sense, prioritization, metrics, strategy
  - Sales: Objection handling, closing techniques, pipeline management

• Answer Quality Scoring (0-100)
  - Structure: Clear STAR format (25 points)
  - Specificity: Concrete details, not generalities (25 points)
  - Impact: Quantified results and outcomes (25 points)
  - Relevance: Alignment with job requirements (25 points)

• Non-Verbal Communication
  - Eye contact and body language
  - Vocal variety and pacing
  - Confidence projection
  - Active listening cues

• Advanced Strategies
  - The "Callback": Reference earlier conversation points
  - The "Reversal": Turn weaknesses into strengths
  - The "Future-Pacing": Show how past success predicts future performance
  - The "Humble Brag": Showcase achievements without arrogance

FEEDBACK FRAMEWORK:
For each answer, provide:
1. Overall Score (0-100) with breakdown
2. What Worked Well (2-3 specific strengths)
3. Areas for Improvement (2-3 specific weaknesses)
4. Optimized Answer Example
5. Follow-up Question Preparation

CONTEXT AWARENESS:
${context?.interviewType ? `- Interview Type: ${context.interviewType}` : ''}
${context?.role ? `- Target Role: ${context.role}` : ''}
${context?.industry ? `- Industry: ${context.industry}` : ''}
${context?.experienceLevel ? `- Experience Level: ${context.experienceLevel}` : ''}

OUTPUT FORMAT: Provide structured feedback using:
- 🎯 Score Breakdown
- ✅ Strengths
- 🔧 Improvements
- 💎 Optimized Version
- 🚀 Pro Tips`;

    default:
      return baseContext + `SPECIALIZED ROLE: Strategic Career Development Advisor

EXPERTISE AREAS:
• Career Planning & Goal Setting
  - SMART goal framework
  - 1-year, 3-year, 5-year planning
  - Skills gap analysis
  - Career pivot strategies

• Professional Networking
  - LinkedIn optimization
  - Informational interview techniques
  - Conference and event strategies
  - Mentor relationship building

• Skill Development Roadmaps
  - Technical skills prioritization
  - Soft skills enhancement
  - Certification value analysis
  - Learning resource recommendations

• Industry Insights & Trends
  - Emerging roles and opportunities
  - Market demand analysis
  - Salary benchmarking
  - Future-proof career paths

• Job Search Optimization
  - Application tracking systems
  - Recruiter engagement strategies
  - Offer negotiation tactics
  - Multiple offer evaluation

OUTPUT FORMAT: Provide actionable, prioritized guidance with:
- 📋 Action Items
- 📈 Success Metrics
- ⏱️ Timeline Recommendations
- 🎓 Learning Resources`;
  }
}

// Enhanced intelligent fallback responses with context awareness
function generateIntelligentResponse(prompt: string, type: string): string {
  const lowerPrompt = prompt.toLowerCase()
  
  switch (type) {
    case 'resume':
      // Detect industry from prompt
      if (lowerPrompt.includes('software') || lowerPrompt.includes('developer') || lowerPrompt.includes('engineer') || lowerPrompt.includes('tech') || lowerPrompt.includes('programming')) {
        return `**🎯 Technical Resume Optimization Strategy**

**IMMEDIATE ACTIONS (High Impact):**

✅ **ATS Optimization Checklist:**
• Use exact technology names from job description (e.g., "JavaScript" not "JS", "React.js" not "React")
• Include version numbers for frameworks (React 18, Node.js 16+, Python 3.10)
• Add technical keywords in Skills section AND within experience descriptions
• Use standard section headers: "Professional Experience", "Technical Skills", "Education"
• Save as PDF with text layer (not scanned image)

📊 **Quantification Framework - XYZ Method:**
Instead of: "Developed web applications"
Write: "Developed 5 full-stack web applications using React and Node.js, serving 50K+ daily active users with 99.9% uptime"

**Examples by Experience Level:**

*Junior (0-2 years):*
• "Built RESTful API with Express.js, reducing response time by 40% through query optimization"
• "Implemented responsive UI components using React Hooks, improving mobile user engagement by 25%"

*Mid-Level (3-5 years):*
• "Architected microservices infrastructure on AWS, reducing deployment time from 2 hours to 15 minutes"
• "Led team of 3 developers to deliver $500K project 2 weeks ahead of schedule"

*Senior (6+ years):*
• "Designed scalable system architecture supporting 10M+ requests/day with <100ms latency"
• "Mentored 8 junior engineers, with 75% receiving promotions within 18 months"

**🏗️ Technical Projects Section:**
Include your top 3-4 projects with:
1. **Project Name** | Tech Stack | [GitHub] [Live Demo]
2. One-line description of problem solved
3. Key technical achievements with metrics
4. Technologies used (be specific)

Example:
**E-Commerce Platform** | React, Node.js, PostgreSQL, AWS | [GitHub] [Demo]
• Built full-stack marketplace handling $100K+ monthly transactions
• Implemented payment processing with Stripe, reducing checkout abandonment by 30%
• Optimized database queries, improving page load speed by 60%

**💡 Tech-Specific Pro Tips:**
• **Frontend:** Highlight performance metrics (Lighthouse scores, Core Web Vitals)
• **Backend:** Emphasize scalability, reliability, and system design decisions
• **DevOps:** Showcase automation, CI/CD pipelines, infrastructure as code
• **Data:** Focus on data pipeline efficiency, model accuracy, business impact

**❌ Common Mistakes to Avoid:**
• Listing technologies without context or proficiency level
• Using buzzwords without demonstrating actual usage
• Ignoring soft skills (communication, collaboration, leadership)
• Outdated technologies (Flash, jQuery for new projects, etc.)

**🎯 ATS Score Prediction: 75-85%**
To reach 90%+:
1. Add 5-7 more job-specific keywords
2. Quantify at least 80% of achievements
3. Include relevant certifications (AWS, Azure, Google Cloud)
4. Add portfolio/GitHub links with active projects`
      }
      
      if (lowerPrompt.includes('marketing') || lowerPrompt.includes('sales') || lowerPrompt.includes('business') || lowerPrompt.includes('manager')) {
        return `**📈 Marketing/Business Resume Enhancement Strategy**

**IMMEDIATE IMPACT IMPROVEMENTS:**

✅ **Results-Driven Content Framework:**
Every bullet point should follow this structure:
**Action Verb** + **What You Did** + **Measurable Result**

**Power Examples:**

*Marketing:*
• "Launched multi-channel campaign across email, social, and PPC, generating 2,500 qualified leads and $1.2M in pipeline"
• "Increased organic traffic by 250% (10K to 35K monthly visitors) through SEO optimization and content strategy"
• "Managed $800K annual marketing budget, achieving 180% ROI through data-driven optimization"
• "Grew Instagram following from 5K to 75K in 12 months, with 8% average engagement rate"

*Sales:*
• "Exceeded quarterly quota by 135% for 6 consecutive quarters, generating $3.2M in new revenue"
• "Built and managed pipeline of 150+ enterprise accounts, closing 45 deals worth $5M annually"
• "Reduced sales cycle from 90 to 45 days through process optimization and CRM automation"
• "Achieved 92% customer retention rate through strategic account management and upselling"

*Business/Product Management:*
• "Led cross-functional team of 12 to launch product feature, resulting in 40% increase in user engagement"
• "Conducted market research and competitive analysis, identifying $10M revenue opportunity"
• "Optimized pricing strategy, increasing average deal size by 28% without impacting conversion"
• "Managed product roadmap for SaaS platform with 50K+ users and $5M ARR"

**🎯 Strategic Skills Highlighting:**

*Digital Marketing Tools:*
• Analytics: Google Analytics, Mixpanel, Amplitude, Tableau
• Marketing Automation: HubSpot, Marketo, Salesforce Marketing Cloud
• SEO/SEM: SEMrush, Ahrefs, Google Ads, Bing Ads
• Social Media: Hootsuite, Sprout Social, Buffer
• Email: Mailchimp, SendGrid, Constant Contact
• CRM: Salesforce, HubSpot, Pipedrive

*Key Competencies:*
• Campaign Strategy & Execution
• Data Analysis & Reporting
• Budget Management
• A/B Testing & Optimization
• Customer Segmentation
• Content Marketing
• Brand Management
• Lead Generation & Nurturing

**📊 Metrics That Matter:**
• Revenue generated or influenced
• Lead volume and quality (MQL, SQL conversion rates)
• ROI and ROAS (Return on Ad Spend)
• Customer acquisition cost (CAC)
• Lifetime value (LTV)
• Conversion rates at each funnel stage
• Market share growth
• Brand awareness metrics

**💼 Professional Impact Showcase:**
Group achievements by business impact:

*Revenue Growth:*
• Direct revenue attribution
• Pipeline generation
• Deal size increases

*Efficiency Gains:*
• Cost reductions
• Process improvements
• Time savings

*Market Expansion:*
• New market entry
• Customer base growth
• Geographic expansion

**🎯 ATS Score Prediction: 70-80%**
To reach 90%+:
1. Add industry-specific certifications (Google Ads, HubSpot, Salesforce)
2. Include more quantified achievements (aim for 90%+ of bullets)
3. Add relevant keywords from job description
4. Showcase both strategic and tactical skills`
      }
      
      return `**📋 Universal Resume Enhancement Framework**

**🎯 PROFESSIONAL SUMMARY (Top of Resume - Critical!):**

This is your 30-second pitch. Structure:
[Years of Experience] + [Key Expertise] + [Biggest Achievement] + [Value Proposition]

**Examples by Level:**

*Entry-Level:*
"Recent [Degree] graduate with hands-on experience in [Field] through internships and projects. Skilled in [3-4 key skills]. Passionate about [industry/role] and eager to contribute to [type of company/mission]."

*Mid-Level:*
"Results-driven [Job Title] with 5+ years of experience in [Industry]. Proven track record of [key achievement with metric]. Expert in [core skills]. Seeking to leverage expertise in [specific area] to drive [business outcome] at [type of company]."

*Senior-Level:*
"Strategic [Job Title] with 10+ years leading [function/teams] in [industry]. Delivered [major achievement] resulting in [business impact]. Specialized in [expertise areas]. Known for [unique value proposition]."

**📊 ACHIEVEMENT-FOCUSED EXPERIENCE:**

**The CAR Method:**
• **Challenge:** What problem existed?
• **Action:** What did YOU specifically do?
• **Result:** What measurable outcome occurred?

**Before vs. After Examples:**

❌ Before: "Responsible for managing team projects"
✅ After: "Led team of 8 to complete 15 projects on time and under budget, improving client satisfaction scores by 35%"

❌ Before: "Improved company processes"
✅ After: "Streamlined onboarding process, reducing time-to-productivity from 6 weeks to 3 weeks and saving $50K annually"

❌ Before: "Worked with customers"
✅ After: "Managed portfolio of 50+ enterprise clients worth $2M ARR, achieving 95% retention rate"

**🛠️ SKILLS & KEYWORDS:**

**Organization Strategy:**
1. **Technical Skills:** Software, tools, platforms
2. **Core Competencies:** Industry-specific expertise
3. **Soft Skills:** Leadership, communication, problem-solving
4. **Certifications:** Professional credentials

**Proficiency Levels (Optional but Helpful):**
• Expert: 5+ years, can teach others
• Advanced: 3-5 years, independent work
• Intermediate: 1-3 years, some guidance needed
• Familiar: <1 year, basic knowledge

**📋 FORMATTING BEST PRACTICES:**

✅ **Do:**
• Use 10-12pt professional fonts (Calibri, Arial, Garamond)
• Maintain consistent formatting throughout
• Use bullet points for easy scanning
• Include white space for readability
• Keep to 1 page (0-5 years) or 2 pages (6+ years)
• Use standard section headers
• Include LinkedIn URL and portfolio (if applicable)

❌ **Don't:**
• Use tables, text boxes, or graphics (ATS can't read them)
• Include photos (unless required in your country)
• Use headers/footers for important info
• List references or "References available upon request"
• Include outdated or irrelevant experience
• Use personal pronouns (I, me, my)

**🎯 KEYWORD OPTIMIZATION:**

1. **Extract from Job Description:**
   • Required skills and qualifications
   • Preferred technologies or methodologies
   • Industry-specific terminology
   • Soft skills mentioned

2. **Strategic Placement:**
   • Skills section (exact matches)
   • Experience descriptions (natural integration)
   • Professional summary (top keywords)
   • Education/Certifications (relevant credentials)

3. **Density Balance:**
   • Include keywords 2-3 times throughout resume
   • Use variations (e.g., "Project Management" and "Managed Projects")
   • Don't keyword stuff - maintain readability

**🎯 ATS Score Prediction: 65-75%**
To reach 90%+:
1. Quantify 80%+ of achievements with specific metrics
2. Add 10-15 job-specific keywords from target job description
3. Include relevant certifications or professional development
4. Ensure consistent formatting and standard section headers
5. Add LinkedIn profile and professional portfolio/website`

    case 'cover-letter':
      if (lowerPrompt.includes('tech') || lowerPrompt.includes('software') || lowerPrompt.includes('developer') || lowerPrompt.includes('engineer')) {
        return `**💻 Technical Cover Letter Framework**

**🎯 OPENING HOOK (Choose Your Style):**

*Option 1 - Technical Achievement:*
"When I reduced API response time by 75% at [Current Company], I realized the impact that thoughtful system design can have on user experience. This is why I'm excited about the [Position] role at [Company] - your focus on building scalable, performant systems aligns perfectly with my passion for optimization."

*Option 2 - Company-Specific:*
"I've been following [Company]'s engineering blog for the past year, particularly impressed by your recent post on [specific technical topic]. As someone who recently implemented a similar solution using [technology], I'm excited to apply for the [Position] role and contribute to your innovative engineering culture."

*Option 3 - Problem-Solution:*
"Every engineer knows the frustration of legacy code. At [Current Company], I inherited a monolithic application with 200K+ lines of code and zero test coverage. Six months later, we had 85% coverage and a modular architecture. I'd love to bring this same transformation mindset to [Company]'s [Position] role."

**💼 TECHNICAL VALUE PROPOSITION:**

**Paragraph Structure:**
"In my current role as [Title] at [Company], I [specific technical achievement with metrics]. This experience directly applies to your need for [job requirement from description].

Key technical accomplishments:
• [Achievement 1 with technology stack and impact]
• [Achievement 2 with scale/performance metrics]
• [Achievement 3 with business outcome]

I'm particularly drawn to [Company]'s work on [specific project/product] because [genuine technical interest]. My experience with [relevant technologies] and passion for [technical area] would allow me to contribute immediately to [specific team goal or challenge]."

**🔧 TECHNOLOGY ALIGNMENT:**

Create a mini-table (if ATS-friendly) or list:

**Your Requirements → My Experience:**
• React/TypeScript → 4 years building SPAs, including [specific project]
• AWS/Cloud Infrastructure → Designed and deployed microservices on AWS, handling 1M+ requests/day
• System Design → Architected [specific system] supporting [scale/users]
• Team Collaboration → Led team of 5 engineers, mentored 3 junior developers

**🎯 CLOSING WITH TECHNICAL ENTHUSIASM:**

"I'm excited about the opportunity to discuss how my experience with [specific technologies] and passion for [technical area] can contribute to [Company]'s mission to [company goal]. I'd particularly love to learn more about [specific technical challenge or project mentioned in job description].

Thank you for considering my application. I look forward to the opportunity to discuss how I can contribute to your engineering team."

**📋 TECH-SPECIFIC TIPS:**

✅ **Do:**
• Reference their tech blog, GitHub repos, or open-source contributions
• Mention specific technologies from the job posting
• Include links to your GitHub, portfolio, or technical blog
• Show genuine interest in their technical challenges
• Demonstrate understanding of their product/architecture

❌ **Don't:**
• List technologies without context
• Be overly technical or use jargon unnecessarily
• Copy-paste generic cover letters
• Focus only on what you want to learn (show what you can contribute)
• Exceed one page

**🔗 INCLUDE THESE LINKS:**
• GitHub: github.com/yourprofile
• Portfolio: yourportfolio.com
• LinkedIn: linkedin.com/in/yourprofile
• Technical Blog (if you have one)
• Relevant project demos`
      }
      
      return `**✍️ Professional Cover Letter Framework**

**🎯 COMPELLING OPENING (Choose Your Approach):**

*The Achievement Hook:*
"When I [specific impressive achievement], I learned [valuable lesson]. This experience has prepared me perfectly for the [Position] role at [Company], where I can [specific contribution]."

*The Research Hook:*
"I was impressed to learn that [Company] recently [specific achievement/news]. As someone who [relevant experience], I'm excited to apply for the [Position] role and contribute to [specific company goal]."

*The Passion Hook:*
"For the past [X years], I've been passionate about [field/industry]. This passion led me to [specific achievement], and now I'm eager to bring this expertise to [Company] as your next [Position]."

**💼 VALUE-DRIVEN BODY (2 Paragraphs):**

**Paragraph 1 - Relevant Experience & Achievement:**
"In my current role as [Title] at [Company], I [main responsibility]. My most significant achievement was [specific accomplishment with metrics], which resulted in [business impact]. This experience has equipped me with [relevant skills] that directly align with your need for [job requirement].

Specifically, I have:
• [Relevant skill/experience 1 with brief context]
• [Relevant skill/experience 2 with brief context]
• [Relevant skill/experience 3 with brief context]"

**Paragraph 2 - Cultural Fit & Enthusiasm:**
"I'm particularly drawn to [Company] because of [specific reason - values, mission, recent initiative, culture]. Your commitment to [company value/goal] resonates with my own professional philosophy. In my previous role, I demonstrated this alignment by [specific example of similar values in action].

I'm excited about the opportunity to [specific contribution you can make] and help [Company] achieve [specific goal from job description or company mission]."

**🎯 STRONG CLOSING:**

"I would welcome the opportunity to discuss how my experience in [specific area] and passion for [relevant field] can help [Company] [achieve specific goal]. Thank you for considering my application. I look forward to speaking with you soon.

Best regards,
[Your Name]"

**📋 ESSENTIAL ELEMENTS CHECKLIST:**

✅ **Personalization:**
• Company name used 3-4 times
• Specific role title mentioned
• Reference to company news, values, or initiatives
• Hiring manager's name (if available)

✅ **Content Quality:**
• 3-4 paragraphs maximum
• 2-3 specific achievements with metrics
• Clear connection between your experience and their needs
• Enthusiasm and cultural fit demonstrated
• Professional yet personable tone

✅ **Format:**
• Keep to one page
• Professional font (same as resume)
• Your contact information at top
• Date and company address (for formal applications)
• Proper business letter format

**💡 ADVANCED TIPS:**

**The "T-Method" (For Career Changers):**
Create a two-column comparison:

Your Requirements | My Qualifications
• [Requirement 1] | [Your relevant experience]
• [Requirement 2] | [Your relevant experience]
• [Requirement 3] | [Your relevant experience]

**The "Story Arc":**
1. Hook: Grab attention with achievement or insight
2. Bridge: Connect your background to their needs
3. Proof: Provide specific examples and metrics
4. Fit: Demonstrate cultural alignment
5. Close: Express enthusiasm and call-to-action

**The "Research Drop":**
Mention something specific about the company that shows you've done your homework:
• Recent product launch or feature
• Company blog post or podcast
• Award or recognition
• Funding round or expansion
• Leadership change or strategic initiative

**❌ COMMON MISTAKES TO AVOID:**

• Starting with "I am writing to apply for..."
• Repeating your resume verbatim
• Focusing on what you want to learn (instead of what you can contribute)
• Using generic templates without personalization
• Exceeding one page
• Typos or grammatical errors
• Forgetting to customize company name (leaving [Company] placeholder!)
• Being too formal or too casual for the industry
• Not including a clear call-to-action`

    case 'interview':
      if (lowerPrompt.includes('weakness') || lowerPrompt.includes('weaknesses')) {
        return `**💪 Mastering the "Weakness" Question - Advanced Framework**

**🎯 THE STRATEGIC APPROACH:**

This question tests:
1. **Self-awareness:** Do you know your limitations?
2. **Growth mindset:** Are you actively improving?
3. **Honesty:** Can you be authentic without disqualifying yourself?
4. **Professionalism:** Can you discuss challenges constructively?

**📋 THE 4-PART ANSWER STRUCTURE:**

**1. Choose a Real Weakness (10 seconds)**
Pick something that:
• Is genuine and believable
• Won't disqualify you from the role
• Shows self-awareness
• Has a clear improvement path

**2. Provide Context (15 seconds)**
Explain when/how you discovered this weakness:
"Early in my career, I realized that..."
"I've noticed that I tend to..."
"Feedback from my manager helped me see that..."

**3. Show Improvement Actions (30 seconds)**
Detail specific steps you've taken:
"To address this, I have:
• [Specific action 1]
• [Specific action 2]
• [Specific action 3]"

**4. Demonstrate Progress (15 seconds)**
Share measurable improvement:
"As a result, [specific positive outcome]"

**💎 EXCELLENT EXAMPLE ANSWERS:**

**Example 1 - Delegation (Leadership):**
"Earlier in my career, I struggled with delegation because I wanted to ensure everything met my high standards. This led to burnout and bottlenecks for my team.

I realized this wasn't sustainable or fair to my team, so I:
• Developed detailed project briefs with clear success criteria
• Implemented regular check-ins rather than micromanaging every step
• Invested time in training team members on quality standards
• Learned to focus on outcomes rather than dictating process

Now I successfully delegate larger projects while developing my team's capabilities. Last quarter, my team exceeded our goals by 20% while I maintained better work-life balance and had time for strategic planning."

**Example 2 - Public Speaking (Communication):**
"I used to get very nervous presenting to large groups, which affected my confidence in leadership meetings and client presentations.

To improve, I:
• Joined Toastmasters and committed to weekly practice
• Volunteered to present at team meetings to build comfort
• Worked with a speaking coach on breathing techniques and body language
• Started recording myself to identify areas for improvement

The progress has been significant. Last month, I presented our quarterly results to 200+ stakeholders and received positive feedback from our CEO. I still prepare thoroughly, but the anxiety no longer holds me back."

**Example 3 - Technical Skills (Professional Development):**
"While I'm strong in [primary skill], I recognized that my knowledge of [complementary skill] was limiting my effectiveness on cross-functional projects.

I took action by:
• Enrolling in an online course and dedicating 5 hours weekly to learning
• Finding a mentor in that area within our company
• Volunteering for projects that would let me apply new skills
• Building a personal project to practice in a low-stakes environment

After six months, I successfully [specific achievement using new skill]. I'm now comfortable collaborating with [relevant team] and even mentoring others who are learning."

**🚫 WEAKNESSES TO AVOID:**

❌ **Fake Weaknesses (Humble Brags):**
• "I'm too much of a perfectionist"
• "I work too hard"
• "I care too much about quality"
• "I'm too dedicated"

❌ **Critical Job Requirements:**
• For sales role: "I'm not good with people"
• For developer role: "I struggle with problem-solving"
• For manager role: "I can't handle conflict"

❌ **Character Flaws:**
• "I'm always late"
• "I don't work well with others"
• "I have a bad temper"
• "I'm not detail-oriented"

❌ **Vague or Unaddressed:**
• Mentioning weakness without improvement plan
• Being too general ("I need to improve my skills")
• Not showing any progress

**✅ GOOD WEAKNESS CATEGORIES:**

**Process-Related:**
• Delegation (for individual contributors moving to leadership)
• Time management (with specific improvement system)
• Organization (with tools/methods you've implemented)

**Communication:**
• Public speaking (with training/practice undertaken)
• Giving critical feedback (with frameworks learned)
• Technical communication to non-technical audiences

**Technical Skills:**
• Specific technology you're learning
• Industry knowledge you're developing
• Methodology you're adopting

**Work Style:**
• Impatience with slow progress (balanced with empathy development)
• Overcommitment (balanced with boundary-setting)
• Detail focus vs. big picture (balanced with strategic thinking)

**🎯 FOLLOW-UP QUESTIONS TO PREPARE FOR:**

• "Can you give me another example of a weakness?"
• "How do you handle feedback about your weaknesses?"
• "What weakness are you currently working on?"
• "How do your colleagues view this weakness?"

**💡 PRO TIPS:**

1. **Choose Wisely:** Pick a weakness that shows growth potential, not incompetence
2. **Be Specific:** Vague answers sound rehearsed and insincere
3. **Show Progress:** Always include measurable improvement
4. **Stay Positive:** Frame as growth opportunity, not fatal flaw
5. **Be Authentic:** Choose something real - interviewers can spot BS
6. **Time It Right:** Keep answer to 60-90 seconds total
7. **Practice:** Rehearse so it sounds natural, not memorized`
      }
      
      if (lowerPrompt.includes('tell me about yourself') || lowerPrompt.includes('introduce yourself') || lowerPrompt.includes('walk me through')) {
        return `**🎤 "Tell Me About Yourself" - The Perfect Answer Framework**

**⏱️ THE 3-PART STRUCTURE (2-3 minutes total):**

**1. PRESENT (30-45 seconds) - Where You Are Now:**
"I'm currently a [Current Role] at [Company], where I [key responsibility and major achievement]. In this role, I've [1-2 specific accomplishments with metrics that are relevant to the target role]."

**2. PAST (45-60 seconds) - How You Got Here:**
"My background includes [X years] of experience in [relevant field/industry]. Previously, at [Previous Company], I [major accomplishment that demonstrates relevant skills]. Before that, I [brief mention of earlier relevant experience]. This journey has given me deep expertise in [relevant skills/areas]."

**3. FUTURE (30-45 seconds) - Why You're Here:**
"I'm excited about this opportunity at [Company] because [specific reason related to role/company]. I'm particularly drawn to [specific aspect of job/company mission], and I believe my experience in [relevant area] would allow me to [specific contribution/impact]. I'm looking to [career goal that aligns with this role]."

**💎 EXCELLENT EXAMPLES BY ROLE:**

**Software Engineer:**
"I'm currently a Senior Software Engineer at TechCorp, where I lead the development of our customer-facing platform serving over 100,000 users. In the past year, I've increased system performance by 40% and reduced deployment time from hours to minutes through implementing CI/CD pipelines.

My background includes 6 years in full-stack development. At StartupXYZ, I was the third engineer and helped scale our product from MVP to $5M ARR. I built our core API using Node.js and React, which now handles over 1 million requests daily. Earlier, I spent two years at ConsultingFirm working on diverse client projects, which taught me to adapt quickly to new technologies and business domains.

I'm excited about this role at [Company] because of your focus on building scalable, user-centric products. Your recent work on [specific project] particularly interests me, as I've tackled similar challenges around [technical area]. I'm looking to join a team where I can contribute my expertise in system architecture while continuing to grow as an engineer and technical leader."

**Product Manager:**
"I'm currently a Product Manager at SaaS Company, where I own our enterprise product line generating $10M in annual revenue. This year, I launched three major features that increased user engagement by 35% and reduced churn by 20%.

I've spent 5 years in product management, starting as an Associate PM at BigTech after completing my MBA. There, I learned to balance user needs, business goals, and technical constraints while shipping products used by millions. Before business school, I was a software engineer for 3 years, which gives me a strong technical foundation and helps me collaborate effectively with engineering teams.

I'm drawn to [Company] because of your mission to [company mission] and your customer-centric approach to product development. I'm particularly excited about the opportunity to [specific aspect of role], as this aligns with my passion for [relevant area]. I'm looking to take on more strategic product leadership while working on products that have meaningful impact."

**Marketing Manager:**
"I'm currently a Marketing Manager at E-commerce Company, where I lead our digital marketing strategy across paid, organic, and social channels. Last year, I grew our customer base by 150% while reducing customer acquisition cost by 30%, generating $3M in new revenue.

I have 7 years of marketing experience, starting in content marketing and gradually expanding into full-funnel strategy. At Agency, I managed campaigns for 15+ clients across various industries, which taught me to be data-driven and results-focused. I also spent time at a B2B SaaS startup where I built the marketing function from scratch and learned the importance of product-market fit.

I'm excited about [Company] because of your innovative approach to [specific marketing challenge or company differentiator]. Your recent campaign around [specific initiative] was brilliant, and I'd love to contribute my expertise in [relevant area] to help scale your growth. I'm looking for an opportunity to lead strategic marketing initiatives that drive measurable business impact."

**🎯 CUSTOMIZATION TIPS:**

**For Career Changers:**
Focus on transferable skills and explain the transition:
"While my background is in [old field], I've been passionate about [new field] for [time period]. I've taken concrete steps including [courses, projects, certifications] to make this transition. My experience in [old field] gives me a unique perspective on [relevant insight for new role]."

**For Recent Graduates:**
Emphasize education, internships, and projects:
"I recently graduated from [University] with a degree in [Major], where I focused on [relevant coursework]. During my internship at [Company], I [specific achievement]. I also [relevant project or extracurricular] which taught me [relevant skills]."

**For Senior Leaders:**
Focus on strategic impact and leadership:
"I'm a [Title] with 15+ years leading [function] in [industry]. I've built and scaled teams, driven [major initiatives], and delivered [business outcomes]. Most recently at [Company], I [transformational achievement]."

**📋 DELIVERY BEST PRACTICES:**

✅ **Do:**
• Practice until it flows naturally (not memorized)
• Tailor to each specific role and company
• Include metrics and specific achievements
• Connect your story to their needs
• Show enthusiasm and energy
• Maintain eye contact and confident posture
• Keep it to 2-3 minutes maximum

❌ **Don't:**
• Recite your resume chronologically
• Go back to high school or irrelevant early career
• Include personal information (marital status, age, etc.)
• Ramble or lose focus
• Be too modest or too boastful
• Speak in generalities without specific examples
• Forget to connect to why you're interested in THIS role

**💡 PRO TIPS:**

1. **The Hook:** Start with your most impressive current achievement
2. **The Thread:** Create a narrative arc showing intentional career progression
3. **The Bridge:** Explicitly connect your experience to their needs
4. **The Close:** End with enthusiasm for this specific opportunity
5. **The Practice:** Record yourself and watch for filler words, pacing, energy
6. **The Flexibility:** Have 60-second, 2-minute, and 5-minute versions ready

**🎯 COMMON FOLLOW-UPS TO PREPARE FOR:**

• "What interests you about this role specifically?"
• "What's your biggest professional achievement?"
• "Why are you looking to leave your current role?"
• "Where do you see yourself in 5 years?"
• "What do you know about our company?"

Remember: This is your elevator pitch and first impression. Make it count!`
      }
      
      return `**🎯 Interview Excellence Masterclass**

**📋 PRE-INTERVIEW PREPARATION (The 48-Hour Plan):**

**Company Research (2 hours):**
✅ Company website (About, Mission, Values, Recent News)
✅ LinkedIn company page (employees, recent posts, culture)
✅ Glassdoor reviews (interview experiences, company culture)
✅ Recent news articles or press releases
✅ Product/service (sign up for trial, use the product)
✅ Competitors and market position
✅ Financial performance (if public company)

**Role Preparation (3 hours):**
✅ Job description analysis (highlight every requirement)
✅ Prepare 5-7 STAR examples covering different competencies
✅ Research interviewer(s) on LinkedIn
✅ Prepare 5-8 thoughtful questions to ask
✅ Review your resume and be ready to discuss everything
✅ Prepare your "Tell me about yourself" answer

**Logistics (30 minutes):**
✅ Test technology (for virtual interviews)
✅ Plan your outfit (professional, comfortable)
✅ Plan your route (arrive 10-15 minutes early)
✅ Prepare materials (extra resumes, portfolio, notepad)
✅ Set up your space (for virtual: lighting, background, quiet)

**💬 DURING THE INTERVIEW - THE STAR METHOD:**

**Structure Every Behavioral Answer:**

**S - Situation (10-15 seconds):**
Set the context concisely
"At my previous company, we were facing [challenge]..."

**T - Task (10-15 seconds):**
Define your specific responsibility
"I was responsible for [specific task/goal]..."

**A - Action (40-50 seconds):**
Detail YOUR specific actions (this is the meat!)
"I took several steps: First, I [action 1]. Then, I [action 2]. Finally, I [action 3]..."

**R - Result (15-20 seconds):**
Quantify the outcome
"As a result, we [specific outcome with metrics]. This led to [business impact]."

**🎯 EXAMPLE STAR ANSWERS:**

**Question: "Tell me about a time you faced a difficult challenge."**

"At TechCorp, we were experiencing a 40% increase in customer support tickets, threatening our SLA commitments and customer satisfaction. (Situation)

As the product manager, I was tasked with identifying the root cause and implementing a solution within 30 days. (Task)

I took a data-driven approach: First, I analyzed 500+ support tickets to identify patterns - 60% were related to a specific feature. Then, I conducted user interviews to understand the pain points. I discovered our UI was confusing for new users. I worked with design to create a simplified onboarding flow and with engineering to implement it. We also created in-app tooltips and video tutorials. (Action)

Within 6 weeks, support tickets decreased by 55%, our NPS score increased from 32 to 48, and user activation improved by 25%. The solution became a template for how we approach user experience issues across the product. (Result)"

**📊 POWERFUL CLOSING QUESTIONS TO ASK:**

**About the Role:**
• "What does success look like in this role after 6 months? After a year?"
• "What are the biggest challenges facing the team right now?"
• "How does this role contribute to the company's strategic goals?"
• "What would a typical day or week look like in this position?"

**About the Team/Culture:**
• "How would you describe the team culture and working style?"
• "What do you enjoy most about working here?"
• "How does the company support professional development and growth?"
• "What's the onboarding process like for this role?"

**About the Company:**
• "What are the company's top priorities for the next year?"
• "How has the company/team evolved in the past year?"
• "What sets your company apart from competitors?"
• "What's the next step in the interview process?"

**🎯 POST-INTERVIEW FOLLOW-UP:**

**Within 24 Hours:**
✅ Send personalized thank-you email to each interviewer
✅ Reference specific conversation points
✅ Reiterate your interest and key qualifications
✅ Include any additional information you forgot to mention
✅ Keep it concise (3-4 paragraphs)

**Example Thank-You Email:**

"Subject: Thank you - [Position] Interview

Dear [Interviewer Name],

Thank you for taking the time to speak with me today about the [Position] role. I enjoyed learning about [specific topic discussed] and was particularly excited to hear about [specific project or initiative].

Our conversation reinforced my interest in joining [Company]. The challenge of [specific challenge discussed] aligns perfectly with my experience in [relevant area], and I'm confident I could make an immediate impact.

I appreciate you sharing insights about [specific detail from conversation]. If you need any additional information, please don't hesitate to reach out.

I look forward to hearing about the next steps.

Best regards,
[Your Name]"

**⚡ CONFIDENCE BOOSTERS:**

**Before the Interview:**
• Arrive 10-15 minutes early (but not too early)
• Review your notes and key talking points
• Practice power poses (2 minutes)
• Take deep breaths to calm nerves
• Remind yourself of your achievements

**During the Interview:**
• Smile and make eye contact
• Use the interviewer's name occasionally
• Show enthusiasm and energy
• Take notes (shows engagement)
• Ask for clarification if needed
• Pause before answering (shows thoughtfulness)

**Body Language:**
• Sit up straight, lean slightly forward
• Use hand gestures naturally
• Maintain open posture (no crossed arms)
• Mirror interviewer's energy level
• Nod to show active listening

**🚫 COMMON MISTAKES TO AVOID:**

❌ Speaking negatively about current/past employers
❌ Being unprepared with questions to ask
❌ Focusing only on what you want to learn (not what you can contribute)
❌ Lying or exaggerating achievements
❌ Checking phone or appearing distracted
❌ Interrupting the interviewer
❌ Rambling or going off-topic
❌ Not following up after the interview
❌ Discussing salary too early (unless they bring it up)
❌ Appearing desperate or overconfident

**💡 ADVANCED STRATEGIES:**

**The Callback Technique:**
Reference earlier parts of the conversation:
"As you mentioned earlier about [topic], I think my experience with [relevant experience] would be particularly valuable here."

**The Reversal:**
Turn potential negatives into positives:
"While I don't have direct experience with [specific tool], I've quickly mastered similar technologies like [examples], and I'm excited to add [tool] to my skillset."

**The Future-Pacing:**
Show how past success predicts future performance:
"Just as I [past achievement], I would approach [future challenge] by [specific strategy]."

**The Humble Brag:**
Showcase achievements without arrogance:
"I was fortunate to work with an amazing team that helped us achieve [impressive result]. My role was to [your specific contribution]."

**🎯 FINAL CHECKLIST:**

✅ Researched company thoroughly
✅ Prepared 5-7 STAR examples
✅ Practiced "Tell me about yourself"
✅ Prepared thoughtful questions
✅ Tested technology (if virtual)
✅ Planned professional outfit
✅ Printed extra resumes
✅ Know the route/login details
✅ Prepared thank-you email template
✅ Set reminders for follow-up

**Remember:** Interviews are conversations, not interrogations. Be authentic, show enthusiasm, and remember that you're also evaluating if this company is right for YOU!`

    default:
      return `**🎯 Strategic Career Development Roadmap**

**📋 PHASE 1: SELF-ASSESSMENT (Week 1-2)**

**Career Inventory:**
✅ List your top 10 professional achievements
✅ Identify your core strengths (ask colleagues for input)
✅ Assess your current skills vs. market demands
✅ Define your values and non-negotiables
✅ Evaluate your current role satisfaction (1-10 scale)

**SMART Goal Framework:**
Set goals that are:
• **Specific:** "Become a senior data analyst" not "advance my career"
• **Measurable:** "Complete 3 certifications" not "learn more"
• **Achievable:** Stretch but realistic given your situation
• **Relevant:** Aligned with your values and market trends
• **Time-bound:** "Within 12 months" not "someday"

**Example Goals:**
• 1-Year: "Earn AWS Solutions Architect certification and lead 2 cloud migration projects"
• 3-Year: "Transition to engineering management role leading team of 5-8 engineers"
• 5-Year: "Become VP of Engineering at a growth-stage tech company"

**📈 PHASE 2: MARKET RESEARCH (Week 3-4)**

**Industry Analysis:**
✅ Research 10-15 target companies (culture, growth, opportunities)
✅ Analyze job postings for target roles (common requirements)
✅ Research salary ranges (Glassdoor, Levels.fyi, Payscale)
✅ Identify industry trends and emerging skills
✅ Map out career progression paths in your field

**Competitive Analysis:**
• Who has your dream job? Study their background
• What skills do top performers in your field have?
• What certifications or credentials are valued?
• What companies are known for developing talent?

**🎯 PHASE 3: STRATEGIC POSITIONING (Month 2-3)**

**LinkedIn Optimization:**
✅ Professional headshot and banner image
✅ Compelling headline (not just job title)
✅ Summary that tells your story and value proposition
✅ Detailed experience with achievements and metrics
✅ Skills section with endorsements (top 10 most relevant)
✅ Recommendations from colleagues and managers
✅ Regular posts and engagement (2-3 times per week)

**Personal Brand Development:**
• Define your unique value proposition
• Identify your niche or specialization
• Create content showcasing expertise (blog, LinkedIn posts)
• Speak at events or webinars
• Contribute to open source or industry projects

**Resume \u0026 Portfolio Updates:**
✅ Tailor resume for target roles
✅ Quantify all achievements with metrics
✅ Create role-specific resume versions
✅ Build or update portfolio/website
✅ Gather work samples and case studies

**🤝 PHASE 4: STRATEGIC NETWORKING (Ongoing)**

**Monthly Networking Goals:**
• Connect with 5-10 new people in target industry
• Have 2-3 informational interviews
• Attend 1-2 industry events or webinars
• Engage with 10+ posts from industry leaders
• Reach out to 1-2 potential mentors

**Networking Strategies:**
• **LinkedIn:** Personalized connection requests, engage with content
• **Events:** Conferences, meetups, workshops (virtual or in-person)
• **Alumni:** Leverage school/company alumni networks
• **Communities:** Join Slack groups, Discord servers, professional associations
• **Mentorship:** Seek mentors and offer reverse mentoring

**Informational Interview Template:**
"Hi [Name], I'm [your name] and I'm currently [your role]. I've been following your work in [their area] and I'm impressed by [specific achievement]. I'm exploring opportunities in [target area] and would love to learn from your experience. Would you have 20 minutes for a brief call? I'm happy to work around your schedule."

**📚 PHASE 5: SKILL DEVELOPMENT (Ongoing)**

**Learning Plan (5-10 hours/week):**

**Technical Skills:**
• Online courses (Coursera, Udemy, Pluralsight)
• Certifications (AWS, Google, Microsoft, industry-specific)
• Books and technical documentation
• Personal projects and portfolio building
• Contribute to open source

**Soft Skills:**
• Leadership and management training
• Communication and presentation skills
• Emotional intelligence development
• Negotiation and influence
• Strategic thinking and business acumen

**Recommended Resources:**
• **Tech:** freeCodeCamp, LeetCode, System Design Primer
• **Business:** Harvard Business Review, "The Lean Startup"
• **Leadership:** "Radical Candor", "The Manager's Path"
• **Career:** "Designing Your Life", "So Good They Can't Ignore You"

**🎯 PHASE 6: JOB SEARCH OPTIMIZATION (When Ready)**

**Application Strategy:**
• Quality over quantity (5-10 tailored applications > 50 generic)
• Target companies where you have connections
• Apply within first 48 hours of posting
• Follow up with hiring manager or recruiter
• Track all applications in spreadsheet

**Recruiter Engagement:**
• Optimize LinkedIn for recruiter searches
• Respond promptly to recruiter outreach
• Build relationships (not just transactional)
• Be clear about your requirements and timeline
• Ask about company culture and team dynamics

**Interview Preparation:**
• Practice STAR method answers (5-7 examples)
• Research each company thoroughly
• Prepare thoughtful questions
• Mock interviews with friends or coaches
• Record yourself to improve delivery

**💰 PHASE 7: OFFER NEGOTIATION**

**Preparation:**
• Research market rates (Glassdoor, Levels.fyi, Blind)
• Know your walk-away number
• Consider total compensation (base, bonus, equity, benefits)
• Prepare justification for your ask
• Have alternative offers (if possible)

**Negotiation Framework:**
1. Express enthusiasm for the role
2. Thank them for the offer
3. Ask for time to review (24-48 hours)
4. Come back with specific, justified requests
5. Be prepared to compromise
6. Get everything in writing

**Beyond Salary:**
• Signing bonus
• Stock options or RSUs
• Performance bonus structure
• Vacation time
• Remote work flexibility
• Professional development budget
• Title and level
• Start date

**📊 SUCCESS METRICS \u0026 TRACKING:**

**Monthly Check-ins:**
✅ Skills learned or improved
✅ Networking connections made
✅ Applications submitted
✅ Interviews conducted
✅ Offers received
✅ Progress toward goals
✅ Adjustments needed

**Quarterly Reviews:**
• Assess progress against 1-year goals
• Update resume and LinkedIn
• Refresh job search strategy
• Seek feedback from mentors
• Celebrate wins and learn from setbacks

**Annual Planning:**
• Review and update 3-year and 5-year goals
• Assess market changes and trends
• Plan major skill development initiatives
• Consider career pivots or advancement opportunities

**💡 CAREER ADVANCEMENT TIPS:**

**In Your Current Role:**
• Volunteer for high-visibility projects
• Seek stretch assignments outside comfort zone
• Build cross-functional relationships
• Document your achievements regularly
• Ask for feedback and act on it
• Mentor junior team members
• Stay informed about company strategy

**Building Your Reputation:**
• Deliver consistently high-quality work
• Be reliable and meet deadlines
• Communicate proactively
• Solve problems, don't just identify them
• Share credit with team
• Maintain positive attitude
• Be the go-to person for your expertise

**When to Make a Move:**
• You've stopped learning and growing
• No clear path for advancement
• Company culture doesn't align with values
• Compensation significantly below market
• Better opportunity aligns with long-term goals
• You've been in role 2-3 years (generally)

**🎯 REMEMBER:**

Career development is a marathon, not a sprint. Focus on:
• Consistent progress over perfection
• Building valuable relationships
• Continuous learning and adaptation
• Delivering results in current role
• Staying true to your values and goals

**You've got this! 🚀**`
  }
}

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
