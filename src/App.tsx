import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SecurityProvider } from "@/components/SecurityProvider";
import { AccessibilityAnnouncer } from "@/components/AccessibilityAnnouncer";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import Auth from "./pages/Auth";
import Dashboard from "./pages/StandardCustomerDashboard";
import DriverDashboard from "./pages/StandardDriverDashboard";
import DriverProfile from "./pages/DriverProfile";
import DriverScheduled from "./pages/DriverScheduled";
import DriversManagement from "./pages/DriversManagement";
import DriverOngoing from "./pages/DriverOngoing";
import AdminDashboard from "./pages/NewAdminDashboard";
import BookingConfirmation from "./pages/BookingConfirmation";
import DriverAuth from "./pages/DriverAuth";
import PartnerAuth from "./pages/PartnerAuth";
import PartnerDashboard from "./pages/StandardPartnerDashboard";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import { RoleBasedRoute } from "./components/RoleBasedRoute";
import { DashboardRouter } from "./components/DashboardRouter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SecurityProvider>
      <AccessibilityAnnouncer />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/driver-signup" element={<DriverAuth />} />
            <Route path="/partner-signup" element={<PartnerAuth />} />
            <Route path="/drivers" element={<DriversManagement />} />
            
            {/* Role-based routing */}
            <Route path="/dashboard" element={<DashboardRouter />} />
            
            {/* Customer routes */}
            <Route path="/customer" element={
              <RoleBasedRoute allowedRoles={['user']}>
                <Dashboard />
              </RoleBasedRoute>
            } />
            
            {/* Driver routes */}
            <Route path="/driver" element={
              <RoleBasedRoute allowedRoles={['driver']}>
                <DriverDashboard />
              </RoleBasedRoute>
            } />
            <Route path="/driver/profile" element={
              <RoleBasedRoute allowedRoles={['driver']}>
                <DriverProfile />
              </RoleBasedRoute>
            } />
            <Route path="/driver/scheduled" element={
              <RoleBasedRoute allowedRoles={['driver']}>
                <DriverScheduled />
              </RoleBasedRoute>
            } />
            <Route path="/driver/ongoing" element={
              <RoleBasedRoute allowedRoles={['driver']}>
                <DriverOngoing />
              </RoleBasedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleBasedRoute>
            } />
            
            {/* Partner routes */}
            <Route path="/partner" element={
              <RoleBasedRoute allowedRoles={['partner']}>
                <PartnerDashboard />
              </RoleBasedRoute>
            } />
            
            
            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-canceled" element={<PaymentCanceled />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SecurityProvider>
  </QueryClientProvider>
);

export default App;
