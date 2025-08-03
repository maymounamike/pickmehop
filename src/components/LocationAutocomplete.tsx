import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { MapPin, Building, Plane, Train, Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@googlemaps/js-api-loader";

export interface LocationSuggestion {
  id: string;
  address: string;
  type: 'airport' | 'train' | 'hotel' | 'address' | 'establishment';
  description?: string;
  icon?: React.ReactNode;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onValidSelection?: (isValid: boolean) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
}

// Debounce hook for performance
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Custom cache for suggestions
class SuggestionCache {
  private cache = new Map<string, LocationSuggestion[]>();
  private maxSize = 100;

  get(key: string): LocationSuggestion[] | null {
    return this.cache.get(key) || null;
  }

  set(key: string, value: LocationSuggestion[]): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

const suggestionCache = new SuggestionCache();

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  onValidSelection,
  placeholder = "Enter pickup location",
  className,
  disabled = false,
  error = false,
}) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isValidSelection, setIsValidSelection] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debouncedValue = useDebounce(value, 300);

  // Memoized airport presets for performance
  const airportPresets = useMemo(() => [
    {
      id: 'cdg',
      address: 'Charles de Gaulle International Airport, Tremblay-en-France 93290',
      type: 'airport' as const,
      description: 'CDG - Primary Paris Airport',
      icon: <Plane className="h-4 w-4 text-blue-600" />
    },
    {
      id: 'orly',
      address: 'Orly Airport, Orly 94390',
      type: 'airport' as const,
      description: 'ORY - Paris Orly Airport',
      icon: <Plane className="h-4 w-4 text-blue-600" />
    },
    {
      id: 'beauvais',
      address: 'Beauvais-Tillé Airport, Tillé 60000',
      type: 'airport' as const,
      description: 'BVA - Paris Beauvais',
      icon: <Plane className="h-4 w-4 text-blue-600" />
    }
  ], []);

  // Memoized train station presets
  const trainStations = useMemo(() => [
    {
      id: 'gare-du-nord',
      address: 'Gare du Nord, Paris 75010',
      type: 'train' as const,
      description: 'Major train station',
      icon: <Train className="h-4 w-4 text-green-600" />
    },
    {
      id: 'gare-de-lyon',
      address: 'Gare de Lyon, Paris 75012',
      type: 'train' as const,
      description: 'Major train station',
      icon: <Train className="h-4 w-4 text-green-600" />
    },
    {
      id: 'gare-montparnasse',
      address: 'Gare Montparnasse, Paris 75015',
      type: 'train' as const,
      description: 'Major train station',
      icon: <Train className="h-4 w-4 text-green-600" />
    }
  ], []);

  // Fast local filtering for presets
  const getLocalSuggestions = useCallback((query: string): LocationSuggestion[] => {
    if (!query || query.length < 1) return [];
    
    const queryLower = query.toLowerCase();
    const results: LocationSuggestion[] = [];

    // Check airports
    airportPresets.forEach(airport => {
      if (airport.address.toLowerCase().includes(queryLower) ||
          airport.description?.toLowerCase().includes(queryLower) ||
          queryLower.includes('airport') || queryLower.includes('cdg') || 
          queryLower.includes('orly') || queryLower.includes('beauvais')) {
        results.push(airport);
      }
    });

    // Check train stations
    trainStations.forEach(station => {
      if (station.address.toLowerCase().includes(queryLower) ||
          queryLower.includes('gare') || queryLower.includes('train')) {
        results.push(station);
      }
    });

    return results;
  }, [airportPresets, trainStations]);

  // Fetch hotel suggestions from API
  const fetchHotelSuggestions = useCallback(async (query: string): Promise<LocationSuggestion[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-paris-hotels', {
        body: { query }
      });
      
      if (error || !data?.hotels) return [];
      
      return data.hotels.map((hotel: string, index: number) => ({
        id: `hotel-${index}`,
        address: hotel,
        type: 'hotel' as const,
        description: 'Hotel',
        icon: <Building className="h-4 w-4 text-orange-600" />
      }));
    } catch (error) {
      console.error('Error fetching hotels:', error);
      return [];
    }
  }, []);

  // Fetch Google Maps suggestions
  const fetchGoogleSuggestions = useCallback(async (query: string): Promise<LocationSuggestion[]> => {
    console.log('🗺️ fetchGoogleSuggestions called with:', query);
    
    if (query.length < 2) {
      console.log('❌ Google query too short:', query.length);
      return [];
    }
    
    try {
      console.log('🔑 Getting Google Maps API key...');
      const { data: keyData, error: keyError } = await supabase.functions.invoke('get-google-maps-key');
      
      if (keyError || !keyData?.apiKey) {
        console.error('❌ Failed to get Google Maps API key:', keyError);
        return [];
      }

      console.log('✅ Got API key, loading Google Maps...');
      const loader = new Loader({
        apiKey: keyData.apiKey,
        version: "weekly",
        libraries: ["places"]
      });

      const google = await loader.load();
      console.log('✅ Google Maps loaded, creating autocomplete service...');
      const service = new google.maps.places.AutocompleteService();
      
      return new Promise((resolve) => {
        console.log('🔍 Requesting predictions for:', query);
        service.getPlacePredictions(
          {
            input: query,
            componentRestrictions: { country: 'FR' },
            types: ['geocode', 'establishment'] // Include both geocode and establishment to recognize hotels
          },
          async (predictions, status) => {
            console.log('📍 Google API response:', { status, predictionsCount: predictions?.length || 0 });
            
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              // Create a PlacesService to get detailed information
              const placesService = new google.maps.places.PlacesService(document.createElement('div'));
              
              const suggestions = await Promise.all(
                predictions.slice(0, 5).map(async (prediction, index) => {
                  console.log(`📍 Prediction ${index}:`, prediction);
                  
                  try {
                    // Get detailed place information including formatted address
                    const placeDetails = await new Promise<google.maps.places.PlaceResult>((resolve) => {
                      placesService.getDetails(
                        {
                          placeId: prediction.place_id,
                          fields: ['formatted_address', 'name', 'types', 'address_components']
                        },
                        (result, status) => {
                          if (status === google.maps.places.PlacesServiceStatus.OK && result) {
                            resolve(result);
                          } else {
                            // Fallback to prediction description if detailed request fails
                            resolve({ formatted_address: prediction.description } as google.maps.places.PlaceResult);
                          }
                        }
                      );
                    });
                    
                    // Use the formatted address from place details which includes street numbers
                    const displayAddress = placeDetails.formatted_address || prediction.description;
                    console.log(`📍 Detailed address: ${displayAddress}`);
                    
                    // Determine if this is an establishment based on types
                    const isEstablishment = placeDetails.types?.includes('establishment') || 
                                           placeDetails.types?.includes('lodging') ||
                                           placeDetails.types?.includes('restaurant') ||
                                           placeDetails.types?.includes('store') ||
                                           prediction.types?.includes('establishment');
                    
                    return {
                      id: `google-${index}`,
                      address: displayAddress,
                      type: (isEstablishment ? 'establishment' : 'address') as 'establishment' | 'address',
                      description: isEstablishment ? 'Establishment' : 'Address',
                      icon: isEstablishment 
                        ? <Building className="h-4 w-4 text-blue-600" />
                        : <MapPin className="h-4 w-4 text-gray-600" />
                    };
                  } catch (error) {
                    console.log(`⚠️ Failed to get details for prediction ${index}, using fallback`);
                    // Fallback to prediction description
                    return {
                      id: `google-${index}`,
                      address: prediction.description,
                      type: 'address' as const,
                      description: 'Address',
                      icon: <MapPin className="h-4 w-4 text-gray-600" />
                    };
                  }
                })
              );
              
              console.log('✅ Returning Google suggestions:', suggestions.length);
              resolve(suggestions);
            } else {
              console.log('❌ Google API failed or no predictions:', status);
              resolve([]);
            }
          }
        );
      });
    } catch (error) {
      console.error('❌ Error fetching Google suggestions:', error);
      return [];
    }
  }, []);

  // Main suggestion fetching function with caching
  const fetchSuggestions = useCallback(async (query: string) => {
    console.log('🔍 fetchSuggestions called with query:', query);
    
    if (!query || query.length < 1) {
      console.log('❌ Query too short, clearing suggestions');
      setSuggestions([]);
      return;
    }

    // Check cache first
    const cached = suggestionCache.get(query);
    if (cached) {
      console.log('✅ Found cached suggestions:', cached.length);
      setSuggestions(cached);
      return;
    }

    console.log('⏳ Fetching new suggestions...');
    setIsLoading(true);
    
    try {
      // Get local suggestions immediately
      const localSuggestions = getLocalSuggestions(query);
      console.log('📍 Local suggestions:', localSuggestions.length);
      
      // Get hotel and Google suggestions in parallel
      const [hotelSuggestions, googleSuggestions] = await Promise.all([
        fetchHotelSuggestions(query),
        fetchGoogleSuggestions(query)
      ]);

      console.log('🏨 Hotel suggestions:', hotelSuggestions.length);
      console.log('🗺️ Google suggestions:', googleSuggestions.length);

      // Combine and deduplicate
      const allSuggestions = [
        ...localSuggestions,
        ...hotelSuggestions,
        ...googleSuggestions
      ].slice(0, 8); // Limit to 8 suggestions for performance

      console.log('📋 Total suggestions:', allSuggestions.length);
      console.log('📋 All suggestions:', allSuggestions);

      // Cache the results
      suggestionCache.set(query, allSuggestions);
      setSuggestions(allSuggestions);
    } catch (error) {
      console.error('❌ Error fetching suggestions:', error);
      const fallbackSuggestions = getLocalSuggestions(query);
      console.log('🔄 Using fallback suggestions:', fallbackSuggestions.length);
      setSuggestions(fallbackSuggestions);
    } finally {
      setIsLoading(false);
    }
  }, [getLocalSuggestions, fetchHotelSuggestions, fetchGoogleSuggestions]);

  // Fetch suggestions when debounced value changes
  useEffect(() => {
    if (debouncedValue) {
      fetchSuggestions(debouncedValue);
    } else {
      setSuggestions([]);
    }
  }, [debouncedValue, fetchSuggestions]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // More lenient validation - consider valid if it's a reasonable address
    const isValid = newValue.length >= 3 && (
      // Check if it's a complete address-like format
      newValue.includes(',') || 
      !!newValue.match(/\d/) || // Has any number
      newValue.length >= 10 || // Long enough to be a full address
      airportPresets.some(preset => preset.address.toLowerCase().includes(newValue.toLowerCase())) ||
      trainStations.some(station => station.address.toLowerCase().includes(newValue.toLowerCase())) ||
      newValue.toLowerCase().includes('paris') ||
      newValue.toLowerCase().includes('airport') ||
      newValue.toLowerCase().includes('gare') ||
      newValue.toLowerCase().includes('hotel')
    );
    
    setIsValidSelection(isValid);
    onValidSelection?.(isValid);
    
    if (newValue.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setIsValidSelection(false);
      onValidSelection?.(false);
    }
    setSelectedIndex(-1);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    onChange(suggestion.address);
    setIsValidSelection(true);
    onValidSelection?.(true);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Clear input
  const handleClear = () => {
    onChange('');
    setIsValidSelection(false);
    onValidSelection?.(false);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (value && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onBlur={(e) => {
            // Only close if we're not clicking on the dropdown
            const relatedTarget = e.relatedTarget as HTMLElement;
            if (!listRef.current?.contains(relatedTarget)) {
              setTimeout(() => setIsOpen(false), 200);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pl-10 pr-10 h-11 transition-all duration-200 ease-in-out",
            error && "border-destructive focus:ring-destructive",
            isValidSelection && "border-green-500",
            className
          )}
          autoComplete="off"
        />
        
        {/* Search icon */}
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        
        {/* Loading or clear button */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-accent"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          ) : null}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {(() => {
        console.log('🎨 Dropdown render check:', {
          isOpen,
          suggestionsLength: suggestions.length,
          shouldRender: isOpen && suggestions.length > 0
        });
        return isOpen && suggestions.length > 0;
      })() && (
        <div
          ref={listRef}
          className={cn(
            "fixed left-0 right-0 mt-1 max-h-[300px] overflow-y-auto rounded-lg border shadow-2xl",
            "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
          )}
          style={{ 
            position: 'fixed',
            top: inputRef.current ? inputRef.current.getBoundingClientRect().bottom + window.scrollY + 4 : 0,
            left: inputRef.current ? inputRef.current.getBoundingClientRect().left + window.scrollX : 0,
            width: inputRef.current ? inputRef.current.getBoundingClientRect().width : 'auto',
            zIndex: 999999,
            backgroundColor: 'hsl(var(--popover))',
            borderColor: 'hsl(var(--border))',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div className="p-1">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-150",
                  "hover:bg-accent hover:text-accent-foreground",
                  index === selectedIndex && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleSelectSuggestion(suggestion)}
                onMouseDown={(e) => e.preventDefault()} // Prevent blur
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {suggestion.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium leading-tight">
                    {suggestion.address}
                  </div>
                  {suggestion.description && (
                    <div className="text-xs text-muted-foreground">
                      {suggestion.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;