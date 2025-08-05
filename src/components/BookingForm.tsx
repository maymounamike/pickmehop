import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Loader } from "@googlemaps/js-api-loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrangeDatePicker } from "@/components/ui/orange-date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EnhancedSelect, EnhancedSelectContent, EnhancedSelectItem, EnhancedSelectTrigger, EnhancedSelectValue } from "@/components/ui/enhanced-select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, MapPin, Minus, Plus, Users, Luggage, Loader2, Euro, Phone, Mail, CreditCard, DollarSign, Wallet, Baby, Accessibility, FileText, User, UserCheck, Car, Globe } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeText, validateEmail, validatePhone, ClientRateLimit, detectBotBehavior, generateCSRFToken } from "@/lib/security";

const bookingSchema = z.object({
  fromLocation: z.string().min(3, "From location must be at least 3 characters").max(200, "Location too long").refine((val) => {
    // Will be validated by component state - this is just a backup
    return val.length >= 3;
  }, "Please select a valid address from the suggestions"),
  toLocation: z.string().min(3, "To location must be at least 3 characters").max(200, "Location too long").refine((val) => {
    // Will be validated by component state - this is just a backup  
    return val.length >= 3;
  }, "Please select a valid address from the suggestions"),
  date: z.date().optional(),
  time: z.string().min(1, "Please select a pickup time"),
  passengers: z.number().min(1, "At least 1 passenger required").max(8, "Maximum 8 passengers"),
  luggage: z.number().min(0, "Luggage cannot be negative").max(10, "Maximum 10 luggage pieces"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().email("Please enter a valid email").refine(validateEmail, "Invalid email format"),
  phone: z.string().min(10, "Please enter a valid phone number").refine(validatePhone, "Invalid phone format"),
  flightNumber: z.string().optional(),
  specialRequests: z.string().max(500, "Special requests too long").optional(),
  childSeat: z.boolean().optional(),
  infantCarrierQty: z.number().min(0).max(4).optional(),
  childSeatQty: z.number().min(0).max(4).optional(),
  boosterQty: z.number().min(0).max(4).optional(),
  wheelchairAccess: z.boolean().optional(),
  notesToDriver: z.boolean().optional(),
  driverNotes: z.string().max(500, "Notes too long").optional(),
  paymentCategory: z.enum(["driver_direct", "online"]).optional(),
  paymentMethod: z.enum(["cash", "card", "paypal"]).optional(),
  honeypot: z.string().optional(), // Hidden field for bot detection
}).refine((data) => {
  // If from location is an airport, flight number is required
  const isFromAirport = data.fromLocation.toLowerCase().includes('airport') || 
                       data.fromLocation.toLowerCase().includes('cdg') ||
                       data.fromLocation.toLowerCase().includes('orly') ||
                       data.fromLocation.toLowerCase().includes('beauvais');
  
  if (isFromAirport && (!data.flightNumber || data.flightNumber.trim().length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Flight number is required when pickup location is an airport",
  path: ["flightNumber"]
}).refine((data) => {
  // Cannot accept rides with more than 8 passengers OR more than 10 pieces of luggage
  if (data.passengers > 8 || data.luggage > 10) {
    return false;
  }
  return true;
}, {
  message: "We cannot accept rides with more than 8 passengers or more than 10 pieces of luggage",
  path: ["passengers"]
});

type BookingFormData = z.infer<typeof bookingSchema>;

// Debounce utility function
const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): T => {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
};

const BookingForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [formStartTime] = useState(Date.now());
  const [csrfToken] = useState(generateCSRFToken());
  const [validFromSelected, setValidFromSelected] = useState(false);
  const [validToSelected, setValidToSelected] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+33"); // Default to France
  const [formKey, setFormKey] = useState(0); // Key to force form remount
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isDisneylandOrigin, setIsDisneylandOrigin] = useState(false);
  const [needsCustomQuote, setNeedsCustomQuote] = useState(false);
  const [isBeauvaisParisRoute, setIsBeauvaisParisRoute] = useState(false);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | null>(null);
  const [toLocationValue, setToLocationValue] = useState('');
  const rateLimit = new ClientRateLimit();

  // Country codes with USA and France first
  const countryCodes = [
    { code: "+1", country: "🇺🇸 USA", flag: "🇺🇸" },
    { code: "+33", country: "🇫🇷 France", flag: "🇫🇷" },
    { code: "+44", country: "🇬🇧 UK", flag: "🇬🇧" },
    { code: "+49", country: "🇩🇪 Germany", flag: "🇩🇪" },
    { code: "+39", country: "🇮🇹 Italy", flag: "🇮🇹" },
    { code: "+34", country: "🇪🇸 Spain", flag: "🇪🇸" },
    { code: "+32", country: "🇧🇪 Belgium", flag: "🇧🇪" },
    { code: "+31", country: "🇳🇱 Netherlands", flag: "🇳🇱" },
    { code: "+41", country: "🇨🇭 Switzerland", flag: "🇨🇭" },
    { code: "+43", country: "🇦🇹 Austria", flag: "🇦🇹" },
  ];

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
      childSeat: false,
      infantCarrierQty: 0,
      childSeatQty: 0,
      boosterQty: 0,
      wheelchairAccess: false,
      notesToDriver: false,
      driverNotes: "",
      paymentCategory: undefined,
      honeypot: "", // Hidden honeypot field
    },
  });

  // Load user profile for authenticated users
  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          setUserProfile(profile);
          // Pre-fill form with user data
          const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
          if (fullName) {
            form.setValue('name', fullName);
          }
          if (session.user.email) {
            form.setValue('email', session.user.email);
          }
          if (profile.phone) {
            form.setValue('phone', profile.phone);
          }
        }
      }
    };

    loadUserProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadUserProfile();
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

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

  // Disneyland Paris coordinates and radius (5km)
  const DISNEYLAND_PARIS_LAT = 48.8674;
  const DISNEYLAND_PARIS_LNG = 2.7840;
  const DISNEYLAND_RADIUS_KM = 5;

  // Function to calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Function to calculate distance-based pricing for routes not in fixed pricing zones
  const calculateDistanceBasedPricing = async (from: string, to: string, passengers: number, luggage: number) => {
    try {
      // Get Google Maps API key from cache or fetch it
      let apiKey = googleMapsApiKey;
      if (!apiKey) {
        const { data: keyData, error: keyError } = await supabase.functions.invoke('get-google-maps-key');
        if (keyError || !keyData?.key) {
          console.error('Failed to get Google Maps API key:', keyError);
          // Fallback to custom quote if API unavailable
          return { price: null, isDisneyland: false, needsQuote: true, isBeauvaisParisRoute: false };
        }
        apiKey = keyData.key;
        setGoogleMapsApiKey(apiKey);
      }

      // Load Google Maps API
      const loader = new Loader({
        apiKey: apiKey,
        version: "weekly",
        libraries: ["places", "geometry"]
      });

      await loader.load();

      const service = new google.maps.DistanceMatrixService();
      
      const result = await new Promise<google.maps.DistanceMatrixResponse>((resolve, reject) => {
        service.getDistanceMatrix({
          origins: [from],
          destinations: [to],
          travelMode: google.maps.TravelMode.DRIVING,
          avoidHighways: false,
          avoidTolls: false
        }, (response, status) => {
          if (status === google.maps.DistanceMatrixStatus.OK && response) {
            resolve(response);
          } else {
            reject(new Error(`Distance Matrix API error: ${status}`));
          }
        });
      });

      const distance = result.rows[0]?.elements[0]?.distance?.value;
      if (!distance) {
        // Fallback to custom quote if distance couldn't be calculated
        return { price: null, isDisneyland: false, needsQuote: true, isBeauvaisParisRoute: false };
      }

      const distanceKm = distance / 1000; // Convert meters to kilometers

      // Apply per-kilometer pricing rules
      let basePrice: number;
      let vehicleType: string;

      if (passengers <= 4 && luggage <= 4) {
        // Sedan pricing: 5€/km with 50€ minimum
        basePrice = Math.max(distanceKm * 5, 50);
        vehicleType = "sedan";
      } else if (passengers <= 8 && luggage <= 8) {
        // Minivan pricing: 8€/km with 80€ minimum
        basePrice = Math.max(distanceKm * 8, 80);
        vehicleType = "minivan";
      } else {
        // Exceeds capacity - fallback to custom quote
        return { price: null, isDisneyland: false, needsQuote: true, isBeauvaisParisRoute: false };
      }

      // Round to nearest euro
      const finalPrice = Math.round(basePrice);
      
      return { 
        price: finalPrice, 
        isDisneyland: false, 
        needsQuote: false, 
        isBeauvaisParisRoute: false,
        distanceKm: Math.round(distanceKm * 10) / 10, // Round to 1 decimal
        vehicleType
      };

    } catch (error) {
      console.error('Error calculating distance-based pricing:', error);
      // Fallback to custom quote if calculation fails
      return { price: null, isDisneyland: false, needsQuote: true, isBeauvaisParisRoute: false };
    }
  };

  // Cache for geocoding results to prevent repeated API calls
  const geocodingCache = useMemo(() => new Map<string, boolean>(), []);

  // Function to check if location is within Disneyland Paris geofence with caching
  const isWithinDisneylandGeofence = useCallback(async (address: string): Promise<boolean> => {
    // Check cache first
    const cacheKey = address.toLowerCase().trim();
    if (geocodingCache.has(cacheKey)) {
      return geocodingCache.get(cacheKey)!;
    }

    try {
      // Simple string check first for better performance
      const addressLower = cacheKey;
      if (addressLower.includes('disneyland') || addressLower.includes('disney')) {
        geocodingCache.set(cacheKey, true);
        return true;
      }
      
      // Skip API call for obviously non-Disney addresses to prevent jittering
      const isObviouslyNotDisney = addressLower.includes('airport') || 
                                  addressLower.includes('gare') || 
                                  addressLower.includes('station') ||
                                  addressLower.includes('hotel') ||
                                  addressLower.length < 5;
      
      if (isObviouslyNotDisney) {
        geocodingCache.set(cacheKey, false);
        return false;
      }
      
      // Get Google Maps API key from cache or fetch it
      let apiKey = googleMapsApiKey;
      if (!apiKey) {
        const { data: keyData, error: keyError } = await supabase.functions.invoke('get-google-maps-key');
        if (!keyData?.apiKey || keyError) {
          geocodingCache.set(cacheKey, false);
          return false;
        }
        apiKey = keyData.apiKey;
        setGoogleMapsApiKey(apiKey); // Cache the key
      }

      // Load Google Maps API with timeout
      const loader = new Loader({
        apiKey: apiKey,
        version: "weekly",
        libraries: ["places"]
      });

      const google = await loader.load();
      const geocoder = new google.maps.Geocoder();

      // Add timeout to prevent hanging
      const geocodePromise = new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Geocoding timeout'));
        }, 5000); // 5 second timeout

        geocoder.geocode({ address }, (results, status) => {
          clearTimeout(timeoutId);
          if (status === 'OK' && results) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });

      const result = await geocodePromise;

      if (result.length > 0) {
        const location = result[0].geometry.location;
        const distance = calculateDistance(
          DISNEYLAND_PARIS_LAT,
          DISNEYLAND_PARIS_LNG,
          location.lat(),
          location.lng()
        );
        const isWithinGeofence = distance <= DISNEYLAND_RADIUS_KM;
        geocodingCache.set(cacheKey, isWithinGeofence);
        return isWithinGeofence;
      }
    } catch (error) {
      console.error('Error checking Disneyland geofence:', error);
      // Cache the negative result to prevent repeated failures
      geocodingCache.set(cacheKey, false);
      return false;
    }
    
    geocodingCache.set(cacheKey, false);
    return false;
  }, [geocodingCache, googleMapsApiKey]);

  // Calculate estimated price with special airport rules and Disneyland geofencing
  const calculatePrice = async (from: string, to: string, passengers: number, luggage: number = 1) => {
    if (!from || !to) return { price: null, isDisneyland: false, needsQuote: false, isBeauvaisParisRoute: false };
    
    // Cannot accept rides with more than 8 passengers or more than 10 pieces of luggage
    if (passengers > 8 || luggage > 10) return { price: null, isDisneyland: false, needsQuote: true, isBeauvaisParisRoute: false };
    
    const fromLower = from.toLowerCase();
    const toLower = to.toLowerCase();
    
    // Helper function to check if location is CDG
    const isCDGLocation = (location: string) => {
      const locationLower = location.toLowerCase();
      return locationLower.includes('charles de gaulle') || locationLower.includes('cdg');
    };
    
    // Helper function to check if location is Orly
    const isOrlyLocation = (location: string) => {
      const locationLower = location.toLowerCase();
      return locationLower.includes('orly') || locationLower.includes('ory');
    };
    
    // Helper function to check if location is Beauvais
    const isBeauvaisLocation = (location: string) => {
      const locationLower = location.toLowerCase();
      return locationLower.includes('beauvais') || locationLower.includes('bva') || locationLower.includes('tillé');
    };
    
    // Check if either origin OR destination is within Disneyland Paris geofence
    const isDisneyOriginByName = fromLower.includes('disneyland') || fromLower.includes('disney');
    const isDisneyDestinationByName = toLower.includes('disneyland') || toLower.includes('disney');
    let isDisneyOriginByLocation = false;
    let isDisneyDestinationByLocation = false;
    
    try {
      isDisneyOriginByLocation = await isWithinDisneylandGeofence(from);
      isDisneyDestinationByLocation = await isWithinDisneylandGeofence(to);
    } catch (error) {
      console.error('Error checking Disneyland geofence:', error);
      isDisneyOriginByLocation = false;
      isDisneyDestinationByLocation = false;
    }
    
    const isOriginWithinDisneyGeofence = isDisneyOriginByName || isDisneyOriginByLocation;
    const isDestinationWithinDisneyGeofence = isDisneyDestinationByName || isDisneyDestinationByLocation;
    
    // Check if locations are within our service area (Disneyland, CDG, Orly, or Beauvais)
    const isOriginInServiceArea = isOriginWithinDisneyGeofence || isCDGLocation(from) || isOrlyLocation(from) || isBeauvaisLocation(from);
    const isDestinationInServiceArea = isDestinationWithinDisneyGeofence || isCDGLocation(to) || isOrlyLocation(to) || isBeauvaisLocation(to);
    
    // If neither origin nor destination is in our service area, use per-kilometer pricing
    if (!isOriginInServiceArea && !isDestinationInServiceArea) {
      // For routes not in our fixed pricing zones, calculate distance-based pricing
      // This requires geocoding both locations to get coordinates
      return await calculateDistanceBasedPricing(from, to, passengers, luggage);
    }
    
    const isDisneylandRoute = isOriginWithinDisneyGeofence || isDestinationWithinDisneyGeofence;
    
    // Check for Beauvais Airport routes
    const isBeauvaisFrom = fromLower.includes('beauvais') || fromLower.includes('bva') || fromLower.includes('tillé');
    const isBeauvaisTo = toLower.includes('beauvais') || toLower.includes('bva') || toLower.includes('tillé');
    
    // Special pricing for Disneyland ↔ Beauvais Airport routes (highest priority)
    if (isDisneylandRoute && (isBeauvaisFrom || isBeauvaisTo)) {
      if (passengers >= 5 && passengers <= 8 && luggage <= 8) {
        return { price: 275, isDisneyland: true, needsQuote: false, isBeauvaisParisRoute: false }; // Minivan Disneyland ↔ Beauvais
      } else if (passengers <= 4 && luggage <= 4) {
        return { price: 200, isDisneyland: true, needsQuote: false, isBeauvaisParisRoute: false }; // Sedan Disneyland ↔ Beauvais
      } else {
        // Outside capacity limits - use per-kilometer pricing
        return await calculateDistanceBasedPricing(from, to, passengers, luggage);
      }
    }
    
    // Check for Paris, CDG, or Orly locations
    const isParisLocation = (location: string) => {
      const locationLower = location.toLowerCase();
      return locationLower.includes('paris') || 
             locationLower.includes('75') ||
             locationLower.includes('charles de gaulle') || 
             locationLower.includes('cdg') ||
             locationLower.includes('orly') || 
             locationLower.includes('ory');
    };
    
    const isFromParisArea = isParisLocation(from);
    const isToParisArea = isParisLocation(to);
    
    // Standard Disneyland ↔ Paris/CDG/Orly pricing rules
    if (isDisneylandRoute && (isFromParisArea || isToParisArea)) {
      if (passengers >= 5 && passengers <= 8 && luggage <= 8) {
        return { price: 110, isDisneyland: true, needsQuote: false, isBeauvaisParisRoute: false }; // Minivan Disneyland ↔ Paris/CDG/Orly
      } else if (passengers <= 4 && luggage <= 4) {
        return { price: 80, isDisneyland: true, needsQuote: false, isBeauvaisParisRoute: false }; // Sedan Disneyland ↔ Paris/CDG/Orly
      } else {
        // Outside capacity limits - use per-kilometer pricing
        return await calculateDistanceBasedPricing(from, to, passengers, luggage);
      }
    }
    
    // Special pricing for Beauvais ↔ Paris/CDG/Orly routes
    const isBeauvaisParisRoute = (isBeauvaisFrom && isToParisArea) || (isFromParisArea && isBeauvaisTo);
    
    if (isBeauvaisParisRoute) {
      if (passengers >= 5 && passengers <= 8 && luggage <= 8) {
        return { price: 275, isDisneyland: false, needsQuote: false, isBeauvaisParisRoute: true }; // Minivan for Beauvais-Paris routes
      } else if (passengers <= 4 && luggage <= 4) {
        return { price: 200, isDisneyland: false, needsQuote: false, isBeauvaisParisRoute: true }; // Sedan for Beauvais-Paris routes
      } else {
        // Outside capacity limits - use per-kilometer pricing
        return await calculateDistanceBasedPricing(from, to, passengers, luggage);
      }
    }
    
    // Check if route involves other airports (existing logic)
    const isCDGRoute = (fromLower.includes('charles de gaulle') || fromLower.includes('cdg')) ||
                       (toLower.includes('charles de gaulle') || toLower.includes('cdg'));
    const isOrlyRoute = (fromLower.includes('orly') || fromLower.includes('ory')) ||
                        (toLower.includes('orly') || toLower.includes('ory'));
    const isBeauvaisRoute = (fromLower.includes('beauvais') || fromLower.includes('bva') || fromLower.includes('tillé')) ||
                            (toLower.includes('beauvais') || toLower.includes('bva') || toLower.includes('tillé'));
    
    // Van service pricing (5-8 passengers OR >4 luggage, luggage ≤8) - existing airport routes
    if ((passengers >= 5 && passengers <= 8 && luggage <= 8) || (luggage > 4 && luggage <= 8)) {
      if (isBeauvaisRoute && !isBeauvaisParisRoute) {
        return { price: 220, isDisneyland: false, needsQuote: false, isBeauvaisParisRoute: false }; // Van price for other Beauvais routes
      }
      if (isCDGRoute && !isBeauvaisParisRoute) {
        return { price: 135, isDisneyland: false, needsQuote: false, isBeauvaisParisRoute: false }; // Van price for CDG
      }
      if (isOrlyRoute && !isBeauvaisParisRoute) {
        return { price: 90, isDisneyland: false, needsQuote: false, isBeauvaisParisRoute: false }; // Van price for Orly
      }
    }
    
    // Comfort service pricing (≤4 passengers, ≤4 luggage) - existing airport routes
    const qualifiesForComfortPricing = passengers <= 4 && luggage <= 4;
    
    if (qualifiesForComfortPricing) {
      if (isBeauvaisRoute && !isBeauvaisParisRoute) {
        return { price: 150, isDisneyland: false, needsQuote: false, isBeauvaisParisRoute: false }; // Comfort price for other Beauvais routes
      }
      
      const isParisAddress = from.includes('75') || to.includes('75') || 
                            fromLower.includes('paris') || toLower.includes('paris');
      
      if (isCDGRoute && isParisAddress && !isBeauvaisParisRoute) {
        return { price: 75, isDisneyland: false, needsQuote: false, isBeauvaisParisRoute: false }; // Comfort price for CDG + Paris
      }
      
      if (isOrlyRoute && isParisAddress && !isBeauvaisParisRoute) {
        return { price: 65, isDisneyland: false, needsQuote: false, isBeauvaisParisRoute: false }; // Comfort price for Orly + Paris
      }
    }
    
    // For any other routes, use per-kilometer pricing instead of custom quote
    return await calculateDistanceBasedPricing(from, to, passengers, luggage);
  };

  // Watch form values to calculate price with debouncing
  const watchedValues = form.watch(['fromLocation', 'toLocation', 'passengers', 'luggage']);
  
  // Watch toLocation for real-time pricing updates
  useEffect(() => {
    const toLocation = form.watch('toLocation');
    setToLocationValue(toLocation || '');
  }, [form.watch('toLocation')]);
  
  // Debounced price calculation to prevent excessive calls
  const debouncedUpdatePrice = useCallback(
    debounce(async (from: string, to: string, passengers: number, luggage: number) => {
      // Reset states
      setNeedsCustomQuote(false);
      setIsDisneylandOrigin(false);
      setIsBeauvaisParisRoute(false);
      setEstimatedPrice(null);
      
      // Only calculate if we have valid inputs
      if (!from || !to || from.length < 3 || to.length < 3) {
        setEstimatedPrice(null);
        return;
      }
      
      try {
        const result = await calculatePrice(from, to, passengers, luggage);
        
        if (result) {
          setEstimatedPrice(result.price);
          setIsDisneylandOrigin(result.isDisneyland);
          setNeedsCustomQuote(result.needsQuote);
          setIsBeauvaisParisRoute(result.isBeauvaisParisRoute);
        } else {
          setEstimatedPrice(null);
        }
      } catch (error) {
        console.error('Error calculating price:', error);
        setEstimatedPrice(null);
        setIsDisneylandOrigin(false);
        setNeedsCustomQuote(false);
        setIsBeauvaisParisRoute(false);
      }
    }, 300), // 300ms debounce
    []
  );
  
  // Update price when form values change
  useEffect(() => {
    const [from, to, passengers, luggage] = watchedValues;
    debouncedUpdatePrice(from, to, passengers, luggage);
  }, [watchedValues, debouncedUpdatePrice]);

  // Validate step 1 fields
  // Memoized airport presets to prevent repeated calculations
  const getAirportPresets = useCallback((query: string): string[] => {
    const queryLower = query.toLowerCase();
    const presets: string[] = [];

    // Charles de Gaulle Airport keywords - match from first character
    if (['c', 'ch', 'cha', 'char', 'charl', 'charles', 'cdg', 'g', 'ga', 'gau', 'gaul', 'gaulle', 'r', 'ro', 'roi', 'rois', 'roiss', 'roissy', 'a', 'ai', 'air', 'airp', 'airpo', 'airpor', 'airport'].some(keyword => 
        queryLower.startsWith(keyword) || keyword.startsWith(queryLower))) {
      presets.push('Charles de Gaulle International Airport, Tremblay-en-France 93290');
    }

    // Orly Airport keywords - match from first character
    if (['o', 'or', 'orl', 'orly', 'ory', 'a', 'ai', 'air', 'airp', 'airpo', 'airpor', 'airport'].some(keyword => 
        queryLower.startsWith(keyword) || keyword.startsWith(queryLower))) {
      presets.push('Orly Airport, Orly 94390');
    }

    // Beauvais Airport keywords - match from first character
    if (['b', 'be', 'bea', 'beau', 'beauv', 'beauva', 'beauvai', 'beauvais', 'bva', 't', 'ti', 'til', 'till', 'tillé', 'a', 'ai', 'air', 'airp', 'airpo', 'airpor', 'airport'].some(keyword => 
        queryLower.startsWith(keyword) || keyword.startsWith(queryLower))) {
      presets.push('Beauvais-Tillé Airport, Tillé 60000');
    }

    return presets.slice(0, 5); // Limit to 5 suggestions
  }, []);

  // Memoized train station suggestions for Paris stations
  const getTrainStationSuggestions = useCallback((query: string): string[] => {
    const queryLower = query.toLowerCase();
    const stations: string[] = [];

    // Major Paris train stations with their keywords
    const trainStations = [
      { keywords: ['g', 'ga', 'gar', 'gare', 'n', 'no', 'nor', 'nord'], name: 'Gare du Nord, Paris 75010' },
      { keywords: ['g', 'ga', 'gar', 'gare', 'e', 'es', 'est'], name: 'Gare de l\'Est, Paris 75010' },
      { keywords: ['g', 'ga', 'gar', 'gare', 'l', 'ly', 'lyo', 'lyon'], name: 'Gare de Lyon, Paris 75012' },
      { keywords: ['g', 'ga', 'gar', 'gare', 'a', 'au', 'aus', 'aust', 'auste', 'auster', 'austerl', 'austerlitz'], name: 'Gare d\'Austerlitz, Paris 75013' },
      { keywords: ['g', 'ga', 'gar', 'gare', 'm', 'mo', 'mon', 'mont', 'montp', 'montpa', 'montpar', 'montparn', 'montparna', 'montparnas', 'montparnass', 'montparnasse'], name: 'Gare Montparnasse, Paris 75015' },
      { keywords: ['g', 'ga', 'gar', 'gare', 's', 'sa', 'sai', 'sain', 'saint', 'l', 'la', 'laz', 'laza', 'lazar', 'lazare'], name: 'Gare Saint-Lazare, Paris 75008' },
      { keywords: ['g', 'ga', 'gar', 'gare', 'b', 'be', 'ber', 'berc', 'bercy'], name: 'Gare de Bercy, Paris 75012' },
      { keywords: ['c', 'ch', 'cha', 'chat', 'chate', 'chatel', 'chatelet'], name: 'Châtelet-Les Halles RER, Paris 75001' },
      { keywords: ['n', 'na', 'nat', 'nati', 'natio', 'nation'], name: 'Nation, Paris 75011' },
      { keywords: ['r', 're', 'rep', 'repu', 'repub', 'republ', 'republi', 'republic', 'republique'], name: 'République, Paris 75003' },
      { keywords: ['b', 'ba', 'bas', 'bast', 'basti', 'bastil', 'bastill', 'bastille'], name: 'Bastille, Paris 75004' },
      { keywords: ['o', 'op', 'ope', 'oper', 'opera'], name: 'Opéra, Paris 75009' },
      { keywords: ['c', 'co', 'con', 'conc', 'conco', 'concor', 'concord', 'concorde'], name: 'Concorde, Paris 75001' },
      { keywords: ['c', 'ch', 'cha', 'cham', 'champ', 'champs', 'e', 'el', 'ely', 'elys', 'elyse', 'elysee', 'elysees'], name: 'Champs-Élysées, Paris 75008' }
    ];

    for (const station of trainStations) {
      if (station.keywords.some(keyword => queryLower.startsWith(keyword) || keyword.startsWith(queryLower))) {
        if (!stations.includes(station.name)) {
          stations.push(station.name);
        }
      }
    }

    return stations.slice(0, 5); // Limit to 5 suggestions
  }, []);

  // Hotel suggestion function for Paris hotels
  const fetchHotelSuggestions = async (query: string) => {
    if (query.length < 1) return [];
    
    try {
      const { data, error } = await supabase.functions.invoke('get-paris-hotels', {
        body: { query }
      });
      
      if (error) {
        console.error('Error fetching hotel suggestions:', error);
        return [];
      }
      
      return data?.hotels || [];
    } catch (error) {
      console.error('Error fetching hotel suggestions:', error);
      return [];
    }
  };

  // Enhanced address suggestion function that includes hotels and train stations
  const fetchAddressSuggestions = async (query: string) => {
    const suggestions: string[] = [];

    // First check for airport presets (minimum 1 character)
    if (query.length >= 1) {
      const airportPresets = getAirportPresets(query);
      suggestions.push(...airportPresets);
    }

    // Check for train station suggestions (minimum 1 character)
    if (query.length >= 1) {
      const trainStations = getTrainStationSuggestions(query);
      suggestions.push(...trainStations);
    }

    // Always check for hotel suggestions for any query with 1+ character
    if (query.length >= 1) {
      const hotelSuggestions = await fetchHotelSuggestions(query);
      suggestions.push(...hotelSuggestions);
    }

    // ALWAYS get Google Maps suggestions for general addresses (minimum 2 characters)
    if (query.length >= 2) {
      try {
        // Get Google Maps API key from Supabase function
        const { data: keyData, error: keyError } = await supabase.functions.invoke('get-google-maps-key');
        
        if (!keyError && keyData?.apiKey) {
          // Load Google Maps API if not already loaded
          const loader = new Loader({
            apiKey: keyData.apiKey,
            version: "weekly",
            libraries: ["places"]
          });

          const google = await loader.load();
          
          // Create autocomplete service
          const service = new google.maps.places.AutocompleteService();
          
          const googleSuggestions = await new Promise<string[]>((resolve) => {
            service.getPlacePredictions({
              input: query,
              componentRestrictions: { country: 'fr' }
            }, (predictions, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                const googleResults = predictions.map(prediction => prediction.description);
                resolve(googleResults.slice(0, 5)); // Limit to 5 Google suggestions
              } else {
                console.error('Places service error:', status);
                resolve([]);
              }
            });
          });

          suggestions.push(...googleSuggestions);
        } else {
          console.error('Failed to get Google Maps API key:', keyError);
        }
      } catch (error) {
        console.error('Error fetching Google Maps suggestions:', error);
      }
    }

    return suggestions.slice(0, 8); // Limit to 8 suggestions total
  };

  // Validate step 1 fields
  const validateStep1 = () => {
    const values = form.getValues();
    const errors = [];
    
    // Check basic field requirements
    if (!values.fromLocation || values.fromLocation.length < 3) {
      form.setError('fromLocation', { 
        message: 'Please enter a pickup location (minimum 3 characters)' 
      });
      errors.push('fromLocation');
    }

    if (!values.toLocation || values.toLocation.length < 3) {
      form.setError('toLocation', { 
        message: 'Please enter a destination location (minimum 3 characters)' 
      });
      errors.push('toLocation');
    }
    
    // STRICT VALIDATION: Must select from dropdown suggestions
    if (values.fromLocation && values.fromLocation.length >= 3 && !validFromSelected) {
      form.setError('fromLocation', { 
        message: 'Please select a valid address from the dropdown suggestions' 
      });
      errors.push('fromLocation');
    }

    if (values.toLocation && values.toLocation.length >= 3 && !validToSelected) {
      form.setError('toLocation', { 
        message: 'Please select a valid address from the dropdown suggestions' 
      });
      errors.push('toLocation');
    }
    
    if (!values.time) {
      form.setError('time', { 
        message: 'Please select a pickup time' 
      });
      errors.push('time');
    }
    
    // Check if flight number is required for airport pickup
    const isFromAirport = values.fromLocation && (
      values.fromLocation.toLowerCase().includes('airport') ||
      values.fromLocation.toLowerCase().includes('cdg') ||
      values.fromLocation.toLowerCase().includes('orly') ||
      values.fromLocation.toLowerCase().includes('beauvais')
    );
    
    if (isFromAirport && (!values.flightNumber || values.flightNumber.trim().length === 0)) {
      form.setError('flightNumber', {
        message: 'Flight number is required when pickup location is an airport'
      });
      errors.push('flightNumber');
    }
    
    return errors.length === 0;
  };

  const handleContinueToStep2 = () => {
    if (validateStep1()) {
      // Force clear email and phone fields before going to step 2
      form.setValue('email', '');
      form.setValue('phone', '');
      setCurrentStep(2);
      // Force form remount to ensure clean state
      setFormKey(prev => prev + 1);
    } else {
      // Trigger validation for step 1 fields, including flight number if airport is selected
      const fieldsToValidate: (keyof BookingFormData)[] = ['fromLocation', 'toLocation', 'time'];
      const values = form.getValues();
      const isFromAirport = values.fromLocation && (
        values.fromLocation.toLowerCase().includes('airport') || 
        values.fromLocation.toLowerCase().includes('cdg') ||
        values.fromLocation.toLowerCase().includes('orly') ||
        values.fromLocation.toLowerCase().includes('beauvais')
      );
      
      if (isFromAirport) {
        fieldsToValidate.push('flightNumber');
      }
      
      form.trigger(fieldsToValidate);
    }
  };

  const validateStep2 = () => {
    const values = form.getValues();
    const errors = [];
    
    if (!values.name || values.name.length < 2) errors.push('name');
    if (!values.email || !validateEmail(values.email)) errors.push('email');
    if (!values.phone || !validatePhone(values.phone)) errors.push('phone');
    
    return errors.length === 0;
  };

  const handleContinueToStep3 = () => {
    if (validateStep2()) {
      setCurrentStep(3);
    } else {
      // Trigger validation for step 2 fields
      form.trigger(['name', 'email', 'phone']);
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
      // Build special requests string from checkbox options
      const specialRequestsArray = [];
      if (data.childSeat) {
        const childSeatRequests = [];
        if (data.infantCarrierQty && data.infantCarrierQty > 0) {
          childSeatRequests.push(`${data.infantCarrierQty} Infant carrier(s) (0-6 months)`);
        }
        if (data.childSeatQty && data.childSeatQty > 0) {
          childSeatRequests.push(`${data.childSeatQty} Child seat(s) (6 months - 3 years)`);
        }
        if (data.boosterQty && data.boosterQty > 0) {
          childSeatRequests.push(`${data.boosterQty} Booster(s) (3-12 years)`);
        }
        if (childSeatRequests.length > 0) {
          specialRequestsArray.push(`Child seats: ${childSeatRequests.join(', ')}`);
        }
      }
      if (data.wheelchairAccess) {
        specialRequestsArray.push("Wheelchair access required");
      }
      if (data.notesToDriver && data.driverNotes) {
        specialRequestsArray.push(`Notes: ${data.driverNotes}`);
      }
      
      // Sanitize inputs before sending
      const sanitizedData = {
        ...data,
        fromLocation: sanitizeText(data.fromLocation),
        toLocation: sanitizeText(data.toLocation),
        name: sanitizeText(data.name),
        email: sanitizeText(data.email),
        phone: sanitizeText(data.phone),
        specialRequests: specialRequestsArray.length > 0 ? sanitizeText(specialRequestsArray.join("; ")) : "",
        estimatedPrice,
        csrfToken,
      };

      // Handle different payment methods
      if (data.paymentCategory === 'driver_direct') {
        // Direct booking for payments to driver (cash or card on board)
        const { data: result, error } = await supabase.functions.invoke('submit-booking', {
          body: {
            ...sanitizedData,
            paymentMethod: data.paymentCategory === 'driver_direct' && data.paymentMethod === 'card' ? 'card_onboard' : data.paymentMethod,
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        // Redirect to confirmation page instead of showing toast
        navigate('/booking-confirmation');
        
        // Reset form after successful submission
        form.reset();
        setEstimatedPrice(null);
        setCurrentStep(1);
        rateLimit.reset('booking-form');
        
      } else if (data.paymentCategory === 'online') {
        // Create payment gateway session for online payments
        const { data: paymentResult, error: paymentError } = await supabase.functions.invoke('create-payment', {
          body: {
            ...sanitizedData,
            amount: estimatedPrice ? estimatedPrice * 100 : 5000, // Convert to cents
            paymentMethod: 'card_online', // Default to card for online payments
          },
        });

        if (paymentError) {
          throw new Error(paymentError.message);
        }

        if (paymentResult?.url) {
          // Redirect to payment gateway in the same tab
          window.location.href = paymentResult.url;
        } else {
          throw new Error("Payment session could not be created");
        }
      }
      
    } catch (error) {
      console.error('Booking submission error:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto bg-background/95 backdrop-blur-sm shadow-2xl border border-muted-foreground/30" 
          style={{ boxShadow: '0 25px 50px -12px rgba(45, 52, 54, 0.2)' }}
          role="form" aria-labelledby="booking-form-title">
      <CardHeader className="pb-4 px-6 pt-6">
        <CardTitle id="booking-form-title" className="text-lg font-semibold text-foreground text-center">
          {currentStep === 1 ? "Allez Hop ! Let's Book a Ride" : currentStep === 2 ? "Your details" : "Payment Method"}
        </CardTitle>

        
        {currentStep === 1 && estimatedPrice && typeof estimatedPrice === 'number' && (
          <div 
            className="flex items-center gap-3 bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border border-primary/20 text-center justify-center mt-4 animate-fade-in" 
            role="status" 
            aria-live="polite"
          >
            <Euro className="h-5 w-5 text-primary animate-pulse" aria-hidden="true" />
            <span className="text-2xl font-bold text-primary animate-scale-in">
              {estimatedPrice}
            </span>
          </div>
        )}
        
        {currentStep === 1 && needsCustomQuote && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
            <div className="text-orange-800 font-medium mb-2">
              🎯 Custom Quote Required
            </div>
            <p className="text-sm text-orange-700 mb-3">
              This route requires a custom quote. Please contact us for pricing.
            </p>
            <Button
              type="button"
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
              onClick={() => {
                navigate('/contact');
              }}
            >
              Get Custom Quote
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form key={formKey} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
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
                          <LocationAutocomplete
                            value={field.value || ""}
                            onChange={field.onChange}
                            onValidSelection={(isValid) => {
                              setValidFromSelected(isValid);
                              if (isValid) {
                                form.clearErrors('fromLocation');
                              }
                            }}
                            placeholder="From (airport, port, address)"
                            className={cn(
                              "dropdown-optimize",
                              field.value && field.value.length >= 3 && !validFromSelected && "border-red-500"
                            )}
                            error={!!form.formState.errors.fromLocation || (field.value && field.value.length >= 3 && !validFromSelected)}
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
                        <FormControl>
                          <LocationAutocomplete
                            value={field.value || ""}
                            onChange={field.onChange}
                            onValidSelection={(isValid) => {
                              setValidToSelected(isValid);
                              if (isValid) {
                                form.clearErrors('toLocation');
                              }
                            }}
                            placeholder="To (airport, port, address)"
                            className={cn(
                              "dropdown-optimize",
                              field.value && field.value.length >= 3 && !validToSelected && "border-red-500"
                            )}
                            error={!!form.formState.errors.toLocation || (field.value && field.value.length >= 3 && !validToSelected)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                 </div>

                 {/* Flight Number - shown only if from location is airport */}
                 {(() => {
                   const fromLocation = form.watch('fromLocation');
                   const isFromAirport = fromLocation && (
                     fromLocation.toLowerCase().includes('airport') || 
                     fromLocation.toLowerCase().includes('cdg') ||
                     fromLocation.toLowerCase().includes('orly') ||
                     fromLocation.toLowerCase().includes('beauvais')
                   );
                   
                   if (!isFromAirport) return null;
                   
                   return (
                     <FormField
                       control={form.control}
                       name="flightNumber"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="text-xs font-medium">
                             Flight Number <span className="text-destructive" aria-label="required">*</span>
                           </FormLabel>
                           <FormControl>
                             <Input
                               placeholder="e.g., AF1234, BA456"
                               className="h-10 text-sm"
                               {...field}
                               aria-describedby={field.name + "-error"}
                               aria-invalid={!!form.formState.errors.flightNumber}
                             />
                           </FormControl>
                           <FormMessage id={field.name + "-error"} />
                         </FormItem>
                       )}
                     />
                   );
                 })()}

                 {/* Date and Time */}
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-xs font-medium mb-1">Pickup date</FormLabel>
                        <FormControl>
                          <OrangeDatePicker
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            placeholder="Pick a date"
                            className="w-full"
                          />
                        </FormControl>
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
                        <EnhancedSelect onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <EnhancedSelectTrigger 
                              className={cn(
                                "w-full justify-start text-left font-normal bg-background h-11 text-sm dropdown-optimize",
                                !field.value && "text-muted-foreground"
                              )}
                              aria-describedby={field.name + "-error"}
                              aria-invalid={!!form.formState.errors.time}
                            >
                              <EnhancedSelectValue placeholder="Select pickup time" />
                            </EnhancedSelectTrigger>
                          </FormControl>
                          <EnhancedSelectContent className="bg-background border dropdown-optimize" maxHeight={250} aria-label="Available pickup times">
                            {times.map((time) => (
                              <EnhancedSelectItem key={time} value={time}>
                                {time}
                              </EnhancedSelectItem>
                            ))}
                          </EnhancedSelectContent>
                        </EnhancedSelect>
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
                              size="sm"
                              onClick={() => field.onChange(Math.max(1, field.value - 1))}
                              className="h-6 w-6 p-0 touch-manipulation bg-primary hover:bg-primary/90 text-primary-foreground"
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
                              size="sm"
                              onClick={() => field.onChange(Math.min(8, field.value + 1))}
                              className="h-6 w-6 p-0 touch-manipulation bg-primary hover:bg-primary/90 text-primary-foreground"
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
                              size="sm"
                              onClick={() => field.onChange(Math.max(0, field.value - 1))}
                              className="h-6 w-6 p-0 touch-manipulation bg-primary hover:bg-primary/90 text-primary-foreground"
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
                              size="sm"
                              onClick={() => field.onChange(Math.min(10, field.value + 1))}
                              className="h-6 w-6 p-0 touch-manipulation bg-primary hover:bg-primary/90 text-primary-foreground"
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
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-sm font-medium touch-manipulation mt-3"
                >
                  Continue booking
                </Button>
              </>
            ) : currentStep === 2 ? (
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
                          <div className="flex gap-2">
                            {/* Country Code Dropdown */}
                            <SearchableSelect
                              options={countryCodes.map(country => ({
                                value: country.code,
                                label: country.code,
                                description: country.country,
                                icon: <span className="text-xs">{country.flag}</span>
                              }))}
                              value={selectedCountryCode}
                              onValueChange={(newCode) => {
                                setSelectedCountryCode(newCode);
                                // Update the phone field with new country code if there's an existing number
                                const currentPhone = field.value || "";
                                const numberPart = currentPhone.replace(/^\+\d+\s?/, '').trim();
                                if (numberPart) {
                                  field.onChange(`${newCode} ${numberPart}`);
                                }
                              }}
                              placeholder="Code"
                              searchPlaceholder="Search country..."
                              className="w-[130px] sm:w-[150px] text-xs sm:text-sm dropdown-optimize"
                              maxHeight={250}
                            />
                            
                            {/* Phone Number Input */}
                            <div className="relative flex-1">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
                              <Input
                                type="tel"
                                placeholder={selectedCountryCode === "+1" ? "555 123 4567" : "6 12 34 56 78"}
                                className="pl-10 h-10 text-sm"
                                value={
                                  field.value 
                                    ? field.value.replace(selectedCountryCode, '').trim() 
                                    : ""
                                }
                                onChange={(e) => {
                                  // Only store the number part, system will combine with country code
                                  const phoneNumber = e.target.value.trim();
                                  const fullNumber = phoneNumber ? `${selectedCountryCode} ${phoneNumber}` : "";
                                  field.onChange(fullNumber);
                                }}
                                onBlur={field.onBlur}
                                name={field.name}
                                aria-describedby={field.name + "-error"}
                                aria-invalid={!!form.formState.errors.phone}
                                autoComplete="tel"
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage id={field.name + "-error"} />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Special Requests */}
                <div className="space-y-2">
                  <div className="text-xs font-medium">Special Requests (Optional)</div>
                  
                  {/* Child Seat Option */}
                  <FormField
                    control={form.control}
                    name="childSeat"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                            <Baby className="h-4 w-4" />
                            Child Seat
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Child Seat Type Options - Show when child seat is checked */}
                  {form.watch("childSeat") && (
                    <div className="ml-6 space-y-2">
                      <div className="text-xs text-muted-foreground mb-1">Select quantities:</div>
                      
                      {/* Infant Carrier Quantity */}
                      <FormField
                        control={form.control}
                        name="infantCarrierQty"
                        render={({ field }) => (
                           <FormItem className="py-1">
                             <div className="flex items-center justify-between">
                               <FormLabel className="flex items-center gap-1 text-xs">
                                 <Baby className="h-3 w-3" />
                                 Infant carrier (0-6 months)
                               </FormLabel>
                               <div className="flex items-center gap-1">
                                 <Button
                                   type="button"
                                   variant="outline"
                                   size="sm"
                                   className="h-6 w-6 p-0"
                                  onClick={() => field.onChange(Math.max(0, (field.value || 0) - 1))}
                                  disabled={(field.value || 0) <= 0}
                                >
                                   <Minus className="h-2 w-2" />
                                 </Button>
                                 <span className="w-6 text-center text-xs">{field.value || 0}</span>
                                 <Button
                                   type="button"
                                   variant="outline"
                                   size="sm"
                                   className="h-6 w-6 p-0"
                                  onClick={() => field.onChange(Math.min(4, (field.value || 0) + 1))}
                                  disabled={(field.value || 0) >= 4}
                                >
                                   <Plus className="h-2 w-2" />
                                 </Button>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Child Seat Quantity */}
                       <FormField
                         control={form.control}
                         name="childSeatQty"
                         render={({ field }) => (
                           <FormItem className="py-1">
                             <div className="flex items-center justify-between">
                               <FormLabel className="flex items-center gap-1 text-xs">
                                 <User className="h-3 w-3" />
                                 Child seat (6 months - 3 years)
                               </FormLabel>
                               <div className="flex items-center gap-1">
                                 <Button
                                   type="button"
                                   variant="outline"
                                   size="sm"
                                   className="h-6 w-6 p-0"
                                   onClick={() => field.onChange(Math.max(0, (field.value || 0) - 1))}
                                   disabled={(field.value || 0) <= 0}
                                 >
                                   <Minus className="h-2 w-2" />
                                 </Button>
                                 <span className="w-6 text-center text-xs">{field.value || 0}</span>
                                 <Button
                                   type="button"
                                   variant="outline"
                                   size="sm"
                                   className="h-6 w-6 p-0"
                                   onClick={() => field.onChange(Math.min(4, (field.value || 0) + 1))}
                                   disabled={(field.value || 0) >= 4}
                                 >
                                   <Plus className="h-2 w-2" />
                                 </Button>
                               </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Booster Quantity */}
                       <FormField
                         control={form.control}
                         name="boosterQty"
                         render={({ field }) => (
                           <FormItem className="py-1">
                             <div className="flex items-center justify-between">
                               <FormLabel className="flex items-center gap-1 text-xs">
                                 <UserCheck className="h-3 w-3" />
                                 Booster (3-12 years)
                               </FormLabel>
                               <div className="flex items-center gap-1">
                                 <Button
                                   type="button"
                                   variant="outline"
                                   size="sm"
                                   className="h-6 w-6 p-0"
                                   onClick={() => field.onChange(Math.max(0, (field.value || 0) - 1))}
                                   disabled={(field.value || 0) <= 0}
                                 >
                                   <Minus className="h-2 w-2" />
                                 </Button>
                                 <span className="w-6 text-center text-xs">{field.value || 0}</span>
                                 <Button
                                   type="button"
                                   variant="outline"
                                   size="sm"
                                   className="h-6 w-6 p-0"
                                   onClick={() => field.onChange(Math.min(4, (field.value || 0) + 1))}
                                   disabled={(field.value || 0) >= 4}
                                 >
                                   <Plus className="h-2 w-2" />
                                 </Button>
                               </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Wheelchair Access Option */}
                  <FormField
                    control={form.control}
                    name="wheelchairAccess"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                            <Accessibility className="h-4 w-4" />
                            Wheelchair Access
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Notes to Driver Option */}
                  <FormField
                    control={form.control}
                    name="notesToDriver"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                            <FileText className="h-4 w-4" />
                            Notes to Driver
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Driver Notes Text Area - Show when notes to driver is checked */}
                  {form.watch("notesToDriver") && (
                    <div className="ml-7">
                      <FormField
                        control={form.control}
                        name="driverNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Please provide any additional information for the driver..."
                                className="min-h-[80px] text-sm"
                                {...field}
                                maxLength={500}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-12">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 h-12 text-sm"
                  >
                    Back
                  </Button>
                  <Button 
                    type="button"
                    onClick={handleContinueToStep3}
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-sm font-medium touch-manipulation"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </>
            ) : (
              // Step 3: Payment Method
              <>
                <div className="mb-3 text-xs text-muted-foreground text-center">
                  {form.getValues('fromLocation')} → {form.getValues('toLocation')}
                  {estimatedPrice && <span className="block">€{estimatedPrice}</span>}
                </div>

                {/* Payment Method Selection */}
                <FormField
                  control={form.control}
                  name="paymentCategory"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-medium">
                        Payment Method <span className="text-destructive" aria-label="required">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid gap-3"
                        >
                          {/* Pay Driver Directly */}
                          <div className="border rounded-lg">
                            <div className="flex items-center space-x-3 p-3 hover:bg-secondary/50 transition-colors">
                              <RadioGroupItem value="driver_direct" id="driver_direct" />
                              <label htmlFor="driver_direct" className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1">
                                <Car className="h-4 w-4 text-muted-foreground" />
                                Pay Driver Directly
                              </label>
                            </div>
                            
                            {/* Driver Direct Sub-options */}
                            {form.watch("paymentCategory") === "driver_direct" && (
                              <div className="px-3 pb-3 ml-6 space-y-2 border-t bg-secondary/20">
                                <div className="text-xs text-muted-foreground pt-2 mb-2">Choose payment option:</div>
                                <FormField
                                  control={form.control}
                                  name="paymentMethod"
                                  render={({ field: subField }) => (
                                    <RadioGroup
                                      onValueChange={subField.onChange}
                                      value={subField.value}
                                      className="space-y-2"
                                    >
                                      <div className="flex items-center space-x-2 p-2 border rounded hover:bg-background transition-colors">
                                        <RadioGroupItem value="cash" id="cash_driver" />
                                        <label htmlFor="cash_driver" className="flex items-center gap-2 text-sm cursor-pointer flex-1">
                                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                                          Cash
                                        </label>
                                      </div>
                                      
                                      <div className="flex items-center space-x-2 p-2 border rounded hover:bg-background transition-colors">
                                        <RadioGroupItem value="card" id="card_driver" />
                                        <label htmlFor="card_driver" className="flex items-center gap-2 text-sm cursor-pointer flex-1">
                                          <CreditCard className="h-3 w-3 text-muted-foreground" />
                                          Card
                                        </label>
                                      </div>
                                    </RadioGroup>
                                  )}
                                />
                              </div>
                            )}
                          </div>

                          {/* Pay Online */}
                          <div className="border rounded-lg">
                            <div className="flex items-center space-x-3 p-3 hover:bg-secondary/50 transition-colors">
                              <RadioGroupItem value="online" id="online" />
                              <label htmlFor="online" className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                Pay Online
                              </label>
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 mt-4">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 h-12 text-sm"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-sm font-medium touch-manipulation"
                    disabled={isSubmitting || !form.getValues('paymentCategory') || (form.getValues('paymentCategory') === 'driver_direct' && !form.getValues('paymentMethod'))}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                        Processing...
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