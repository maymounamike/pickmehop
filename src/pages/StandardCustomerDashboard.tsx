import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, MapPin, Users, CreditCard, LogOut, Plus, User, CheckCircle, Bell, Settings } from "lucide-react";

interface Booking {
  id: string;
  booking_id: string;
  from_location: string;
  to_location: string;
  date: string;
  time: string;
  passengers: number;
  estimated_price: number;
  status: string;
  payment_status: string;
  created_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      // Verify user has customer role or no role (default to customer)
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .order('role', { ascending: true });

      if (roleData && roleData.length > 0) {
        const roles = roleData.map(r => r.role);
        if (!roles.includes('user')) {
          // Redirect to appropriate dashboard based on role
          const roleRedirects = {
            admin: '/admin',
            driver: '/driver',
            partner: '/partner'
          };
          const redirectRole = roles.includes('admin') ? 'admin' : 
                              roles.includes('driver') ? 'driver' :
                              roles.includes('partner') ? 'partner' : null;
          if (redirectRole) {
            navigate(roleRedirects[redirectRole as keyof typeof roleRedirects]);
            return;
          }
        }
      }

      setUser(session.user);
      fetchBookings();
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        checkUser();
      }
    });

    checkUser();
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        toast({
          title: "Error",
          description: "Failed to load bookings",
          variant: "destructive",
        });
      } else {
        setBookings(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "new-booking") {
      navigate("/");
    } else if (tab === "profile") {
      toast({
        title: "Coming Soon",
        description: "Profile page is under development",
      });
    }
  };

  const stats = {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
  };

  const filteredBookings = () => {
    switch (activeTab) {
      case "confirmed":
        return bookings.filter(b => b.status === 'confirmed');
      case "completed":
        return bookings.filter(b => b.status === 'completed');
      default:
        return bookings;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Customer Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-white font-semibold text-lg">Customer Portal - PickMeHop</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                    Customer
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <span className="text-sm hidden md:block">Welcome, {user?.email}</span>
              <Button
                variant="ghost"
                className="text-white hover:bg-red-500/20"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-6 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-blue-700 mb-2">
              {activeTab === "bookings" && "My Bookings"}
              {activeTab === "confirmed" && "Confirmed Rides"}
              {activeTab === "completed" && "Completed Rides"}
            </h1>
            <p className="text-gray-600">
              {activeTab === "bookings" && "Manage all your ride bookings"}
              {activeTab === "confirmed" && "Your confirmed upcoming rides"}
              {activeTab === "completed" && "Your ride history"}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Confirmed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.confirmedBookings}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedBookings}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              onClick={() => setActiveTab("bookings")}
              variant={activeTab === "bookings" ? "default" : "outline"}
              className={activeTab === "bookings" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              All Bookings
            </Button>
            <Button
              onClick={() => setActiveTab("confirmed")}
              variant={activeTab === "confirmed" ? "default" : "outline"}
              className={activeTab === "confirmed" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              Confirmed ({stats.confirmedBookings})
            </Button>
            <Button
              onClick={() => setActiveTab("completed")}
              variant={activeTab === "completed" ? "default" : "outline"}
              className={activeTab === "completed" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              Completed ({stats.completedBookings})
            </Button>
          </div>

          {/* Bookings List */}
          {filteredBookings().length === 0 ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {activeTab === "confirmed" && "No confirmed rides"}
                  {activeTab === "completed" && "No completed rides yet"}
                  {activeTab === "bookings" && "No bookings yet"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === "bookings" && "You haven't made any bookings yet. Start planning your next trip!"}
                  {activeTab === "confirmed" && "You don't have any confirmed rides at the moment."}
                  {activeTab === "completed" && "You haven't completed any rides yet."}
                </p>
                <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Book a Ride
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredBookings().map((booking) => (
                <Card key={booking.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          Booking #{booking.booking_id}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          Booked on {formatDate(booking.created_at)}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge 
                          variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                          className={booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : ''}
                        >
                          {booking.status}
                        </Badge>
                        <Badge variant={booking.payment_status === 'paid' ? 'default' : 'destructive'}>
                          {booking.payment_status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Route</p>
                            <p className="text-sm text-gray-600">
                              {booking.from_location} → {booking.to_location}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Date & Time</p>
                            <p className="text-sm text-gray-600">
                              {booking.date} at {booking.time}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Passengers</p>
                            <p className="text-sm text-gray-600">
                              {booking.passengers} {booking.passengers === 1 ? 'person' : 'people'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Price</p>
                            <p className="text-sm text-gray-600">
                              €{booking.estimated_price}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;