import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, MapPin, Minus, Plus, Users, Luggage, Loader2, Euro, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeText, validateEmail, validatePhone, ClientRateLimit, detectBotBehavior, generateCSRFToken } from "@/lib/security";

const bookingSchema = z.object({
  fromLocation: z.string().min(3, "From location must be at least 3 characters").max(200, "Location too long"),
  toLocation: z.string().min(3, "To location must be at least 3 characters").max(200, "Location too long"),
  date: z.date().optional(),
  time: z.string().min(1, "Please select a pickup time"),
  passengers: z.number().min(1, "At least 1 passenger required").max(8, "Maximum 8 passengers"),
  luggage: z.number().min(0, "Luggage cannot be negative").max(10, "Maximum 10 luggage pieces"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().email("Please enter a valid email").refine(validateEmail, "Invalid email format"),
  phone: z.string().min(10, "Please enter a valid phone number").refine(validatePhone, "Invalid phone format"),
  specialRequests: z.string().max(500, "Special requests too long").optional(),
  honeypot: z.string().optional(), // Hidden field for bot detection
});

type BookingFormData = z.infer<typeof bookingSchema>;

const BookingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [formStartTime] = useState(Date.now());
  const [csrfToken] = useState(generateCSRFToken());
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const rateLimit = new ClientRateLimit();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fromLocation: "",
      toLocation: "",
      passengers: 1,
      luggage: 1,
      name: "",
      email: "",
      phone: "",
      specialRequests: "",
      honeypot: "", // Hidden honeypot field
    },
  });

  // Debug logging to understand the form state
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === 'email' || name === 'phone') {
        console.log(`Field ${name} changed to:`, value[name], 'via', type);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const times = Array.from({ length: 24 * 4 }, (_, i) => {
    const hours = Math.floor(i / 4);
    const minutes = (i % 4) * 15;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  });

  // Calculate estimated price with special airport rules
  const calculatePrice = (from: string, to: string, passengers: number) => {
    if (!from || !to) return null;
    
    const fromLower = from.toLowerCase();
    const toLower = to.toLowerCase();
    
    // Check for Charles de Gaulle Airport + Paris (75xxx) combination
    const isCDGRoute = (fromLower.includes('charles de gaulle') || fromLower.includes('cdg')) ||
                       (toLower.includes('charles de gaulle') || toLower.includes('cdg'));
    const isParisAddress = from.includes('75') || to.includes('75');
    
    if (isCDGRoute && isParisAddress) {
      return 75; // Fixed price for CDG + Paris
    }
    
    // Check for Orly Airport + Paris (75xxx) combination
    const isOrlyRoute = (fromLower.includes('orly') || fromLower.includes('ory')) ||
                        (toLower.includes('orly') || toLower.includes('ory'));
    
    if (isOrlyRoute && isParisAddress) {
      return 65; // Fixed price for Orly + Paris
    }
    
    // Standard price calculation for other routes
    const basePrice = 25;
    const perKmRate = 1.5;
    const passengerSurcharge = passengers > 4 ? (passengers - 4) * 5 : 0;
    const estimatedKm = fromLower.includes('airport') || toLower.includes('airport') ? 35 : 20;
    
    return Math.round(basePrice + (estimatedKm * perKmRate) + passengerSurcharge);
  };

  // Watch form values to calculate price
  const watchedValues = form.watch(['fromLocation', 'toLocation', 'passengers']);
  
  // Update price when form values change
  useEffect(() => {
    const [from, to, passengers] = watchedValues;
    const price = calculatePrice(from, to, passengers);
    setEstimatedPrice(price);
  }, [watchedValues]);

  // Preset airport suggestions for common keywords
  const getAirportPresets = (query: string): string[] => {
    const queryLower = query.toLowerCase();
    const presets: string[] = [];

    // Charles de Gaulle Airport keywords
    if (['cdg', 'charles', 'gaulle', 'roissy', 'airport'].some(keyword => 
        queryLower.includes(keyword) || keyword.includes(queryLower))) {
      presets.push('Charles de Gaulle International Airport, Tremblay-en-France 93290');
    }

    // Orly Airport keywords
    if (['orly', 'ory', 'airport'].some(keyword => 
        queryLower.includes(keyword) || keyword.includes(queryLower))) {
      presets.push('Orly Airport, Orly 94390');
    }

    // Beauvais Airport keywords
    if (['beauvais', 'bva', 'tillé', 'airport'].some(keyword => 
        queryLower.includes(keyword) || keyword.includes(queryLower))) {
      presets.push('Beauvais-Tillé Airport, Tillé 60000');
    }

    return presets;
  };

  // Address suggestion function using Nominatim (OpenStreetMap)
  const fetchAddressSuggestions = async (query: string) => {
    // First check for airport presets (minimum 2 characters)
    if (query.length >= 2) {
      const airportPresets = getAirportPresets(query);
      if (airportPresets.length > 0) {
        return airportPresets;
      }
    }

    if (query.length < 3) return [];
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}, France&limit=5&addressdetails=1`
      );
      const data = await response.json();
      
      return data.map((item: any) => {
        const parts = [];
        if (item.address?.house_number) parts.push(item.address.house_number);
        if (item.address?.road) parts.push(item.address.road);
        if (item.address?.postcode) parts.push(item.address.postcode);
        if (item.address?.city || item.address?.town || item.address?.village) {
          parts.push(item.address.city || item.address.town || item.address.village);
        }
        return parts.join(' ') || item.display_name;
      }).filter((address: string) => address && address.length > 0);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      return [];
    }
  };

  // Handle address input changes with suggestions
  const handleFromLocationChange = async (value: string) => {
    form.setValue('fromLocation', value);
    if (value.length >= 2) {
      const suggestions = await fetchAddressSuggestions(value);
      setFromSuggestions(suggestions);
      setShowFromSuggestions(true);
    } else {
      setShowFromSuggestions(false);
    }
  };

  const handleToLocationChange = async (value: string) => {
    form.setValue('toLocation', value);
    if (value.length >= 2) {
      const suggestions = await fetchAddressSuggestions(value);
      setToSuggestions(suggestions);
      setShowToSuggestions(true);
    } else {
      setShowToSuggestions(false);
    }
  };

  const selectFromSuggestion = (suggestion: string) => {
    form.setValue('fromLocation', suggestion);
    setShowFromSuggestions(false);
  };

  const selectToSuggestion = (suggestion: string) => {
    form.setValue('toLocation', suggestion);
    setShowToSuggestions(false);
  };

  // Validate step 1 fields
  const validateStep1 = () => {
    const values = form.getValues();
    const errors = [];
    
    if (!values.fromLocation || values.fromLocation.length < 3) errors.push('fromLocation');
    if (!values.toLocation || values.toLocation.length < 3) errors.push('toLocation');
    if (!values.time) errors.push('time');
    
    return errors.length === 0;
  };

  const handleContinueToStep2 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    } else {
      // Trigger validation for step 1 fields
      form.trigger(['fromLocation', 'toLocation', 'time']);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    // Rate limiting check
    if (!rateLimit.check('booking-form', 3, 300000)) { // 3 attempts per 5 minutes
      toast({
        title: "Too many attempts",
        description: "Please wait before submitting again.",
        variant: "destructive",
      });
      return;
    }

    // Bot detection
    const formData = {
      ...data,
      fillTime: Date.now() - formStartTime,
      csrfToken,
    };

    if (detectBotBehavior(formData)) {
      console.log('Potential bot detected');
      toast({
        title: "Submission failed",
        description: "Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Sanitize inputs before sending
      const sanitizedData = {
        ...data,
        fromLocation: sanitizeText(data.fromLocation),
        toLocation: sanitizeText(data.toLocation),
        name: sanitizeText(data.name),
        email: sanitizeText(data.email),
        phone: sanitizeText(data.phone),
        specialRequests: data.specialRequests ? sanitizeText(data.specialRequests) : "",
        csrfToken,
      };

      // Submit to secure edge function
      const { data: result, error } = await supabase.functions.invoke('submit-booking', {
        body: sanitizedData,
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Booking Submitted!",
        description: `Thank you ${data.name}! We'll contact you shortly to confirm your ride from ${data.fromLocation} to ${data.toLocation}.`,
      });
      
      // Reset form after successful submission
      form.reset();
      setEstimatedPrice(null);
      setCurrentStep(1);
      rateLimit.reset('booking-form');
      
    } catch (error) {
      console.error('Booking submission error:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error submitting your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto bg-white shadow-elegant border-0" role="form" aria-labelledby="booking-form-title">
      <CardHeader className="pb-1 px-2 pt-2">
        <CardTitle id="booking-form-title" className="text-xs font-semibold text-foreground text-center">
          {currentStep === 1 ? "Allez Hop ! Let's Book a Ride" : "Your details"}
        </CardTitle>
        {currentStep === 1 && estimatedPrice && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 p-1 rounded text-center justify-center" role="status" aria-live="polite">
            <Euro className="h-3 w-3" aria-hidden="true" />
            <span>€{estimatedPrice}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1" noValidate>
            <div className="sr-only">
              <label htmlFor="form-instructions">Form instructions</label>
              <div id="form-instructions">Fill out this form to book your ride. All fields marked with an asterisk are required.</div>
            </div>

            {currentStep === 1 ? (
              // Step 1: Route, Date, Time, Passengers, Luggage
              <>
                {/* Location Fields */}
                <div className="space-y-1">
                  <FormField
                    control={form.control}
                    name="fromLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" aria-hidden="true" />
                            <Input
                              placeholder="From (airport, port, address)"
                              className="pl-10 h-10 text-sm"
                              value={field.value || ""}
                              onChange={(e) => handleFromLocationChange(e.target.value)}
                              onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                              onFocus={() => field.value && field.value.length >= 3 && setShowFromSuggestions(true)}
                              aria-describedby={field.name + "-error"}
                              aria-invalid={!!form.formState.errors.fromLocation}
                            />
                            {showFromSuggestions && fromSuggestions.length > 0 && (
                              <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {fromSuggestions.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                                    onClick={() => selectFromSuggestion(suggestion)}
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage id={field.name + "-error"} />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="toLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" aria-hidden="true" />
                            <Input
                              placeholder="To (airport, port, address)"
                              className="pl-10 h-10 text-sm"
                              value={field.value || ""}
                              onChange={(e) => handleToLocationChange(e.target.value)}
                              onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                              onFocus={() => field.value && field.value.length >= 3 && setShowToSuggestions(true)}
                              aria-describedby={field.name + "-error"}
                              aria-invalid={!!form.formState.errors.toLocation}
                            />
                            {showToSuggestions && toSuggestions.length > 0 && (
                              <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {toSuggestions.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                                    onClick={() => selectToSuggestion(suggestion)}
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage id={field.name + "-error"} />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-xs font-medium mb-1">Pickup date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal h-10 text-sm",
                                  !field.value && "text-muted-foreground"
                                )}
                                aria-haspopup="dialog"
                                aria-expanded="false"
                                aria-describedby={field.name + "-error"}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage id={field.name + "-error"} />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-xs font-medium mb-1">Pickup time</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger 
                              className={cn(
                                "w-full justify-start text-left font-normal bg-background h-10 text-sm",
                                !field.value && "text-muted-foreground"
                              )}
                              aria-describedby={field.name + "-error"}
                              aria-invalid={!!form.formState.errors.time}
                            >
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-background border z-50 max-h-60 overflow-y-auto" aria-label="Available pickup times">
                            {times.map((time) => (
                              <SelectItem key={time} value={time} className="hover:bg-secondary">
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage id={field.name + "-error"} />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Passengers and Luggage */}
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="passengers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium mb-1">Passengers</FormLabel>
                        <FormControl>
                          <div className="flex items-center justify-between border rounded-lg p-2 h-10" role="group" aria-label="Number of passengers">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => field.onChange(Math.max(1, field.value - 1))}
                              className="h-6 w-6 p-0 touch-manipulation"
                              aria-label="Decrease passenger count"
                              disabled={field.value <= 1}
                            >
                              <Minus className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <div className="flex items-center space-x-1" aria-live="polite">
                              <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                              <span className="font-medium text-sm" aria-label={`${field.value} passengers selected`}>{field.value}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => field.onChange(Math.min(8, field.value + 1))}
                              className="h-6 w-6 p-0 touch-manipulation"
                              aria-label="Increase passenger count"
                              disabled={field.value >= 8}
                            >
                              <Plus className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage id={field.name + "-error"} />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="luggage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium mb-1">Luggage pieces</FormLabel>
                        <FormControl>
                          <div className="flex items-center justify-between border rounded-lg p-2 h-10" role="group" aria-label="Number of luggage pieces">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => field.onChange(Math.max(0, field.value - 1))}
                              className="h-6 w-6 p-0 touch-manipulation"
                              aria-label="Decrease luggage count"
                              disabled={field.value <= 0}
                            >
                              <Minus className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <div className="flex items-center space-x-1" aria-live="polite">
                              <Luggage className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                              <span className="font-medium text-sm" aria-label={`${field.value} luggage pieces selected`}>{field.value}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => field.onChange(Math.min(10, field.value + 1))}
                              className="h-6 w-6 p-0 touch-manipulation"
                              aria-label="Increase luggage count"
                              disabled={field.value >= 10}
                            >
                              <Plus className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage id={field.name + "-error"} />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="button"
                  onClick={handleContinueToStep2}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-sm font-medium touch-manipulation mt-3"
                >
                  Continue booking
                </Button>
              </>
            ) : (
              // Step 2: Contact Information
              <>
                <div className="mb-3 text-xs text-muted-foreground text-center">
                  {form.getValues('fromLocation')} → {form.getValues('toLocation')}
                  {estimatedPrice && <span className="block">€{estimatedPrice}</span>}
                </div>

                {/* Contact Information */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">
                        Full Name <span className="text-destructive" aria-label="required">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your full name" 
                          className="h-10 text-sm"
                          {...field} 
                          aria-describedby={field.name + "-error"}
                          aria-invalid={!!form.formState.errors.name}
                          autoComplete="name"
                        />
                      </FormControl>
                      <FormMessage id={field.name + "-error"} />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          Email <span className="text-destructive" aria-label="required">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              className="pl-10 h-10 text-sm"
                              value={field.value || ""}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              aria-describedby={field.name + "-error"}
                              aria-invalid={!!form.formState.errors.email}
                              autoComplete="email"
                            />
                          </div>
                        </FormControl>
                        <FormMessage id={field.name + "-error"} />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          Phone <span className="text-destructive" aria-label="required">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
                            <Input
                              type="tel"
                              placeholder="+33 6 12 34 56 78"
                              className="pl-10 h-10 text-sm"
                              value={field.value || ""}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              aria-describedby={field.name + "-error"}
                              aria-invalid={!!form.formState.errors.phone}
                              autoComplete="tel"
                            />
                          </div>
                        </FormControl>
                        <FormMessage id={field.name + "-error"} />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Special Requests */}
                <FormField
                  control={form.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">Special Requests (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Child seat, wheelchair access, etc."
                          className="h-10 text-sm"
                          {...field}
                          aria-describedby={field.name + "-error"}
                          maxLength={500}
                        />
                      </FormControl>
                      <FormMessage id={field.name + "-error"} />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 mt-4">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 h-12 text-sm"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-sm font-medium touch-manipulation"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                        Booking...
                      </>
                    ) : (
                      "Complete Booking"
                    )}
                  </Button>
                </div>
              </>
            )}

            {/* Hidden honeypot field for bot detection */}
            <FormField
              control={form.control}
              name="honeypot"
              render={({ field }) => (
                <div style={{ display: 'none' }} aria-hidden="true">
                  <Input
                    {...field}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;