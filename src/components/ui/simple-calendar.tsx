import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SimpleCalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
}

export function SimpleCalendar({ selected, onSelect, disabled, className }: SimpleCalendarProps) {
  console.log('🔥 SimpleCalendar is rendering!', { selected });
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
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
  
  return (
    <div className={cn("p-3", className)}>
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
          
          return (
            <button
              key={index}
              onClick={() => {
                if (!disabled && isCurrentMonth && onSelect) {
                  onSelect(date);
                }
              }}
              disabled={disabled || !isCurrentMonth}
              style={{
                backgroundColor: selected ? '#FF0000' : (date.toDateString() === new Date().toDateString() && !selected) ? '#F3F4F6' : 'transparent',
                color: selected ? 'white' : isCurrentMonth ? '#111827' : '#9CA3AF',
                border: selected ? '3px solid #FF0000' : 'none',
                borderRadius: '6px',
                fontWeight: selected ? 'bold' : 'normal'
              }}
              className={cn(
                "h-9 w-9 p-0 font-normal text-sm transition-colors",
                "hover:bg-gray-100 focus:outline-none focus:ring-2",
                {
                  // Disabled days
                  "opacity-50 cursor-not-allowed": disabled,
                }
              )}
              onMouseEnter={(e) => {
                if (selected) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#EA580C';
                  (e.target as HTMLButtonElement).style.color = 'white';
                }
              }}
              onFocus={(e) => {
                if (selected) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#EA580C';
                  (e.target as HTMLButtonElement).style.color = 'white';
                }
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
