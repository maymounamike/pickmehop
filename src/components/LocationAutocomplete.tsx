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
  type: 'airport' | 'train' | 'hotel' | 'address';
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
    if (query.length < 2) return [];
    
    try {
      const { data: keyData, error: keyError } = await supabase.functions.invoke('get-google-maps-key');
      
      if (keyError || !keyData?.apiKey) return [];

      const loader = new Loader({
        apiKey: keyData.apiKey,
        version: "weekly",
        libraries: ["places"]
      });

      const google = await loader.load();
      const service = new google.maps.places.AutocompleteService();
      
      return new Promise((resolve) => {
        service.getPlacePredictions(
          {
            input: query,
            componentRestrictions: { country: 'FR' },
            types: ['address', 'establishment']
          },
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              const suggestions = predictions.slice(0, 5).map((prediction, index) => ({
                id: `google-${index}`,
                address: prediction.description,
                type: 'address' as const,
                description: 'Address',
                icon: <MapPin className="h-4 w-4 text-gray-600" />
              }));
              resolve(suggestions);
            } else {
              resolve([]);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error fetching Google suggestions:', error);
      return [];
    }
  }, []);

  // Main suggestion fetching function with caching
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 1) {
      setSuggestions([]);
      return;
    }

    // Check cache first
    const cached = suggestionCache.get(query);
    if (cached) {
      setSuggestions(cached);
      return;
    }

    setIsLoading(true);
    
    try {
      // Get local suggestions immediately
      const localSuggestions = getLocalSuggestions(query);
      
      // Get hotel and Google suggestions in parallel
      const [hotelSuggestions, googleSuggestions] = await Promise.all([
        fetchHotelSuggestions(query),
        fetchGoogleSuggestions(query)
      ]);

      // Combine and deduplicate
      const allSuggestions = [
        ...localSuggestions,
        ...hotelSuggestions,
        ...googleSuggestions
      ].slice(0, 8); // Limit to 8 suggestions for performance

      // Cache the results
      suggestionCache.set(query, allSuggestions);
      setSuggestions(allSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions(getLocalSuggestions(query));
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
    
    // Validate the input as user types
    const isValid = newValue.length >= 5 && (
      // Check if it's a complete address-like format
      newValue.includes(',') || 
      !!newValue.match(/\d+/) || // Has numbers (address/postal code)
      airportPresets.some(preset => preset.address.toLowerCase().includes(newValue.toLowerCase())) ||
      trainStations.some(station => station.address.toLowerCase().includes(newValue.toLowerCase()))
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
          onBlur={() => {
            // Delay closing to allow for clicks on suggestions
            setTimeout(() => setIsOpen(false), 150);
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
      {isOpen && suggestions.length > 0 && (
        <div
          ref={listRef}
          className={cn(
            "absolute top-full left-0 right-0 z-[9999] mt-1 max-h-[300px] overflow-y-auto overscroll-contain rounded-lg border autocomplete-dropdown",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
            "will-change-transform pointer-events-auto"
          )}
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