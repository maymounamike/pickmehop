import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Building2, DollarSign, Car, TrendingUp, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

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
  customer_name: string;
  customer_email: string;
  created_at: string;
}

interface Partner {
  id: string;
  user_id: string;
  company_name: string;
  company_logo_url?: string;
  partnership_type: string;
  commission_rate: number;
  is_active: boolean;
}

interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

interface PartnerStats {
  totalRides: number;
  monthlyRides: number;
  totalEarnings: number;
  monthlyEarnings: number;
}

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<PartnerStats>({
    totalRides: 0,
    monthlyRides: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    checkUserAndLoadData();
  }, []);

  const checkUserAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Check if user has partner role
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (userRole?.role !== 'partner') {
        toast.error('Access denied. Partner role required.');
        navigate('/dashboard');
        return;
      }

      // Load partner profile
      const { data: partnerData } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (partnerData) {
        setPartner(partnerData);
      }

      // Load user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Load bookings data (for partner analytics)
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsData) {
        setBookings(bookingsData);
        calculateStats(bookingsData, partnerData?.commission_rate || 0);
      }

    } catch (error) {
      console.error('Error loading partner dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsData: Booking[], commissionRate: number) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyBookings = bookingsData.filter(booking => {
      const bookingDate = new Date(booking.created_at);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    });

    const totalEarnings = bookingsData.reduce((sum, booking) => {
      return sum + (booking.estimated_price * (commissionRate / 100));
    }, 0);

    const monthlyEarnings = monthlyBookings.reduce((sum, booking) => {
      return sum + (booking.estimated_price * (commissionRate / 100));
    }, 0);

    setStats({
      totalRides: bookingsData.length,
      monthlyRides: monthlyBookings.length,
      totalEarnings,
      monthlyEarnings,
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const getDisplayName = () => {
    if (partner?.company_name) return partner.company_name;
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return user?.email?.split('@')[0] || 'Partner';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background to-background/50">
        <main className="flex-1">
          {/* Header */}
          <header className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <div>
                  <span className="text-white font-semibold text-lg">Partner Dashboard - PickMeHop</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 ml-3">
                    Partner
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <span className="text-sm">
                  Welcome, {getDisplayName()}
                </span>
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-green-400 hover:bg-green-50/10"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">Partner Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor your partnership performance and earnings
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRides}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Rides</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.monthlyRides}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{stats.totalEarnings.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">All time commission</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{stats.monthlyEarnings.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="rides">Completed Rides</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Partnership Overview</CardTitle>
                    <CardDescription>Your partnership details and performance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Partnership Type</label>
                        <div className="mt-1">
                          <Badge variant="secondary">{partner?.partnership_type || 'Standard'}</Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Commission Rate</label>
                        <div className="mt-1 text-lg font-semibold">
                          {partner?.commission_rate || 0}%
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <div className="mt-1">
                          <Badge variant={partner?.is_active ? "default" : "destructive"}>
                            {partner?.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rides" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Completed Rides</CardTitle>
                    <CardDescription>Rides that generated commission for your partnership</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {bookings.length > 0 ? (
                        bookings.slice(0, 10).map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                              <div className="font-medium">
                                {booking.from_location} → {booking.to_location}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {booking.customer_name} • {booking.date} at {booking.time}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">€{booking.estimated_price}</div>
                              <div className="text-sm text-muted-foreground">
                                Commission: €{(booking.estimated_price * ((partner?.commission_rate || 0) / 100)).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No rides found
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Manage your partner profile details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Company Name</label>
                        <div className="mt-1 p-2 border rounded">
                          {partner?.company_name || 'Not set'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Contact Name</label>
                        <div className="mt-1 p-2 border rounded">
                          {profile?.first_name && profile?.last_name 
                            ? `${profile.first_name} ${profile.last_name}` 
                            : 'Not set'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <div className="mt-1 p-2 border rounded">
                          {user?.email}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Phone</label>
                        <div className="mt-1 p-2 border rounded">
                          {profile?.phone || 'Not set'}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default PartnerDashboard;