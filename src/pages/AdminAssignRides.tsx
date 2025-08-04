import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Clock, 
  Users, 
  DollarSign,
  Car,
  Navigation,
  Filter,
  Map,
  List,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import AdminSidebar from '@/components/AdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { toast } from '@/hooks/use-toast';

interface RideRequest {
  id: string;
  booking_id: string;
  customer_name: string;
  customer_phone: string;
  from_location: string;
  to_location: string;
  date: string;
  time: string;
  passengers: number;
  estimated_price: number;
  status: string;
  driver_id: string | null;
  created_at: string;
  urgency: 'low' | 'medium' | 'high';
}

interface AvailableDriver {
  id: string;
  user_id: string;
  name: string;
  vehicle_info: string;
  distance: number;
  eta: number;
  rating: number;
  completed_rides: number;
  is_available: boolean;
}

const AdminAssignRides = () => {
  const navigate = useNavigate();
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<AvailableDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState<RideRequest | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [filterOption, setFilterOption] = useState('all');
  const [sortOption, setSortOption] = useState('pickup-time');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    loadRideRequests();
    loadAvailableDrivers();
  }, []);

  const loadRideRequests = async () => {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .is('driver_id', null)
        .eq('status', 'confirmed');

      if (error) throw error;

      const formattedRequests = bookings?.map(booking => ({
        id: booking.id,
        booking_id: booking.booking_id,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone || '',
        from_location: booking.from_location,
        to_location: booking.to_location,
        date: booking.date,
        time: booking.time,
        passengers: booking.passengers,
        estimated_price: Number(booking.estimated_price),
        status: booking.status,
        driver_id: booking.driver_id,
        created_at: booking.created_at,
        urgency: getUrgency(booking.date, booking.time)
      })) || [];

      setRideRequests(formattedRequests);
    } catch (error) {
      console.error('Error loading ride requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableDrivers = async () => {
    try {
      const { data: drivers, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      const formattedDrivers = drivers?.map((driver, index) => ({
        id: driver.id,
        user_id: driver.user_id,
        name: `Driver ${driver.id.slice(-4)}`,
        vehicle_info: `${driver.vehicle_make || ''} ${driver.vehicle_model || ''} (${driver.vehicle_license_plate || ''})`.trim(),
        distance: Math.random() * 10 + 1, // Mock distance
        eta: Math.floor(Math.random() * 20) + 5, // Mock ETA
        rating: Math.random() * 2 + 3, // Mock rating 3-5
        completed_rides: Math.floor(Math.random() * 500) + 50, // Mock completed rides
        is_available: Math.random() > 0.3 // Mock availability
      })) || [];

      setAvailableDrivers(formattedDrivers);
    } catch (error) {
      console.error('Error loading available drivers:', error);
    }
  };

  const getUrgency = (date: string, time: string): 'low' | 'medium' | 'high' => {
    const now = new Date();
    const rideDateTime = new Date(`${date} ${time}`);
    const hoursUntilRide = (rideDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilRide < 2) return 'high';
    if (hoursUntilRide < 24) return 'medium';
    return 'low';
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Soon</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Scheduled</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedRide || !selectedDriver) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          driver_id: selectedDriver,
          assigned_at: new Date().toISOString(),
          assigned_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', selectedRide.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Driver assigned successfully",
      });

      setSelectedRide(null);
      setSelectedDriver('');
      loadRideRequests();
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast({
        title: "Error",
        description: "Failed to assign driver",
        variant: "destructive"
      });
    }
  };

  const getFilteredRequests = () => {
    let filtered = rideRequests;

    switch (filterOption) {
      case 'urgent':
        filtered = rideRequests.filter(req => req.urgency === 'high');
        break;
      case 'scheduled':
        filtered = rideRequests.filter(req => req.urgency === 'low');
        break;
      case 'asap':
        filtered = rideRequests.filter(req => req.urgency === 'medium' || req.urgency === 'high');
        break;
      default:
        filtered = rideRequests;
    }

    // Sort requests
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'pickup-time':
          return new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime();
        case 'request-time':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'price':
          return b.estimated_price - a.estimated_price;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const RideRequestCard = ({ request }: { request: RideRequest }) => (
    <Card className="hover:border-emerald-500 transition-colors duration-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-gray-800">#{request.booking_id}</h3>
              <p className="text-sm text-gray-600">{request.customer_name}</p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              {getUrgencyBadge(request.urgency)}
              <span className="text-sm text-gray-500">
                {new Date(request.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
              <span className="text-gray-700">{request.from_location}</span>
            </div>
            <div className="flex items-center text-sm">
              <Navigation className="h-4 w-4 mr-2 text-red-600" />
              <span className="text-gray-700">{request.to_location}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-600" />
                <span>{request.date} at {request.time}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{request.passengers}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm font-medium">
                <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                <span>€{request.estimated_price}</span>
              </div>
              <Button 
                size="sm"
                onClick={() => setSelectedRide(request)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Assign Driver
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const unassignedCount = rideRequests.length;
  const urgentCount = rideRequests.filter(req => req.urgency === 'high').length;

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AdminSidebar 
            activeTab="assign-rides" 
            onTabChange={(tab) => navigate(`/admin/${tab}`)}
            stats={{ unassignedRides: 0, activeDrivers: 0, pendingDrivers: 0, totalBookings: 0 }}
          />
          <main className="flex-1 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar 
          activeTab="assign-rides" 
          onTabChange={(tab) => navigate(`/admin/${tab}`)}
          stats={{ unassignedRides: unassignedCount, activeDrivers: availableDrivers.length, pendingDrivers: 0, totalBookings: 0 }}
        />
        
        <main className="flex-1 p-8 bg-gray-50">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <Car className="h-8 w-8 text-emerald-600" />
              <h1 className="text-3xl font-bold text-gray-800">Assign Rides</h1>
              <Badge variant="secondary" className="text-sm">
                {unassignedCount} unassigned
              </Badge>
              {urgentCount > 0 && (
                <Badge className="bg-red-100 text-red-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {urgentCount} urgent
                </Badge>
              )}
            </div>
            <p className="text-gray-600">Assign available drivers to ride requests</p>
          </div>

          {/* Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex space-x-4">
                <Select value={filterOption} onValueChange={setFilterOption}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Unassigned</SelectItem>
                    <SelectItem value="urgent">Urgent Only</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="asap">ASAP Requests</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup-time">Pickup Time</SelectItem>
                    <SelectItem value="request-time">Request Time</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Ride Requests */}
          {getFilteredRequests().length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No unassigned rides</h3>
                <p className="text-gray-500">All rides have been assigned to drivers</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredRequests().map((request) => (
                <RideRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Assignment Dialog */}
      <Dialog open={selectedRide !== null} onOpenChange={() => setSelectedRide(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Driver to Ride</DialogTitle>
          </DialogHeader>
          
          {selectedRide && (
            <div className="space-y-6">
              {/* Ride Details */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Ride Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Customer:</span> {selectedRide.customer_name}
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span> {selectedRide.customer_phone}
                  </div>
                  <div>
                    <span className="text-gray-600">Date & Time:</span> {selectedRide.date} at {selectedRide.time}
                  </div>
                  <div>
                    <span className="text-gray-600">Passengers:</span> {selectedRide.passengers}
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">From:</span> {selectedRide.from_location}
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">To:</span> {selectedRide.to_location}
                  </div>
                </div>
              </div>
              
              {/* Available Drivers */}
              <div>
                <h4 className="font-medium mb-3">Available Drivers</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableDrivers.filter(d => d.is_available).map((driver) => (
                    <div 
                      key={driver.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedDriver === driver.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedDriver(driver.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-emerald-100 text-emerald-800">
                              {driver.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h5 className="font-medium">{driver.name}</h5>
                            <p className="text-sm text-gray-600">{driver.vehicle_info}</p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-gray-600">{driver.distance.toFixed(1)} km away</div>
                          <div className="text-gray-600">ETA: {driver.eta} min</div>
                          <div className="text-yellow-600">★ {driver.rating.toFixed(1)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRide(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignDriver}
              disabled={!selectedDriver}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Assign Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default AdminAssignRides;