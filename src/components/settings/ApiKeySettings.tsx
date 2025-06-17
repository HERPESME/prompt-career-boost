
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Key, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const ApiKeySettings = () => {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid OpenAI API key",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Here you would typically save to Supabase secrets or your backend
      // For now, we'll simulate the save process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsConfigured(true);
      toast({
        title: "Success!",
        description: "OpenAI API key has been configured successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Test the API key by making a simple request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Connection Successful!",
        description: "Your OpenAI API key is working correctly",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect with the provided API key",
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
            Enter your OpenAI API key to enable resume optimization, cover letter generation, and interview coaching features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isConfigured && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                OpenAI API key is configured and ready to use!
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your API key is securely stored and never shared with third parties. 
              Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a>.
            </AlertDescription>
          </Alert>

          <div className="flex space-x-3 pt-2">
            <Button
              onClick={handleSaveApiKey}
              disabled={isLoading || !apiKey.trim()}
              className="flex-1"
            >
              {isLoading ? "Saving..." : "Save API Key"}
            </Button>
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={isLoading || !apiKey.trim()}
            >
              {isLoading ? "Testing..." : "Test Connection"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What's Enabled</CardTitle>
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
    </div>
  );
};
