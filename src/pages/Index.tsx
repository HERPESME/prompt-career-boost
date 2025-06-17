import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAuthUser } from "@/hooks/useAuthUser";
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
  Award,
  LogOut,
  Sparkles,
  Zap
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [authDialog, setAuthDialog] = useState({ isOpen: false, mode: "signin" as "signin" | "signup" });
  const { user, loading, signOut } = useAuthUser();
  const navigate = useNavigate();

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
    if (!user) {
      setAuthDialog({ isOpen: true, mode: "signin" });
      return;
    }

    switch (type) {
      case "Resume":
        navigate("/resume");
        break;
      case "Cover Letter":
        navigate("/cover-letter");
        break;
      case "Interview Practice":
        navigate("/interview");
        break;
      default:
        toast({
          title: `Creating ${type}`,
          description: "This feature will be available soon!",
        });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    CareerBoost AI
                  </h1>
                  <p className="text-xs text-gray-500">AI-Powered Career Assistant</p>
                </div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-1">
              <Button 
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                onClick={() => setActiveTab("dashboard")}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
              <Button 
                variant={activeTab === "resume" ? "default" : "ghost"}
                onClick={() => user ? navigate("/resume") : setAuthDialog({ isOpen: true, mode: "signin" })}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200"
              >
                <FileText className="w-4 h-4" />
                <span>Resume Builder</span>
              </Button>
              <Button 
                variant={activeTab === "interview" ? "default" : "ghost"}
                onClick={() => user ? navigate("/interview") : setAuthDialog({ isOpen: true, mode: "signin" })}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Interview Coach</span>
              </Button>
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      onClick={handleSignOut}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => setAuthDialog({ isOpen: true, mode: "signin" })}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => setAuthDialog({ isOpen: true, mode: "signup" })}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="dashboard" className="space-y-8">
            {/* Enhanced Welcome Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="max-w-2xl">
                  <h2 className="text-4xl font-bold mb-3">
                    {user ? `Welcome back, ${user.email?.split('@')[0]}!` : "Welcome to CareerBoost AI"}
                  </h2>
                  <p className="text-blue-100 text-lg mb-6">
                    {user 
                      ? "Ready to advance your career with AI-powered tools?"
                      : "Transform your career with AI-powered resume building, cover letters, and interview coaching."
                    }
                  </p>
                  {!user && (
                    <Button
                      onClick={() => setAuthDialog({ isOpen: true, mode: "signup" })}
                      className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg shadow-lg"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Start Your Journey
                    </Button>
                  )}
                </div>
                <div className="hidden lg:block">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">12</div>
                      <div className="text-sm text-blue-100">Applications sent</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-pink-500/30 to-transparent rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-transparent rounded-full blur-2xl"></div>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 border-0 bg-gradient-to-br from-blue-50 to-blue-100" onClick={() => handleCreateNew("Resume")}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300 shadow-lg">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <Plus className="w-5 h-5 text-blue-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">AI Resume Builder</CardTitle>
                  <CardDescription className="text-gray-600">Build ATS-optimized resumes with AI assistance and real-time feedback</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 border-0 bg-gradient-to-br from-purple-50 to-purple-100" onClick={() => handleCreateNew("Cover Letter")}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300 shadow-lg">
                      <MessageSquare className="w-7 h-7 text-white" />
                    </div>
                    <Plus className="w-5 h-5 text-purple-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Cover Letter Writer</CardTitle>
                  <CardDescription className="text-gray-600">Generate personalized cover letters tailored to specific job postings</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 border-0 bg-gradient-to-br from-green-50 to-green-100" onClick={() => handleCreateNew("Interview Practice")}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl group-hover:from-green-600 group-hover:to-green-700 transition-all duration-300 shadow-lg">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <Plus className="w-5 h-5 text-green-400 group-hover:text-green-600 transition-colors" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Interview Coach</CardTitle>
                  <CardDescription className="text-gray-600">Practice interviews with AI feedback and personalized coaching tips</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
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

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
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

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
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

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
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
              <Card className="shadow-lg">
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
              <Card className="shadow-lg">
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

      <AuthDialog
        isOpen={authDialog.isOpen}
        onClose={() => setAuthDialog(prev => ({ ...prev, isOpen: false }))}
        mode={authDialog.mode}
        onModeChange={(mode) => setAuthDialog(prev => ({ ...prev, mode }))}
      />
    </div>
  );
};

export default Index;
