import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface InlineCalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  disabled?: (date: Date) => boolean;
}

export function InlineCalendar({ selected, onSelect, disabled }: InlineCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days = [];
  const current = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const isSelected = (date: Date) => {
    return selected && date.toDateString() === selected.toDateString();
  };
  
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };
  
  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };
  
  const isDisabled = (date: Date) => {
    return disabled ? disabled(date) : false;
  };
  
  const handleDateClick = (date: Date) => {
    if (!isDisabled(date) && isCurrentMonth(date) && onSelect) {
      onSelect(date);
    }
  };
  
  const goToPrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };
  
  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="font-semibold text-lg">
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const selected = isSelected(date);
          const currentMonth = isCurrentMonth(date);
          const today = isToday(date);
          const disabled = isDisabled(date);
          
          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={disabled || !currentMonth}
              className={`
                h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200
                ${selected 
                  ? 'text-white shadow-md transform scale-105' 
                  : currentMonth 
                    ? 'text-gray-900 hover:bg-orange-100' 
                    : 'text-gray-400'
                }
                ${today && !selected ? 'bg-gray-100 font-bold' : ''}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-orange-300
              `}
              style={{
                backgroundColor: selected ? '#EA580C' : undefined,
                borderColor: selected ? '#EA580C' : undefined,
                border: selected ? '2px solid #EA580C' : '1px solid transparent'
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