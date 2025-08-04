import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  Car, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Textarea } from '@/components/ui/textarea';
import AdminSidebar from '@/components/AdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { toast } from '@/hooks/use-toast';

interface DriverApplication {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  license_number: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_license_plate: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminDriverApprovals = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<DriverApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<DriverApplication | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'info' | null>(null);
  const [notes, setNotes] = useState('');
  const [filterTab, setFilterTab] = useState('pending');
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    loadDriverApplications();
  }, []);

  const loadDriverApplications = async () => {
    try {
      const { data: drivers, error } = await supabase
        .from('drivers')
        .select('*');

      if (error) throw error;

      const formattedApplications = drivers?.map(driver => ({
        id: driver.id,
        user_id: driver.user_id,
        first_name: 'Driver',
        last_name: `${driver.id.slice(-4)}`,
        phone: driver.phone || '',
        license_number: driver.license_number || '',
        vehicle_make: driver.vehicle_make || '',
        vehicle_model: driver.vehicle_model || '',
        vehicle_year: driver.vehicle_year || 0,
        vehicle_license_plate: driver.vehicle_license_plate || '',
        is_active: driver.is_active,
        created_at: driver.created_at,
        updated_at: driver.updated_at,
        status: (driver.is_active ? 'approved' : 'pending') as 'pending' | 'approved' | 'rejected'
      })) || [];

      setApplications(formattedApplications);
    } catch (error) {
      console.error('Error loading driver applications:', error);
      toast({
        title: "Error",
        description: "Failed to load driver applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async () => {
    if (!selectedApp) return;

    try {
      const { error } = await supabase
        .from('drivers')
        .update({ 
          is_active: actionType === 'approve',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedApp.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Driver ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`,
      });

      setSelectedApp(null);
      setActionType(null);
      setNotes('');
      loadDriverApplications();
    } catch (error) {
      console.error('Error updating driver status:', error);
      toast({
        title: "Error",
        description: "Failed to update driver status",
        variant: "destructive"
      });
    }
  };

  const getFilteredApplications = () => {
    let filtered = applications;

    switch (filterTab) {
      case 'pending':
        filtered = applications.filter(app => !app.is_active);
        break;
      case 'approved':
        filtered = applications.filter(app => app.is_active);
        break;
      case 'rejected':
        // For demo purposes, treating inactive as rejected
        filtered = applications.filter(app => !app.is_active);
        break;
      default:
        filtered = applications;
    }

    // Sort applications
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getStatusBadge = (app: DriverApplication) => {
    if (app.is_active) {
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const ApplicationCard = ({ application }: { application: DriverApplication }) => (
    <Card className="hover:border-emerald-500 transition-colors duration-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-emerald-100 text-emerald-800">
              {application.first_name[0]}{application.last_name[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-800">
                  {application.first_name} {application.last_name}
                </h3>
                {getStatusBadge(application)}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(application.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {application.phone || 'No phone provided'}
              </div>
              <div className="flex items-center text-gray-600">
                <FileText className="h-4 w-4 mr-2" />
                License: {application.license_number || 'Not provided'}
              </div>
              <div className="flex items-center text-gray-600">
                <Car className="h-4 w-4 mr-2" />
                {application.vehicle_year} {application.vehicle_make} {application.vehicle_model}
              </div>
              <div className="flex items-center text-gray-600">
                <FileText className="h-4 w-4 mr-2" />
                Plate: {application.vehicle_license_plate || 'Not provided'}
              </div>
            </div>
            
            {filterTab === 'pending' && (
              <div className="flex space-x-2 pt-2">
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setSelectedApp(application);
                    setActionType('approve');
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => {
                    setSelectedApp(application);
                    setActionType('reject');
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setSelectedApp(application);
                    setActionType('info');
                  }}
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Request Info
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const pendingCount = applications.filter(app => !app.is_active).length;
  const approvedCount = applications.filter(app => app.is_active).length;

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AdminSidebar 
            activeTab="driver-approvals" 
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
          activeTab="driver-approvals" 
          onTabChange={(tab) => navigate(`/admin/${tab}`)}
          stats={{ unassignedRides: 0, activeDrivers: 0, pendingDrivers: pendingCount, totalBookings: 0 }}
        />
        
        <main className="flex-1 p-8 bg-gray-50">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <Car className="h-8 w-8 text-emerald-600" />
              <h1 className="text-3xl font-bold text-gray-800">Driver Approvals</h1>
              <Badge variant="secondary" className="text-sm">
                {pendingCount} pending
              </Badge>
            </div>
            <p className="text-gray-600">Review and approve driver applications</p>
          </div>

          {/* Controls */}
          <div className="mb-6 flex items-center justify-between">
            <Tabs value={filterTab} onValueChange={setFilterTab}>
              <TabsList>
                <TabsTrigger value="pending">
                  Pending Review
                  {pendingCount > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {pendingCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {approvedCount}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="all">All Applications</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {getFilteredApplications().length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No applications found</h3>
                  <p className="text-gray-500">No driver applications match the current filter</p>
                </CardContent>
              </Card>
            ) : (
              getFilteredApplications().map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))
            )}
          </div>
        </main>
      </div>

      {/* Action Dialog */}
      <Dialog open={selectedApp !== null} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Driver Application'}
              {actionType === 'reject' && 'Reject Driver Application'}
              {actionType === 'info' && 'Request Additional Information'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedApp && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">{selectedApp.first_name} {selectedApp.last_name}</h4>
                <p className="text-sm text-gray-600">{selectedApp.phone}</p>
                <p className="text-sm text-gray-600">
                  {selectedApp.vehicle_year} {selectedApp.vehicle_make} {selectedApp.vehicle_model}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  {actionType === 'approve' && 'Approval Notes (Optional)'}
                  {actionType === 'reject' && 'Rejection Reason'}
                  {actionType === 'info' && 'Information Request'}
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    actionType === 'approve' ? 'Enter any notes about the approval...' :
                    actionType === 'reject' ? 'Please provide a reason for rejection...' :
                    'Specify what additional information is needed...'
                  }
                  rows={4}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApp(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApproval}
              className={
                actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                'bg-yellow-600 hover:bg-yellow-700'
              }
            >
              {actionType === 'approve' && 'Approve Driver'}
              {actionType === 'reject' && 'Reject Application'}
              {actionType === 'info' && 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default AdminDriverApprovals;