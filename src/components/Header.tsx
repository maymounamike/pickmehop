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
          .maybeSingle();
        
        setUserRole(roleData?.role || 'user');
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
          .maybeSingle();
        
        setUserRole(roleData?.role || 'user');
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
      // Always navigate to home regardless of server response
      navigate("/");
    }
  };

  return (
    <header className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-black/90 backdrop-blur-sm border-b border-white/10 shadow-lg' 
        : 'bg-black/80 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/fd647c9d-74ed-4206-99d0-9b04a8f86b41.png" 
            alt="Pick Me Hop Logo" 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
          />
          <span className="text-white font-semibold text-base sm:text-lg">Pick Me Hop</span>
        </div>
        
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              {userRole === 'admin' && (
                <>
                  <Button 
                    variant="ghost" 
                    className="text-white hover:text-accent hover:bg-white/10"
                    onClick={() => navigate("/admin")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-white hover:text-accent hover:bg-white/10"
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
                    className="text-white hover:text-accent hover:bg-white/10"
                    onClick={() => navigate("/driver")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Driver Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-white hover:text-accent hover:bg-white/10"
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
                  className="text-white hover:text-accent hover:bg-white/10"
                  onClick={() => navigate("/dashboard")}
                >
                  <User className="mr-2 h-4 w-4" />
                  My Bookings
                </Button>
              )}
              <Button 
                variant="ghost" 
                className="text-white hover:text-accent hover:bg-white/10"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <Button 
              variant="ghost" 
              className="text-white hover:text-accent hover:bg-white/10"
              onClick={() => navigate("/auth")}
            >
              <User className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
          
          <HelpDialog>
            <Button variant="ghost" className="text-white hover:text-accent hover:bg-white/10 text-sm sm:text-base min-h-[44px] px-3 sm:px-4">
              Help
            </Button>
          </HelpDialog>
        </div>
      </div>
    </header>
  );
};

export default Header;