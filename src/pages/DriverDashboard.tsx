import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, Clock, Users, Luggage, Phone, Mail, Car, LogOut } from "lucide-react";
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

const DriverDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.email}</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Driver Profile Card */}
        {driver && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="w-5 h-5 mr-2" />
                Your Vehicle Information
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
              <div className="mt-4">
                <Badge variant={driver.is_active ? "default" : "secondary"}>
                  {driver.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Your Assigned Rides</CardTitle>
            <p className="text-sm text-gray-600">{bookings.length} ride(s) assigned</p>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No rides assigned yet.</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverDashboard;