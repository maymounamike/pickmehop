import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Loader } from "@googlemaps/js-api-loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, MapPin, Minus, Plus, Users, Luggage, Loader2, Euro, Phone, Mail, CreditCard, DollarSign, Wallet, Baby, Accessibility, FileText, User, UserCheck, Car, Globe, ChevronDown } from "lucide-react";
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

const BookingForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [formStartTime] = useState(Date.now());
  const [csrfToken] = useState(generateCSRFToken());
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [validFromSelected, setValidFromSelected] = useState(false);
  const [validToSelected, setValidToSelected] = useState(false);
  const [allSuggestions, setAllSuggestions] = useState<string[]>([]); // Track all generated suggestions
  const [selectedCountryCode, setSelectedCountryCode] = useState("+33"); // Default to France
  const [formKey, setFormKey] = useState(0); // Key to force form remount
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
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

  // Calculate estimated price with special airport rules
  const calculatePrice = (from: string, to: string, passengers: number, luggage: number = 1) => {
    if (!from || !to) return null;
    
    // Cannot accept rides with more than 8 passengers or more than 10 pieces of luggage
    if (passengers > 8 || luggage > 10) return null;
    
    const fromLower = from.toLowerCase();
    const toLower = to.toLowerCase();
    
    // Check if route involves airports
    const isBeauvaisRoute = (fromLower.includes('beauvais') || fromLower.includes('bva') || fromLower.includes('tillé')) ||
                            (toLower.includes('beauvais') || toLower.includes('bva') || toLower.includes('tillé'));
    const isCDGRoute = (fromLower.includes('charles de gaulle') || fromLower.includes('cdg')) ||
                       (toLower.includes('charles de gaulle') || toLower.includes('cdg'));
    const isOrlyRoute = (fromLower.includes('orly') || fromLower.includes('ory')) ||
                        (toLower.includes('orly') || toLower.includes('ory'));
    
    // Van service pricing (5-8 passengers OR >4 luggage, luggage ≤8)
    if ((passengers >= 5 && passengers <= 8 && luggage <= 8) || (luggage > 4 && luggage <= 8)) {
      if (isBeauvaisRoute) {
        return 220; // Van price for Beauvais
      }
      if (isCDGRoute) {
        return 135; // Van price for CDG
      }
      if (isOrlyRoute) {
        return 90; // Van price for Orly
      }
    }
    
    // Comfort service pricing (≤4 passengers, ≤4 luggage)
    const qualifiesForComfortPricing = passengers <= 4 && luggage <= 4;
    
    if (qualifiesForComfortPricing) {
      if (isBeauvaisRoute) {
        return 150; // Comfort price for Beauvais
      }
      
      const isParisAddress = from.includes('75') || to.includes('75') || 
                            fromLower.includes('paris') || toLower.includes('paris');
      
      if (isCDGRoute && isParisAddress) {
        return 75; // Comfort price for CDG + Paris
      }
      
      if (isOrlyRoute && isParisAddress) {
        return 65; // Comfort price for Orly + Paris
      }
    }
    
    // Standard price calculation for other routes or when fixed pricing doesn't apply
    const basePrice = 25;
    const perKmRate = 2.5;
    const passengerSurcharge = passengers > 4 ? (passengers - 4) * 15 : 0;
    const luggageSurcharge = luggage > 4 ? (luggage - 4) * 8 : 0;
    
    // Estimate distance based on route type
    let estimatedKm = 20; // Default city distance
    if (fromLower.includes('airport') || toLower.includes('airport') ||
        fromLower.includes('cdg') || toLower.includes('cdg') ||
        fromLower.includes('orly') || toLower.includes('orly') ||
        fromLower.includes('beauvais') || toLower.includes('beauvais')) {
      estimatedKm = 35; // Airport distance
    }
    
    return Math.round(basePrice + (estimatedKm * perKmRate) + passengerSurcharge + luggageSurcharge);
  };

  // Watch form values to calculate price
  const watchedValues = form.watch(['fromLocation', 'toLocation', 'passengers', 'luggage']);
  
  // Update price when form values change
  useEffect(() => {
    const [from, to, passengers, luggage] = watchedValues;
    const price = calculatePrice(from, to, passengers, luggage);
    setEstimatedPrice(price);
  }, [watchedValues]);

  // Preset airport suggestions for common keywords
  const getAirportPresets = (query: string): string[] => {
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

    return presets;
  };

  // Train station suggestions for Paris stations
  const getTrainStationSuggestions = (query: string): string[] => {
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

    return stations;
  };

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
            service.getPlacePredictions(
              {
                input: query,
                componentRestrictions: { country: ['fr', 'be', 'ch', 'lu'] },
                types: ['establishment', 'geocode'],
              },
              (predictions, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                  const formatted = predictions.map(p => p.description);
                  resolve(formatted);
                } else {
                  resolve([]);
                }
              }
            );
          });
          
          suggestions.push(...googleSuggestions);
        }
      } catch (error) {
        console.error('Error fetching Google Maps suggestions:', error);
      }
    }

    // Remove duplicates while preserving order
    const uniqueSuggestions = Array.from(new Set(suggestions));
    
    // Update the allSuggestions state with current suggestions
    setAllSuggestions(prev => {
      const newAll = [...prev, ...uniqueSuggestions];
      return Array.from(new Set(newAll));
    });
    
    return uniqueSuggestions;
  };

  // Handle location change for "From" field
  const handleLocationChange = async (value: string, field: 'from' | 'to') => {
    if (field === 'from') {
      form.setValue('fromLocation', value);
      setValidFromSelected(false);
      
      if (value.length >= 1) {
        const suggestions = await fetchAddressSuggestions(value);
        setFromSuggestions(suggestions);
        setShowFromSuggestions(true);
      } else {
        setShowFromSuggestions(false);
      }
    } else {
      form.setValue('toLocation', value);
      setValidToSelected(false);
      
      if (value.length >= 1) {
        const suggestions = await fetchAddressSuggestions(value);
        setToSuggestions(suggestions);
        setShowToSuggestions(true);
      } else {
        setShowToSuggestions(false);
      }
    }
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion: string, field: 'from' | 'to') => {
    if (field === 'from') {
      form.setValue('fromLocation', suggestion);
      setValidFromSelected(true);
      setShowFromSuggestions(false);
    } else {
      form.setValue('toLocation', suggestion);
      setValidToSelected(true);
      setShowToSuggestions(false);
    }
  };

  const handleNextStep = () => {
    const fromLocation = form.getValues('fromLocation');
    const toLocation = form.getValues('toLocation');
    
    if (!fromLocation || !toLocation || !validFromSelected || !validToSelected) {
      toast({
        title: "Error",
        description: "Please select valid locations from the suggestions",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentStep(2);
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!user || !userProfile) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a ride",
        variant: "destructive",
      });
      return;
    }

    // Handle form submission logic here
    // Example: await submitBooking(data);
  };

  return (
    <Card className="w-full bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} key={formKey} className="space-y-6">
            {/* Honeypot field for bot detection */}
            <div style={{ display: 'none' }}>
              <FormField
                control={form.control}
                name="honeypot"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} tabIndex={-1} autoComplete="off" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {currentStep === 1 && (
              <>
                {/* Route Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-600 mb-4">Your route</h3>
                  
                  <div className="relative bg-gray-50 rounded-lg p-4 space-y-4">
                    {/* From Location */}
                    <div className="relative">
                      <div className="flex items-start space-x-3">
                        <div className="w-3 h-3 rounded-full border-2 border-gray-400 bg-white flex-shrink-0 mt-2"></div>
                        <div className="flex-1">
                          <FormField
                            control={form.control}
                            name="fromLocation"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="From (airport, port, address)"
                                    {...field}
                                    onChange={(e) => handleLocationChange(e.target.value, 'from')}
                                    className="border-0 bg-transparent text-base placeholder:text-gray-500 focus-visible:ring-0 p-0 font-normal"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      {/* From Suggestions */}
                      {showFromSuggestions && fromSuggestions.length > 0 && (
                        <div className="absolute top-full left-12 right-0 z-50 bg-white border border-border rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                          {fromSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                              onClick={() => selectSuggestion(suggestion, 'from')}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dotted line connection */}
                    <div className="flex items-center space-x-3">
                      <div className="w-3 flex justify-center">
                        <div className="w-0.5 h-6 border-l-2 border-dotted border-gray-300"></div>
                      </div>
                    </div>

                    {/* To Location */}
                    <div className="relative">
                      <div className="flex items-start space-x-3">
                        <div className="w-3 h-3 bg-gray-600 rounded-full flex-shrink-0 mt-2 relative">
                          <div className="absolute inset-0.5 bg-white rounded-full"></div>
                          <div className="absolute inset-1 bg-gray-600 rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <FormField
                            control={form.control}
                            name="toLocation"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="To (airport, port, address)"
                                    {...field}
                                    onChange={(e) => handleLocationChange(e.target.value, 'to')}
                                    className="border-0 bg-transparent text-base placeholder:text-gray-500 focus-visible:ring-0 p-0 font-normal"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      {/* To Suggestions */}
                      {showToSuggestions && toSuggestions.length > 0 && (
                        <div className="absolute top-full left-12 right-0 z-50 bg-white border border-border rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                          {toSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                              onClick={() => selectSuggestion(suggestion, 'to')}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Date and Time Section */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Pickup Date */}
                  <div>
                    <h4 className="text-base font-medium text-gray-900 mb-3">Pickup date</h4>
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-center text-left font-normal h-14 bg-gray-50 border-gray-200 hover:bg-gray-100",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                                  )}
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
                  </div>

                  {/* Pickup Time */}
                  <div>
                    <h4 className="text-base font-medium text-gray-900 mb-3">Pickup time</h4>
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-14 bg-gray-50 border-gray-200 hover:bg-gray-100">
                                <SelectValue placeholder={
                                  <div className="flex items-center justify-center w-full">
                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                  </div>
                                } />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {times.map((time) => (
                                <SelectItem key={time} value={time}>
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
                </div>

                {/* Passengers and Luggage */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Passengers */}
                  <div>
                    <h4 className="text-base font-medium text-gray-900 mb-3">Passengers</h4>
                    <FormField
                      control={form.control}
                      name="passengers"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg h-14 px-4">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-gray-200"
                              onClick={() => field.onChange(Math.max(1, field.value - 1))}
                              disabled={field.value <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-lg font-medium text-gray-900">{field.value}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-gray-200"
                              onClick={() => field.onChange(Math.min(8, field.value + 1))}
                              disabled={field.value >= 8}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Luggage */}
                  <div>
                    <h4 className="text-base font-medium text-gray-900 mb-3">Luggage pieces</h4>
                    <FormField
                      control={form.control}
                      name="luggage"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg h-14 px-4">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-gray-200"
                              onClick={() => field.onChange(Math.max(0, field.value - 1))}
                              disabled={field.value <= 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-lg font-medium text-gray-900">{field.value}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-gray-200"
                              onClick={() => field.onChange(Math.min(10, field.value + 1))}
                              disabled={field.value >= 10}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Continue Button */}
                <Button 
                  type="button" 
                  onClick={handleNextStep}
                  className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-base rounded-lg"
                  disabled={!form.getValues('fromLocation') || !form.getValues('toLocation') || !validFromSelected || !validToSelected}
                >
                  Continue booking
                </Button>
              </>
            )}

            {/* Additional steps can be added here */}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
