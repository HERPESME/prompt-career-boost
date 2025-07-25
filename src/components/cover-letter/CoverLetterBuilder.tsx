import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { FileText, Sparkles, Save, Download, RefreshCw } from "lucide-react";
import { useSecureTokens } from "@/hooks/useSecureTokens";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useAI } from "@/hooks/useAI";

export const CoverLetterBuilder = () => {
  const { user } = useAuthUser();
  const { useToken } = useSecureTokens();
  const { generateAIResponse, loading: aiLoading } = useAI();
  
  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    position: "",
    jobDescription: "",
    resumeId: "",
  });
  const [coverLetterContent, setCoverLetterContent] = useState("");
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchResumes();
    }
  }, [user]);

  const fetchResumes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("resumes")
        .select("id, title")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error: any) {
      console.error("Error fetching resumes:", error);
      toast({
        title: "Error",
        description: "Failed to load your resumes.",
        variant: "destructive",
      });
    }
  };

  const generateCoverLetter = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate cover letters.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.companyName || !formData.position) {
      toast({
        title: "Missing Information",
        description: "Please fill in the company name and position.",
        variant: "destructive",
      });
      return;
    }

    // Check and consume token securely
    const canUseToken = await useToken('cover-letter');
    if (!canUseToken) {
      return; // Token modal will be shown
    }

    setLoading(true);
    try {
      let resumeContent = null;
      if (formData.resumeId) {
        const { data: resumeData } = await supabase
          .from("resumes")
          .select("content")
          .eq("id", formData.resumeId)
          .eq("user_id", user.id) // Additional security check
          .single();
        resumeContent = resumeData?.content;
      }

      // Create comprehensive prompt for cover letter generation
      const prompt = `Create a professional cover letter for:
- Position: ${formData.position}
- Company: ${formData.companyName}
- Job Description: ${formData.jobDescription || 'Not provided'}
${resumeContent ? `- Candidate Background: ${JSON.stringify(resumeContent)}` : ''}

Make it personalized, professional, and compelling. Include specific examples that match the job requirements.`;

      const response = await generateAIResponse(prompt, 'cover-letter');
      setCoverLetterContent(response);
      
      toast({
        title: "Cover Letter Generated!",
        description: "Your personalized cover letter has been created.",
      });
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCoverLetter = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save cover letters.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim() || !coverLetterContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a title and generate content first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("cover_letters")
        .insert({
          user_id: user.id,
          resume_id: formData.resumeId || null,
          title: formData.title,
          company_name: formData.companyName,
          position: formData.position,
          job_description: formData.jobDescription,
          content: coverLetterContent,
        });

      if (error) throw error;

      toast({
        title: "Cover Letter Saved!",
        description: "Your cover letter has been saved successfully.",
      });
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save cover letter. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-warm-brown-800 mb-4">
            AI Cover Letter Writer
          </h1>
          <p className="text-warm-brown-600 mb-8">
            Please sign in to access the cover letter generator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Cover Letter Writer
          </h1>
          <p className="text-gray-600 mt-2">Generate personalized cover letters with AI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
              Cover Letter Details
            </CardTitle>
            <CardDescription>
              Provide job details to generate a personalized cover letter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Cover Letter for Software Engineer at Google"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Google"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  placeholder="e.g., Software Engineer"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="resumeSelect">Select Resume (Optional)</Label>
              <Select value={formData.resumeId} onValueChange={(value) => setFormData(prev => ({ ...prev, resumeId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a resume to reference" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      {resume.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="jobDescription">Job Description (Optional)</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the job description here for better personalization..."
                value={formData.jobDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                rows={6}
              />
            </div>

            <Button
              onClick={generateCoverLetter}
              disabled={loading || aiLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading || aiLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Cover Letter
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Generated Cover Letter
              </CardTitle>
              <div className="flex space-x-2">
                <Button onClick={saveCoverLetter} variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {coverLetterContent ? (
              <div className="space-y-4">
                <Textarea
                  value={coverLetterContent}
                  onChange={(e) => setCoverLetterContent(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />
                <div className="text-sm text-gray-600">
                  You can edit the generated content above before saving.
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Your generated cover letter will appear here</p>
                <p className="text-sm mt-1">Fill in the details and click "Generate Cover Letter"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
