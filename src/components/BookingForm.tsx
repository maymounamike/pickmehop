import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader } from "@googlemaps/js-api-loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const bookingSchema = z.object({
  fromLocation: z.string().min(3, "From location must be at least 3 characters"),
  toLocation: z.string().min(3, "To location must be at least 3 characters"),
  date: z.date().optional(),
  time: z.string().min(1, "Please select a pickup time"),
  passengers: z.number().min(1, "At least 1 passenger required").max(8, "Maximum 8 passengers"),
  luggage: z.number().min(0, "Luggage cannot be negative").max(10, "Maximum 10 luggage pieces"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  specialRequests: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

// Common locations for autocomplete
const locationSuggestions = [
  "Charles de Gaulle Airport (CDG)",
  "Orly Airport (ORY)",
  "Gare du Nord",
  "Gare de Lyon",
  "Châtelet-Les Halles",
  "République - 75003",
  "Marais - 75004", 
  "Latin Quarter - 75005",
  "Saint-Germain - 75006",
  "Eiffel Tower - 75007",
  "Champs-Élysées - 75008",
  "Opéra - 75009",
  "République - 75010",
  "Bastille - 75011",
  "Montparnasse - 75014",
  "Champ de Mars - 75015",
  "Arc de Triomphe - 75016",
  "Batignolles - 75017",
  "Montmartre - 75018",
  "Belleville - 75019",
  "Père Lachaise - 75020"
];

const BookingForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);
  const fromAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const toAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

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
    },
  });

  // Initialize Google Places API
  useEffect(() => {
    if (isGoogleLoaded) return;

    const initializeGooglePlaces = async () => {
      try {
        console.log('Starting Google Places initialization...');
        
        // Get the Google Maps API key from Supabase secrets
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        
        if (error || !data?.apiKey) {
          console.error('Failed to get API key:', error);
          throw new Error('Failed to get Google Maps API key');
        }

        console.log('API key retrieved successfully');

        const loader = new Loader({
          apiKey: data.apiKey,
          version: "weekly",
          libraries: ["places"],
        });

        console.log('Loading Google Maps API...');
        await loader.load();
        console.log('Google Maps API loaded');
        
        // Wait for DOM elements to be ready and ensure Google is fully loaded
        const initAutocomplete = () => {
          console.log('Initializing autocomplete...');
          console.log('From input ref:', fromInputRef.current);
          console.log('To input ref:', toInputRef.current);
          console.log('Google places available:', typeof google !== 'undefined' && google.maps && google.maps.places);

          // Initialize autocomplete for FROM input
          if (fromInputRef.current && !fromAutocompleteRef.current) {
            console.log('Creating FROM autocomplete');
            fromAutocompleteRef.current = new google.maps.places.Autocomplete(fromInputRef.current, {
              types: ['address', 'establishment'],
              componentRestrictions: { country: 'fr' },
              fields: ['formatted_address', 'geometry', 'place_id'],
            });

            fromAutocompleteRef.current.addListener('place_changed', () => {
              console.log('FROM place changed');
              const place = fromAutocompleteRef.current?.getPlace();
              console.log('FROM place:', place);
              if (place?.formatted_address) {
                form.setValue('fromLocation', place.formatted_address, { shouldValidate: true });
              }
            });
            console.log('FROM autocomplete initialized');
          }

          // Initialize autocomplete for TO input
          if (toInputRef.current && !toAutocompleteRef.current) {
            console.log('Creating TO autocomplete');
            toAutocompleteRef.current = new google.maps.places.Autocomplete(toInputRef.current, {
              types: ['address', 'establishment'],
              componentRestrictions: { country: 'fr' },
              fields: ['formatted_address', 'geometry', 'place_id'],
            });

            toAutocompleteRef.current.addListener('place_changed', () => {
              console.log('TO place changed');
              const place = toAutocompleteRef.current?.getPlace();
              console.log('TO place:', place);
              if (place?.formatted_address) {
                form.setValue('toLocation', place.formatted_address, { shouldValidate: true });
              }
            });
            console.log('TO autocomplete initialized');
          }

          setIsGoogleLoaded(true);
          
          toast({
            title: "Google Places loaded!",
            description: "Address autocomplete is now active.",
          });
        };

        // Try multiple times to ensure DOM is ready
        let attempts = 0;
        const maxAttempts = 10;
        
        const tryInit = () => {
          attempts++;
          console.log(`Initialization attempt ${attempts}`);
          
          if (fromInputRef.current && toInputRef.current) {
            initAutocomplete();
          } else if (attempts < maxAttempts) {
            console.log('DOM not ready, retrying in 200ms...');
            setTimeout(tryInit, 200);
          } else {
            console.error('Failed to initialize - DOM elements not found after', maxAttempts, 'attempts');
            toast({
              title: "Autocomplete setup failed",
              description: "Could not initialize address suggestions. Please refresh the page.",
              variant: "destructive",
            });
          }
        };

        // Start trying to initialize
        setTimeout(tryInit, 100);

      } catch (error) {
        console.error('Error loading Google Places:', error);
        toast({
          title: "Google Places failed to load",
          description: "Unable to load address autocomplete. Please try refreshing the page.",
          variant: "destructive",
        });
      }
    };

    initializeGooglePlaces();
  }, [form]);

  // Cleanup autocomplete listeners
  useEffect(() => {
    return () => {
      if (fromAutocompleteRef.current) {
        google.maps.event.clearInstanceListeners(fromAutocompleteRef.current);
      }
      if (toAutocompleteRef.current) {
        google.maps.event.clearInstanceListeners(toAutocompleteRef.current);
      }
    };
  }, []);

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

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Booking Submitted!",
        description: `Thank you ${data.name}! We'll contact you shortly to confirm your ride from ${data.fromLocation} to ${data.toLocation}.`,
      });
      
      // Reset form after successful submission
      form.reset();
      setEstimatedPrice(null);
      
    } catch (error) {
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
    <Card className="w-full max-w-md bg-white shadow-elegant">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Allez Hop ! Let&apos;s Book a Ride</CardTitle>
        {estimatedPrice && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 p-2 rounded-lg">
            <Euro className="h-4 w-4" />
            <span>Estimated price: <strong>€{estimatedPrice}</strong></span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!isGoogleLoaded && (
          <div className="mb-4 p-4 bg-secondary/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Loading Google Maps...</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Initializing address autocomplete functionality.
            </p>
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Location Fields */}
            <FormField
              control={form.control}
              name="fromLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                      <Input
                        ref={fromInputRef}
                        placeholder="From (airport, port, address)"
                        className="pl-10"
                        {...field}
                        value={field.value || ""}
                      />
                    </div>
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
                  <FormLabel>To</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                      <Input
                        ref={toInputRef}
                        placeholder="To (airport, port, address)"
                        className="pl-10"
                        {...field}
                        value={field.value || ""}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Pickup date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup time</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border z-50">
                        {times.map((time) => (
                          <SelectItem key={time} value={time} className="hover:bg-secondary">
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Passengers and Luggage */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="passengers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passengers</FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-between border rounded-lg p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => field.onChange(Math.max(1, field.value - 1))}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{field.value}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => field.onChange(Math.min(8, field.value + 1))}
                          className="h-8 w-8 p-0"
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
                    <FormLabel>Luggage pieces</FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-between border rounded-lg p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => field.onChange(Math.max(0, field.value - 1))}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center space-x-2">
                          <Luggage className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{field.value}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => field.onChange(Math.min(10, field.value + 1))}
                          className="h-8 w-8 p-0"
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

            {/* Contact Information */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="tel"
                          placeholder="+33 6 12 34 56 78"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
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
                  <FormLabel>Special Requests (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Child seat, wheelchair access, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Booking...
                </>
              ) : (
                "Continue Booking"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;