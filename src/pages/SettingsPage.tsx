
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          System Status
        </h1>
        <p className="text-gray-600">All AI features are ready and working</p>
      </div>

      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <CheckCircle className="h-5 w-5 mr-2" />
            AI Features Active
          </CardTitle>
          <CardDescription className="text-green-700">
            All features are powered by free AI services and ready to use
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">✓</span>
            <span className="text-green-700">Resume optimization with intelligent suggestions</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-600">✓</span>
            <span className="text-green-700">Professional cover letter generation</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-600">✓</span>
            <span className="text-green-700">Interactive interview coaching</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-600">✓</span>
            <span className="text-green-700">100% free - no limits or API costs</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
