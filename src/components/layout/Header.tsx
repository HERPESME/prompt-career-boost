
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAuthUser } from "@/hooks/useAuthUser";
import { SecureTokenDisplay } from "@/components/pricing/SecureTokenDisplay";
import { SecureTokenModal } from "@/components/pricing/SecureTokenModal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const Header = () => {
  const { user, signOut } = useAuthUser();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="bg-white/90 backdrop-blur-md border-b border-warm-brown-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/c44d97a5-c9ae-446f-8c2a-e54360bc2e8c.png" 
                alt="CareerBoost AI" 
                className="h-8 w-8"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-warm-brown-600 to-warm-brown-800 bg-clip-text text-transparent">
                CareerBoost AI
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-warm-brown-700 hover:text-warm-brown-800 transition-colors">
                Home
              </Link>
              {user && (
                <>
                  <Link to="/resume" className="text-warm-brown-700 hover:text-warm-brown-800 transition-colors">
                    Resume Builder
                  </Link>
                  <Link to="/cover-letter" className="text-warm-brown-700 hover:text-warm-brown-800 transition-colors">
                    Cover Letters
                  </Link>
                  <Link to="/interview" className="text-warm-brown-700 hover:text-warm-brown-800 transition-colors">
                    Interview Coach
                  </Link>
                </>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <SecureTokenDisplay />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-warm-brown-100 text-warm-brown-800">
                            {getUserInitials(user.email || 'U')}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="text-sm font-medium">{user.email}</p>
                        </div>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <AuthDialog>
                  <Button className="bg-gradient-to-r from-warm-brown-600 to-warm-brown-700 hover:from-warm-brown-700 hover:to-warm-brown-800 text-white">
                    <User className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                </AuthDialog>
              )}
            </div>
          </div>
        </div>
      </header>
      <SecureTokenModal />
    </>
  );
};
