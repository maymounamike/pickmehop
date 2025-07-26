import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, MapPin, Users, CreditCard, ArrowLeft, FileX, CheckCircle } from "lucide-react";
import Header from "@/components/Header";

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
      fetchBookings();
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchBookings();
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
        {/* Back to Home Button */}
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => {
            console.log('Back to Home button clicked');
            navigate("/");
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground">Welcome back, {user?.email}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/unassigned-rides")}>
              <FileX className="mr-2 h-4 w-4" />
              Unassigned Rides
            </Button>
            <Button variant="outline" onClick={() => navigate("/confirmed-rides")}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirmed Rides
            </Button>
          </div>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't made any bookings yet. Start planning your next trip!
              </p>
              <Button onClick={() => navigate("/")}>
                Book a Ride
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Booking #{booking.booking_id}
                      </CardTitle>
                      <CardDescription>
                        Booked on {formatDate(booking.created_at)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
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
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Route</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.from_location} → {booking.to_location}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Date & Time</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.date} at {booking.time}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Passengers</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.passengers} {booking.passengers === 1 ? 'person' : 'people'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Price</p>
                          <p className="text-sm text-muted-foreground">
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
    </div>
  );
};

export default Dashboard;