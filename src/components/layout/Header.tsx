
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Settings, LogOut, User, FileText, PenTool, MessageSquare, Menu, X } from "lucide-react";
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
      <header className="sticky top-0 z-50 w-full border-b border-amber-200/30 bg-cream-50/95 backdrop-blur-md supports-[backdrop-filter]:bg-cream-50/95 shadow-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-600 to-orange-700 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-800 to-orange-900 bg-clip-text text-transparent">
              CareerBoost AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
            {user ? (
              <Link
                to="/resume"
                className="flex items-center space-x-2 text-amber-800 hover:text-orange-700 transition-colors font-medium group"
              >
                <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Resume Builder</span>
              </Link>
            ) : (
              <button
                onClick={handleProtectedLink}
                className="flex items-center space-x-2 text-amber-800 hover:text-orange-700 transition-colors font-medium group"
              >
                <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Resume Builder</span>
              </button>
            )}
            
            {user ? (
              <Link
                to="/cover-letter"
                className="flex items-center space-x-2 text-amber-800 hover:text-orange-700 transition-colors font-medium group"
              >
                <PenTool className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Cover Letter</span>
              </Link>
            ) : (
              <button
                onClick={handleProtectedLink}
                className="flex items-center space-x-2 text-amber-800 hover:text-orange-700 transition-colors font-medium group"
              >
                <PenTool className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Cover Letter</span>
              </button>
            )}
            
            {user ? (
              <Link
                to="/interview"
                className="flex items-center space-x-2 text-amber-800 hover:text-orange-700 transition-colors font-medium group"
              >
                <MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Interview Coach</span>
              </Link>
            ) : (
              <button
                onClick={handleProtectedLink}
                className="flex items-center space-x-2 text-amber-800 hover:text-orange-700 transition-colors font-medium group"
              >
                <MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Interview Coach</span>
              </button>
            )}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
            {loading ? (
              <div className="w-8 h-8 animate-pulse bg-amber-200 rounded-full" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-amber-100">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                      <AvatarFallback className="bg-amber-100 text-amber-800 text-sm font-semibold">
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
                  className="text-amber-800 hover:text-orange-700 hover:bg-amber-100 font-medium border border-transparent hover:border-amber-200 transition-all duration-300"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => handleAuthClick("signup")}
                  className="bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white font-semibold px-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-amber-500/30"
                >
                  Get Started
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
