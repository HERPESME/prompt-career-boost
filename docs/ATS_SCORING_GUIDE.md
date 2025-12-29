# ATS Resume Scoring Engine - Quick Start Guide

## Overview

The ATS (Applicant Tracking System) Scoring Engine provides **real, calculated scores** for resumes based on:
- **Keyword Matching** (40% weight): TF-IDF algorithm comparing resume to job description
- **Formatting** (25% weight): Detects ATS-unfriendly elements (tables, images, etc.)
- **Structure** (20% weight): Validates required sections (Experience, Education, Skills)
- **Readability** (15% weight): Analyzes sentence length, action verbs, quantification

## Test Results

✅ **Well-Written Resume**: 83/100
- Keyword Match: 76% (131/173 keywords matched)
- Formatting: 80%
- Structure: 95%
- Readability: 90%

✅ **General ATS Check** (no job description): 81/100

❌ **Poor Resume** (vague, missing sections): 57/100
- Keyword Match: 32%
- Missing Education and Skills sections
- Insufficient quantification

## Usage

### 1. Basic Usage

```typescript
import { calculateATSScore } from '@/utils/atsScoring';

const resumeText = "..."; // Your resume content
const jobDescription = "..."; // Target job description

const score = calculateATSScore(resumeText, jobDescription);

console.log(score.overall); // 83
console.log(score.breakdown.keywordMatch); // 76
console.log(score.matchedKeywords); // ['javascript', 'react', 'node', ...]
console.log(score.missingKeywords); // ['python', 'django', ...]
console.log(score.improvements); // ['Add missing keywords...', ...]
```

### 2. React Hook

```typescript
import { useATSScoring } from '@/hooks/useATSScoring';

function ResumeBuilder() {
  const { score, calculateScore, rating, color } = useATSScoring();

  const handleAnalyze = () => {
    calculateScore(resumeText, jobDescription);
  };

  return (
    <div>
      <button onClick={handleAnalyze}>Analyze Resume</button>
      {score && (
        <div>
          <h3>ATS Score: {score.overall}/100</h3>
          <p>Rating: {rating}</p> {/* "Very Good" */}
        </div>
      )}
    </div>
  );
}
```

### 3. Display Component

```typescript
import { ATSScoreDisplay } from '@/components/resume/ATSScoreDisplay';
import { useATSScoring } from '@/hooks/useATSScoring';

function ResumeAnalyzer() {
  const { score, calculateScore } = useATSScoring();

  return (
    <div>
      <button onClick={() => calculateScore(resumeText, jobDescription)}>
        Analyze
      </button>
      
      {score && <ATSScoreDisplay score={score} />}
    </div>
  );
}
```

## Features

### Keyword Extraction
- **N-gram analysis**: Extracts 1-3 word phrases
- **TF-IDF weighting**: Prioritizes important terms
- **Technical term detection**: Boosts acronyms (AWS, API), dotted notation (React.js)
- **Synonym matching**: Partial keyword matches

### Format Validation
Detects and penalizes:
- ❌ Tables (-20 points)
- ❌ Images/Graphics (-15 points)
- ❌ Multi-column layouts (-15 points)
- ❌ Excessive special characters (-10 points)
- ⚠️ Inconsistent formatting (-5 points)

### Structure Analysis
Checks for:
- ✅ Experience section (required, -30 if missing)
- ✅ Skills section (required, -20 if missing)
- ✅ Education section (-15 if missing)
- ✅ Professional Summary (-10 if missing)
- ✅ Contact information (email, phone)

### Readability Metrics
Analyzes:
- **Sentence length**: Optimal 15-20 words
- **Word complexity**: Flags overly complex vocabulary
- **Passive voice**: Detects and penalizes passive constructions
- **Action verbs**: Rewards strong verbs (Led, Managed, Developed)
- **Quantification**: Counts numbers, percentages, metrics

## Integration Example

```typescript
// In ResumeBuilder.tsx
import { useATSScoring } from '@/hooks/useATSScoring';
import { ATSScoreDisplay } from '@/components/resume/ATSScoreDisplay';

export function ResumeBuilder() {
  const [resumeData, setResumeData] = useState({...});
  const [jobDescription, setJobDescription] = useState('');
  const { score, calculateScore } = useATSScoring();

  // Auto-calculate score when resume changes
  useEffect(() => {
    const resumeText = formatResumeAsText(resumeData);
    calculateScore(resumeText, jobDescription);
  }, [resumeData, jobDescription]);

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left: Resume Editor */}
      <div>
        <ResumeForm data={resumeData} onChange={setResumeData} />
        <textarea
          placeholder="Paste job description for better matching..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </div>

      {/* Right: ATS Score + Preview */}
      <div>
        {score && <ATSScoreDisplay score={score} className="mb-6" />}
        <ResumePreview data={resumeData} />
      </div>
    </div>
  );
}
```

## Next Steps

1. **Database Integration**: Store scores in `ats_scores` table
2. **Progress Tracking**: Track improvement over time
3. **Benchmarking**: Compare against industry averages
4. **Real-time Suggestions**: Show inline keyword suggestions
5. **Export Report**: Generate PDF with detailed analysis

## API Reference

### `calculateATSScore(resumeText, jobDescription?)`

**Parameters:**
- `resumeText` (string): Full resume content
- `jobDescription` (string, optional): Target job posting

**Returns:** `ATSScore`
```typescript
{
  overall: number;              // 0-100
  breakdown: {
    keywordMatch: number;       // 0-100
    formatting: number;         // 0-100
    structure: number;          // 0-100
    readability: number;        // 0-100
  };
  improvements: string[];       // Actionable suggestions
  matchedKeywords: string[];    // Keywords found in resume
  missingKeywords: string[];    // Keywords missing from resume
  details: {
    totalKeywords: number;
    matchedCount: number;
    matchPercentage: number;
  };
}
```

### `getScoreRating(score)`
Returns: `"Excellent"` | `"Very Good"` | `"Good"` | `"Fair"` | `"Needs Improvement"`

### `getScoreColor(score)`
Returns: `"green"` | `"yellow"` | `"red"`
