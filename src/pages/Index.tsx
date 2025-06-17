
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, FileText, PenTool, MessageSquare, Star, Users, Award, Zap } from "lucide-react";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const { user } = useAuthUser();

  const features = [
    {
      icon: FileText,
      title: "AI Resume Builder",
      description: "Create ATS-optimized resumes tailored to specific job descriptions with AI assistance.",
      href: "/resume",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: PenTool,
      title: "Cover Letter Generator",
      description: "Generate personalized cover letters that highlight your strengths and match company culture.",
      href: "/cover-letter",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: MessageSquare,
      title: "Interview Coach",
      description: "Practice with AI-powered mock interviews and get detailed feedback to improve your performance.",
      href: "/interview",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const stats = [
    { icon: Users, label: "Active Users", value: "50,000+" },
    { icon: Award, label: "Success Rate", value: "94%" },
    { icon: Star, label: "Average Rating", value: "4.9/5" },
    { icon: Zap, label: "Time Saved", value: "10+ hours" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Supercharge Your Career with AI
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Transform your job search with our AI-powered tools. Create compelling resumes, 
              write persuasive cover letters, and ace your interviews with personalized coaching.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/resume">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Button 
                  size="lg" 
                  onClick={() => { setAuthMode("signup"); setIsAuthOpen(true); }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
                >
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-2">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mb-4">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive suite of AI-powered tools helps you stand out in today's competitive job market.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 bg-white/70 backdrop-blur">
                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 mb-6 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  {user ? (
                    <Link to={feature.href}>
                      <Button className="w-full bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600">
                        Try Now <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      onClick={() => { setAuthMode("signup"); setIsAuthOpen(true); }}
                      className="w-full bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600"
                    >
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Accelerate Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have successfully landed their dream jobs with our AI-powered career tools.
          </p>
          {!user && (
            <Button 
              size="lg"
              onClick={() => { setAuthMode("signup"); setIsAuthOpen(true); }}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold"
            >
              Start Your Journey Today <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
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
