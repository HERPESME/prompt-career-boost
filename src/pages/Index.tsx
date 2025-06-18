
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, FileText, PenTool, MessageSquare, Star, Users, Award, Zap, Check, Sparkles, ChevronRight, Play, Code, Briefcase, TrendingUp, Shield } from "lucide-react";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const { user } = useAuthUser();
  const featuresRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: FileText,
      title: "AI Resume Builder",
      description: "Create ATS-optimized resumes tailored to specific job descriptions with AI assistance.",
      href: "/resume",
      gradient: "from-blue-600 to-indigo-600",
      bgGradient: "from-blue-50/80 to-indigo-50/80",
      hoverGradient: "from-blue-700 to-indigo-700"
    },
    {
      icon: PenTool,
      title: "Cover Letter Generator",
      description: "Generate personalized cover letters that highlight your strengths and match company culture.",
      href: "/cover-letter",
      gradient: "from-indigo-600 to-purple-600",
      bgGradient: "from-indigo-50/80 to-purple-50/80",
      hoverGradient: "from-indigo-700 to-purple-700"
    },
    {
      icon: MessageSquare,
      title: "Interview Coach",
      description: "Practice with AI-powered mock interviews and get detailed feedback to improve your performance.",
      href: "/interview",
      gradient: "from-purple-600 to-pink-600",
      bgGradient: "from-purple-50/80 to-pink-50/80",
      hoverGradient: "from-purple-700 to-pink-700"
    }
  ];

  const stats = [
    { icon: Users, label: "Active Users", value: "50,000+", color: "text-blue-600" },
    { icon: Award, label: "Success Rate", value: "94%", color: "text-indigo-600" },
    { icon: Star, label: "Average Rating", value: "4.9/5", color: "text-purple-600" },
    { icon: Zap, label: "Time Saved", value: "10+ hours", color: "text-pink-600" }
  ];

  const benefits = [
    "ATS-optimized resume templates",
    "AI-powered content suggestions", 
    "Real-time feedback and improvements",
    "Industry-specific customization",
    "Professional formatting",
    "Download in multiple formats"
  ];

  const technologies = [
    "JavaScript", "Python", "React", "Node.js", "Angular", "Vue.js", "Java", "C++", 
    "TypeScript", "PHP", "Ruby", "Go", "Swift", "Kotlin", "SQL", "MongoDB",
    "AWS", "Azure", "Docker", "Kubernetes", "Git", "GraphQL", "REST API", "Machine Learning"
  ];

  const jobRoles = [
    { title: "Frontend Developer", demand: "High", icon: Code },
    { title: "Backend Engineer", demand: "Very High", icon: Shield },
    { title: "Product Manager", demand: "High", icon: Briefcase },
    { title: "Data Scientist", demand: "Very High", icon: TrendingUp },
    { title: "DevOps Engineer", demand: "High", icon: Zap },
    { title: "UI/UX Designer", demand: "Medium", icon: Sparkles }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-blue-400 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-indigo-400 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-soft-light filter blur-3xl opacity-15 animate-pulse animation-delay-4000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-white/90 text-sm font-medium">Powered by Advanced AI Technology</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-white leading-tight animate-scale-in">
              Land Your Dream Job with
              <span className="block bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 bg-clip-text text-transparent mt-2">
                AI-Powered Career Tools
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto animate-fade-in animation-delay-500">
              Create compelling resumes, write persuasive cover letters, and ace interviews with our intelligent career platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in animation-delay-1000">
              {user ? (
                <Link to="/resume">
                  <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100 px-10 py-6 text-lg font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
                    Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Button 
                  size="lg" 
                  onClick={() => { setAuthMode("signup"); setIsAuthOpen(true); }}
                  className="bg-white text-slate-900 hover:bg-gray-100 px-10 py-6 text-lg font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
                >
                  Start Free Today <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
              <Button 
                variant="outline" 
                size="lg" 
                className="px-10 py-6 text-lg border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 group"
                onClick={() => {
                  // Scroll to demo section or show demo modal
                  document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>
            
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in animation-delay-1500">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-blue-200 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo-section" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              See CareerBoost AI in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch how our AI-powered tools can transform your job search in minutes
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-2xl">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <Play className="h-12 w-12 text-white ml-1" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Interactive Demo Coming Soon</h3>
                <p className="text-gray-600">Experience the power of AI-driven career tools</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-6 py-2 mb-6 font-medium">
              <Sparkles className="h-4 w-4" />
              AI-Powered Tools
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Everything You Need to
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Land Your Dream Job</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our comprehensive suite of AI-powered tools helps you stand out in today's competitive job market.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => (
              <Card key={index} className={`group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br ${feature.bgGradient} hover:scale-105 overflow-hidden relative backdrop-blur-sm`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/30"></div>
                <CardHeader className="text-center pb-6 relative z-10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-3">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center relative z-10">
                  <CardDescription className="text-gray-600 mb-8 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  {user ? (
                    <Link to={feature.href}>
                      <Button className={`w-full bg-gradient-to-r ${feature.gradient} hover:bg-gradient-to-r hover:${feature.hoverGradient} hover:shadow-lg transition-all duration-300 text-white font-semibold py-3`}>
                        Try Now <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      onClick={() => { setAuthMode("signup"); setIsAuthOpen(true); }}
                      className={`w-full bg-gradient-to-r ${feature.gradient} hover:bg-gradient-to-r hover:${feature.hoverGradient} hover:shadow-lg transition-all duration-300 text-white font-semibold py-3`}
                    >
                      Get Started <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Optimize for Any Technology Stack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI understands the requirements for all major programming languages and technologies
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {technologies.map((tech, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-gray-100 hover:bg-blue-100 rounded-full text-gray-700 hover:text-blue-700 transition-all duration-200 cursor-pointer hover:scale-105 border border-gray-200 hover:border-blue-200"
              >
                {tech}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Button variant="outline" className="border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600">
              See all technologies <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Job Roles Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Popular Job Roles We Support
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tailored resume and interview preparation for in-demand positions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobRoles.map((role, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <role.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      role.demand === "Very High" ? "bg-red-100 text-red-700" : 
                      role.demand === "High" ? "bg-orange-100 text-orange-700" : 
                      "bg-green-100 text-green-700"
                    }`}>
                      {role.demand} Demand
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{role.title}</h3>
                  <p className="text-gray-600 text-sm">Specialized resume templates and interview questions</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Why Choose CareerBoost AI?
              </h3>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Join thousands of professionals who have successfully transformed their careers with our cutting-edge AI technology.
              </p>
              {!user && (
                <Button 
                  size="lg"
                  onClick={() => { setAuthMode("signup"); setIsAuthOpen(true); }}
                  className="bg-white text-slate-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl"
                >
                  Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-white font-medium text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <AuthDialog
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  );
};

export default Index;
