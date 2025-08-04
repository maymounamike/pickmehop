import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  ClipboardList, 
  Download, 
  Eye, 
  Edit, 
  X,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
} from '@/components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface BookingRequest {
  id: string;
  booking_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  from_location: string;
  to_location: string;
  date: string;
  time: string;
  passengers: number;
  estimated_price: number;
  status: string;
  driver_id: string | null;
  driver_name?: string;
  created_at: string;
  payment_status: string;
}

const AdminAllRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter, dateRange]);

  const loadRequests = async () => {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRequests = bookings?.map(booking => ({
        id: booking.id,
        booking_id: booking.booking_id,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone || '',
        customer_email: booking.customer_email,
        from_location: booking.from_location,
        to_location: booking.to_location,
        date: booking.date,
        time: booking.time,
        passengers: booking.passengers,
        estimated_price: Number(booking.estimated_price),
        status: booking.status,
        driver_id: booking.driver_id,
        driver_name: booking.driver_id ? `Driver ${booking.driver_id.slice(-4)}` : null,
        created_at: booking.created_at,
        payment_status: booking.payment_status
      })) || [];

      setRequests(formattedRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests.filter(request => {
      const matchesSearch = 
        request.booking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.from_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.to_location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

      let matchesDate = true;
      if (dateRange !== 'all') {
        const requestDate = new Date(request.created_at);
        const now = new Date();
        
        switch (dateRange) {
          case 'today':
            matchesDate = requestDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = requestDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = requestDate >= monthAgo;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });

    setFilteredRequests(filtered);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      assigned: { color: 'bg-yellow-100 text-yellow-800', label: 'Assigned' },
      'in-progress': { color: 'bg-orange-100 text-orange-800', label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.confirmed;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const exportToCSV = () => {
    const headers = [
      'Request ID', 'Date', 'Time', 'Customer', 'From', 'To', 
      'Driver', 'Status', 'Price', 'Payment Status'
    ];
    
    const csvData = filteredRequests.map(request => [
      request.booking_id,
      request.date,
      request.time,
      request.customer_name,
      request.from_location,
      request.to_location,
      request.driver_name || 'Unassigned',
      request.status,
      `€${request.estimated_price}`,
      request.payment_status
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ride-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-50">
        <main className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <main className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <ClipboardList className="h-8 w-8 text-emerald-600" />
              <h1 className="text-3xl font-bold text-gray-800">All Requests</h1>
              <Badge variant="secondary" className="text-sm">
                {filteredRequests.length} total
              </Badge>
            </div>
            <p className="text-gray-600">View and manage all ride requests</p>
          </div>

          {/* Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by ID, customer, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={exportToCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Requests Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No requests found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRequests.map((request) => (
                      <TableRow key={request.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          #{request.booking_id}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{request.date}</div>
                            <div className="text-gray-500">{request.time}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{request.customer_name}</div>
                            <div className="text-gray-500">{request.customer_phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-xs">
                            <div className="truncate">{request.from_location}</div>
                            <div className="text-gray-500 truncate">→ {request.to_location}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.driver_name ? (
                            <span className="text-sm">{request.driver_name}</span>
                          ) : (
                            <span className="text-sm text-gray-500">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(request.status)}
                        </TableCell>
                        <TableCell className="font-medium">
                          €{request.estimated_price}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {request.status !== 'completed' && (
                              <Button size="sm" variant="outline">
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNumber)}
                          isActive={currentPage === pageNumber}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
      </main>

      {/* Request Details Dialog */}
      <Dialog open={selectedRequest !== null} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Request Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600">ID:</span> #{selectedRequest.booking_id}</div>
                      <div><span className="text-gray-600">Date:</span> {selectedRequest.date}</div>
                      <div><span className="text-gray-600">Time:</span> {selectedRequest.time}</div>
                      <div><span className="text-gray-600">Passengers:</span> {selectedRequest.passengers}</div>
                      <div><span className="text-gray-600">Price:</span> €{selectedRequest.estimated_price}</div>
                      <div><span className="text-gray-600">Status:</span> {getStatusBadge(selectedRequest.status)}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Customer Details</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600">Name:</span> {selectedRequest.customer_name}</div>
                      <div><span className="text-gray-600">Phone:</span> {selectedRequest.customer_phone}</div>
                      <div><span className="text-gray-600">Email:</span> {selectedRequest.customer_email}</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Route Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">From:</span>
                        <div className="mt-1 p-2 bg-gray-50 rounded text-gray-800">
                          {selectedRequest.from_location}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">To:</span>
                        <div className="mt-1 p-2 bg-gray-50 rounded text-gray-800">
                          {selectedRequest.to_location}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedRequest.driver_name && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Assigned Driver</h4>
                      <div className="text-sm">
                        <div>{selectedRequest.driver_name}</div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Payment Status</h4>
                    <Badge className={selectedRequest.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {selectedRequest.payment_status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAllRequests;