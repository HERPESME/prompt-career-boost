
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
      <footer className="bg-gradient-to-r from-warm-brown-800 via-warm-brown-700 to-warm-brown-600 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Company Info */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white">
                CareerBoost AI
              </h3>
              <p className="text-cream-100 leading-relaxed text-sm">
                Empowering professionals to advance their careers with AI-powered tools for resumes, cover letters, and interview preparation.
              </p>
              <div className="flex space-x-3">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white h-8 w-8">
                  <Github className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white h-8 w-8">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white h-8 w-8">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-white">Quick Links</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  {user ? (
                    <Link to="/resume" className="text-cream-100 hover:text-white transition-colors duration-200">
                      Resume Builder
                    </Link>
                  ) : (
                    <button 
                      onClick={handleProtectedLink}
                      className="text-cream-100 hover:text-white transition-colors duration-200 text-left"
                    >
                      Resume Builder
                    </button>
                  )}
                </li>
                <li>
                  {user ? (
                    <Link to="/cover-letter" className="text-cream-100 hover:text-white transition-colors duration-200">
                      Cover Letter Generator
                    </Link>
                  ) : (
                    <button 
                      onClick={handleProtectedLink}
                      className="text-cream-100 hover:text-white transition-colors duration-200 text-left"
                    >
                      Cover Letter Generator
                    </button>
                  )}
                </li>
                <li>
                  {user ? (
                    <Link to="/interview" className="text-cream-100 hover:text-white transition-colors duration-200">
                      Interview Coach
                    </Link>
                  ) : (
                    <button 
                      onClick={handleProtectedLink}
                      className="text-cream-100 hover:text-white transition-colors duration-200 text-left"
                    >
                      Interview Coach
                    </button>
                  )}
                </li>
                <li>
                  <a href="#features" className="text-cream-100 hover:text-white transition-colors duration-200">
                    Features
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact & Newsletter */}
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-white">Stay Connected</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="h-3 w-3 text-cream-200" />
                  <span className="text-cream-100">support@careerboost.ai</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-3 w-3 text-cream-200" />
                  <span className="text-cream-100">San Francisco, CA</span>
                </div>
              </div>
              
              {/* Newsletter Signup */}
              <div className="mt-4">
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-3 py-2 rounded-md bg-white/20 border border-white/30 text-white placeholder-cream-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                  />
                  <Button className="bg-white text-warm-brown-700 hover:bg-cream-100 font-semibold text-sm px-3 py-2">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-white/20 mb-4" />

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-4 text-sm">
              <p className="text-cream-100">
                © 2024 CareerBoost AI. All rights reserved.
              </p>
              <div className="flex space-x-3 text-xs">
                <a href="#" className="text-cream-100 hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-cream-100 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 text-cream-100 text-xs">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-red-400 fill-current" />
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
