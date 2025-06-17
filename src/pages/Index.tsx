
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  FileText, 
  MessageSquare, 
  User, 
  Settings, 
  Plus, 
  Download, 
  Eye,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Award
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Mock data for demonstration
  const mockResumes = [
    {
      id: 1,
      title: "Software Engineer Resume",
      status: "completed",
      lastModified: "2 days ago",
      atsScore: 87,
      company: "Google"
    },
    {
      id: 2,
      title: "Product Manager Resume",
      status: "in-progress",
      lastModified: "1 week ago",
      atsScore: 72,
      company: "Microsoft"
    },
    {
      id: 3,
      title: "Data Scientist Resume",
      status: "draft",
      lastModified: "3 days ago",
      atsScore: 65,
      company: "OpenAI"
    }
  ];

  const mockInterviews = [
    {
      id: 1,
      type: "Technical Interview",
      company: "Google",
      score: 85,
      date: "Yesterday",
      duration: "45 min"
    },
    {
      id: 2,
      type: "Behavioral Interview",
      company: "Microsoft",
      score: 78,
      date: "3 days ago",
      duration: "30 min"
    }
  ];

  const handleCreateNew = (type: string) => {
    toast({
      title: `Creating ${type}`,
      description: "This feature will be available soon!",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in-progress": return <Clock className="w-4 h-4 text-blue-600" />;
      case "draft": return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Career Assistant
                </h1>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Button 
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                onClick={() => setActiveTab("dashboard")}
                className="flex items-center space-x-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
              <Button 
                variant={activeTab === "resume" ? "default" : "ghost"}
                onClick={() => setActiveTab("resume")}
                className="flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Resume Builder</span>
              </Button>
              <Button 
                variant={activeTab === "interview" ? "default" : "ghost"}
                onClick={() => setActiveTab("interview")}
                className="flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Interview Coach</span>
              </Button>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="dashboard" className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Welcome back, John!</h2>
                  <p className="text-blue-100 text-lg">Ready to advance your career with AI assistance?</p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">12</div>
                      <div className="text-sm text-blue-100">Applications sent</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => handleCreateNew("Resume")}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  </div>
                  <CardTitle className="text-lg">Create Resume</CardTitle>
                  <CardDescription>Build an ATS-optimized resume with AI assistance</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => handleCreateNew("Cover Letter")}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <MessageSquare className="w-6 h-6 text-purple-600" />
                    </div>
                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  </div>
                  <CardTitle className="text-lg">Write Cover Letter</CardTitle>
                  <CardDescription>Generate personalized cover letters instantly</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => handleCreateNew("Interview Practice")}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  </div>
                  <CardTitle className="text-lg">Practice Interview</CardTitle>
                  <CardDescription>Simulate real interviews with AI feedback</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">5</p>
                      <p className="text-sm text-gray-600">Resumes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <MessageSquare className="w-8 h-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">3</p>
                      <p className="text-sm text-gray-600">Cover Letters</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Target className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">8</p>
                      <p className="text-sm text-gray-600">Mock Interviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-orange-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">85%</p>
                      <p className="text-sm text-gray-600">Avg ATS Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Resumes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Recent Resumes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockResumes.map((resume) => (
                    <div key={resume.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(resume.status)}
                        <div>
                          <h4 className="font-medium">{resume.title}</h4>
                          <p className="text-sm text-gray-600">For {resume.company} • {resume.lastModified}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(resume.status)}>
                          {resume.status}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm font-medium">ATS: {resume.atsScore}%</div>
                          <Progress value={resume.atsScore} className="w-16 h-2" />
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Interviews */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Recent Interview Practice
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockInterviews.map((interview) => (
                    <div key={interview.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{interview.type}</h4>
                          <p className="text-sm text-gray-600">{interview.company} • {interview.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">Score: {interview.score}%</div>
                        <div className="text-xs text-gray-500">{interview.duration}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resume" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resume Builder</CardTitle>
                <CardDescription>Create professional, ATS-optimized resumes with AI assistance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Resume Builder Coming Soon</h3>
                  <p className="text-gray-600 mb-4">Connect to Supabase to enable full functionality</p>
                  <Button onClick={() => handleCreateNew("Resume")}>
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interview Coach</CardTitle>
                <CardDescription>Practice interviews with AI-powered feedback and coaching</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Interview Coach Coming Soon</h3>
                  <p className="text-gray-600 mb-4">Connect to Supabase to enable full functionality</p>
                  <Button onClick={() => handleCreateNew("Interview Practice")}>
                    Start Practice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
