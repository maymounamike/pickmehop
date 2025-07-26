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
import { MapPin, Calendar, Clock, Users, Car, Phone, Mail, UserPlus, LogOut, Settings } from "lucide-react";
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

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriverForBooking, setSelectedDriverForBooking] = useState<string>("");
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [newDriverData, setNewDriverData] = useState({
    email: "",
    password: "",
    license_number: "",
    vehicle_make: "",
    vehicle_model: "",
    vehicle_year: "",
    vehicle_license_plate: "",
    phone: "",
  });
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

  const createNewDriver = async () => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newDriverData.email,
        password: newDriverData.password,
        email_confirm: true
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      // Create driver profile - start as inactive until profile is complete
      const { error: driverError } = await supabase
        .from('drivers')
        .insert({
          user_id: authData.user.id,
          license_number: newDriverData.license_number || '',
          vehicle_make: newDriverData.vehicle_make || '',
          vehicle_model: newDriverData.vehicle_model || '',
          vehicle_year: newDriverData.vehicle_year ? parseInt(newDriverData.vehicle_year) : null,
          vehicle_license_plate: newDriverData.vehicle_license_plate || '',
          phone: newDriverData.phone || '',
          is_active: false // Start as inactive until profile is complete
        });

      if (driverError) throw driverError;

      // Assign driver role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'driver'
        });

      if (roleError) throw roleError;

      // Send welcome email with login credentials
      try {
        const { error: emailError } = await supabase.functions.invoke('send-driver-welcome', {
          body: {
            email: newDriverData.email,
            temporaryPassword: newDriverData.password
          }
        });

        if (emailError) {
          console.error('Email error:', emailError);
          toast({
            title: "Driver Created",
            description: "Driver account created but email notification failed. Please contact the driver manually.",
            variant: "default",
          });
        } else {
          toast({
            title: "Success",
            description: "Driver account created and welcome email sent successfully.",
          });
        }
      } catch (emailError) {
        console.error('Email error:', emailError);
        toast({
          title: "Driver Created",
          description: "Driver account created but email notification failed. Please contact the driver manually.",
          variant: "default",
        });
      }

      // Reset form and refresh data
      setNewDriverData({
        email: "",
        password: "",
        license_number: "",
        vehicle_make: "",
        vehicle_model: "",
        vehicle_year: "",
        vehicle_license_plate: "",
        phone: "",
      });

      await checkUserAndLoadData();

    } catch (error) {
      console.error('Error creating driver:', error);
      toast({
        title: "Error",
        description: "Failed to create driver.",
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
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Driver
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Driver</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newDriverData.email}
                        onChange={(e) => setNewDriverData({...newDriverData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newDriverData.password}
                        onChange={(e) => setNewDriverData({...newDriverData, password: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="license">License Number</Label>
                    <Input
                      id="license"
                      value={newDriverData.license_number}
                      onChange={(e) => setNewDriverData({...newDriverData, license_number: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="make">Vehicle Make</Label>
                      <Input
                        id="make"
                        value={newDriverData.vehicle_make}
                        onChange={(e) => setNewDriverData({...newDriverData, vehicle_make: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        value={newDriverData.vehicle_model}
                        onChange={(e) => setNewDriverData({...newDriverData, vehicle_model: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={newDriverData.vehicle_year}
                        onChange={(e) => setNewDriverData({...newDriverData, vehicle_year: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plate">License Plate</Label>
                      <Input
                        id="plate"
                        value={newDriverData.vehicle_license_plate}
                        onChange={(e) => setNewDriverData({...newDriverData, vehicle_license_plate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newDriverData.phone}
                        onChange={(e) => setNewDriverData({...newDriverData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <Button onClick={createNewDriver} className="w-full">
                    Create Driver
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
        </div>

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