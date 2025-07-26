import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Clock, Users, Phone, Mail, Car, DollarSign, TrendingUp, UserCircle, ListTodo, LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format, subDays, isAfter } from "date-fns";

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
  assigned_at: string;
}

interface Driver {
  id: string;
  license_number: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_license_plate: string;
  phone: string;
  is_active: boolean;
}

interface Profile {
  first_name: string | null;
  last_name: string | null;
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
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAndLoadData();
  }, []);

  const checkUserAndLoadData = async () => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', session.user.id)
        .single();

      setProfile(profileData);

      // Check if user is a driver
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (!roleData || roleData.role !== 'driver') {
        toast({
          title: "Access Denied",
          description: "You don't have driver access.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      // Load driver profile
      const { data: driverData } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      setDriver(driverData);

      // Load assigned bookings
      if (driverData) {
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('*')
          .eq('driver_id', driverData.id)
          .order('date', { ascending: true });

        setBookings(bookingsData || []);
        
        // Calculate analytics
        calculateStats(bookingsData || []);
      }

    } catch (error) {
      console.error('Error loading driver data:', error);
      toast({
        title: "Error",
        description: "Failed to load driver dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsData: Booking[]) => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const completedBookings = bookingsData.filter(b => b.status === 'completed');
    const pendingBookings = bookingsData.filter(b => b.status === 'confirmed');
    
    // Monthly stats (last 30 days)
    const monthlyBookings = completedBookings.filter(b => 
      isAfter(new Date(b.date), thirtyDaysAgo)
    );
    
    const monthlyRevenue = monthlyBookings.reduce((sum, booking) => 
      sum + Number(booking.estimated_price), 0
    );
    
    const totalEarnings = completedBookings.reduce((sum, booking) => 
      sum + Number(booking.estimated_price), 0
    );

    setStats({
      monthlyBookings: monthlyBookings.length,
      monthlyRevenue,
      totalEarnings,
      completedRides: completedBookings.length,
      pendingRides: pendingBookings.length,
    });
  };

  const handleSignOut = async () => {
    try {
      setUser(null);
      await supabase.auth.signOut();
    } catch (error) {
      console.log('Sign out completed');
    } finally {
      navigate("/");
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ));

      toast({
        title: "Status Updated",
        description: `Booking marked as ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  // Separate bookings by status
  const pendingBookings = bookings.filter(b => b.status === 'confirmed');
  const ongoingBookings = bookings.filter(b => b.status === 'in_progress');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  const renderBookingCard = (booking: Booking) => (
    <Card key={booking.id} className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold">Booking #{booking.booking_id}</h3>
            <Badge variant={
              booking.status === 'confirmed' ? 'default' :
              booking.status === 'in_progress' ? 'secondary' :
              booking.status === 'completed' ? 'outline' : 'destructive'
            }>
              {booking.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">€{booking.estimated_price}</p>
            <p className="text-xs text-gray-500">
              Assigned: {format(new Date(booking.assigned_at), 'MMM d, HH:mm')}
            </p>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Route Information */}
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <MapPin className="w-4 h-4 mr-2 text-green-600" />
              <span className="font-medium">From:</span>
            </div>
            <p className="text-sm text-gray-700 ml-6">{booking.from_location}</p>
            
            <div className="flex items-center text-sm">
              <MapPin className="w-4 h-4 mr-2 text-red-600" />
              <span className="font-medium">To:</span>
            </div>
            <p className="text-sm text-gray-700 ml-6">{booking.to_location}</p>
          </div>

          {/* Booking Details */}
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="font-medium">Date:</span>
              <span className="ml-2">{format(new Date(booking.date), 'MMM d, yyyy')}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2" />
              <span className="font-medium">Time:</span>
              <span className="ml-2">{booking.time}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <Users className="w-4 h-4 mr-2" />
              <span className="font-medium">Passengers:</span>
              <span className="ml-2">{booking.passengers}</span>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <Separator className="my-3" />
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Customer Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div className="flex items-center">
              <span className="font-medium">Name:</span>
              <span className="ml-2">{booking.customer_name}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              <a href={`tel:${booking.customer_phone}`} className="text-blue-600 hover:underline">
                {booking.customer_phone}
              </a>
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              <a href={`mailto:${booking.customer_email}`} className="text-blue-600 hover:underline">
                {booking.customer_email}
              </a>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {booking.status === 'confirmed' && (
            <Button 
              size="sm" 
              onClick={() => updateBookingStatus(booking.id, 'in_progress')}
            >
              Start Ride
            </Button>
          )}
          {booking.status === 'in_progress' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => updateBookingStatus(booking.id, 'completed')}
            >
              Complete Ride
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Black Header */}
      <header className="bg-black text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/fd647c9d-74ed-4206-99d0-9b04a8f86b41.png" 
              alt="Pick Me Hop Logo" 
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-white font-semibold text-lg">Pick Me Hop</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <span className="text-sm">
              Welcome, {profile?.first_name} {profile?.last_name}
            </span>
            <Button 
              variant="ghost" 
              className="text-white hover:text-accent hover:bg-white/10"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.first_name}! 👋
          </h1>
          <p className="text-gray-600">Here's your driving performance overview</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">30-Day Bookings</p>
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
                  <p className="text-green-100 text-sm">30-Day Revenue</p>
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
                  <p className="text-purple-100 text-sm">Total Earnings</p>
                  <p className="text-2xl font-bold">€{stats.totalEarnings.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-200" />
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

        {/* Navigation Tabs */}
        <Tabs defaultValue="unassigned" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black">
            <TabsTrigger value="unassigned" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">
              Unassigned Rides
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">
              Confirmed Rides
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">
              My Profile
            </TabsTrigger>
          </TabsList>

          {/* Unassigned Rides Tab */}
          <TabsContent value="unassigned" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Rides</CardTitle>
                <p className="text-sm text-gray-600">Rides available for assignment</p>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  No unassigned rides available at the moment.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Confirmed Rides Tab */}
          <TabsContent value="confirmed" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Confirmed Rides</CardTitle>
                <p className="text-sm text-gray-600">{bookings.length} total ride(s)</p>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No rides assigned yet</p>
                    <p className="text-sm text-gray-400">Check back soon for new ride assignments</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map(renderBookingCard)}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            {driver && (
              <div className="space-y-6">
                {/* Performance Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Performance Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{stats.completedRides}</p>
                        <p className="text-sm text-gray-600">Total Completed Rides</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">€{stats.totalEarnings.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Total Earnings</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">
                          {stats.completedRides > 0 ? (stats.totalEarnings / stats.completedRides).toFixed(2) : '0.00'}
                        </p>
                        <p className="text-sm text-gray-600">Avg. Earnings per Ride</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Driver Profile Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Car className="w-5 h-5 mr-2" />
                      Vehicle Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Vehicle</p>
                        <p className="font-medium">{driver.vehicle_make} {driver.vehicle_model} ({driver.vehicle_year})</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">License Plate</p>
                        <p className="font-medium">{driver.vehicle_license_plate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">License Number</p>
                        <p className="font-medium">{driver.license_number}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Badge variant={driver.is_active ? "default" : "secondary"}>
                        {driver.is_active ? "Active Driver" : "Inactive"}
                      </Badge>
                      <Button variant="outline" onClick={() => navigate('/driver/profile')}>
                        Edit Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserCircle className="w-5 h-5 mr-2" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-medium text-lg">
                          {profile?.first_name} {profile?.last_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone Number</p>
                        <p className="font-medium">{driver.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Member Since</p>
                        <p className="font-medium">{format(new Date(user?.created_at), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DriverDashboard;