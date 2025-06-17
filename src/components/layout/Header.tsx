
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Settings, LogOut, User, FileText, PenTool, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const { user, loading, signOut } = useAuthUser();

  const handleAuthClick = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 backdrop-blur supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-blue-600/80 supports-[backdrop-filter]:via-purple-600/80 supports-[backdrop-filter]:to-indigo-600/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-white">CareerBoost AI</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/resume"
              className="flex items-center space-x-1 text-white/90 hover:text-white transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Resume</span>
            </Link>
            <Link
              to="/cover-letter"
              className="flex items-center space-x-1 text-white/90 hover:text-white transition-colors"
            >
              <PenTool className="h-4 w-4" />
              <span>Cover Letter</span>
            </Link>
            <Link
              to="/interview"
              className="flex items-center space-x-1 text-white/90 hover:text-white transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Interview</span>
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 animate-pulse bg-white/20 rounded-full" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                      <AvatarFallback className="bg-white text-blue-600 text-sm font-semibold">
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
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => handleAuthClick("signin")}
                  className="text-white hover:bg-white/20"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => handleAuthClick("signup")}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
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
