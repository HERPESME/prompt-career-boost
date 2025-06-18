import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Settings, LogOut, User, FileText, PenTool, MessageSquare, Menu, X, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading, signOut } = useAuthUser();

  const handleAuthClick = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleProtectedLink = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setAuthMode("signin");
      setIsAuthOpen(true);
    }
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-warm-brown-200/40 bg-cream-50/95 backdrop-blur-md supports-[backdrop-filter]:bg-cream-50/95 shadow-lg">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
          {/* Enhanced Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0 group">
            <div className="relative w-12 h-12 bg-gradient-to-br from-warm-brown-600 to-warm-brown-800 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110 animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-warm-brown-400 to-warm-brown-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Sparkles className="text-cream-50 font-bold text-xl relative z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-warm-brown-800 to-warm-brown-600 bg-clip-text text-transparent group-hover:from-warm-brown-700 group-hover:to-warm-brown-500 transition-all duration-300">
                CareerBoost AI
              </span>
              <span className="text-xs text-warm-brown-500 font-medium tracking-wide">AI-Powered Career Tools</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
            {user ? (
              <Link
                to="/resume"
                className="flex items-center space-x-2 text-warm-brown-700 hover:text-warm-brown-800 transition-all duration-300 font-medium group px-4 py-2 rounded-lg hover:bg-warm-brown-50"
              >
                <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Resume Builder</span>
              </Link>
            ) : (
              <button
                onClick={handleProtectedLink}
                className="flex items-center space-x-2 text-warm-brown-700 hover:text-warm-brown-800 transition-all duration-300 font-medium group px-4 py-2 rounded-lg hover:bg-warm-brown-50"
              >
                <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Resume Builder</span>
              </button>
            )}
            
            {user ? (
              <Link
                to="/cover-letter"
                className="flex items-center space-x-2 text-warm-brown-700 hover:text-warm-brown-800 transition-all duration-300 font-medium group px-4 py-2 rounded-lg hover:bg-warm-brown-50"
              >
                <PenTool className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Cover Letter</span>
              </Link>
            ) : (
              <button
                onClick={handleProtectedLink}
                className="flex items-center space-x-2 text-warm-brown-700 hover:text-warm-brown-800 transition-all duration-300 font-medium group px-4 py-2 rounded-lg hover:bg-warm-brown-50"
              >
                <PenTool className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Cover Letter</span>
              </button>
            )}
            
            {user ? (
              <Link
                to="/interview"
                className="flex items-center space-x-2 text-warm-brown-700 hover:text-warm-brown-800 transition-all duration-300 font-medium group px-4 py-2 rounded-lg hover:bg-warm-brown-50"
              >
                <MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Interview Coach</span>
              </Link>
            ) : (
              <button
                onClick={handleProtectedLink}
                className="flex items-center space-x-2 text-warm-brown-700 hover:text-warm-brown-800 transition-all duration-300 font-medium group px-4 py-2 rounded-lg hover:bg-warm-brown-50"
              >
                <MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Interview Coach</span>
              </button>
            )}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
            {loading ? (
              <div className="w-10 h-10 animate-pulse bg-warm-brown-200 rounded-full" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-warm-brown-100 ring-2 ring-transparent hover:ring-warm-brown-200 transition-all duration-300">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                      <AvatarFallback className="bg-warm-brown-100 text-warm-brown-800 text-sm font-semibold">
                        {getUserInitials(user.email || "")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.user_metadata?.full_name || "User"}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => handleAuthClick("signin")}
                  className="text-warm-brown-700 hover:text-warm-brown-800 hover:bg-warm-brown-100 font-medium border border-transparent hover:border-warm-brown-200 transition-all duration-300 px-6 py-2"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => handleAuthClick("signup")}
                  className="bg-gradient-to-r from-warm-brown-600 to-warm-brown-700 hover:from-warm-brown-700 hover:to-warm-brown-800 text-cream-50 font-semibold px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-warm-brown-500/30 relative overflow-hidden"
                >
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-amber-100">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                      <AvatarFallback className="bg-amber-100 text-amber-800 text-sm font-semibold">
                        {getUserInitials(user.email || "")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.user_metadata?.full_name || "User"}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-amber-800 hover:text-orange-700 hover:bg-amber-100"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-amber-200 bg-cream-50/95 backdrop-blur-md">
            <div className="container mx-auto px-4 py-4 space-y-3">
              {user ? (
                <Link
                  to="/resume"
                  className="flex items-center space-x-3 text-amber-800 hover:text-orange-700 transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FileText className="h-4 w-4" />
                  <span>Resume Builder</span>
                </Link>
              ) : (
                <button
                  onClick={(e) => {
                    handleProtectedLink(e);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 text-amber-800 hover:text-orange-700 transition-colors font-medium py-2 w-full text-left"
                >
                  <FileText className="h-4 w-4" />
                  <span>Resume Builder</span>
                </button>
              )}
              
              {user ? (
                <Link
                  to="/cover-letter"
                  className="flex items-center space-x-3 text-amber-800 hover:text-orange-700 transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <PenTool className="h-4 w-4" />
                  <span>Cover Letter</span>
                </Link>
              ) : (
                <button
                  onClick={(e) => {
                    handleProtectedLink(e);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 text-amber-800 hover:text-orange-700 transition-colors font-medium py-2 w-full text-left"
                >
                  <PenTool className="h-4 w-4" />
                  <span>Cover Letter</span>
                </button>
              )}
              
              {user ? (
                <Link
                  to="/interview"
                  className="flex items-center space-x-3 text-amber-800 hover:text-orange-700 transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Interview Coach</span>
                </Link>
              ) : (
                <button
                  onClick={(e) => {
                    handleProtectedLink(e);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 text-amber-800 hover:text-orange-700 transition-colors font-medium py-2 w-full text-left"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Interview Coach</span>
                </button>
              )}
              
              {!user && (
                <div className="pt-3 border-t border-amber-200 space-y-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleAuthClick("signin");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start text-amber-800 hover:text-orange-700 hover:bg-amber-100 font-medium"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      handleAuthClick("signup");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white font-semibold shadow-lg"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthDialog
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
};
