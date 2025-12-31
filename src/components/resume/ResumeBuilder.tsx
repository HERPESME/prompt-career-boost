import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { FileText, Sparkles, Save, Download, Target, Code, Eye, PanelLeftClose, PanelLeft, Palette, Loader2 } from "lucide-react";
import { useSecureTokens } from "@/hooks/useSecureTokens";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useAI } from "@/hooks/useAI";
import { ResumeUpload } from "./ResumeUpload";
import { ResumePreview } from "./ResumePreview";
import { ExportOptions } from "./ExportOptions";
import { generateLaTeXResume } from "./LaTeXGenerator";
import { generateLaTeXFromTemplate, suggestTemplate, TEMPLATE_OPTIONS, TemplateId } from "./LaTeXTemplates";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const { analyzeResume, generateAIResponse, optimizeLaTeX, loading: aiLoading } = useAI();
  
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
  const [generatedLaTeX, setGeneratedLaTeX] = useState("");
  const [showLaTeXPreview, setShowLaTeXPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [liveLaTeX, setLiveLaTeX] = useState("");

  // Generate live LaTeX whenever resumeData or template changes
  const currentLaTeX = useMemo(() => {
    return generateLaTeXFromTemplate(selectedTemplate, resumeData);
  }, [resumeData, selectedTemplate]);

  // Update liveLaTeX when currentLaTeX changes (unless manually optimized)
  useEffect(() => {
    if (!isOptimizing) {
      setLiveLaTeX(currentLaTeX);
    }
  }, [currentLaTeX, isOptimizing]);

  const handleResumeUpload = async (file: File, text: string) => {
    setUploadedFile(file);
    setExtractedText(text);
    setIsParsing(true);

    try {
      // Use AI to parse the resume text into structured data
      const parsePrompt = `Parse this resume text and extract the information into a JSON structure. Be accurate and only extract information that is explicitly present in the resume. If a field is not found, leave it as an empty string or empty array.

RESUME TEXT:
${text}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "personalInfo": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "portfolio": ""
  },
  "summary": "",
  "experience": [
    {
      "company": "",
      "position": "",
      "duration": "",
      "description": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "year": ""
    }
  ],
  "skills": []
}`;

      const response = await generateAIResponse(parsePrompt, 'resume');
      
      try {
        // Clean up the response - remove markdown code blocks if present
        let cleanedResponse = response.trim();
        if (cleanedResponse.startsWith('```json')) {
          cleanedResponse = cleanedResponse.slice(7);
        } else if (cleanedResponse.startsWith('```')) {
          cleanedResponse = cleanedResponse.slice(3);
        }
        if (cleanedResponse.endsWith('```')) {
          cleanedResponse = cleanedResponse.slice(0, -3);
        }
        cleanedResponse = cleanedResponse.trim();

        const parsedData = JSON.parse(cleanedResponse);
        
        // Validate and merge with existing structure
        if (parsedData.personalInfo || parsedData.experience || parsedData.education || parsedData.skills) {
          setResumeData(prev => ({
            personalInfo: {
              fullName: parsedData.personalInfo?.fullName || prev.personalInfo.fullName,
              email: parsedData.personalInfo?.email || prev.personalInfo.email,
              phone: parsedData.personalInfo?.phone || prev.personalInfo.phone,
              location: parsedData.personalInfo?.location || prev.personalInfo.location,
              linkedin: parsedData.personalInfo?.linkedin || prev.personalInfo.linkedin,
              portfolio: parsedData.personalInfo?.portfolio || prev.personalInfo.portfolio,
            },
            summary: parsedData.summary || prev.summary,
            experience: Array.isArray(parsedData.experience) && parsedData.experience.length > 0 
              ? parsedData.experience.filter((e: any) => e.company || e.position)
              : prev.experience,
            education: Array.isArray(parsedData.education) && parsedData.education.length > 0
              ? parsedData.education.filter((e: any) => e.institution || e.degree)
              : prev.education,
            skills: Array.isArray(parsedData.skills) && parsedData.skills.length > 0
              ? parsedData.skills
              : prev.skills,
          }));
          
          toast({
            title: "Resume Parsed Successfully!",
            description: "Form fields have been auto-filled. Review and add your target job description.",
          });

          // Auto-suggest best template based on content
          const suggestedTemplate = suggestTemplate(parsedData, text);
          setSelectedTemplate(suggestedTemplate);
          toast({
            title: `Template Selected: ${TEMPLATE_OPTIONS.find(t => t.id === suggestedTemplate)?.name}`,
            description: "You can change this in the template selector.",
          });
        } else {
          throw new Error("Invalid parsed structure");
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        
        // Fallback: Try to extract basic info from raw text using regex
        try {
          const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
          const phoneMatch = text.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/);
          const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
          
          // Try to get name from first line
          const lines = text.split('\n').filter(l => l.trim());
          const possibleName = lines[0]?.trim();
          const isName = possibleName && possibleName.length < 50 && /^[A-Z][a-z]+ [A-Z][a-z]+/.test(possibleName);
          
          if (emailMatch || phoneMatch || isName) {
            setResumeData(prev => ({
              ...prev,
              personalInfo: {
                ...prev.personalInfo,
                fullName: isName ? possibleName : prev.personalInfo.fullName,
                email: emailMatch ? emailMatch[0] : prev.personalInfo.email,
                phone: phoneMatch ? phoneMatch[0] : prev.personalInfo.phone,
                linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : prev.personalInfo.linkedin,
              },
            }));
            
            toast({
              title: "Basic Info Extracted",
              description: "Some fields auto-filled. Please complete the rest.",
            });
          } else {
            toast({
              title: "Manual Entry Needed",
              description: "Please fill in your information manually.",
              variant: "default",
            });
          }
        } catch (fallbackError) {
          toast({
            title: "Manual Entry Needed",
            description: "Please fill in the form manually.",
            variant: "default",
          });
        }
      }
    } catch (error) {
      console.error("AI parsing error:", error);
      
      // Even on complete failure, try basic regex extraction
      try {
        const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
        const phoneMatch = text.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/);
        
        if (emailMatch || phoneMatch) {
          setResumeData(prev => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              email: emailMatch ? emailMatch[0] : prev.personalInfo.email,
              phone: phoneMatch ? phoneMatch[0] : prev.personalInfo.phone,
            },
          }));
          toast({
            title: "Basic Info Found",
            description: "Email/phone extracted. Please fill remaining fields.",
          });
        } else {
          toast({
            title: "Parse Failed",
            description: "Please fill the form manually.",
            variant: "destructive",
          });
        }
      } catch (e) {
        toast({
          title: "Parse Failed", 
          description: "Please fill the form manually.",
          variant: "destructive",
        });
      }
    } finally {
      setIsParsing(false);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setExtractedText("");
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
    setIsOptimizing(true);
    
    try {
      // Get the current live LaTeX code
      const currentLatexCode = liveLaTeX || currentLaTeX;
      
      // Use the dedicated optimizeLaTeX function
      const result = await optimizeLaTeX(currentLatexCode, jobDescription);
      
      // Update state with optimized LaTeX
      setLiveLaTeX(result.optimizedLaTeX);
      setGeneratedLaTeX(result.optimizedLaTeX);
      setAtsScore(result.score);
      
      toast({
        title: "Resume Optimized!",
        description: `Your resume has been optimized for ATS with a score of ${result.score}%`,
      });
      
      // Log improvements for debugging
      console.log('📝 Optimization improvements:', result.improvements);
      
    } catch (error: any) {
      console.error("AI optimization error:", error);
      toast({
        title: "Optimization Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsOptimizing(false);
    }
  };

  const generateLaTeXOutput = () => {
    const latex = liveLaTeX || generateLaTeXFromTemplate(selectedTemplate, resumeData);
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
    a.download = `${resumeTitle || 'optimized_resume'}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "LaTeX Downloaded",
      description: "Compile the .tex file with LaTeX to generate your professionally formatted PDF resume.",
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
      // Get the current LaTeX (either optimized or generated from template)
      const latexToSave = liveLaTeX || generateLaTeXFromTemplate(selectedTemplate, resumeData);
      
      const { error } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title: resumeTitle,
          job_description: jobDescription,
          content: {
            ...resumeData,
            latex_code: latexToSave,
            selected_template: selectedTemplate,
          } as any,
          ats_score: atsScore,
          status: "completed",
        });

      if (error) throw error;

      toast({
        title: "Resume Saved!",
        description: "Your resume and optimized LaTeX have been saved successfully.",
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
    <div className={`mx-auto p-6 space-y-8 ${showPreview ? 'max-w-[1600px]' : 'max-w-6xl'}`}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Resume Builder
          </h1>
          <p className="text-slate-600 mt-1">Create an ATS-optimized resume tailored to your target role</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Template Selector */}
          <div className="flex items-center gap-2">
            <Label htmlFor="template-select" className="text-sm font-medium text-slate-600 whitespace-nowrap">
              <Palette className="w-4 h-4 inline mr-1" />
              Template:
            </Label>
            <Select value={selectedTemplate} onValueChange={(value: TemplateId) => setSelectedTemplate(value)}>
              <SelectTrigger className="w-[180px] border-slate-300">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_OPTIONS.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{template.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview Toggle */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="border-slate-300 hover:bg-slate-50"
          >
            {showPreview ? (
              <>
                <PanelLeftClose className="w-4 h-4 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <PanelLeft className="w-4 h-4 mr-2" />
                Show Preview
              </>
            )}
          </Button>
          
          {atsScore > 0 && (
            <div className="flex items-center gap-4 px-5 py-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">{atsScore}%</div>
                <div className="text-xs font-medium text-emerald-700 uppercase tracking-wide">ATS Score</div>
              </div>
              <Progress value={atsScore} className="w-28 h-2" />
            </div>
          )}
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-8 ${showPreview ? 'xl:grid-cols-[1fr_2fr_1.5fr] lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
        {/* AI Assistant Panel */}
        <div className={showPreview ? '' : 'lg:col-span-1'}>
          <div className="space-y-6">
            {/* Resume Upload */}
            <ResumeUpload 
              onResumeUploaded={handleResumeUpload}
              uploadedFile={uploadedFile}
              onRemoveFile={removeUploadedFile}
              isProcessing={isParsing}
            />

            {/* AI Assistant */}
            <Card className="sticky top-6 border-slate-200 shadow-lg">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
                <CardTitle className="flex items-center text-slate-800">
                  <div className="p-2 rounded-lg bg-indigo-100 mr-3">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  AI Optimization
                </CardTitle>
                <CardDescription className="text-slate-600">
                  {uploadedFile ? "Your resume is ready for optimization" : "Upload a resume and paste a job description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div className="space-y-2">
                  <Label htmlFor="resumeTitle" className="text-sm font-medium text-slate-700">Resume Title</Label>
                  <Input
                    id="resumeTitle"
                    placeholder="e.g., Software Engineer Resume"
                    value={resumeTitle}
                    onChange={(e) => setResumeTitle(e.target.value)}
                    className="border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jobDescription" className="text-sm font-medium text-slate-700">Target Job Description</Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste the job description here for AI optimization..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={8}
                    className="border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20 resize-none"
                  />
                </div>

                <Button
                  onClick={generateWithAI}
                  disabled={loading || aiLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-5 shadow-md hover:shadow-lg transition-all"
                >
                  {loading || aiLoading ? "Optimizing..." : "Optimize with AI"}
                  <Target className="w-4 h-4 ml-2" />
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={saveResume} variant="outline" className="border-slate-300 hover:bg-slate-50">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  
                  <Dialog open={showLaTeXPreview} onOpenChange={setShowLaTeXPreview}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={generateLaTeXOutput}
                        variant="outline" 
                        className="border-slate-300 hover:bg-slate-50"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Professional LaTeX Resume</DialogTitle>
                        <DialogDescription>
                          Your resume formatted with the professional AlgoUniversity template for maximum ATS compatibility.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4">
                        <pre className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-xs overflow-x-auto">
                          <code className="text-slate-700">{generatedLaTeX}</code>
                        </pre>
                        <div className="flex space-x-2 mt-4">
                          <Button onClick={downloadLaTeX} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                            <Download className="w-4 h-4 mr-2" />
                            Download LaTeX
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <ExportOptions 
                  resumeData={resumeData}
                  resumeTitle={resumeTitle}
                  className="w-full font-medium py-5"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Resume Form */}
        <div className={showPreview ? '' : 'lg:col-span-2'} style={{ gridColumn: showPreview ? 'span 1' : undefined }}>
          <div className="space-y-6">
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

        {/* Resume Preview Panel */}
        {showPreview && (
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-indigo-600" />
                  Live Preview
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {TEMPLATE_OPTIONS.find(t => t.id === selectedTemplate)?.name}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateLaTeXOutput}
                    className="text-xs"
                  >
                    <Code className="w-3 h-3 mr-1" />
                    View LaTeX
                  </Button>
                </div>
              </div>
              
              {/* Show optimization status */}
              {isOptimizing && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-sm text-indigo-700">AI is optimizing your resume...</span>
                </div>
              )}
              
              <ResumePreview data={resumeData} className="shadow-xl" />
              
              {/* LaTeX Code Info */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500">
                  <Code className="w-3 h-3 inline mr-1" />
                  LaTeX code is generated live from your data using the <strong>{TEMPLATE_OPTIONS.find(t => t.id === selectedTemplate)?.name}</strong> template.
                  Click "View LaTeX" to see and download the code.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
