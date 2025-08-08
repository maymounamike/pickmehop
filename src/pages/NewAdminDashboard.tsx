import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Car, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  UserPlus,
  LogOut,
  Bell,
  Settings,
  BarChart3,
  MapPin,
  Menu
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import UserCreationDialog from "@/components/UserCreationDialog";

interface AdminStats {
  totalUsers: number;
  totalDrivers: number;
  totalBookings: number;
  totalRevenue: number;
  pendingDrivers: number;
  activeRides: number;
  monthlyBookings: number;
  monthlyRevenue: number;
  unassignedRides: number;
  activeDrivers: number;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'driver' | 'user';
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDrivers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingDrivers: 0,
    activeRides: 0,
    monthlyBookings: 0,
    monthlyRevenue: 0,
    unassignedRides: 0,
    activeDrivers: 0
  });
  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'booking',
      message: 'New booking from Paris to CDG Airport',
      timestamp: '2 minutes ago',
      status: 'success'
    },
    {
      id: '2',
      type: 'driver',
      message: 'Driver application pending review',
      timestamp: '15 minutes ago',
      status: 'warning'
    },
    {
      id: '3',
      type: 'booking',
      message: 'Ride completed successfully',
      timestamp: '1 hour ago',
      status: 'success'
    }
  ]);
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

      // Verify user has admin role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .order('role', { ascending: true });

      const roles = roleData?.map(r => r.role) || [];
      if (!roles.includes('admin')) {
        toast({
          title: "Access Denied",
          description: "You don't have admin access.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setUser(session.user);

      // Load dashboard data
      await loadDashboardStats();
      
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      // Get basic counts
      const [
        { data: bookingsData, count: bookingsCount },
        { data: driversData, count: driversCount },
        { data: usersData, count: usersCount }
      ] = await Promise.all([
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('drivers').select('*', { count: 'exact', head: true }),
        supabase.from('user_roles').select('*', { count: 'exact', head: true })
      ]);

      // Calculate revenue
      const { data: revenueData } = await supabase
        .from('bookings')
        .select('estimated_price')
        .eq('payment_status', 'paid');

      const totalRevenue = revenueData?.reduce((sum, booking) => sum + Number(booking.estimated_price), 0) || 0;

      // Get pending drivers
      const { count: pendingDriversCount } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', false);

      // Get unassigned rides
      const { count: unassignedCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .is('driver_id', null)
        .eq('status', 'confirmed');

      setStats({
        totalBookings: bookingsCount || 0,
        totalDrivers: driversCount || 0,
        totalUsers: usersCount || 0,
        totalRevenue,
        pendingDrivers: pendingDriversCount || 0,
        activeRides: 0, // Will implement real-time tracking
        monthlyBookings: bookingsCount || 0, // Simplified for now
        monthlyRevenue: totalRevenue, // Simplified for now
        unassignedRides: unassignedCount || 0,
        activeDrivers: (driversCount || 0) - (pendingDriversCount || 0)
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading Admin Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-[#0D2C54] to-[#1a4480] text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#FFB400] rounded-full flex items-center justify-center">
                  <span className="text-[#0D2C54] font-bold text-lg">A</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-white font-semibold text-lg">Admin Control Panel - PickMeHop</span>
                  <Badge variant="secondary" className="bg-[#FFB400] text-[#0D2C54] border-[#FFB400]">
                    Administrator
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <UserCreationDialog onUserCreated={loadDashboardStats} />
              <Button variant="ghost" className="text-white hover:bg-white/10 relative">
                <Bell className="h-5 w-5" />
                {stats.pendingDrivers > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                    {stats.pendingDrivers}
                  </span>
                )}
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <span className="text-sm hidden md:block">Welcome, Admin</span>
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
          <h1 className="text-3xl font-bold text-[#0D2C54] mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Monitor your transportation business performance and manage operations</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Bookings</p>
                      <p className="text-2xl font-bold">{stats.totalBookings}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Active Drivers</p>
                      <p className="text-2xl font-bold">{stats.activeDrivers}</p>
                    </div>
                    <Car className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm">Pending Actions</p>
                      <p className="text-2xl font-bold">{stats.pendingDrivers + stats.unassignedRides}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-200" />
                  </div>
                </CardContent>
              </Card>
          </div>

          {/* Dashboard Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Actions Card */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-[#0D2C54]" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    className="h-20 p-3 flex flex-col items-center justify-center space-y-2 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 hover:text-emerald-800"
                    variant="outline"
                    onClick={() => navigate('/admin/users')}
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-xs font-medium text-center">Manage Users</span>
                  </Button>
                  
                  <Button 
                    className="h-20 p-3 flex flex-col items-center justify-center space-y-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800"
                    variant="outline"
                    onClick={() => navigate('/admin/driver-approvals')}
                  >
                    <div className="relative">
                      <Car className="h-6 w-6" />
                      {stats.pendingDrivers > 0 && (
                        <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {stats.pendingDrivers}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-center">Driver Approvals</span>
                  </Button>
                  
                  <Button 
                    className="h-20 p-3 flex flex-col items-center justify-center space-y-2 bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700 hover:text-orange-800"
                    variant="outline"
                    onClick={() => navigate('/admin/assign-rides')}
                  >
                    <div className="relative">
                      <MapPin className="h-6 w-6" />
                      {stats.unassignedRides > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {stats.unassignedRides}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-center">Assign Rides</span>
                  </Button>
                  
                  <Button 
                    className="h-20 p-3 flex flex-col items-center justify-center space-y-2 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 hover:text-purple-800"
                    variant="outline"
                    onClick={() => navigate('/admin/all-requests')}
                  >
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-xs font-medium text-center">All Requests</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

              {/* Performance Overview Card */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-[#0D2C54]" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Monthly Growth</span>
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +12%
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Driver Satisfaction</span>
                      <span className="font-bold text-[#0D2C54]">94%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Avg Response Time</span>
                      <span className="font-bold text-[#0D2C54]">3.2 min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity Card */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#0D2C54]" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.status === 'success' ? 'bg-green-500' :
                          activity.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Alerts Section */}
            {stats.pendingDrivers > 0 && (
              <Card className="border-l-4 border-l-[#FFB400] bg-[#FFB400]/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-[#FFB400]" />
                    <div>
                      <p className="font-medium text-[#0D2C54]">
                        {stats.pendingDrivers} driver application{stats.pendingDrivers > 1 ? 's' : ''} awaiting review
                      </p>
                      <p className="text-sm text-gray-600">Review and approve new driver applications to expand your fleet.</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="ml-auto bg-[#0D2C54] hover:bg-[#0D2C54]/90"
                      onClick={() => navigate('/admin')}
                    >
                      Review Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    );
  };

  export default AdminDashboard;