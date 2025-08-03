import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, Users, Phone, Mail, Car, DollarSign, TrendingUp, UserCircle, LogOut, Bell, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  booking_id: string;
  from_location: string;
  to_location: string;
  date: string;
  time: string;
  passengers: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  estimated_price: number;
  status: string;
  created_at: string;
}

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
}

interface Profile {
  first_name: string;
  last_name: string;
  phone: string;
}

interface DashboardStats {
  monthlyBookings: number;
  monthlyRevenue: number;
  totalEarnings: number;
  completedRides: number;
  pendingRides: number;
}

const DriverDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    monthlyBookings: 0,
    monthlyRevenue: 0,
    totalEarnings: 0,
    completedRides: 0,
    pendingRides: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("confirmed");
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAndLoadData();
  }, []);

  const checkUserAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      // Verify user has driver role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .order('role', { ascending: true });

      const roles = roleData?.map(r => r.role) || [];
      if (!roles.includes('driver') && !roles.includes('admin')) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Load driver and profile data
      const [driverResponse, profileResponse] = await Promise.all([
        supabase.from('drivers').select('*').eq('user_id', session.user.id).single(),
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
      ]);

      if (driverResponse.data) setDriver(driverResponse.data);
      if (profileResponse.data) setProfile(profileResponse.data);

      // Load dashboard data
      await fetchBookings();
      
    } catch (error) {
      console.error('Error loading driver dashboard:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    if (!driver) return;

    try {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('driver_id', driver.id)
        .order('created_at', { ascending: false });

      if (data) {
        setBookings(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const calculateStats = (bookingData: Booking[]) => {
    const completed = bookingData.filter(b => b.status === 'completed');
    const pending = bookingData.filter(b => b.status === 'confirmed');
    const monthlyRevenue = completed.reduce((sum, b) => sum + Number(b.estimated_price), 0) * 0.8; // 80% commission

    setStats({
      monthlyBookings: bookingData.length,
      monthlyRevenue,
      totalEarnings: monthlyRevenue,
      completedRides: completed.length,
      pendingRides: pending.length,
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev => prev.map(booking =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));

      toast({
        title: "Status Updated",
        description: `Booking status updated to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading Driver Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Driver Header */}
      <header className="bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-white font-semibold text-lg">Driver Hub - PickMeHop</span>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                    Driver
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
              <span className="text-sm hidden md:block">
                Welcome, {profile?.first_name || 'Driver'}
              </span>
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
            <h1 className="text-3xl font-bold text-orange-700 mb-2">Driver Dashboard</h1>
            <p className="text-gray-600">Manage your rides and track your performance</p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Monthly Bookings</p>
                    <p className="text-2xl font-bold">{stats.monthlyBookings}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Monthly Earnings</p>
                    <p className="text-2xl font-bold">€{stats.monthlyRevenue.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Completed Rides</p>
                    <p className="text-2xl font-bold">{stats.completedRides}</p>
                  </div>
                  <Car className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Pending Rides</p>
                    <p className="text-2xl font-bold">{stats.pendingRides}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ride Management Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="confirmed">Confirmed Rides</TabsTrigger>
              <TabsTrigger value="completed">Completed Rides</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="confirmed" className="space-y-4">
              <div className="grid gap-4">
                {bookings
                  .filter(booking => booking.status === 'confirmed')
                  .map(booking => (
                    <Card key={booking.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">Booking #{booking.booking_id}</h3>
                            <p className="text-gray-600">{booking.date} at {booking.time}</p>
                          </div>
                          <Badge variant="outline" className="border-orange-200 text-orange-700">
                            {booking.status}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Route:</span>
                            </div>
                            <p className="text-sm text-gray-600 ml-6">
                              {booking.from_location} → {booking.to_location}
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Customer:</span>
                            </div>
                            <p className="text-sm text-gray-600 ml-6">{booking.customer_name}</p>
                            <p className="text-sm text-gray-600 ml-6">{booking.customer_phone}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg text-green-600">
                            €{booking.estimated_price}
                          </span>
                          <Button
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            Complete Ride
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <div className="grid gap-4">
                {bookings
                  .filter(booking => booking.status === 'completed')
                  .map(booking => (
                    <Card key={booking.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">Booking #{booking.booking_id}</h3>
                            <p className="text-gray-600">{booking.date} at {booking.time}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            Completed
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Route:</span>
                            </div>
                            <p className="text-sm text-gray-600 ml-6">
                              {booking.from_location} → {booking.to_location}
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Earnings:</span>
                            </div>
                            <p className="text-sm font-bold text-green-600 ml-6">
                              €{(Number(booking.estimated_price) * 0.8).toFixed(2)} (80%)
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCircle className="h-5 w-5 text-orange-600" />
                      Driver Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Name</label>
                        <p className="font-semibold">
                          {profile?.first_name} {profile?.last_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone</label>
                        <p className="font-semibold">{profile?.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">License Number</label>
                        <p className="font-semibold">{driver?.license_number}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Vehicle</label>
                        <p className="font-semibold">
                          {driver?.vehicle_make} {driver?.vehicle_model} ({driver?.vehicle_year})
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;