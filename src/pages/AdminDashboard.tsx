import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, Clock, Users, Car, Phone, Mail, UserPlus, LogOut, Settings, Home } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

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

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [pendingDrivers, setPendingDrivers] = useState<PendingDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriverForBooking, setSelectedDriverForBooking] = useState<string>("");
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
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

      // Check if user is an admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (!roleData || roleData.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You don't have admin access.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      // Load bookings with driver information
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

      // Load drivers
      const { data: driversData } = await supabase
        .from('drivers')
        .select('*')
        .eq('is_active', true)
        .order('vehicle_make', { ascending: true });

      setDrivers(driversData || []);

      // Load pending drivers (users with driver role but incomplete profiles)
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
              is_active: pending.drivers?.is_active || false,
              has_driver_profile: true
            };
          })
        );
        setPendingDrivers(pendingWithEmails);
      }

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
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

      // Refresh bookings
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const unassignedBookings = bookings.filter(booking => !booking.driver_id);
  const assignedBookings = bookings.filter(booking => booking.driver_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage bookings and drivers</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{bookings.length}</div>
              <p className="text-sm text-gray-600">Total Bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{unassignedBookings.length}</div>
              <p className="text-sm text-gray-600">Unassigned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{assignedBookings.length}</div>
              <p className="text-sm text-gray-600">Assigned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{drivers.length}</div>
              <p className="text-sm text-gray-600">Active Drivers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{pendingDrivers.length}</div>
              <p className="text-sm text-gray-600">Pending Drivers</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Drivers Section */}
        {pendingDrivers.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-yellow-600">Pending Driver Activations ({pendingDrivers.length})</CardTitle>
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
                          <Badge variant="secondary" className="mt-1">PENDING ACTIVATION</Badge>
                        </div>
                        <Button 
                          onClick={() => activateDriver(driver.id)}
                          size="sm"
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

        {/* Driver Assignment Section */}
        {unassignedBookings.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Assign Driver to Booking</CardTitle>
            </CardHeader>
            <CardContent>
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
                <Button onClick={assignDriverToBooking}>
                  Assign Driver
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Unassigned Bookings */}
        {unassignedBookings.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-orange-600">Unassigned Bookings ({unassignedBookings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {unassignedBookings.map((booking) => (
                  <Card key={booking.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      {/* ... booking content similar to DriverDashboard but with assignment options ... */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">Booking #{booking.booking_id}</h3>
                          <Badge variant="secondary">UNASSIGNED</Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">€{booking.estimated_price}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(booking.date), 'MMM d, yyyy')} at {booking.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-green-600" />
                          <span className="font-medium">From:</span>
                          <span className="ml-2">{booking.from_location}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-red-600" />
                          <span className="font-medium">To:</span>
                          <span className="ml-2">{booking.to_location}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          <span className="font-medium">Customer:</span>
                          <span className="ml-2">{booking.customer_name} ({booking.passengers} pax)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assigned Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Assigned Bookings ({assignedBookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {assignedBookings.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No assigned bookings yet.</p>
            ) : (
              <div className="space-y-4">
                {assignedBookings.map((booking) => (
                  <Card key={booking.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">Booking #{booking.booking_id}</h3>
                          <Badge variant="default">ASSIGNED</Badge>
                          {booking.drivers && (
                            <p className="text-sm text-gray-600 mt-1">
                              Driver: {booking.drivers.vehicle_make} {booking.drivers.vehicle_model} ({booking.drivers.vehicle_license_plate})
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">€{booking.estimated_price}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(booking.date), 'MMM d, yyyy')} at {booking.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-green-600" />
                          <span className="font-medium">From:</span>
                          <span className="ml-2">{booking.from_location}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-red-600" />
                          <span className="font-medium">To:</span>
                          <span className="ml-2">{booking.to_location}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          <span className="font-medium">Customer:</span>
                          <span className="ml-2">{booking.customer_name} ({booking.passengers} pax)</span>
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

export default AdminDashboard;