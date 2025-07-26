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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, MapPin, Minus, Plus, Users, Luggage, Loader2, Euro, Phone, Mail, CreditCard, DollarSign, Wallet } from "lucide-react";
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
  paymentMethod: z.enum(["cash", "card_onboard", "card_online", "paypal"]).optional(),
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
    
    const fromLower = from.toLowerCase();
    const toLower = to.toLowerCase();
    
    // Check if route involves airports
    const isBeauvaisRoute = (fromLower.includes('beauvais') || fromLower.includes('bva') || fromLower.includes('tillé')) ||
                            (toLower.includes('beauvais') || toLower.includes('bva') || toLower.includes('tillé'));
    const isCDGRoute = (fromLower.includes('charles de gaulle') || fromLower.includes('cdg')) ||
                       (toLower.includes('charles de gaulle') || toLower.includes('cdg'));
    const isOrlyRoute = (fromLower.includes('orly') || fromLower.includes('ory')) ||
                        (toLower.includes('orly') || toLower.includes('ory'));
    
    // Van service pricing (5-8 passengers, ≤8 luggage)
    if (passengers >= 5 && passengers <= 8 && luggage <= 8) {
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

    // Update the global suggestions list for validation
    if (suggestions.length > 0) {
      setAllSuggestions(prev => {
        const combined = [...new Set([...prev, ...suggestions])];
        return combined;
      });
    }

    // Return all combined suggestions (airports, trains, hotels, + Google Maps)
    return suggestions.slice(0, 8); // Limit to 8 suggestions total
  };

  // Handle address input changes with suggestions
  const handleFromLocationChange = async (value: string) => {
    form.setValue('fromLocation', value);
    setValidFromSelected(false); // Reset validation when user types
    
    if (value.length >= 1) {
      const suggestions = await fetchAddressSuggestions(value);
      setFromSuggestions(suggestions);
      setShowFromSuggestions(true);
    } else {
      setShowFromSuggestions(false);
    }
  };

  const handleToLocationChange = async (value: string) => {
    form.setValue('toLocation', value);
    setValidToSelected(false); // Reset validation when user types
    
    if (value.length >= 1) {
      const suggestions = await fetchAddressSuggestions(value);
      setToSuggestions(suggestions);
      setShowToSuggestions(true);
    } else {
      setShowToSuggestions(false);
    }
  };

  const selectFromSuggestion = (suggestion: string) => {
    form.setValue('fromLocation', suggestion);
    setValidFromSelected(true); // Mark as valid selection
    setShowFromSuggestions(false);
    form.clearErrors('fromLocation'); // Clear any validation errors
  };

  const selectToSuggestion = (suggestion: string) => {
    form.setValue('toLocation', suggestion);
    setValidToSelected(true); // Mark as valid selection
    setShowToSuggestions(false);
    form.clearErrors('toLocation'); // Clear any validation errors
  };

  // Validate step 1 fields
  const validateStep1 = () => {
    const values = form.getValues();
    const errors = [];
    
    // Check if valid addresses are selected
    if (!validFromSelected && values.fromLocation) {
      form.setError('fromLocation', { 
        message: 'Please select a valid address from the suggestions' 
      });
      errors.push('fromLocation');
    }

    if (!validToSelected && values.toLocation) {
      form.setError('toLocation', { 
        message: 'Please select a valid address from the suggestions' 
      });
      errors.push('toLocation');
    }
    
    if (!values.fromLocation || values.fromLocation.length < 3) errors.push('fromLocation');
    if (!values.toLocation || values.toLocation.length < 3) errors.push('toLocation');
    if (!values.time) errors.push('time');
    
    // Check if flight number is required for airport pickup
    const isFromAirport = values.fromLocation && (
      values.fromLocation.toLowerCase().includes('airport') ||
      values.fromLocation.toLowerCase().includes('cdg') ||
      values.fromLocation.toLowerCase().includes('orly') ||
      values.fromLocation.toLowerCase().includes('beauvais')
    );
    
    if (isFromAirport && (!values.flightNumber || values.flightNumber.trim().length === 0)) {
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
      // Sanitize inputs before sending
      const sanitizedData = {
        ...data,
        fromLocation: sanitizeText(data.fromLocation),
        toLocation: sanitizeText(data.toLocation),
        name: sanitizeText(data.name),
        email: sanitizeText(data.email),
        phone: sanitizeText(data.phone),
        specialRequests: data.specialRequests ? sanitizeText(data.specialRequests) : "",
        estimatedPrice,
        csrfToken,
      };

      // Handle different payment methods
      if (data.paymentMethod === 'cash' || data.paymentMethod === 'card_onboard') {
        // Direct booking for cash or card on board
        const { data: result, error } = await supabase.functions.invoke('submit-booking', {
          body: sanitizedData,
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
        
      } else if (data.paymentMethod === 'card_online' || data.paymentMethod === 'paypal') {
        // Create payment gateway session for online payments
        const { data: paymentResult, error: paymentError } = await supabase.functions.invoke('create-payment', {
          body: {
            ...sanitizedData,
            amount: estimatedPrice ? estimatedPrice * 100 : 5000, // Convert to cents
            paymentMethod: data.paymentMethod,
          },
        });

        if (paymentError) {
          throw new Error(paymentError.message);
        }

        if (paymentResult?.url) {
          // Redirect to payment gateway
          window.open(paymentResult.url, '_blank');
          
          toast({
            title: "Redirecting to Payment",
            description: "Please complete your payment in the new tab. Your booking will be confirmed once payment is processed.",
          });
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
    <Card className="w-full max-w-lg mx-auto bg-white shadow-elegant border-0" role="form" aria-labelledby="booking-form-title">
      <CardHeader className="pb-1 px-2 pt-2">
        <CardTitle id="booking-form-title" className="text-xs font-semibold text-foreground text-center">
          {currentStep === 1 ? "Allez Hop ! Let's Book a Ride" : currentStep === 2 ? "Your details" : "Payment Method"}
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
          <form key={formKey} onSubmit={form.handleSubmit(onSubmit)} className="space-y-1" noValidate>
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
                              onFocus={() => {
                                if (field.value && field.value.length >= 2) {
                                  setShowFromSuggestions(true);
                                }
                              }}
                              aria-describedby={field.name + "-error"}
                              aria-invalid={!!form.formState.errors.fromLocation}
                            />
                            {showFromSuggestions && fromSuggestions.length > 0 && (
                              <div className="absolute top-full left-0 right-0 z-[100] bg-white border border-gray-200 rounded-md shadow-xl max-h-48 overflow-y-auto mt-1">
                                {fromSuggestions.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-900 border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:text-blue-900 focus:outline-none transition-colors"
                                    onClick={() => selectFromSuggestion(suggestion)}
                                    onMouseDown={(e) => e.preventDefault()} // Prevent input blur
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
                              onFocus={() => {
                                if (field.value && field.value.length >= 2) {
                                  setShowToSuggestions(true);
                                }
                              }}
                              aria-describedby={field.name + "-error"}
                              aria-invalid={!!form.formState.errors.toLocation}
                            />
                            {showToSuggestions && toSuggestions.length > 0 && (
                              <div className="absolute top-full left-0 right-0 z-[100] bg-white border border-gray-200 rounded-md shadow-xl max-h-48 overflow-y-auto mt-1">
                                {toSuggestions.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-900 border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:text-blue-900 focus:outline-none transition-colors"
                                    onClick={() => selectToSuggestion(suggestion)}
                                    onMouseDown={(e) => e.preventDefault()} // Prevent input blur
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
                            <Select 
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
                            >
                              <SelectTrigger className="w-[110px] sm:w-[130px] h-10 text-xs sm:text-sm px-2">
                                <SelectValue placeholder="Code" />
                              </SelectTrigger>
                              <SelectContent className="bg-background border border-border shadow-lg z-50">
                                {countryCodes.map((country) => (
                                  <SelectItem key={country.code} value={country.code}>
                                    <span className="flex items-center gap-1 text-xs sm:text-sm">
                                      <span className="text-xs">{country.flag}</span>
                                      <span className="font-mono text-xs">{country.code}</span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
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

                <FormField
                  control={form.control}
                  name="paymentMethod"
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
                          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-secondary/50 transition-colors">
                            <RadioGroupItem value="cash" id="cash" />
                            <label htmlFor="cash" className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              Cash (Pay the driver)
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-secondary/50 transition-colors">
                            <RadioGroupItem value="card_onboard" id="card_onboard" />
                            <label htmlFor="card_onboard" className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              Card on board (Pay in vehicle)
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-secondary/50 transition-colors">
                            <RadioGroupItem value="card_online" id="card_online" />
                            <label htmlFor="card_online" className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              Card online (Pay now)
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-secondary/50 transition-colors">
                            <RadioGroupItem value="paypal" id="paypal" />
                            <label htmlFor="paypal" className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1">
                              <Wallet className="h-4 w-4 text-muted-foreground" />
                              PayPal (Pay now)
                            </label>
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
                    disabled={isSubmitting || !form.getValues('paymentMethod')}
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