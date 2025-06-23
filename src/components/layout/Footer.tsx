
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Github, Twitter, Linkedin, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthUser } from "@/hooks/useAuthUser";
import { AuthDialog } from "@/components/auth/AuthDialog";

export const Footer = () => {
  const { user } = useAuthUser();

  const handleProtectedLink = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      // The AuthDialog will handle opening when the button is clicked
    }
  };

  return (
    <>
      <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Company Info */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white">
                CareerBoost AI
              </h3>
              <p className="text-slate-300 leading-relaxed text-sm">
                Empowering professionals to advance their careers with AI-powered tools for resumes, cover letters, and interview preparation.
              </p>
              <div className="flex space-x-3">
                <Button variant="ghost" size="icon" className="text-slate-300 hover:bg-slate-700 hover:text-white h-8 w-8 transition-colors">
                  <Github className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-300 hover:bg-slate-700 hover:text-white h-8 w-8 transition-colors">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-300 hover:bg-slate-700 hover:text-white h-8 w-8 transition-colors">
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
                    <Link to="/resume" className="text-slate-300 hover:text-blue-400 transition-colors duration-200">
                      Resume Builder
                    </Link>
                  ) : (
                    <AuthDialog>
                      <button className="text-slate-300 hover:text-blue-400 transition-colors duration-200 text-left">
                        Resume Builder
                      </button>
                    </AuthDialog>
                  )}
                </li>
                <li>
                  {user ? (
                    <Link to="/cover-letter" className="text-slate-300 hover:text-blue-400 transition-colors duration-200">
                      Cover Letter Generator
                    </Link>
                  ) : (
                    <AuthDialog>
                      <button className="text-slate-300 hover:text-blue-400 transition-colors duration-200 text-left">
                        Cover Letter Generator
                      </button>
                    </AuthDialog>
                  )}
                </li>
                <li>
                  {user ? (
                    <Link to="/interview" className="text-slate-300 hover:text-blue-400 transition-colors duration-200">
                      Interview Coach
                    </Link>
                  ) : (
                    <AuthDialog>
                      <button className="text-slate-300 hover:text-blue-400 transition-colors duration-200 text-left">
                        Interview Coach
                      </button>
                    </AuthDialog>
                  )}
                </li>
                <li>
                  <a href="#features" className="text-slate-300 hover:text-blue-400 transition-colors duration-200">
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
                  <Mail className="h-3 w-3 text-slate-400" />
                  <span className="text-slate-300">support@careerboost.ai</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  <span className="text-slate-300">San Francisco, CA</span>
                </div>
              </div>
              
              {/* Newsletter Signup */}
              <div className="mt-4">
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-3 py-2 rounded-md bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                  />
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm px-3 py-2 transition-all duration-200">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-700 mb-4" />

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-4 text-sm">
              <p className="text-slate-300">
                © 2024 CareerBoost AI. All rights reserved.
              </p>
              <div className="flex space-x-3 text-xs">
                <a href="#" className="text-slate-400 hover:text-slate-200 transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-slate-400 hover:text-slate-200 transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 text-slate-300 text-xs">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-red-400 fill-current" />
              <span>for your career success</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
