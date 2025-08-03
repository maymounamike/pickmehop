import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import HelpDialog from "./HelpDialog";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session and role
    const getSessionAndRole = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // If there's an error or no session, clear everything
        if (error || !session) {
          setUser(null);
          setUserRole(null);
          return;
        }
        
        setUser(session.user);
        
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .order('role', { ascending: true });
        
        // If user has multiple roles, prioritize admin > driver > partner > user
        const roles = roleData?.map(r => r.role) || [];
        const priorityRole = roles.includes('admin') ? 'admin' : 
                            roles.includes('driver') ? 'driver' :
                            roles.includes('partner') ? 'partner' : 'user';
        setUserRole(priorityRole);
      } catch (error) {
        console.error('Session check error:', error);
        setUser(null);
        setUserRole(null);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session);
      
      if (!session) {
        setUser(null);
        setUserRole(null);
        return;
      }
      
      setUser(session.user);
      
      try {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .order('role', { ascending: true });
        
        // If user has multiple roles, prioritize admin > driver > partner > user
        const roles = roleData?.map(r => r.role) || [];
        const priorityRole = roles.includes('admin') ? 'admin' : 
                            roles.includes('driver') ? 'driver' :
                            roles.includes('partner') ? 'partner' : 'user';
        setUserRole(priorityRole);
      } catch (error) {
        console.error('Role fetch error:', error);
        setUserRole('user');
      }
    });

    getSessionAndRole();

    return () => subscription.unsubscribe();
  }, []);

  // Listen for scroll events to add/remove separation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      // Always clear local state first
      setUser(null);
      setUserRole(null);
      
      // Attempt to sign out from server, but don't fail if session is invalid
      await supabase.auth.signOut();
    } catch (error) {
      console.log('Sign out completed (session was already invalid)');
    } finally {
      // Always redirect to Pick Me Hop home page
      navigate("/");
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-lg border-b border-border shadow-elegant' 
        : 'bg-dark-base/95 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/fd647c9d-74ed-4206-99d0-9b04a8f86b41.png" 
            alt="Pick Me Hop Logo" 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => navigate("/")}
          />
          <span 
            className={`font-display font-semibold text-lg sm:text-xl cursor-pointer transition-colors duration-300 ${
              isScrolled ? 'text-foreground' : 'text-white'
            }`}
            onClick={() => navigate("/")}
          >
            Pick Me Hop
          </span>
        </div>
        
        {/* Navigation Menu - Only show on homepage when not logged in */}
        {!user && window.location.pathname === "/" && (
          <nav className="hidden md:flex items-center space-x-2">
            <Button 
              variant="ghost" 
              className={`font-medium transition-all duration-300 hover:scale-105 ${
                isScrolled 
                  ? 'text-foreground hover:text-primary hover:bg-primary/10' 
                  : 'text-white hover:text-secondary hover:bg-white/20'
              }`}
              onClick={() => navigate("/services")}
            >
              Services
            </Button>
            <Button 
              variant="ghost" 
              className={`font-medium transition-all duration-300 hover:scale-105 ${
                isScrolled 
                  ? 'text-foreground hover:text-primary hover:bg-primary/10' 
                  : 'text-white hover:text-secondary hover:bg-white/20'
              }`}
              onClick={() => navigate("/about")}
            >
              About
            </Button>
            <Button 
              variant="ghost" 
              className={`font-medium transition-all duration-300 hover:scale-105 ${
                isScrolled 
                  ? 'text-foreground hover:text-primary hover:bg-primary/10' 
                  : 'text-white hover:text-secondary hover:bg-white/20'
              }`}
              onClick={() => navigate("/contact")}
            >
              Contact
            </Button>
          </nav>
        )}
        
        <div className="flex items-center space-x-2">
          {user ? (
            <>
              {userRole === 'admin' && (
                <>
                  <Button 
                    variant="ghost" 
                    className={`font-medium transition-all duration-300 ${
                      isScrolled 
                        ? 'text-foreground hover:text-primary hover:bg-primary/10' 
                        : 'text-white hover:text-accent hover:bg-white/20'
                    }`}
                    onClick={() => navigate("/admin")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={`font-medium transition-all duration-300 ${
                      isScrolled 
                        ? 'text-foreground hover:text-primary hover:bg-primary/10' 
                        : 'text-white hover:text-accent hover:bg-white/20'
                    }`}
                    onClick={() => navigate("/drivers")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Driver Management
                  </Button>
                </>
              )}
              {userRole === 'driver' && (
                <>
                  <Button 
                    variant="ghost" 
                    className={`font-medium transition-all duration-300 ${
                      isScrolled 
                        ? 'text-foreground hover:text-primary hover:bg-primary/10' 
                        : 'text-white hover:text-accent hover:bg-white/20'
                    }`}
                    onClick={() => navigate("/driver")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Driver Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={`font-medium transition-all duration-300 ${
                      isScrolled 
                        ? 'text-foreground hover:text-primary hover:bg-primary/10' 
                        : 'text-white hover:text-accent hover:bg-white/20'
                    }`}
                    onClick={() => navigate("/driver/scheduled")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Scheduled Rides
                  </Button>
                </>
              )}
              {(userRole === 'user' || !userRole) && (
                <Button 
                  variant="ghost" 
                  className={`font-medium transition-all duration-300 ${
                    isScrolled 
                      ? 'text-foreground hover:text-primary hover:bg-primary/10' 
                      : 'text-white hover:text-accent hover:bg-white/20'
                  }`}
                  onClick={() => navigate("/dashboard")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              )}
              <Button 
                variant="ghost" 
                className={`font-medium transition-all duration-300 ${
                  isScrolled 
                    ? 'text-foreground hover:text-destructive hover:bg-destructive/10' 
                    : 'text-white hover:text-accent hover:bg-white/20'
                }`}
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : null}
          
          <HelpDialog>
            <Button 
              variant="ghost" 
              className={`font-medium transition-all duration-300 hover:scale-105 ${
                isScrolled 
                  ? 'text-foreground hover:text-primary hover:bg-primary/10' 
                  : 'text-white hover:text-accent hover:bg-white/20'
              } text-sm sm:text-base min-h-[44px] px-3 sm:px-4`}
            >
              Help
            </Button>
          </HelpDialog>
        </div>
      </div>
    </header>
  );
};

export default Header;