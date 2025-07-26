import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, Clock, Users, Phone, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format, isAfter, startOfDay } from "date-fns";
import DriverNavigation from "@/components/DriverNavigation";

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

interface Profile {
  first_name: string | null;
  last_name: string | null;
}

const DriverScheduled = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadScheduledRides();
  }, []);

  const loadScheduledRides = async () => {
    try {
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
        navigate('/');
        return;
      }

      // Get driver data
      const { data: driverData } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (driverData) {
        // Load scheduled bookings (future rides that are confirmed)
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('*')
          .eq('driver_id', driverData.id)
          .eq('status', 'confirmed')
          .gte('date', format(new Date(), 'yyyy-MM-dd'))
          .order('date', { ascending: true })
          .order('time', { ascending: true });

        // Filter to only include future rides
        const futureBookings = (bookingsData || []).filter(booking => {
          const bookingDate = new Date(booking.date + 'T' + booking.time);
          return isAfter(bookingDate, new Date());
        });

        setBookings(futureBookings);
      }

    } catch (error) {
      console.error('Error loading scheduled rides:', error);
      toast({
        title: "Error",
        description: "Failed to load scheduled rides.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Navigation */}
        <div className="mb-6">
          <DriverNavigation user={user} profile={profile} />
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Scheduled Rides</h1>
          <p className="text-gray-600">Your upcoming confirmed rides</p>
        </div>

        {/* Scheduled Rides */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Rides</CardTitle>
            <p className="text-sm text-gray-600">{bookings.length} scheduled ride(s)</p>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No scheduled rides</p>
                <p className="text-gray-400 text-sm">Your future rides will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">Booking #{booking.booking_id}</h3>
                          <Badge variant="default">
                            SCHEDULED
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

export default DriverScheduled;