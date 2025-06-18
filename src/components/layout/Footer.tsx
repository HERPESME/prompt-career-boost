
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Github, Twitter, Linkedin, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useState } from "react";
import { AuthDialog } from "@/components/auth/AuthDialog";

export const Footer = () => {
  const { user } = useAuthUser();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const handleProtectedLink = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setAuthMode("signin");
      setIsAuthOpen(true);
    }
  };

  return (
    <>
      <footer className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white">
        <div className="container mx-auto px-4 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">
                CareerBoost AI
              </h3>
              <p className="text-blue-100 leading-relaxed">
                Empowering professionals to advance their careers with AI-powered tools for resumes, cover letters, and interview preparation.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                  <Github className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                  <Linkedin className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  {user ? (
                    <Link to="/resume" className="text-blue-100 hover:text-white transition-colors duration-200">
                      Resume Builder
                    </Link>
                  ) : (
                    <button 
                      onClick={handleProtectedLink}
                      className="text-blue-100 hover:text-white transition-colors duration-200 text-left"
                    >
                      Resume Builder
                    </button>
                  )}
                </li>
                <li>
                  {user ? (
                    <Link to="/cover-letter" className="text-blue-100 hover:text-white transition-colors duration-200">
                      Cover Letter Generator
                    </Link>
                  ) : (
                    <button 
                      onClick={handleProtectedLink}
                      className="text-blue-100 hover:text-white transition-colors duration-200 text-left"
                    >
                      Cover Letter Generator
                    </button>
                  )}
                </li>
                <li>
                  {user ? (
                    <Link to="/interview" className="text-blue-100 hover:text-white transition-colors duration-200">
                      Interview Coach
                    </Link>
                  ) : (
                    <button 
                      onClick={handleProtectedLink}
                      className="text-blue-100 hover:text-white transition-colors duration-200 text-left"
                    >
                      Interview Coach
                    </button>
                  )}
                </li>
                <li>
                  <a href="#features" className="text-blue-100 hover:text-white transition-colors duration-200">
                    Features
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Get in Touch</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-blue-200" />
                  <span className="text-blue-100">support@careerboost.ai</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-blue-200" />
                  <span className="text-blue-100">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-blue-200" />
                  <span className="text-blue-100">San Francisco, CA</span>
                </div>
              </div>
              
              {/* Newsletter Signup */}
              <div className="mt-6">
                <h5 className="text-md font-medium text-white mb-2">Stay Updated</h5>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-3 py-2 rounded-md bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <Button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-white/20 mb-6" />

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-blue-100 text-sm">
                © 2024 CareerBoost AI. All rights reserved.
              </p>
              <div className="flex space-x-4 text-sm">
                <a href="#" className="text-blue-100 hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-blue-100 hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-blue-100 hover:text-white transition-colors">
                  Cookies
                </a>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 text-blue-100 text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-400 fill-current" />
              <span>for your career success</span>
            </div>
          </div>
        </div>
      </footer>

      <AuthDialog
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
};
