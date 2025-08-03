import * as React from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Input } from "./input";
import * as PopoverPrimitive from "@radix-ui/react-popover";

export interface SearchableSelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onSearch?: (query: string) => void;
  maxHeight?: number;
}

const SearchableSelect = React.forwardRef<
  HTMLButtonElement,
  SearchableSelectProps
>(({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No options found",
  className,
  disabled = false,
  loading = false,
  onSearch,
  maxHeight = 300,
  ...props
}, ref) => {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filteredOptions, setFilteredOptions] = React.useState(options);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Filter options based on search query
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOptions(options);
      return;
    }

    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredOptions(filtered);
  }, [options, searchQuery]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  // Handle option selection
  const handleSelectOption = (optionValue: string) => {
    onValueChange?.(optionValue);
    setOpen(false);
    setSearchQuery("");
  };

  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter" && !open) {
      setOpen(true);
    }
  };

  // Get selected option
  const selectedOption = options.find(option => option.value === value);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
          className={cn(
            "h-11 w-full justify-between bg-background px-4 py-2.5 text-left font-normal transition-all duration-200 ease-in-out hover:border-primary/50 focus:ring-2 focus:ring-primary focus:border-primary",
            !selectedOption && "text-muted-foreground",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          onKeyDown={handleKeyDown}
          {...props}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {selectedOption?.icon}
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <ChevronDown className="h-4 w-4 opacity-50 transition-transform duration-200 data-[state=open]:rotate-180" />
          )}
        </Button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className={cn(
            "z-[9999] w-[--radix-popover-trigger-width] overflow-hidden rounded-lg border bg-popover p-0 text-popover-foreground shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            "will-change-transform"
          )}
          style={{ maxHeight }}
          side="bottom"
          align="start"
          sideOffset={4}
        >
          {/* Search Input */}
          <div className="border-b bg-background/50 p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9 pr-8 h-9 border-0 bg-transparent focus:ring-0 focus:border-0"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-accent"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-[250px] overflow-y-auto overscroll-contain">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              <div className="p-1">
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 pl-8 pr-2 text-sm outline-none transition-colors duration-150 ease-in-out",
                      "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                      "active:bg-accent/70",
                      value === option.value && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => handleSelectOption(option.value)}
                    role="option"
                    aria-selected={value === option.value}
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      {value === option.value && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </span>

                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {option.icon}
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="truncate text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
});

SearchableSelect.displayName = "SearchableSelect";

export { SearchableSelect };