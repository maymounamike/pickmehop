import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export const RoleBasedRoute = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/auth' 
}: RoleBasedRouteProps) => {
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

        // Get user role from user_roles table
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setUserRole('user'); // Default to user if no role found
        } else {
          setUserRole(roleData.role);
        }
      } catch (error) {
        console.error('Error in role check:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          // Re-fetch role when auth state changes
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
          <p className="text-sm text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on user role
    const roleRedirects = {
      admin: '/admin',
      driver: '/driver',
      user: '/customer',
      partner: '/partner'
    };
    
    const defaultRedirect = userRole ? roleRedirects[userRole as keyof typeof roleRedirects] || '/dashboard' : '/auth';
    return <Navigate to={defaultRedirect} replace />;
  }

  return <>{children}</>;
};