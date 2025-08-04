import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MapPin, Calendar, Clock, Users, Car, Phone, Mail, UserPlus, LogOut, TrendingUp, AlertTriangle, CheckCircle, BarChart3, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/AdminSidebar";
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
  driver_id: string | null;
  assigned_at: string | null;
  created_at: string;
  drivers?: {
    id: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_license_plate: string;
  };
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

interface PendingDriver {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  is_active: boolean;
  has_driver_profile: boolean;
}

interface AdminStats {
  monthlyBookings: number;
  monthlyRevenue: number;
  totalBookings: number;
  totalRevenue: number;
  unassignedRides: number;
  activeDrivers: number;
  pendingDrivers: number;
}

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [pendingDrivers, setPendingDrivers] = useState<PendingDriver[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    monthlyBookings: 0,
    monthlyRevenue: 0,
    totalBookings: 0,
    totalRevenue: 0,
    unassignedRides: 0,
    activeDrivers: 0,
    pendingDrivers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedDriverForBooking, setSelectedDriverForBooking] = useState<string>("");
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("bookings");
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

      // Verify user has admin role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (!roleData || roleData.role !== 'admin') {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', session.user.id)
        .single();

      setProfile(profileData);

      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          drivers:driver_id (
            id,
            vehicle_make,
            vehicle_model,
            vehicle_license_plate
          )
        `)
        .order('created_at', { ascending: false });

      setBookings(bookingsData || []);

      const { data: driversData } = await supabase
        .from('drivers')
        .select('*')
        .eq('is_active', true)
        .order('vehicle_make', { ascending: true });

      setDrivers(driversData || []);

      const { data: pendingData } = await supabase
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

      if (pendingData) {
        const pendingWithEmails = await Promise.all(
          pendingData.map(async (pending: any) => {
            const { data: userData } = await supabase.auth.admin.getUserById(pending.id);
            return {
              id: pending.id,
              first_name: pending.first_name,
              last_name: pending.last_name,
              email: userData.user?.email || 'Unknown',
              created_at: pending.created_at,
              is_active: pending.drivers?.is_active || false,
              has_driver_profile: true
            };
          })
        );
        setPendingDrivers(pendingWithEmails);
      }

      calculateStats(bookingsData || [], driversData || [], pendingData ? await Promise.all(
        pendingData.map(async (pending: any) => {
          const { data: userData } = await supabase.auth.admin.getUserById(pending.id);
          return {
            id: pending.id,
            first_name: pending.first_name,
            last_name: pending.last_name,
            email: userData.user?.email || 'Unknown',
            created_at: pending.created_at,
            is_active: pending.drivers?.is_active || false,
            has_driver_profile: true
          };
        })
      ) : []);

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsData: Booking[], driversData: Driver[], pendingData: PendingDriver[]) => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const monthlyBookings = bookingsData.filter(b => 
      isAfter(new Date(b.created_at), thirtyDaysAgo)
    );
    
    const monthlyRevenue = monthlyBookings.reduce((sum, booking) => 
      sum + Number(booking.estimated_price), 0
    );
    
    const totalRevenue = bookingsData.reduce((sum, booking) => 
      sum + Number(booking.estimated_price), 0
    );
    
    const unassignedRides = bookingsData.filter(b => !b.driver_id).length;

    setStats({
      monthlyBookings: monthlyBookings.length,
      monthlyRevenue,
      totalBookings: bookingsData.length,
      totalRevenue,
      unassignedRides,
      activeDrivers: driversData.length,
      pendingDrivers: pendingData.length,
    });
  };

  const handleSignOut = async () => {
    try {
      setUser(null);
      setProfile(null);
      await supabase.auth.signOut();
    } catch (error) {
      console.log('Sign out completed');
    } finally {
      navigate("/");
    }
  };

  const assignDriverToBooking = async () => {
    if (!selectedDriverForBooking || !selectedBookingId) {
      toast({
        title: "Error",
        description: "Please select both a driver and booking.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          driver_id: selectedDriverForBooking,
          assigned_at: new Date().toISOString(),
          assigned_by: user.id
        })
        .eq('id', selectedBookingId);

      if (error) throw error;

      await checkUserAndLoadData();

      toast({
        title: "Driver Assigned",
        description: "Driver has been successfully assigned to the booking.",
      });

      setSelectedDriverForBooking("");
      setSelectedBookingId("");
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast({
        title: "Error",
        description: "Failed to assign driver.",
        variant: "destructive",
      });
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

      await checkUserAndLoadData();
    } catch (error) {
      console.error('Error activating driver:', error);
      toast({
        title: "Error",
        description: "Failed to activate driver.",
        variant: "destructive",
      });
    }
  };

  const getTabContent = () => {
    const unassignedBookings = bookings.filter(booking => !booking.driver_id);
    const assignedBookings = bookings.filter(booking => booking.driver_id);

    switch (activeTab) {
      case "bookings":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Unassigned Rides ({unassignedBookings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {unassignedBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 mx-auto text-green-300 mb-4" />
                    <p className="text-gray-500 text-lg mb-2">All rides assigned!</p>
                    <p className="text-sm text-gray-400">Great job managing the fleet</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {unassignedBookings.slice(0, 5).map((booking) => (
                      <Card key={booking.id} className="border-l-4 border-l-orange-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold">#{booking.booking_id}</h3>
                              <p className="text-sm text-gray-600 mb-2">{booking.customer_name}</p>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1 text-green-600" />
                                  <span className="truncate">{booking.from_location}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1 text-red-600" />
                                  <span className="truncate">{booking.to_location}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    <span>{format(new Date(booking.date), 'MMM d')}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    <span>{booking.time}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-bold text-green-600">€{booking.estimated_price}</p>
                              <Badge variant="secondary">{booking.passengers} passengers</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Recent Assignments ({assignedBookings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {assignedBookings.slice(0, 5).map((booking) => (
                    <Card key={booking.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">#{booking.booking_id}</h3>
                            <p className="text-sm text-gray-600 mb-2">{booking.customer_name}</p>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center">
                                <Car className="w-3 h-3 mr-1" />
                                <span>
                                  {booking.drivers?.vehicle_make} {booking.drivers?.vehicle_model} 
                                  ({booking.drivers?.vehicle_license_plate})
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-bold text-green-600">€{booking.estimated_price}</p>
                            <Badge variant={
                              booking.status === 'confirmed' ? 'default' :
                              booking.status === 'in_progress' ? 'secondary' : 'outline'
                            }>
                              {booking.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "drivers":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingDrivers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-yellow-600">Pending Activations ({pendingDrivers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingDrivers.map((driver) => (
                      <Card key={driver.id} className="border-l-4 border-l-yellow-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold">{driver.first_name} {driver.last_name}</h3>
                              <p className="text-sm text-gray-600">{driver.email}</p>
                              <p className="text-xs text-gray-500">
                                Registered: {format(new Date(driver.created_at), 'MMM d, yyyy')}
                              </p>
                              <Badge variant="secondary" className="mt-1">PENDING</Badge>
                            </div>
                            <Button 
                              onClick={() => activateDriver(driver.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Activate
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Active Drivers ({drivers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {drivers.map((driver) => (
                    <Card key={driver.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">{driver.vehicle_make} {driver.vehicle_model}</h3>
                            <p className="text-sm text-gray-600">{driver.vehicle_license_plate}</p>
                            <p className="text-xs text-gray-500">License: {driver.license_number}</p>
                            <div className="flex items-center mt-2">
                              <Phone className="w-3 h-3 mr-1" />
                              <span className="text-sm">{driver.phone}</span>
                            </div>
                          </div>
                          <Badge variant="default">ACTIVE</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "assignments":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Assign Driver to Booking</CardTitle>
              <p className="text-sm text-gray-600">Quickly assign available drivers to unassigned bookings</p>
            </CardHeader>
            <CardContent>
              {unassignedBookings.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto text-green-300 mb-4" />
                  <p className="text-gray-500 text-lg mb-2">All rides assigned!</p>
                  <p className="text-sm text-gray-400">No pending assignments needed</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <Label>Select Booking</Label>
                    <Select value={selectedBookingId} onValueChange={setSelectedBookingId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a booking" />
                      </SelectTrigger>
                      <SelectContent>
                        {unassignedBookings.map((booking) => (
                          <SelectItem key={booking.id} value={booking.id}>
                            {booking.booking_id} - {booking.customer_name} ({format(new Date(booking.date), 'MMM d')})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Select Driver</Label>
                    <Select value={selectedDriverForBooking} onValueChange={setSelectedDriverForBooking}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.vehicle_make} {driver.vehicle_model} ({driver.vehicle_license_plate})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={assignDriverToBooking} className="w-full">
                    Assign Driver
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "analytics":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Business Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{stats.totalBookings}</p>
                      <p className="text-sm text-gray-600">Total Bookings</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">€{stats.totalRevenue.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      €{stats.totalBookings > 0 ? (stats.totalRevenue / stats.totalBookings).toFixed(2) : '0.00'}
                    </p>
                    <p className="text-sm text-gray-600">Average Booking Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Assignment Rate</span>
                    <span className="font-bold text-green-600">
                      {bookings.length > 0 ? Math.round(((bookings.length - stats.unassignedRides) / bookings.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Driver Utilization</span>
                    <span className="font-bold text-blue-600">
                      {drivers.length > 0 ? Math.round(((bookings.length - stats.unassignedRides) / drivers.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Pending Actions</span>
                    <span className="font-bold text-orange-600">
                      {stats.unassignedRides + stats.pendingDrivers}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-gray-50">
        <AdminSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          stats={stats} 
        />

        <div className="flex-1 flex flex-col">
          <header className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="text-white hover:bg-white/10" />
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <div>
                    <span className="text-white font-semibold text-lg">Admin Panel - PickMeHop</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200 ml-3">
                      Administrator
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <span className="text-sm">
                  Welcome back {profile?.first_name}!
                </span>
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-red-400 hover:bg-red-50/10"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  SIGN OUT
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 bg-white overflow-y-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back {profile?.first_name}! 🚀
              </h1>
              <p className="text-gray-600">Your command center overview for Pick Me Hop</p>
            </div>

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
              
              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Unassigned Rides</p>
                      <p className="text-2xl font-bold">{stats.unassignedRides}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Active Drivers</p>
                      <p className="text-2xl font-bold">{stats.activeDrivers}</p>
                    </div>
                    <Car className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Grid */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    className="h-20 p-4 flex flex-col items-center justify-center space-y-2 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 hover:text-emerald-800"
                    variant="outline"
                    onClick={() => navigate('/admin/users')}
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-sm font-medium">Manage Users</span>
                  </Button>
                  
                  <Button 
                    className="h-20 p-4 flex flex-col items-center justify-center space-y-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800"
                    variant="outline"
                    onClick={() => navigate('/admin/driver-approvals')}
                  >
                    <div className="relative">
                      <UserPlus className="h-6 w-6" />
                      {stats.pendingDrivers > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center">
                          {stats.pendingDrivers}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm font-medium">Driver Approvals</span>
                  </Button>
                  
                  <Button 
                    className="h-20 p-4 flex flex-col items-center justify-center space-y-2 bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700 hover:text-orange-800"
                    variant="outline"
                    onClick={() => navigate('/admin/assign-rides')}
                  >
                    <div className="relative">
                      <Car className="h-6 w-6" />
                      {stats.unassignedRides > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center">
                          {stats.unassignedRides}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm font-medium">Assign Rides</span>
                  </Button>
                  
                  <Button 
                    className="h-20 p-4 flex flex-col items-center justify-center space-y-2 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 hover:text-purple-800"
                    variant="outline"
                    onClick={() => navigate('/admin/all-requests')}
                  >
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-sm font-medium">All Requests</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {getTabContent()}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;