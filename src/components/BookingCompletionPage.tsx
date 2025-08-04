import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Clock, 
  Globe, 
  CheckCircle, 
  Star, 
  ArrowRight, 
  Plane, 
  MapPin, 
  Car, 
  Users, 
  Luggage, 
  CreditCard, 
  Loader2,
  Phone,
  Mail,
  User,
  Baby,
  Accessibility,
  MessageSquare,
  Euro,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeText, validateEmail, validatePhone, generateCSRFToken } from "@/lib/security";

const completionSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().email("Please enter a valid email").refine(validateEmail, "Invalid email format"),
  phone: z.string().min(10, "Please enter a valid phone number").refine(validatePhone, "Invalid phone format"),
  countryCode: z.string(),
  passengers: z.number().min(1, "At least 1 passenger required").max(8, "Maximum 8 passengers"),
  luggage: z.number().min(0, "Luggage cannot be negative").max(10, "Maximum 10 luggage pieces"),
  childSeatNeeded: z.boolean(),
  wheelchairAccess: z.boolean(),
  meetGreet: z.boolean(),
  extraWaiting: z.boolean(),
  driverNotes: z.string().max(200, "Maximum 200 characters").optional(),
  smsUpdates: z.boolean(),
  paymentMethod: z.enum(["card", "paypal"]),
});

type CompletionFormData = z.infer<typeof completionSchema>;

const countryCodes = [
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+44", country: "GB", flag: "🇬🇧" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+34", country: "ES", flag: "🇪🇸" },
  { code: "+39", country: "IT", flag: "🇮🇹" },
];

interface BookingData {
  fromLocation: string;
  toLocation: string;
  date: string;
  time: string;
  estimatedPrice: number;
  duration: string;
  distance: string;
}

const BookingCompletionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingData] = useState<BookingData>(
    location.state?.bookingData || {
      fromLocation: "Charles de Gaulle Airport (CDG)",
      toLocation: "Shangri-La Hotel, Paris",
      date: "Wed, Aug 15",
      time: "14:30",
      estimatedPrice: 69,
      duration: "45 min",
      distance: "32 km"
    }
  );

  const form = useForm<CompletionFormData>({
    resolver: zodResolver(completionSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      countryCode: "+33",
      passengers: 2,
      luggage: 2,
      childSeatNeeded: false,
      wheelchairAccess: false,
      meetGreet: true,
      extraWaiting: false,
      driverNotes: "",
      smsUpdates: true,
      paymentMethod: "card",
    },
  });

  const passengers = form.watch("passengers");
  const luggage = form.watch("luggage");
  const childSeatNeeded = form.watch("childSeatNeeded");
  const wheelchairAccess = form.watch("wheelchairAccess");
  const meetGreet = form.watch("meetGreet");
  const extraWaiting = form.watch("extraWaiting");
  const driverNotes = form.watch("driverNotes");

  const calculateTotal = useCallback(() => {
    let total = bookingData.estimatedPrice;
    if (childSeatNeeded) total += 5;
    if (wheelchairAccess) total += 10;
    if (extraWaiting) total += 15;
    return total;
  }, [bookingData.estimatedPrice, childSeatNeeded, wheelchairAccess, extraWaiting]);

  const onSubmit = async (data: CompletionFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate booking submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Booking Confirmed!",
        description: "You'll receive a confirmation email shortly.",
      });
      
      navigate("/booking-confirmation");
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/fd647c9d-74ed-4206-99d0-9b04a8f86b41.png" 
              alt="PickMeHop Logo" 
              className="w-8 h-8 rounded-full object-cover"
            />
            <h1 className="text-xl font-bold" style={{ color: '#FF6B35' }}>PickMeHop</h1>
          </div>
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
            <span>Route Selection</span>
            <ArrowRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Booking Details</span>
            <ArrowRight className="h-3 w-3" />
            <span>Payment</span>
          </div>
        </div>
      </div>

      {/* Trust Indicators Bar */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-orange-700">
              <Globe className="h-4 w-4" />
              <span>English-speaking drivers</span>
            </div>
            <div className="flex items-center gap-2 text-orange-700">
              <Euro className="h-4 w-4" />
              <span>Fixed price guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-orange-700">
              <Clock className="h-4 w-4" />
              <span>24/7 customer support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Complete Your Booking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Passenger Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <User className="h-5 w-5" style={{ color: '#FF6B35' }} />
                        Passenger Details
                      </h3>
                      
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your.email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-2">
                        <FormField
                          control={form.control}
                          name="countryCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {countryCodes.map((country) => (
                                    <SelectItem key={country.code} value={country.code}>
                                      {country.flag} {country.code}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number *</FormLabel>
                                <FormControl>
                                  <Input placeholder="6 12 34 56 78" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="smsUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Receive booking updates via SMS
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Trip Preferences */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Car className="h-5 w-5" style={{ color: '#FF6B35' }} />
                        Trip Preferences
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="passengers"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Passengers</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Array.from({ length: 8 }, (_, i) => (
                                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                                      <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        {i + 1} passenger{i > 0 ? 's' : ''}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="luggage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Luggage</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Array.from({ length: 11 }, (_, i) => (
                                    <SelectItem key={i} value={i.toString()}>
                                      <div className="flex items-center gap-2">
                                        <Luggage className="h-4 w-4" />
                                        {i} bag{i !== 1 ? 's' : ''}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="childSeatNeeded"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="flex items-center gap-2">
                                  <Baby className="h-4 w-4" />
                                  Child seat needed
                                </FormLabel>
                                <p className="text-xs text-muted-foreground">+€5</p>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="wheelchairAccess"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="flex items-center gap-2">
                                  <Accessibility className="h-4 w-4" />
                                  Wheelchair accessible
                                </FormLabel>
                                <p className="text-xs text-muted-foreground">+€10</p>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="meetGreet"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  Meet & greet service
                                </FormLabel>
                                <p className="text-xs text-muted-foreground">Included</p>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="extraWaiting"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  Extra waiting time
                                </FormLabel>
                                <p className="text-xs text-muted-foreground">+€15</p>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" style={{ color: '#FF6B35' }} />
                        Additional Notes
                      </h3>
                      
                      <FormField
                        control={form.control}
                        name="driverNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special instructions for driver</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Flight delays, meeting point preferences, etc."
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <div className="flex justify-between">
                              <FormMessage />
                              <span className="text-xs text-muted-foreground">
                                {(driverNotes?.length || 0)}/200
                              </span>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Payment Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <CreditCard className="h-5 w-5" style={{ color: '#FF6B35' }} />
                        Payment Method
                      </h3>
                      
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="grid grid-cols-2 gap-4">
                                <div 
                                  className={cn(
                                    "border rounded-md p-4 cursor-pointer transition-colors",
                                    field.value === "card" ? "border-orange-500 bg-orange-50" : "border-input"
                                  )}
                                  onClick={() => field.onChange("card")}
                                >
                                  <div className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    <span className="font-medium">Credit Card</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">Visa, Mastercard, Amex</p>
                                </div>
                                
                                <div 
                                  className={cn(
                                    "border rounded-md p-4 cursor-pointer transition-colors",
                                    field.value === "paypal" ? "border-orange-500 bg-orange-50" : "border-input"
                                  )}
                                  onClick={() => field.onChange("paypal")}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">P</div>
                                    <span className="font-medium">PayPal</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">Secure online payment</p>
                                </div>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span>Secure payment • SSL encrypted</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full text-lg py-6"
                      style={{ backgroundColor: '#FF6B35' }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing Booking...
                        </>
                      ) : (
                        <>
                          Complete Booking €{calculateTotal()}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              {/* Booking Summary Card */}
              <Card className="shadow-lg overflow-hidden">
                {/* Dark header with city image */}
                <div 
                  className="h-32 bg-gradient-to-r from-gray-800 to-gray-700 p-4 flex items-end"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1502602898536-47ad22581b52?auto=format&fit=crop&w=800&q=80")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="bg-black/50 backdrop-blur-sm rounded px-3 py-1">
                    <h2 className="text-white font-semibold">Booking Summary</h2>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  {/* Route Details */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <div className="w-0.5 h-8 bg-gray-300 my-1"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">{bookingData.date} • {bookingData.time}</p>
                          <p className="font-medium flex items-center gap-2">
                            <Plane className="h-4 w-4" />
                            {bookingData.fromLocation}
                          </p>
                        </div>
                        <div className="text-center text-xs text-muted-foreground">
                          {bookingData.duration} journey
                        </div>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {bookingData.toLocation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm">
                        <Car className="h-4 w-4" />
                        Standard Car
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4" />
                        {passengers} passenger{passengers !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-2 text-sm">
                        <Luggage className="h-4 w-4" />
                        {luggage} bag{luggage !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base fare</span>
                      <span>€{bookingData.estimatedPrice}</span>
                    </div>
                    {childSeatNeeded && (
                      <div className="flex justify-between text-sm">
                        <span>Child seat</span>
                        <span>€5</span>
                      </div>
                    )}
                    {wheelchairAccess && (
                      <div className="flex justify-between text-sm">
                        <span>Wheelchair access</span>
                        <span>€10</span>
                      </div>
                    )}
                    {extraWaiting && (
                      <div className="flex justify-between text-sm">
                        <span>Extra waiting time</span>
                        <span>€15</span>
                      </div>
                    )}
                    <hr />
                    <div className="flex justify-between font-bold text-lg" style={{ color: '#FF6B35' }}>
                      <span>Total</span>
                      <span>€{calculateTotal()}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Why Choose Pick Me Hop</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Free cancellation up to 1 hour</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>English-speaking drivers</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Flight monitoring included</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Meet & greet service</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Fixed price, no surprises</span>
                      </div>
                    </div>
                  </div>

                  {/* Trust Elements */}
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <p className="text-sm font-medium">4.8/5 stars from 1,200+ rides</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      "Excellent service, professional driver" - Sarah M.
                    </p>
                  </div>

                  {/* Security Badges */}
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <Badge variant="outline" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      SSL Secure
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      PCI Compliant
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCompletionPage;