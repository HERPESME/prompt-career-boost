import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSecureTokens } from "@/hooks/useSecureTokens";
import { useAI } from "@/hooks/useAI";
import { useAuthUser } from "@/hooks/useAuthUser";
import { MessageSquare, Play, Pause, RotateCcw, Save, Target, Clock, Award, Sparkles } from "lucide-react";

interface Question {
  id: string;
  question: string;
  type: "behavioral" | "technical" | "general";
  difficulty: "easy" | "medium" | "hard";
}

interface Response {
  questionId: string;
  answer: string;
  feedback: string;
  score: number;
}

// Intelligent fallback scoring function
const generateIntelligentFeedback = (answer: string, question: Question, interviewData: any) => {
  const answerLength = answer.trim().split(' ').length;
  const lowerAnswer = answer.toLowerCase();
  
  let score = 60; // Base score
  let feedback = "Thank you for your response. ";
  
  // Length scoring
  if (answerLength >= 50) {
    score += 20;
    feedback += "Your answer was comprehensive and detailed. ";
  } else if (answerLength >= 25) {
    score += 10;
    feedback += "Good level of detail in your response. ";
  } else {
    score -= 10;
    feedback += "Consider providing more detail and specific examples. ";
  }
  
  // STAR method detection
  const starKeywords = ['situation', 'task', 'action', 'result', 'challenge', 'problem', 'solution', 'outcome'];
  const foundStarKeywords = starKeywords.filter(keyword => lowerAnswer.includes(keyword));
  score += foundStarKeywords.length * 5;
  
  if (foundStarKeywords.length >= 2) {
    feedback += "Great use of structured examples (STAR method). ";
  }
  
  // Professional keywords
  const professionalKeywords = ['experience', 'skills', 'project', 'team', 'leadership', 'collaboration', 'achievement'];
  const foundProfessional = professionalKeywords.filter(keyword => lowerAnswer.includes(keyword));
  score += foundProfessional.length * 3;
  
  // Question-specific adjustments
  if (question.type === 'behavioral' && foundStarKeywords.length > 0) {
    score += 10;
    feedback += "Excellent behavioral response with specific examples. ";
  }
  
  if (question.type === 'technical' && (lowerAnswer.includes('technology') || lowerAnswer.includes('tool') || lowerAnswer.includes('framework'))) {
    score += 8;
    feedback += "Good technical insight. ";
  }
  
  // Confidence and clarity indicators
  if (answer.includes('I') && !lowerAnswer.includes('um') && !lowerAnswer.includes('uh')) {
    score += 5;
    feedback += "Clear and confident communication. ";
  }
  
  feedback += "Keep practicing to improve your interview skills!";
  
  return {
    score: Math.min(95, Math.max(30, score)),
    feedback: feedback
  };
};

export const InterviewCoach = () => {
  const { user } = useAuthUser();
  const { useToken } = useSecureTokens();
  const { generateAIResponse, loading: aiLoading } = useAI();
  
  const [interviewData, setInterviewData] = useState({
    title: "",
    companyName: "",
    position: "",
    interviewType: "general" as "general" | "technical" | "behavioral" | "case-study",
    experienceLevel: "mid" as "junior" | "mid" | "senior",
    jobDescription: "",
  });
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Response[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const generateQuestions = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate interview questions.",
        variant: "destructive",
      });
      return;
    }

    if (!interviewData.position) {
      toast({
        title: "Position Required",
        description: "Please enter the position you're interviewing for.",
        variant: "destructive",
      });
      return;
    }

    // Check and consume token securely
    const canUseToken = await useToken('interview');
    if (!canUseToken) {
      return; // Token modal will be shown
    }

    setLoading(true);
    try {
      // Create AI prompt for generating challenging interview questions
      const questionPrompt = `Generate 5 challenging and realistic interview questions for a ${interviewData.experienceLevel}-level ${interviewData.position} position${interviewData.companyName ? ` at ${interviewData.companyName}` : ''}.

Interview Type: ${interviewData.interviewType}
Experience Level: ${interviewData.experienceLevel}
${interviewData.jobDescription ? `Job Description: ${interviewData.jobDescription}` : ''}

Requirements:
- Questions should be relevant to the specific role and experience level
- Mix different difficulty levels (easy, medium, hard)
- For technical interviews: include coding concepts, system design, problem-solving
- For behavioral interviews: focus on leadership, teamwork, conflict resolution
- For general interviews: mix of background, motivation, and role-specific questions
- Make questions challenging but realistic for actual interviews

Format each question as:
Question: [question text]
Type: [behavioral/technical/general]
Difficulty: [easy/medium/hard]

Provide exactly 5 questions.`;

      const aiResponse = await generateAIResponse(questionPrompt, 'interview');
      
      // Parse AI response to extract questions
      const generatedQuestions = parseAIQuestions(aiResponse);
      
      if (generatedQuestions.length === 0) {
        // Fallback to smarter default questions if AI parsing fails
        const fallbackQuestions = generateSmartFallbackQuestions(interviewData);
        setQuestions(fallbackQuestions);
      } else {
        setQuestions(generatedQuestions);
      }
      
      setCurrentQuestionIndex(0);
      setResponses([]);
      setCurrentAnswer("");
      
      toast({
        title: "AI-Generated Questions Ready!",
        description: `Generated ${questions.length > 0 ? questions.length : 5} challenging interview questions tailored to your role.`,
      });
    } catch (error: any) {
      console.error("Question generation error:", error);
      // Use smart fallback questions
      const fallbackQuestions = generateSmartFallbackQuestions(interviewData);
      setQuestions(fallbackQuestions);
      
      toast({
        title: "Questions Generated",
        description: "Interview questions are ready for practice.",
      });
    } finally {
      setLoading(false);
    }
  };

  const parseAIQuestions = (aiResponse: string): Question[] => {
    const questions: Question[] = [];
    const lines = aiResponse.split('\n');
    let currentQuestion = null;
    let questionCounter = 1;

    for (const line of lines) {
      if (line.toLowerCase().includes('question:')) {
        const questionText = line.replace(/question:\s*/i, '').trim();
        if (questionText) {
          currentQuestion = {
            id: questionCounter.toString(),
            question: questionText,
            type: "general" as any,
            difficulty: "medium" as any
          };
        }
      } else if (currentQuestion && line.toLowerCase().includes('type:')) {
        const type = line.replace(/type:\s*/i, '').trim().toLowerCase();
        if (['behavioral', 'technical', 'general'].includes(type)) {
          currentQuestion.type = type as any;
        }
      } else if (currentQuestion && line.toLowerCase().includes('difficulty:')) {
        const difficulty = line.replace(/difficulty:\s*/i, '').trim().toLowerCase();
        if (['easy', 'medium', 'hard'].includes(difficulty)) {
          currentQuestion.difficulty = difficulty as any;
        }
        // Question is complete, add it
        questions.push(currentQuestion);
        currentQuestion = null;
        questionCounter++;
      }
    }

    // Handle case where last question doesn't have difficulty specified
    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    return questions;
  };

  const generateSmartFallbackQuestions = (data: typeof interviewData): Question[] => {
    const { position, interviewType, experienceLevel, companyName } = data;
    
    const baseQuestions: Question[] = [];

    if (interviewType === 'technical') {
      baseQuestions.push(
        {
          id: "1",
          question: `Explain the most complex technical problem you've solved in your ${position} experience. Walk me through your approach, the technologies you used, and how you measured success.`,
          type: "technical",
          difficulty: "hard"
        },
        {
          id: "2",
          question: `If you had to design a scalable system for ${position === 'Software Engineer' ? 'handling millions of concurrent users' : 'processing large datasets'}, what architecture would you choose and why?`,
          type: "technical",
          difficulty: "hard"
        },
        {
          id: "3",
          question: `Describe a time when you had to optimize performance in a ${position} project. What was the bottleneck and how did you resolve it?`,
          type: "technical",
          difficulty: "medium"
        }
      );
    } else if (interviewType === 'behavioral') {
      baseQuestions.push(
        {
          id: "1",
          question: `Tell me about a time when you had to lead a project or initiative as a ${position}. How did you handle challenges and ensure team alignment?`,
          type: "behavioral",
          difficulty: "medium"
        },
        {
          id: "2",
          question: `Describe a situation where you disagreed with a senior colleague or manager about a technical decision. How did you handle it?`,
          type: "behavioral",
          difficulty: "hard"
        }
      );
    }

    // Add role-specific questions
    baseQuestions.push(
      {
        id: (baseQuestions.length + 1).toString(),
        question: `What emerging trends or technologies in the ${position} field excite you most, and how are you preparing to leverage them?`,
        type: "general",
        difficulty: "medium"
      },
      {
        id: (baseQuestions.length + 2).toString(),
        question: `${companyName ? `Why do you want to work at ${companyName} specifically` : 'Why are you interested in this role'}, and how does it align with your career goals?`,
        type: "general",
        difficulty: "easy"
      }
    );

    // Ensure we have 5 questions
    while (baseQuestions.length < 5) {
      baseQuestions.push({
        id: (baseQuestions.length + 1).toString(),
        question: `What is the most challenging aspect of being a ${position}, and how do you overcome it?`,
        type: "general",
        difficulty: "medium"
      });
    }

    return baseQuestions.slice(0, 5);
  };

  const startInterview = () => {
    if (questions.length === 0) {
      toast({
        title: "No Questions Available",
        description: "Please generate questions first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsInterviewActive(true);
    setStartTime(new Date());
    setCurrentQuestionIndex(0);
    setResponses([]);
    setCurrentAnswer("");
  };

  const submitAnswer = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to get AI feedback.",
        variant: "destructive",
      });
      return;
    }

    if (!currentAnswer.trim()) {
      toast({
        title: "Answer Required",
        description: "Please provide an answer before proceeding.",
        variant: "destructive",
      });
      return;
    }

    // Check and consume token securely
    const canUseToken = await useToken('interview');
    if (!canUseToken) {
      return; // Token modal will be shown
    }

    setLoading(true);
    try {
      const currentQuestion = questions[currentQuestionIndex];
      
      // Generate AI-powered feedback
      const aiPrompt = `Evaluate this interview answer and provide a score (0-100) and detailed feedback:

QUESTION: ${currentQuestion.question}
QUESTION TYPE: ${currentQuestion.type}
DIFFICULTY: ${currentQuestion.difficulty}
POSITION: ${interviewData.position}
EXPERIENCE LEVEL: ${interviewData.experienceLevel}
COMPANY: ${interviewData.companyName || 'Not specified'}

CANDIDATE ANSWER: ${currentAnswer}

Please provide:
1. A numerical score (0-100) based on:
   - Relevance to the question
   - Use of specific examples (STAR method)
   - Communication clarity
   - Professional presentation
   - Depth of insight

2. Constructive feedback including:
   - What they did well
   - Areas for improvement
   - Specific suggestions for better answers

Format: Score: [number] | Feedback: [detailed feedback]`;

      let newResponse: Response;
      
      try {
        const aiResponse = await generateAIResponse(aiPrompt, 'interview');
        
        // Parse AI response
        const scoreMatch = aiResponse.match(/Score:\s*(\d+)/i);
        const feedbackMatch = aiResponse.match(/Feedback:\s*(.+)/is);
        
        const score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1]))) : 75;
        const feedback = feedbackMatch ? feedbackMatch[1].trim() : 'Good effort! Keep practicing to improve your interview skills.';
        
        newResponse = {
          questionId: currentQuestion.id,
          answer: currentAnswer,
          feedback: feedback,
          score: score,
        };
      } catch (aiError) {
        // Fallback to intelligent scoring if AI fails
        console.log('AI feedback failed, using intelligent fallback');
        const { score, feedback } = generateIntelligentFeedback(currentAnswer, currentQuestion, interviewData);
        
        newResponse = {
          questionId: currentQuestion.id,
          answer: currentAnswer,
          feedback: feedback,
          score: score,
        };
      }

      const updatedResponses = [...responses, newResponse];
      setResponses(updatedResponses);
      setCurrentAnswer("");

      // Move to next question or finish interview
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Calculate overall score
        const totalScore = updatedResponses.reduce((sum, r) => sum + r.score, 0);
        const avgScore = Math.round(totalScore / updatedResponses.length);
        setOverallScore(avgScore);
        setIsInterviewActive(false);
        
        toast({
          title: "Interview Complete!",
          description: `Your overall score: ${avgScore}%. Great job!`,
        });
      }
    } catch (error: any) {
      console.error("Answer evaluation error:", error);
      toast({
        title: "Evaluation Complete", 
        description: "Your answer has been recorded.",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveInterview = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save interviews.",
        variant: "destructive",
      });
      return;
    }

    if (responses.length === 0) {
      toast({
        title: "No Data to Save",
        description: "Complete the interview first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const duration = startTime ? Math.round((Date.now() - startTime.getTime()) / 60000) : 0;

      const { error } = await supabase
        .from("interviews")
        .insert({
          user_id: user.id,
          title: interviewData.title || `${interviewData.position} Interview`,
          company_name: interviewData.companyName,
          position: interviewData.position,
          interview_type: interviewData.interviewType,
          questions: questions as any,
          responses: responses as any,
          feedback: responses.map(r => ({ questionId: r.questionId, feedback: r.feedback })) as any,
          score: overallScore,
          duration_minutes: duration,
          status: "completed",
        });

      if (error) throw error;

      toast({
        title: "Interview Saved!",
        description: "Your interview session has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetInterview = () => {
    setIsInterviewActive(false);
    setCurrentQuestionIndex(0);
    setResponses([]);
    setCurrentAnswer("");
    setOverallScore(0);
    setStartTime(null);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-warm-brown-800 mb-4">
            AI Interview Coach
          </h1>
          <p className="text-warm-brown-600 mb-8">
            Please sign in to access the interview coach.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            AI Interview Coach
          </h1>
          <p className="text-gray-600 mt-2">Practice interviews with AI-powered challenging questions</p>
        </div>
        {overallScore > 0 && (
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{overallScore}%</div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <Progress value={overallScore} className="w-24" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Setup Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-600" />
                Interview Setup
              </CardTitle>
              <CardDescription>
                Configure your AI-powered interview practice session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Session Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Google Software Engineer Interview"
                  value={interviewData.title}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  placeholder="e.g., Software Engineer, Product Manager"
                  value={interviewData.position}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, position: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="companyName">Company (Optional)</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Google, Meta, Apple"
                  value={interviewData.companyName}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, companyName: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select value={interviewData.experienceLevel} onValueChange={(value: any) => setInterviewData(prev => ({ ...prev, experienceLevel: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid-level (3-5 years)</SelectItem>
                    <SelectItem value="senior">Senior (5+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="interviewType">Interview Type</Label>
                <Select value={interviewData.interviewType} onValueChange={(value: any) => setInterviewData(prev => ({ ...prev, interviewType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="case-study">Case Study</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="jobDescription">Job Description (Optional)</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the job description here for more targeted questions..."
                  value={interviewData.jobDescription}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, jobDescription: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Button
                  onClick={generateQuestions}
                  disabled={loading || aiLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {loading || aiLoading ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Generating AI Questions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Questions
                    </>
                  )}
                </Button>

                {questions.length > 0 && !isInterviewActive && (
                  <Button onClick={startInterview} className="w-full" variant="outline">
                    <Play className="w-4 h-4 mr-2" />
                    Start Interview
                  </Button>
                )}

                {isInterviewActive && (
                  <Button onClick={resetInterview} className="w-full" variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                )}

                {responses.length > 0 && (
                  <Button onClick={saveInterview} className="w-full" variant="outline">
                    <Save className="w-4 h-4 mr-2" />
                    Save Session
                  </Button>
                )}
              </div>

              {questions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{currentQuestionIndex + 1} / {questions.length}</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Interview Panel */}
        <div className="lg:col-span-2">
          {currentQuestion ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Question {currentQuestionIndex + 1}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant={currentQuestion.type === "technical" ? "default" : currentQuestion.type === "behavioral" ? "secondary" : "outline"}>
                      {currentQuestion.type}
                    </Badge>
                    <Badge variant={currentQuestion.difficulty === "hard" ? "destructive" : currentQuestion.difficulty === "medium" ? "default" : "secondary"}>
                      {currentQuestion.difficulty}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-500">
                  <h3 className="font-semibold text-lg mb-2">Interview Question:</h3>
                  <p className="text-gray-800 leading-relaxed">{currentQuestion.question}</p>
                </div>

                {isInterviewActive && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="answer">Your Answer</Label>
                      <Textarea
                        id="answer"
                        placeholder="Type your answer here..."
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        rows={6}
                        className="mt-2"
                      />
                    </div>

                    <Button
                      onClick={submitAnswer}
                      disabled={loading || aiLoading}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      {loading || aiLoading ? "Evaluating..." : currentQuestionIndex < questions.length - 1 ? "Submit & Next" : "Submit & Finish"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for AI-Powered Interview Practice?</h3>
                <p className="text-gray-600 mb-4">Generate challenging, role-specific questions tailored to your position and experience level</p>
              </CardContent>
            </Card>
          )}

          {/* Feedback Section */}
          {responses.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Interview Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {responses.map((response, index) => (
                  <div key={response.questionId} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Question {index + 1}</h4>
                      <Badge variant={response.score >= 80 ? "default" : response.score >= 60 ? "secondary" : "destructive"}>
                        {response.score}%
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Your Answer:</strong> {response.answer.substring(0, 100)}...
                    </div>
                    <div className="text-sm">
                      <strong>Feedback:</strong> {response.feedback}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
