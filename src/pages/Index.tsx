
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, FileText, PenTool, MessageSquare, Star, Users, Award, Zap, Check, Sparkles, ChevronRight, Play, Code, Briefcase, TrendingUp, Shield, Quote } from "lucide-react";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PricingSection } from "@/components/pricing/PricingSection";
import { TokenModal } from "@/components/pricing/TokenModal";
import { useSecureTokens } from "@/hooks/useSecureTokens";

const Index = () => {
  const { user } = useAuthUser();
  const featuresRef = useRef<HTMLDivElement>(null);
  const { isTokenModalOpen, currentTokenType, closeTokenModal, tokens } = useSecureTokens();

  const features = [
    {
      icon: FileText,
      title: "AI Resume Builder",
      description: "Create ATS-optimized resumes tailored to specific job descriptions with AI assistance.",
      href: "/resume",
      gradient: "from-warm-brown-500 to-warm-brown-600",
      bgGradient: "from-cream-50 to-warm-brown-50",
      hoverGradient: "from-warm-brown-600 to-warm-brown-700",
      tokenType: "resume" as const
    },
    {
      icon: PenTool,
      title: "Cover Letter Generator",
      description: "Generate personalized cover letters that highlight your strengths and match company culture.",
      href: "/cover-letter",
      gradient: "from-warm-brown-600 to-warm-brown-700",
      bgGradient: "from-warm-brown-50 to-cream-100",
      hoverGradient: "from-warm-brown-700 to-warm-brown-800",
      tokenType: "coverLetter" as const
    },
    {
      icon: MessageSquare,
      title: "Interview Coach",
      description: "Practice with AI-powered mock interviews and get detailed feedback to improve your performance.",
      href: "/interview",
      gradient: "from-warm-brown-700 to-warm-brown-800",
      bgGradient: "from-cream-100 to-warm-brown-100",
      hoverGradient: "from-warm-brown-800 to-warm-brown-700",
      tokenType: "interview" as const
    }
  ];

  const stats = [
    { icon: Users, label: "Active Users", value: "50,000+", color: "text-warm-brown-600" },
    { icon: Award, label: "Success Rate", value: "94%", color: "text-warm-brown-700" },
    { icon: Star, label: "Average Rating", value: "4.9/5", color: "text-warm-brown-800" },
    { icon: Zap, label: "Time Saved", value: "10+ hours", color: "text-warm-brown-600" }
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
    { name: "JavaScript", icon: "⚡" },
    { name: "Python", icon: "🐍" },
    { name: "React", icon: "⚛️" },
    { name: "Node.js", icon: "🟢" },
    { name: "Angular", icon: "🅰️" },
    { name: "Vue.js", icon: "💚" },
    { name: "Java", icon: "☕" },
    { name: "C++", icon: "⚙️" },
    { name: "TypeScript", icon: "📘" },
    { name: "PHP", icon: "🐘" },
    { name: "Ruby", icon: "💎" },
    { name: "Go", icon: "🐹" },
    { name: "Swift", icon: "🦉" },
    { name: "Kotlin", icon: "🎯" },
    { name: "SQL", icon: "🗃️" },
    { name: "MongoDB", icon: "🍃" },
    { name: "AWS", icon: "☁️" },
    { name: "Azure", icon: "🔵" },
    { name: "Docker", icon: "🐳" },
    { name: "Kubernetes", icon: "⚓" },
    { name: "Git", icon: "📝" },
    { name: "GraphQL", icon: "🔗" },
    { name: "REST API", icon: "🌐" },
    { name: "Machine Learning", icon: "🤖" }
  ];

  const jobRoles = [
    { title: "Frontend Developer", demand: "High", icon: Code },
    { title: "Backend Engineer", demand: "Very High", icon: Shield },
    { title: "Product Manager", demand: "High", icon: Briefcase },
    { title: "Data Scientist", demand: "Very High", icon: TrendingUp },
    { title: "DevOps Engineer", demand: "High", icon: Zap },
    { title: "UI/UX Designer", demand: "Medium", icon: Sparkles }
  ];

  const reviews = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      company: "Google",
      avatar: "SJ",
      rating: 5,
      review: "CareerBoost AI helped me land my dream job at Google! The resume builder was incredibly intuitive and the AI suggestions were spot-on."
    },
    {
      name: "Michael Chen",
      role: "Product Manager",
      company: "Microsoft",
      avatar: "MC",
      rating: 5,
      review: "The interview coach feature was a game-changer. I felt so much more confident during my interviews and got multiple offers!"
    },
    {
      name: "Emily Rodriguez",
      role: "Data Scientist",
      company: "Tesla",
      avatar: "ER",
      rating: 5,
      review: "Amazing platform! The cover letter generator saved me hours of work and helped me stand out from other candidates."
    },
    {
      name: "David Kim",
      role: "Full Stack Developer",
      company: "Spotify",
      avatar: "DK",
      rating: 5,
      review: "I've tried many career tools, but CareerBoost AI is by far the best. The AI really understands what recruiters are looking for."
    }
  ];

  const getTokenCount = (tokenType: string) => {
    switch (tokenType) {
      case 'resume': return tokens.resume;
      case 'coverLetter': return tokens.coverLetter;
      case 'interview': return tokens.interview;
      default: return 0;
    }
  };

  const getTotalTokens = (tokenType: string) => {
    // Free users get these amounts initially
    switch (tokenType) {
      case 'resume': return 3;
      case 'coverLetter': return 3;
      case 'interview': return 5;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-warm-brown-800 via-warm-brown-700 to-warm-brown-600">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-warm-brown-400 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-warm-brown-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-warm-brown-300 rounded-full mix-blend-soft-light filter blur-3xl opacity-15 animate-pulse animation-delay-4000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-cream-100" />
              <span className="text-white/90 text-sm font-medium">Powered by Advanced AI Technology</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-white leading-tight animate-scale-in">
              Land Your Dream Job with
              <span className="block bg-gradient-to-r from-cream-100 via-cream-200 to-warm-brown-100 bg-clip-text text-transparent mt-2">
                AI-Powered Career Tools
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-cream-100 mb-12 leading-relaxed max-w-3xl mx-auto animate-fade-in animation-delay-500">
              Create compelling resumes, write persuasive cover letters, and ace interviews with our intelligent career platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in animation-delay-1000">
              {user ? (
                <Link to="/resume">
                  <Button size="lg" className="bg-white text-warm-brown-800 hover:bg-cream-100 px-10 py-6 text-lg font-semibold shadow-2xl hover:shadow-warm-brown-500/25 transition-all duration-300 hover:scale-105 border-2 border-cream-200/50">
                    Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <AuthDialog>
                  <Button size="lg" className="bg-white text-warm-brown-800 hover:bg-cream-100 px-10 py-6 text-lg font-semibold shadow-2xl hover:shadow-warm-brown-500/25 transition-all duration-300 hover:scale-105 border-2 border-cream-200/50">
                    Start Free Today <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </AuthDialog>
              )}
              <Button 
                variant="outline" 
                size="lg" 
                className="px-10 py-6 text-lg border-2 border-white/50 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 group shadow-lg hover:shadow-white/10"
                onClick={() => {
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
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-white/20">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-cream-200 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo-section" className="py-24 bg-cream-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-warm-brown-800">
              See CareerBoost AI in Action
            </h2>
            <p className="text-xl text-warm-brown-600 max-w-3xl mx-auto">
              Watch how our AI-powered tools can transform your job search in minutes
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-cream-200 to-warm-brown-200 rounded-2xl flex items-center justify-center shadow-2xl border border-warm-brown-300/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/30"></div>
              <div className="text-center relative z-10">
                <div className="w-24 h-24 bg-gradient-to-r from-warm-brown-600 to-warm-brown-700 rounded-full flex items-center justify-center mx-auto mb-6 hover:scale-110 transition-transform duration-300 cursor-pointer shadow-lg animate-glow">
                  <Play className="h-12 w-12 text-white ml-1" />
                </div>
                <h3 className="text-2xl font-bold text-warm-brown-800 mb-2">Interactive Demo</h3>
                <p className="text-warm-brown-600">Experience the power of AI-driven career tools</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-24 bg-cream-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-warm-brown-100 text-warm-brown-800 rounded-full px-6 py-2 mb-6 font-medium border border-warm-brown-200">
              <Sparkles className="h-4 w-4" />
              AI-Powered Tools
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-warm-brown-800">
              Everything You Need to
              <span className="block bg-gradient-to-r from-warm-brown-600 to-warm-brown-700 bg-clip-text text-transparent">Land Your Dream Job</span>
            </h2>
            <p className="text-xl text-warm-brown-600 max-w-3xl mx-auto leading-relaxed">
              Our comprehensive suite of AI-powered tools helps you stand out in today's competitive job market.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => (
              <Card key={index} className={`group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br ${feature.bgGradient} hover:scale-105 overflow-hidden relative backdrop-blur-sm border border-warm-brown-200/50`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40"></div>
                <CardHeader className="text-center pb-6 relative z-10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-warm-brown-800 mb-3">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center relative z-10">
                  <CardDescription className="text-warm-brown-600 mb-6 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  
                  {user && (
                    <div className="mb-4 p-3 bg-white/60 rounded-lg border border-warm-brown-200/50">
                      <div className="text-sm text-warm-brown-600 mb-1">Available Tokens</div>
                      <div className="text-lg font-bold text-warm-brown-800">
                        {getTokenCount(feature.tokenType)}/{getTotalTokens(feature.tokenType)}
                      </div>
                    </div>
                  )}
                  
                  {user ? (
                    <Link to={feature.href}>
                      <Button className={`w-full bg-gradient-to-r ${feature.gradient} hover:bg-gradient-to-r hover:${feature.hoverGradient} hover:shadow-lg transition-all duration-300 text-white font-semibold py-3`}>
                        Generate AI <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <AuthDialog>
                      <Button className={`w-full bg-gradient-to-r ${feature.gradient} hover:bg-gradient-to-r hover:${feature.hoverGradient} hover:shadow-lg transition-all duration-300 text-white font-semibold py-3`}>
                        Get Started <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </AuthDialog>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-24 bg-cream-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-warm-brown-800">
              Optimize for Any Technology Stack
            </h2>
            <p className="text-xl text-warm-brown-600 max-w-3xl mx-auto">
              Our AI understands the requirements for all major programming languages and technologies
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {technologies.map((tech, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-3 bg-cream-200 hover:bg-warm-brown-100 rounded-full text-warm-brown-700 hover:text-warm-brown-800 transition-all duration-200 cursor-pointer hover:scale-105 border border-warm-brown-200 hover:border-warm-brown-300 shadow-sm hover:shadow-md"
              >
                <span className="text-lg">{tech.icon}</span>
                <span className="font-medium">{tech.name}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Button variant="outline" className="border-2 border-warm-brown-400 hover:border-warm-brown-500 hover:text-warm-brown-800 hover:bg-warm-brown-100 text-warm-brown-700">
              See all technologies <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 bg-cream-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-warm-brown-800">
              What Our Users Say
            </h2>
            <p className="text-xl text-warm-brown-600 max-w-3xl mx-auto">
              Join thousands of professionals who have transformed their careers with CareerBoost AI
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((review, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white border-0 shadow-md border border-warm-brown-200/50 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <Quote className="h-6 w-6 text-warm-brown-300" />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-warm-brown-100 rounded-full flex items-center justify-center border border-warm-brown-200 mr-3">
                      <span className="text-warm-brown-700 font-semibold">{review.avatar}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-warm-brown-800">{review.name}</h4>
                      <p className="text-sm text-warm-brown-600">{review.role} at {review.company}</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-warm-brown-700 text-sm leading-relaxed">{review.review}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Job Roles Section */}
      <section className="py-24 bg-cream-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-warm-brown-800">
              Popular Job Roles We Support
            </h2>
            <p className="text-xl text-warm-brown-600 max-w-3xl mx-auto">
              Tailored resume and interview preparation for in-demand positions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobRoles.map((role, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white border-0 shadow-md border border-warm-brown-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-warm-brown-100 rounded-lg flex items-center justify-center border border-warm-brown-200">
                      <role.icon className="h-6 w-6 text-warm-brown-600" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      role.demand === "Very High" ? "bg-red-100 text-red-700 border border-red-200" : 
                      role.demand === "High" ? "bg-orange-100 text-orange-700 border border-orange-200" : 
                      "bg-green-100 text-green-700 border border-green-200"
                    }`}>
                      {role.demand} Demand
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-warm-brown-800 mb-2">{role.title}</h3>
                  <p className="text-warm-brown-600 text-sm">Specialized resume templates and interview questions</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-r from-warm-brown-800 via-warm-brown-700 to-warm-brown-600 text-white relative overflow-hidden mb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-warm-brown-600/10 to-warm-brown-800/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Why Choose CareerBoost AI?
              </h3>
              <p className="text-xl text-cream-100 mb-8 leading-relaxed">
                Join thousands of professionals who have successfully transformed their careers with our cutting-edge AI technology.
              </p>
              {!user && (
                <AuthDialog>
                  <Button size="lg" className="bg-white text-warm-brown-800 hover:bg-cream-100 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl border-2 border-cream-200/50">
                    Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </AuthDialog>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 border border-white/20">
                  <div className="w-6 h-6 bg-gradient-to-r from-cream-100 to-warm-brown-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-warm-brown-700" />
                  </div>
                  <span className="text-white font-medium text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <TokenModal
        isOpen={isTokenModalOpen}
        onClose={closeTokenModal}
        tokenType={currentTokenType}
        remainingTokens={
          currentTokenType === 'resume' ? tokens.resume :
          currentTokenType === 'cover-letter' ? tokens.coverLetter :
          tokens.interview
        }
      />
    </div>
  );
};

export default Index;
