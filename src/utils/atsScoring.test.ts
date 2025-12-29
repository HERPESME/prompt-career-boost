import { calculateATSScore } from './atsScoring';

// Test the ATS scoring algorithm
console.log('='.repeat(60));
console.log('ATS SCORING ENGINE TEST');
console.log('='.repeat(60));

// Sample resume text
const sampleResume = `
John Doe
john.doe@email.com | (555) 123-4567 | LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Results-driven Software Engineer with 5+ years of experience building scalable web applications using React, Node.js, and AWS. Proven track record of delivering high-impact projects that increased user engagement by 40% and reduced costs by $200K annually.

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechCorp Inc. | Jan 2021 - Present
• Led team of 5 developers to build customer-facing platform serving 100,000+ daily active users
• Implemented microservices architecture using Node.js and Docker, reducing deployment time from 2 hours to 15 minutes
• Optimized database queries with PostgreSQL, improving page load speed by 60%
• Mentored 3 junior developers, with 2 receiving promotions within 12 months

Software Engineer | StartupXYZ | Jun 2019 - Dec 2020
• Developed full-stack web application using React and Express.js
• Built RESTful API handling 1M+ requests per day with 99.9% uptime
• Implemented automated testing with Jest and Cypress, achieving 85% code coverage
• Collaborated with product team to launch 5 major features, increasing user retention by 25%

EDUCATION
Bachelor of Science in Computer Science | University of Technology | 2019
GPA: 3.8/4.0

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, SQL
Frameworks: React, Node.js, Express.js, Next.js
Tools: Git, Docker, AWS, PostgreSQL, MongoDB
Methodologies: Agile, Scrum, CI/CD, Test-Driven Development
`;

// Sample job description
const sampleJobDescription = `
We are seeking a Senior Software Engineer to join our growing team.

Requirements:
- 5+ years of experience with JavaScript and TypeScript
- Strong experience with React and Node.js
- Experience with AWS cloud services
- Knowledge of microservices architecture
- Experience with PostgreSQL or other relational databases
- Familiarity with Docker and containerization
- Strong problem-solving and communication skills
- Experience mentoring junior developers
- Bachelor's degree in Computer Science or related field

Nice to have:
- Experience with Next.js
- Knowledge of CI/CD pipelines
- Experience with automated testing (Jest, Cypress)
- Agile/Scrum methodology experience
`;

// Test 1: With job description
console.log('\n📊 TEST 1: Resume with Job Description');
console.log('-'.repeat(60));
const score1 = calculateATSScore(sampleResume, sampleJobDescription);
console.log(`Overall Score: ${score1.overall}/100`);
console.log(`\nBreakdown:`);
console.log(`  - Keyword Match: ${score1.breakdown.keywordMatch}%`);
console.log(`  - Formatting: ${score1.breakdown.formatting}%`);
console.log(`  - Structure: ${score1.breakdown.structure}%`);
console.log(`  - Readability: ${score1.breakdown.readability}%`);
console.log(`\nKeyword Analysis:`);
console.log(`  - Total Keywords: ${score1.details.totalKeywords}`);
console.log(`  - Matched: ${score1.details.matchedCount} (${score1.details.matchPercentage}%)`);
console.log(`  - Missing: ${score1.missingKeywords.length}`);
console.log(`\nMatched Keywords (first 10):`);
score1.matchedKeywords.slice(0, 10).forEach(kw => console.log(`  ✓ ${kw}`));
console.log(`\nMissing Keywords (first 5):`);
score1.missingKeywords.slice(0, 5).forEach(kw => console.log(`  ✗ ${kw}`));
console.log(`\nTop Improvements:`);
score1.improvements.slice(0, 3).forEach((imp, i) => console.log(`  ${i + 1}. ${imp}`));

// Test 2: Without job description (general ATS check)
console.log('\n\n📊 TEST 2: Resume without Job Description (General ATS Check)');
console.log('-'.repeat(60));
const score2 = calculateATSScore(sampleResume);
console.log(`Overall Score: ${score2.overall}/100`);
console.log(`\nBreakdown:`);
console.log(`  - Keyword Match: ${score2.breakdown.keywordMatch}% (baseline)`);
console.log(`  - Formatting: ${score2.breakdown.formatting}%`);
console.log(`  - Structure: ${score2.breakdown.structure}%`);
console.log(`  - Readability: ${score2.breakdown.readability}%`);
console.log(`\nImprovements:`);
score2.improvements.forEach((imp, i) => console.log(`  ${i + 1}. ${imp}`));

// Test 3: Poor resume (missing sections, bad formatting)
const poorResume = `
John Doe
john.doe@email.com

I am a software engineer with experience in various technologies. I have worked on multiple projects and have been responsible for developing applications. I was involved in improving processes and working with teams.

Work Experience:
- Worked at Company A
- Did some programming
- Helped with projects
- Was part of a team

I know JavaScript, React, and other technologies.
`;

console.log('\n\n📊 TEST 3: Poor Resume (Missing Sections, Vague Content)');
console.log('-'.repeat(60));
const score3 = calculateATSScore(poorResume, sampleJobDescription);
console.log(`Overall Score: ${score3.overall}/100`);
console.log(`\nBreakdown:`);
console.log(`  - Keyword Match: ${score3.breakdown.keywordMatch}%`);
console.log(`  - Formatting: ${score3.breakdown.formatting}%`);
console.log(`  - Structure: ${score3.breakdown.structure}%`);
console.log(`  - Readability: ${score3.breakdown.readability}%`);
console.log(`\nCritical Issues:`);
score3.improvements.forEach((imp, i) => console.log(`  ${i + 1}. ${imp}`));

console.log('\n' + '='.repeat(60));
console.log('TEST COMPLETE');
console.log('='.repeat(60));

export { sampleResume, sampleJobDescription };
