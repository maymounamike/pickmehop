import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import HelpDialog from "./HelpDialog";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session and role
    const getSessionAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        setUserRole(roleData?.role || 'user');
      } else {
        setUserRole(null);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        setUserRole(roleData?.role || 'user');
      } else {
        setUserRole(null);
      }
    });

    getSessionAndRole();

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/298c0d83-9fd2-4556-aeff-ab20854f90c7.png" 
            alt="Pick Me Hop Logo" 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
          />
          <span className="text-white font-semibold text-base sm:text-lg">Pick Me Hop</span>
        </div>
        
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              {userRole === 'admin' && (
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-accent hover:bg-white/10"
                  onClick={() => navigate("/admin")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Admin Panel
                </Button>
              )}
              {userRole === 'driver' && (
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-accent hover:bg-white/10"
                  onClick={() => navigate("/driver")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Driver Dashboard
                </Button>
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