import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { FileText, Sparkles, Save, Download, Target, Code, Eye } from "lucide-react";
import { useSecureTokens } from "@/hooks/useSecureTokens";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useAI } from "@/hooks/useAI";
import { ResumeUpload } from "./ResumeUpload";
import { generateLaTeXResume } from "./LaTeXGenerator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  skills: string[];
}

export const ResumeBuilder = () => {
  const { user } = useAuthUser();
  const { useToken } = useSecureTokens();
  const { analyzeResume, generateAIResponse, loading: aiLoading } = useAI();
  
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      portfolio: "",
    },
    summary: "",
    experience: [{ company: "", position: "", duration: "", description: "" }],
    education: [{ institution: "", degree: "", year: "" }],
    skills: [],
  });
  
  const [jobDescription, setJobDescription] = useState("");
  const [resumeTitle, setResumeTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [atsScore, setAtsScore] = useState(0);
  const [newSkill, setNewSkill] = useState("");

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [optimizedResumeData, setOptimizedResumeData] = useState<ResumeData | null>(null);
  const [generatedLaTeX, setGeneratedLaTeX] = useState("");
  const [showLaTeXPreview, setShowLaTeXPreview] = useState(false);

  const handleResumeUpload = (file: File, text: string) => {
    setUploadedFile(file);
    setExtractedText(text);
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setExtractedText("");
    setOptimizedResumeData(null);
  };

  const generateWithAI = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use AI optimization.",
        variant: "destructive",
      });
      return;
    }

    if (!jobDescription.trim()) {
      toast({
        title: "Job Description Required",
        description: "Please paste a job description to generate AI-optimized content.",
        variant: "destructive",
      });
      return;
    }

    // Check and consume token securely
    const canUseToken = await useToken('resume');
    if (!canUseToken) {
      return; // Token modal will be shown
    }

    setLoading(true);
    try {
      let contentToOptimize = JSON.stringify(resumeData);
      
      // If user uploaded a resume, include that context
      if (uploadedFile && extractedText) {
        contentToOptimize = `Original Resume: ${extractedText}\n\nForm Data: ${JSON.stringify(resumeData)}`;
      }

      // First, analyze the resume
      const analysis = await analyzeResume(contentToOptimize, jobDescription);
      setAtsScore(analysis.score);

      // Then, generate optimized content
      const optimizationPrompt = `Based on this job description and resume data, optimize the resume content:

JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME DATA:
${contentToOptimize}

Please provide optimized content for each section in JSON format with the same structure as the input data. Focus on:
1. ATS keyword optimization
2. Quantified achievements
3. Relevant skills highlighting
4. Professional summary enhancement
5. Experience descriptions improvement

Return only the JSON data with optimized content.`;

      const optimizedContent = await generateAIResponse(optimizationPrompt, 'resume');
      
      try {
        // Try to parse the AI response as JSON
        const parsedOptimization = JSON.parse(optimizedContent);
        if (parsedOptimization.personalInfo) {
          setOptimizedResumeData(parsedOptimization);
          setResumeData(parsedOptimization);
        }
      } catch (parseError) {
        console.log('AI response not in JSON format, using as text suggestions');
      }
      
      toast({
        title: "Resume Optimization Complete!",
        description: `AI suggestions generated with ATS score of ${analysis.score}%`,
      });
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast({
        title: "Optimization Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateLaTeXOutput = () => {
    const latex = generateLaTeXResume(resumeData);
    setGeneratedLaTeX(latex);
    setShowLaTeXPreview(true);
  };

  const downloadLaTeX = () => {
    if (!generatedLaTeX) {
      generateLaTeXOutput();
      return;
    }
    
    const blob = new Blob([generatedLaTeX], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeTitle || 'resume'}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "LaTeX Downloaded",
      description: "Compile the .tex file with LaTeX to generate your PDF resume.",
    });
  };

  const saveResume = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your resume.",
        variant: "destructive",
      });
      return;
    }

    if (!resumeTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your resume.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title: resumeTitle,
          job_description: jobDescription,
          content: resumeData as any,
          ats_score: atsScore,
          status: "completed",
        });

      if (error) throw error;

      toast({
        title: "Resume Saved!",
        description: "Your resume has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: "", position: "", duration: "", description: "" }]
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { institution: "", degree: "", year: "" }]
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-warm-brown-800 mb-4">
            AI Resume Builder
          </h1>
          <p className="text-warm-brown-600 mb-8">
            Please sign in to access the resume builder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Resume Builder
          </h1>
          <p className="text-gray-600 mt-2">Upload your resume and optimize it with AI assistance</p>
        </div>
        {atsScore > 0 && (
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{atsScore}%</div>
              <div className="text-sm text-gray-600">ATS Score</div>
            </div>
            <Progress value={atsScore} className="w-24" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Assistant Panel */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Resume Upload */}
            <ResumeUpload 
              onResumeUploaded={handleResumeUpload}
              uploadedFile={uploadedFile}
              onRemoveFile={removeUploadedFile}
            />

            {/* AI Assistant */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                  AI Assistant
                </CardTitle>
                <CardDescription>
                  {uploadedFile ? "Optimize your uploaded resume" : "Paste a job description to get AI-powered optimization"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="resumeTitle">Resume Title</Label>
                  <Input
                    id="resumeTitle"
                    placeholder="e.g., Software Engineer Resume"
                    value={resumeTitle}
                    onChange={(e) => setResumeTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="jobDescription">Job Description</Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={8}
                  />
                </div>

                <Button
                  onClick={generateWithAI}
                  disabled={loading || aiLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loading || aiLoading ? "Optimizing..." : "Optimize with AI"}
                  <Target className="w-4 h-4 ml-2" />
                </Button>

                <div className="flex space-x-2">
                  <Button onClick={saveResume} variant="outline" className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  
                  <Dialog open={showLaTeXPreview} onOpenChange={setShowLaTeXPreview}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={generateLaTeXOutput}
                        variant="outline" 
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>LaTeX Resume Preview</DialogTitle>
                        <DialogDescription>
                          This is your generated LaTeX code. Download and compile it to create your PDF resume.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4">
                        <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                          <code>{generatedLaTeX}</code>
                        </pre>
                        <div className="flex space-x-2 mt-4">
                          <Button onClick={downloadLaTeX} className="flex-1">
                            <Download className="w-4 h-4 mr-2" />
                            Download LaTeX
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <Button
                  onClick={downloadLaTeX}
                  variant="default"
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export LaTeX Resume
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Resume Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={resumeData.personalInfo.fullName}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={resumeData.personalInfo.email}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, email: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={resumeData.personalInfo.phone}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, phone: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={resumeData.personalInfo.location}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, location: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={resumeData.personalInfo.linkedin}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="portfolio">Portfolio</Label>
                <Input
                  id="portfolio"
                  value={resumeData.personalInfo.portfolio}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, portfolio: e.target.value }
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Write a compelling professional summary..."
                value={resumeData.summary}
                onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                    {skill} ×
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Work Experience</CardTitle>
                <Button onClick={addExperience} variant="outline" size="sm">
                  Add Experience
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Company</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => {
                          const newExp = [...resumeData.experience];
                          newExp[index].company = e.target.value;
                          setResumeData(prev => ({ ...prev, experience: newExp }));
                        }}
                      />
                    </div>
                    <div>
                      <Label>Position</Label>
                      <Input
                        value={exp.position}
                        onChange={(e) => {
                          const newExp = [...resumeData.experience];
                          newExp[index].position = e.target.value;
                          setResumeData(prev => ({ ...prev, experience: newExp }));
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <Input
                      placeholder="e.g., Jan 2022 - Present"
                      value={exp.duration}
                      onChange={(e) => {
                        const newExp = [...resumeData.experience];
                        newExp[index].duration = e.target.value;
                        setResumeData(prev => ({ ...prev, experience: newExp }));
                      }}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe your achievements and responsibilities..."
                      value={exp.description}
                      onChange={(e) => {
                        const newExp = [...resumeData.experience];
                        newExp[index].description = e.target.value;
                        setResumeData(prev => ({ ...prev, experience: newExp }));
                      }}
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Education</CardTitle>
                <Button onClick={addEducation} variant="outline" size="sm">
                  Add Education
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeData.education.map((edu, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label>Institution</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => {
                        const newEdu = [...resumeData.education];
                        newEdu[index].institution = e.target.value;
                        setResumeData(prev => ({ ...prev, education: newEdu }));
                      }}
                    />
                  </div>
                  <div>
                    <Label>Degree</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => {
                        const newEdu = [...resumeData.education];
                        newEdu[index].degree = e.target.value;
                        setResumeData(prev => ({ ...prev, education: newEdu }));
                      }}
                    />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input
                      value={edu.year}
                      onChange={(e) => {
                        const newEdu = [...resumeData.education];
                        newEdu[index].year = e.target.value;
                        setResumeData(prev => ({ ...prev, education: newEdu }));
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
