import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Minus, Plus, Users, Luggage } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const BookingForm = () => {
  const [date, setDate] = useState<Date>();
  const [passengers, setPassengers] = useState(1);
  const [luggage, setLuggage] = useState(1);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");

  const times = Array.from({ length: 24 * 4 }, (_, i) => {
    const hours = Math.floor(i / 4);
    const minutes = (i % 4) * 15;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  });

  return (
    <Card className="w-full max-w-md bg-white shadow-elegant">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Your route</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="from" className="text-sm font-medium text-muted-foreground">From</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="from"
              placeholder="From (airport, port, address)"
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="to" className="text-sm font-medium text-muted-foreground">To</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="to"
              placeholder="To (airport, port, address)"
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Pickup date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Pickup time</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {times.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Passengers</Label>
            <div className="flex items-center justify-between border rounded-lg p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPassengers(Math.max(1, passengers - 1))}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{passengers}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPassengers(passengers + 1)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Luggage pieces</Label>
            <div className="flex items-center justify-between border rounded-lg p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLuggage(Math.max(0, luggage - 1))}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Luggage className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{luggage}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLuggage(luggage + 1)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Button className="w-full bg-success hover:bg-success/90 text-success-foreground">
          Continue booking
        </Button>

        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">18513</span> travelers in <span className="font-semibold">362</span> destinations booked a ride today
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingForm;