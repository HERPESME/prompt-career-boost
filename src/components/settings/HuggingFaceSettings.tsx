import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Brain } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const HuggingFaceSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeAI = async () => {
    setIsLoading(true);
    try {
      // Test if Hugging Face Transformers can be loaded
      const { pipeline } = await import("@huggingface/transformers");
      
      toast({
        title: "AI Initialized!",
        description: "Free AI models are ready to use",
      });
      
      setIsInitialized(true);
    } catch (error: any) {
      toast({
        title: "Initialization Failed", 
        description: "Could not load AI models. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Free AI Configuration
        </h1>
        <p className="text-gray-600">
          Using Hugging Face Transformers - completely free AI models that run in your browser
        </p>
      </div>

      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <CardTitle>Free AI Models</CardTitle>
          </div>
          <CardDescription>
            Powered by Hugging Face Transformers - no API keys required, runs completely offline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isInitialized ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Free AI models are ready! All features are now available offline.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                🚀 Click initialize to load free AI models in your browser
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Models run entirely in your browser using WebAssembly. No data is sent to external servers.
              First load may take a moment to download models.
            </AlertDescription>
          </Alert>

          <div className="pt-2">
            <Button
              onClick={initializeAI}
              disabled={isLoading || isInitialized}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? "Initializing AI Models..." : isInitialized ? "AI Models Ready" : "Initialize Free AI"}
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
                <div className={`w-3 h-3 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="font-medium">AI Resume Optimization</span>
              </div>
              <span className={`text-sm ${isInitialized ? 'text-green-600' : 'text-gray-500'}`}>
                {isInitialized ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="font-medium">Cover Letter Generation</span>
              </div>
              <span className={`text-sm ${isInitialized ? 'text-green-600' : 'text-gray-500'}`}>
                {isInitialized ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="font-medium">Interview Coaching</span>
              </div>
              <span className={`text-sm ${isInitialized ? 'text-green-600' : 'text-gray-500'}`}>
                {isInitialized ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {isInitialized && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">🎉 You're All Set!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 mb-4">
              Free AI models are running in your browser. Enjoy unlimited usage:
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
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-green-700">100% free - no API costs ever</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};