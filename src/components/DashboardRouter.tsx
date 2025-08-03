import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export const DashboardRouter = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAndRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setLoading(false);
          return;
        }

        setUser(session.user);

        // Get user role from user_roles table - prioritize admin role
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .order('role', { ascending: true }); // This will put 'admin' first

        if (error) {
          console.error('Error fetching user role:', error);
          setUserRole('user'); // Default to user if no role found
        } else {
          // If user has multiple roles, prioritize admin > driver > partner > user
          const roles = roleData?.map(r => r.role) || [];
          const priorityRole = roles.includes('admin') ? 'admin' : 
                              roles.includes('driver') ? 'driver' :
                              roles.includes('partner') ? 'partner' : 'user';
          setUserRole(priorityRole);
        }
      } catch (error) {
        console.error('Error in role check:', error);
        setUserRole('user'); // Default fallback
      } finally {
        setLoading(false);
      }
    };

    checkUserAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          checkUserAndRole();
        } else {
          setUser(null);
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to appropriate dashboard based on user role
  const roleRedirects = {
    admin: '/admin',
    driver: '/driver',
    user: '/customer', // User role redirects to customer dashboard
    partner: '/partner'
  };

  const redirectPath = roleRedirects[userRole as keyof typeof roleRedirects] || '/customer';
  
  return <Navigate to={redirectPath} replace />;
};