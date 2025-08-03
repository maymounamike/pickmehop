import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, DollarSign, Car, TrendingUp, LogOut, User, Bell, Settings } from 'lucide-react';
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
  created_at: string;
}

interface Partner {
  id: string;
  user_id: string;
  company_name: string;
  partnership_type: string;
  commission_rate: number;
  is_active: boolean;
  company_logo_url: string;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
}

interface PartnerStats {
  totalRides: number;
  monthlyRides: number;
  totalEarnings: number;
  monthlyEarnings: number;
}

const PartnerDashboard = () => {
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

      // Verify user has partner role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .order('role', { ascending: true });

      const roles = roleData?.map(r => r.role) || [];
      if (!roles.includes('partner') && !roles.includes('admin')) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Load partner data
      const [partnerResponse, profileResponse] = await Promise.all([
        supabase.from('partners').select('*').eq('user_id', session.user.id).single(),
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
      ]);

      if (partnerResponse.data) {
        setPartner(partnerResponse.data);
        await loadPartnerBookings(partnerResponse.data.id);
      }
      if (profileResponse.data) setProfile(profileResponse.data);

    } catch (error) {
      console.error('Error loading partner dashboard:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const loadPartnerBookings = async (partnerId: string) => {
    try {
      // This would typically filter by partner referrals
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (data) {
        setBookings(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error fetching partner bookings:', error);
    }
  };

  const calculateStats = (bookingData: Booking[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyBookings = bookingData.filter(booking => {
      const bookingDate = new Date(booking.created_at);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    });

    const commissionRate = partner?.commission_rate || 0.05; // 5% default
    const totalEarnings = bookingData.reduce((sum, booking) => 
      sum + (Number(booking.estimated_price) * commissionRate), 0
    );
    const monthlyEarnings = monthlyBookings.reduce((sum, booking) => 
      sum + (Number(booking.estimated_price) * commissionRate), 0
    );

    setStats({
      totalRides: bookingData.length,
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
        <div className="text-lg">Loading Partner Dashboard...</div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Partner Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-white font-semibold text-lg">Partner Dashboard - PickMeHop</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    Partner
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
                Welcome, {getDisplayName()}
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
            <h1 className="text-3xl font-bold text-green-700 mb-2">Partner Overview</h1>
            <p className="text-gray-600">Track your partnership performance and earnings</p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Rides</p>
                    <p className="text-2xl font-bold">{stats.totalRides}</p>
                  </div>
                  <Car className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Monthly Rides</p>
                    <p className="text-2xl font-bold">{stats.monthlyRides}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-200" />
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
                  <DollarSign className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Monthly Earnings</p>
                    <p className="text-2xl font-bold">€{stats.monthlyEarnings.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="rides">Completed Rides</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-green-600" />
                      Partnership Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Company Name</label>
                        <p className="font-semibold">{partner?.company_name || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Partnership Type</label>
                        <p className="font-semibold">{partner?.partnership_type || 'Standard'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Commission Rate</label>
                        <p className="font-semibold">{((partner?.commission_rate || 0) * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Status</label>
                        <Badge variant={partner?.is_active ? "default" : "secondary"}>
                          {partner?.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Summary</CardTitle>
                    <CardDescription>Your partnership performance this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Monthly Progress</span>
                          <span className="text-sm text-green-600">+{stats.monthlyRides} rides</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((stats.monthlyRides / 10) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Earnings Goal</span>
                          <span className="text-sm text-green-600">€{stats.monthlyEarnings.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((stats.monthlyEarnings / 500) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="rides" className="space-y-4">
              <div className="grid gap-4">
                {bookings.slice(0, 10).map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">Booking #{booking.booking_id}</h3>
                          <p className="text-gray-600">{booking.date} at {booking.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Commission</p>
                          <p className="font-bold text-green-600">
                            €{(Number(booking.estimated_price) * (partner?.commission_rate || 0.05)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Route</p>
                          <p className="text-gray-900">{booking.from_location} → {booking.to_location}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Fare</p>
                          <p className="text-gray-900">€{booking.estimated_price}</p>
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
                      <User className="h-5 w-5 text-green-600" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">First Name</label>
                        <p className="font-semibold">{profile?.first_name || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Last Name</label>
                        <p className="font-semibold">{profile?.last_name || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p className="font-semibold">{user?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone</label>
                        <p className="font-semibold">{profile?.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">
                      Edit Profile
                    </Button>
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

export default PartnerDashboard;