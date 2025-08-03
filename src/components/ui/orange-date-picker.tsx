import * as React from "react";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface OrangeDatePickerProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
  placeholder?: string;
}

export function OrangeDatePicker({ selected, onSelect, disabled, className, placeholder = "Pick a date" }: OrangeDatePickerProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [isOpen, setIsOpen] = React.useState(false);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
  const days = [];
  
  // Previous month's trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push({ date, isCurrentMonth: false });
  }
  
  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({ date, isCurrentMonth: true });
  }
  
  // Next month's leading days
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    days.push({ date, isCurrentMonth: false });
  }
  
  const isSelected = (date: Date) => {
    if (!selected) return false;
    return date.toDateString() === selected.toDateString();
  };
  
  const isDisabled = (date: Date) => {
    return disabled ? disabled(date) : false;
  };
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const handleDateSelect = (date: Date) => {
    if (onSelect) {
      onSelect(date);
    }
    setIsOpen(false);
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10 text-sm bg-background",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          {/* Header */}
          <div className="flex justify-center pt-1 relative items-center mb-4">
            <button
              onClick={goToPreviousMonth}
              className="absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-gray-300 rounded flex items-center justify-center"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="text-sm font-medium">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={goToNextMonth}
              className="absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-gray-300 rounded flex items-center justify-center"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          {/* Day names */}
          <div className="flex mb-2">
            {dayNames.map((day) => (
              <div key={day} className="w-9 text-center text-xs font-normal text-gray-500 p-1">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((dayObj, index) => {
              const { date, isCurrentMonth } = dayObj;
              const selected = isSelected(date);
              const disabled = isDisabled(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (!disabled && isCurrentMonth) {
                      handleDateSelect(date);
                    }
                  }}
                  disabled={disabled || !isCurrentMonth}
                  className="h-9 w-9 p-0 font-normal text-sm rounded-md transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: selected ? '#EA580C' : isToday && !selected ? '#F3F4F6' : 'transparent',
                    color: selected ? 'white' : isCurrentMonth ? '#111827' : '#9CA3AF',
                    border: selected ? '2px solid #EA580C' : 'none',
                    fontWeight: selected ? 'bold' : 'normal'
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}