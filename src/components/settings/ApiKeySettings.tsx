
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Key, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ApiKeySettings = () => {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    setIsCheckingStatus(true);
    try {
      // Test if API key is configured by making a test call
      const response = await supabase.functions.invoke('generate-resume', {
        body: {
          jobDescription: "test",
          currentData: { personalInfo: { fullName: "Test" }, summary: "", experience: [], education: [], skills: [] }
        },
      });

      // If we get a response (even an error), it means the API key is configured
      // If we get a specific "API key not configured" error, then it's not set
      if (response.error && response.error.message?.includes('OpenAI API key not configured')) {
        setIsConfigured(false);
      } else {
        setIsConfigured(true);
      }
    } catch (error: any) {
      // If we can't reach the function at all, assume not configured
      setIsConfigured(false);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('generate-resume', {
        body: {
          jobDescription: "Software Engineer position requiring JavaScript and React skills",
          currentData: {
            personalInfo: { fullName: "Test User", email: "test@example.com", phone: "", location: "", linkedin: "", portfolio: "" },
            summary: "Test summary",
            experience: [],
            education: [],
            skills: ["JavaScript", "React"]
          }
        },
      });

      if (response.error) {
        if (response.error.message?.includes('OpenAI API key not configured')) {
          throw new Error("OpenAI API key is not configured properly");
        } else {
          throw new Error(response.error.message);
        }
      }
      
      setIsConfigured(true);
      toast({
        title: "Connection Successful!",
        description: "Your OpenAI API key is working correctly",
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Unable to connect with the provided API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            API Configuration
          </h1>
          <p className="text-gray-600">Checking API configuration status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          API Configuration
        </h1>
        <p className="text-gray-600">
          Configure your OpenAI API key to enable AI-powered features
        </p>
      </div>

      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-blue-600" />
            <CardTitle>OpenAI API Key</CardTitle>
          </div>
          <CardDescription>
            Your OpenAI API key enables resume optimization, cover letter generation, and interview coaching features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConfigured ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ OpenAI API key is configured and ready to use! All AI features are now available.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                ⚠️ OpenAI API key is not configured. Please set it up in your Supabase Edge Function secrets.
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your API key is securely stored in Supabase Edge Function secrets and never shared with third parties. 
              Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a>.
            </AlertDescription>
          </Alert>

          <div className="pt-2">
            <Button
              onClick={handleTestConnection}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? "Testing Connection..." : "Test API Connection"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Features Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="font-medium">AI Resume Optimization</span>
              </div>
              <span className={`text-sm ${isConfigured ? 'text-green-600' : 'text-gray-500'}`}>
                {isConfigured ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="font-medium">Cover Letter Generation</span>
              </div>
              <span className={`text-sm ${isConfigured ? 'text-green-600' : 'text-gray-500'}`}>
                {isConfigured ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="font-medium">Interview Coaching</span>
              </div>
              <span className={`text-sm ${isConfigured ? 'text-green-600' : 'text-gray-500'}`}>
                {isConfigured ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {isConfigured && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">🎉 You're All Set!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 mb-4">
              Your OpenAI API key is working perfectly. You can now use all AI-powered features:
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-green-700">Create optimized resumes with AI suggestions</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-green-700">Generate personalized cover letters</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-green-700">Practice interviews with AI feedback</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
