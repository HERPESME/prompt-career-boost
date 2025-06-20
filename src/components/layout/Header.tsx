
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAuthUser } from "@/hooks/useAuthUser";
import { SecureTokenDisplay } from "@/components/pricing/SecureTokenDisplay";
import { SecureTokenModal } from "@/components/pricing/SecureTokenModal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, Menu, X, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export const Header = () => {
  const { user, signOut } = useAuthUser();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const navigationLinks = [
    { to: "/", label: "Home" },
    { to: "/resume", label: "Resume Builder" },
    { to: "/cover-letter", label: "Cover Letters" },
    { to: "/interview", label: "Interview Coach" },
  ];

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-warm-brown-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-warm-brown-600 via-warm-brown-700 to-warm-brown-800 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 border-2 border-warm-brown-300/50">
                  <Sparkles className="h-6 w-6 text-white animate-pulse" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-warm-brown-400/20 to-warm-brown-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-warm-brown-600 via-warm-brown-700 to-warm-brown-800 bg-clip-text text-transparent">
                CareerBoost AI
              </span>
            </Link>
            
            {/* Desktop Navigation - Show all links for everyone */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationLinks.map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className="relative text-warm-brown-700 hover:text-warm-brown-800 transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-warm-brown-50 group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-warm-brown-600 to-warm-brown-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <SecureTokenDisplay />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-warm-brown-100 transition-colors">
                        <Avatar className="h-10 w-10 border-2 border-warm-brown-200">
                          <AvatarFallback className="bg-gradient-to-br from-warm-brown-100 to-warm-brown-200 text-warm-brown-800 font-semibold">
                            {getUserInitials(user.email || 'U')}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-3 border-b border-warm-brown-100">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="text-sm font-medium text-warm-brown-800">{user.email}</p>
                          <p className="text-xs text-warm-brown-600">Logged in</p>
                        </div>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="cursor-pointer flex items-center text-warm-brown-700 hover:text-warm-brown-800">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-warm-brown-700 hover:text-warm-brown-800">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <AuthDialog>
                    <Button className="bg-gradient-to-r from-warm-brown-600 to-warm-brown-700 hover:from-warm-brown-700 hover:to-warm-brown-800 text-white font-semibold px-6 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <User className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                  </AuthDialog>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden h-10 w-10 p-0 hover:bg-warm-brown-100"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 text-warm-brown-700" />
                ) : (
                  <Menu className="h-5 w-5 text-warm-brown-700" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation - Show all links for everyone */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-warm-brown-200 animate-fade-in">
              <nav className="flex flex-col space-y-2 mt-4">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-warm-brown-700 hover:text-warm-brown-800 hover:bg-warm-brown-50 px-4 py-3 rounded-lg transition-all duration-200 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>
      <SecureTokenModal />
    </>
  );
};
