import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Loader } from "@googlemaps/js-api-loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InlineCalendar } from "@/components/ui/inline-calendar";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MapPin, Minus, Plus, Users, Luggage, Loader2, Euro, Phone, Mail, CreditCard, DollarSign, Wallet, Baby, Accessibility, FileText, User, UserCheck, Car, Globe, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeText, validateEmail, validatePhone, ClientRateLimit, detectBotBehavior, generateCSRFToken } from "@/lib/security";

const bookingSchema = z.object({
  fromLocation: z.string().min(3, "From location must be at least 3 characters").max(200, "Location too long"),
  toLocation: z.string().min(3, "To location must be at least 3 characters").max(200, "Location too long"),
  date: z.date(),
  time: z.string().min(1, "Please select a pickup time"),
  passengers: z.number().min(1, "At least 1 passenger required").max(8, "Maximum 8 passengers"),
  luggage: z.number().min(0, "Cannot have negative luggage").max(10, "Maximum 10 pieces of luggage"),
  vehicleType: z.enum(["sedan", "minivan"]),
  customerName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  customerEmail: z.string().email("Please enter a valid email address"),
  customerPhone: z.string().min(10, "Phone number must be at least 10 digits").max(20, "Phone number too long"),
  specialRequests: z.string().max(500, "Special requests too long").optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
  marketingConsent: z.boolean().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function CustomBookingForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      passengers: 1,
      luggage: 1,
      vehicleType: "sedan",
      marketingConsent: false,
    },
  });

  // Time slots
  const times = useMemo(() => {
    const timeSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        timeSlots.push(timeString);
      }
    }
    return timeSlots;
  }, []);

  // Calculate price based on vehicle type and destination
  const calculatePrice = useCallback(() => {
    const vehicleType = form.watch("vehicleType");
    const toLocation = form.watch("toLocation");
    
    if (!toLocation) {
      setEstimatedPrice(null);
      return;
    }

    setPriceLoading(true);
    
    // Simple pricing logic based on destination
    let basePrice = 0;
    const destination = toLocation.toLowerCase();
    
    if (destination.includes("beauvais") || destination.includes("tillé")) {
      basePrice = vehicleType === "sedan" ? 200 : 275;
    } else if (destination.includes("charles de gaulle") || destination.includes("cdg")) {
      basePrice = vehicleType === "sedan" ? 120 : 165;
    } else if (destination.includes("orly")) {
      basePrice = vehicleType === "sedan" ? 110 : 155;
    } else {
      basePrice = vehicleType === "sedan" ? 100 : 140;
    }
    
    setTimeout(() => {
      setEstimatedPrice(basePrice);
      setPriceLoading(false);
    }, 300);
  }, [form]);

  // Watch for changes to recalculate price
  useEffect(() => {
    const subscription = form.watch(() => calculatePrice());
    return () => subscription.unsubscribe();
  }, [form, calculatePrice]);

  const onSubmit = async (data: BookingFormData) => {
    try {
      setIsSubmitting(true);
      
      // Security validations
      const csrfToken = generateCSRFToken();
      
      if (detectBotBehavior(data.customerName)) {
        toast({
          title: "Security Error",
          description: "Suspicious activity detected. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const sanitizedData = {
        ...data,
        customerName: sanitizeText(data.customerName),
        customerEmail: sanitizeText(data.customerEmail),
        customerPhone: sanitizeText(data.customerPhone),
        specialRequests: data.specialRequests ? sanitizeText(data.specialRequests) : null,
        estimatedPrice,
        csrfToken,
      };

      const { data: booking, error } = await supabase
        .from("bookings")
        .insert([{
          customer_name: sanitizedData.customerName,
          customer_email: sanitizedData.customerEmail,
          customer_phone: sanitizedData.customerPhone,
          from_location: sanitizedData.fromLocation,
          to_location: sanitizedData.toLocation,
          date: sanitizedData.date.toISOString().split('T')[0],
          time: sanitizedData.time,
          passengers: sanitizedData.passengers,
          luggage: sanitizedData.luggage,
          vehicle_type: sanitizedData.vehicleType,
          special_requests: sanitizedData.specialRequests,
          estimated_price: sanitizedData.estimatedPrice || 0,
          marketing_consent: sanitizedData.marketingConsent || false,
          booking_id: crypto.randomUUID(),
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Booking Submitted Successfully!",
        description: "You will receive a confirmation email shortly.",
      });

      navigate("/booking-confirmation", { 
        state: { 
          bookingData: sanitizedData,
          bookingId: booking.id 
        } 
      });
    } catch (error: any) {
      console.error("Booking submission error:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "There was an error submitting your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
        <h2 className="text-2xl font-bold text-white text-center">
          Allez Hop ! Let's Book a Ride
        </h2>
      </div>
      
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Location Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fromLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      From (airport, port, address)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="From (airport, port, address)"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      To (airport, port, address)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="To (airport, port, address)"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date and Time Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      Pickup date
                    </FormLabel>
                    <FormControl>
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCalendar(!showCalendar)}
                          className="w-full justify-start text-left font-normal"
                          style={{
                            backgroundColor: '#EA580C',
                            color: 'white',
                            borderColor: '#EA580C'
                          }}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                        {showCalendar && (
                          <div className="mt-2">
                            <InlineCalendar
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setShowCalendar(false);
                              }}
                              disabled={(date) => date < new Date()}
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4 text-orange-500" />
                      Pickup time
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full h-11 px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        style={{
                          backgroundColor: '#EA580C',
                          color: 'white',
                          borderColor: '#EA580C'
                        }}
                      >
                        <option value="">Select pickup time</option>
                        {times.map((time) => (
                          <option key={time} value={time} style={{ backgroundColor: 'white', color: 'black' }}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Passengers and Luggage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="passengers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4 text-orange-500" />
                      Passengers
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-between border rounded-lg p-3">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => field.onChange(Math.max(1, field.value - 1))}
                          className="h-8 w-8 p-0"
                          style={{
                            backgroundColor: '#EA580C',
                            color: 'white'
                          }}
                          disabled={field.value <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-orange-500" />
                          <span className="text-lg font-medium">{field.value}</span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => field.onChange(Math.min(8, field.value + 1))}
                          className="h-8 w-8 p-0"
                          style={{
                            backgroundColor: '#EA580C',
                            color: 'white'
                          }}
                          disabled={field.value >= 8}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="luggage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium">
                      <Luggage className="h-4 w-4 text-orange-500" />
                      Luggage pieces
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-between border rounded-lg p-3">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => field.onChange(Math.max(0, field.value - 1))}
                          className="h-8 w-8 p-0"
                          style={{
                            backgroundColor: '#EA580C',
                            color: 'white'
                          }}
                          disabled={field.value <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Luggage className="h-4 w-4 text-orange-500" />
                          <span className="text-lg font-medium">{field.value}</span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => field.onChange(Math.min(10, field.value + 1))}
                          className="h-8 w-8 p-0"
                          style={{
                            backgroundColor: '#EA580C',
                            color: 'white'
                          }}
                          disabled={field.value >= 10}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Vehicle Selection */}
            <FormField
              control={form.control}
              name="vehicleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold mb-4 block">Choose Your Vehicle</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sedan" id="sedan" className="text-orange-500" />
                        <label htmlFor="sedan" className="flex-1 cursor-pointer">
                          <Card className="border-2 hover:border-orange-300 transition-colors">
                            <CardContent className="p-4 text-center">
                              <Car className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                              <h3 className="font-semibold mb-1">Sedan</h3>
                              <p className="text-sm text-gray-600 mb-2">Up to 4 passengers</p>
                              <div className="text-xl font-bold text-orange-600">€200</div>
                              <p className="text-xs text-gray-500">to Beauvais Airport</p>
                            </CardContent>
                          </Card>
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="minivan" id="minivan" className="text-orange-500" />
                        <label htmlFor="minivan" className="flex-1 cursor-pointer">
                          <Card className="border-2 hover:border-orange-300 transition-colors">
                            <CardContent className="p-4 text-center">
                              <Users className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                              <h3 className="font-semibold mb-1">Minivan</h3>
                              <p className="text-sm text-gray-600 mb-2">Up to 8 passengers</p>
                              <div className="text-xl font-bold text-orange-600">€275</div>
                              <p className="text-xs text-gray-500">to Beauvais Airport</p>
                            </CardContent>
                          </Card>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price Display */}
            {estimatedPrice && (
              <div className="flex items-center gap-3 bg-orange-50 p-4 rounded-lg border border-orange-200 text-center justify-center">
                <Euro className="h-5 w-5 text-orange-600" />
                <span className="text-xl font-bold text-orange-600">
                  Estimated Price: €{estimatedPrice}
                </span>
              </div>
            )}

            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John Doe" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="john@example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" placeholder="+33 1 23 45 67 89" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Special Requests */}
            <FormField
              control={form.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requests (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Any special requirements or requests..."
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Terms and Marketing */}
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="agreeToTerms"
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
                        I agree to the terms and conditions and privacy policy
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketingConsent"
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
                        I'd like to receive marketing updates and special offers
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-lg font-semibold"
              style={{
                backgroundColor: '#EA580C',
                color: 'white'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Continue booking'
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}