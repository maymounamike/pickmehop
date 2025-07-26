import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, UserCheck, Car, Phone, Mail, Calendar } from "lucide-react";
import Header from "@/components/Header";

interface Driver {
  id: string;
  user_id: string;
  license_number: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_license_plate: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

interface PendingDriver {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  is_active: boolean;
}

const DriversManagement = () => {
  const [user, setUser] = useState<any>(null);
  const [activeDrivers, setActiveDrivers] = useState<Driver[]>([]);
  const [pendingDrivers, setPendingDrivers] = useState<PendingDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchDrivers();
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchDrivers();
      }
    });

    checkUser();
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchDrivers = async () => {
    try {
      // Fetch active drivers
      const { data: activeData, error: activeError } = await supabase
        .from('drivers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (activeError) {
        console.error('Error fetching active drivers:', activeError);
      } else {
        setActiveDrivers(activeData || []);
      }

      // Fetch pending drivers (users with driver role but inactive)
      const { data: pendingData, error: pendingError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          created_at,
          drivers!inner(is_active),
          user_roles!inner(role)
        `)
        .eq('user_roles.role', 'driver')
        .eq('drivers.is_active', false)
        .order('created_at', { ascending: false });

      if (pendingError) {
        console.error('Error fetching pending drivers:', pendingError);
      } else if (pendingData) {
        // Get emails for pending drivers
        const pendingWithEmails = await Promise.all(
          pendingData.map(async (pending: any) => {
            const { data: userData } = await supabase.auth.admin.getUserById(pending.id);
            return {
              id: pending.id,
              first_name: pending.first_name,
              last_name: pending.last_name,
              email: userData.user?.email || 'Unknown',
              created_at: pending.created_at,
              is_active: pending.drivers?.is_active || false
            };
          })
        );
        setPendingDrivers(pendingWithEmails);
      }

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Failed to load drivers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const activateDriver = async (driverId: string) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ is_active: true })
        .eq('user_id', driverId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Driver has been activated successfully.",
      });

      await fetchDrivers();
    } catch (error) {
      console.error('Error activating driver:', error);
      toast({
        title: "Error",
        description: "Failed to activate driver.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back to Dashboard Button */}
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Drivers Management</h1>
            <p className="text-muted-foreground">Manage active and pending drivers</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activeDrivers.length}</div>
              <p className="text-sm text-muted-foreground">Active Drivers</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingDrivers.length}</div>
              <p className="text-sm text-muted-foreground">Pending Activation</p>
            </div>
          </div>
        </div>

        {/* Pending Drivers Section */}
        {pendingDrivers.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-yellow-600 flex items-center">
                <UserCheck className="mr-2 h-5 w-5" />
                Pending Driver Activations ({pendingDrivers.length})
              </CardTitle>
              <CardDescription>
                These drivers have signed up and are waiting for activation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {pendingDrivers.map((driver) => (
                  <Card key={driver.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">
                              {driver.first_name} {driver.last_name}
                            </h3>
                            <Badge variant="secondary">PENDING</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>{driver.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Registered: {formatDate(driver.created_at)}</span>
                          </div>
                        </div>
                        <Button 
                          onClick={() => activateDriver(driver.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Activate Driver
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Drivers Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center">
              <Car className="mr-2 h-5 w-5" />
              Active Drivers ({activeDrivers.length})
            </CardTitle>
            <CardDescription>
              Currently active and verified drivers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeDrivers.length === 0 ? (
              <div className="text-center py-12">
                <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active drivers yet</h3>
                <p className="text-muted-foreground">
                  Active drivers will appear here once they complete their profiles and are activated.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {activeDrivers.map((driver) => (
                  <Card key={driver.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">Driver #{driver.id.slice(0, 8)}</h3>
                            <Badge variant="default">ACTIVE</Badge>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Car className="h-4 w-4" />
                                <span>{driver.vehicle_make} {driver.vehicle_model} ({driver.vehicle_year})</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="font-medium">License Plate:</span>
                                <span>{driver.vehicle_license_plate}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>{driver.phone || 'Not provided'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="font-medium">License:</span>
                                <span>{driver.license_number || 'Not provided'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Calendar className="h-4 w-4" />
                            <span>Joined: {formatDate(driver.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriversManagement;