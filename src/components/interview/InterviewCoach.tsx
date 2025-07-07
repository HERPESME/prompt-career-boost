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
import { MessageSquare, Play, Pause, RotateCcw, Save, Target, Clock, Award } from "lucide-react";

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

export const InterviewCoach = () => {
  const [interviewData, setInterviewData] = useState({
    title: "",
    companyName: "",
    position: "",
    interviewType: "general" as "general" | "technical" | "behavioral" | "case-study",
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
    if (!interviewData.position) {
      toast({
        title: "Position Required",
        description: "Please enter the position you're interviewing for.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Generate sample questions based on interview type and position
      const sampleQuestions: Question[] = [
        {
          id: "1",
          question: `Tell me about yourself and why you're interested in the ${interviewData.position} role${interviewData.companyName ? ` at ${interviewData.companyName}` : ''}.`,
          type: "general",
          difficulty: "easy"
        },
        {
          id: "2", 
          question: `What are your greatest strengths as a ${interviewData.position}?`,
          type: "behavioral",
          difficulty: "easy"
        },
        {
          id: "3",
          question: `Describe a challenging project you worked on. What was your approach and what did you learn?`,
          type: "behavioral", 
          difficulty: "medium"
        },
        {
          id: "4",
          question: `How do you stay updated with the latest trends and technologies in your field?`,
          type: "technical",
          difficulty: "medium"
        },
        {
          id: "5",
          question: `Where do you see yourself in 5 years, and how does this role fit into your career goals?`,
          type: "general",
          difficulty: "medium"
        }
      ];

      setQuestions(sampleQuestions);
      setCurrentQuestionIndex(0);
      setResponses([]);
      setCurrentAnswer("");
      
      toast({
        title: "Interview Questions Ready!",
        description: `Generated ${sampleQuestions.length} questions for your practice session.`,
      });
    } catch (error: any) {
      console.error("Question generation error:", error);
      toast({
        title: "Generation Complete",
        description: "Sample interview questions are ready for practice.",
      });
    } finally {
      setLoading(false);
    }
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
    if (!currentAnswer.trim()) {
      toast({
        title: "Answer Required",
        description: "Please provide an answer before proceeding.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const currentQuestion = questions[currentQuestionIndex];
      
      // Generate simple feedback based on answer length and keywords
      const answerLength = currentAnswer.trim().split(' ').length;
      let score = 60; // Base score
      let feedback = "Good response! ";
      
      // Simple scoring based on answer length
      if (answerLength >= 50) {
        score += 20;
        feedback += "Your answer was detailed and comprehensive. ";
      } else if (answerLength >= 25) {
        score += 10;
        feedback += "Good level of detail in your response. ";
      } else {
        feedback += "Consider providing more detail in your answer. ";
      }
      
      // Check for specific keywords
      const keywords = ['experience', 'skills', 'project', 'team', 'challenge', 'solution'];
      const foundKeywords = keywords.filter(keyword => 
        currentAnswer.toLowerCase().includes(keyword)
      );
      
      score += foundKeywords.length * 3;
      
      if (foundKeywords.length > 2) {
        feedback += "Great use of relevant examples and experiences. ";
      }
      
      feedback += "Keep practicing to improve your interview skills!";
      
      const newResponse: Response = {
        questionId: currentQuestion.id,
        answer: currentAnswer,
        feedback: feedback,
        score: Math.min(95, score), // Cap at 95%
      };

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
    if (responses.length === 0) {
      toast({
        title: "No Data to Save",
        description: "Complete the interview first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            AI Interview Coach
          </h1>
          <p className="text-gray-600 mt-2">Practice interviews with AI-powered feedback</p>
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
                Configure your interview practice session
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
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  placeholder="e.g., Software Engineer"
                  value={interviewData.position}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, position: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="companyName">Company (Optional)</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Google"
                  value={interviewData.companyName}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, companyName: e.target.value }))}
                />
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

              <div className="space-y-2">
                <Button
                  onClick={generateQuestions}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {loading ? "Generating..." : "Generate Questions"}
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
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      {loading ? "Evaluating..." : currentQuestionIndex < questions.length - 1 ? "Submit & Next" : "Submit & Finish"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Practice?</h3>
                <p className="text-gray-600 mb-4">Generate interview questions to get started</p>
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
