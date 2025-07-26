import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ChevronDown, 
  Calendar, 
  Clock, 
  User, 
  LogOut, 
  MapPin 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DriverNavigationProps {
  user: any;
  profile?: {
    first_name?: string;
    last_name?: string;
  };
}

const DriverNavigation = ({ user, profile }: DriverNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const menuItems = [
    {
      label: "Booking Requests",
      icon: MapPin,
      path: "/driver",
      description: "View assigned rides"
    },
    {
      label: "Profile",
      icon: User,
      path: "/driver/profile",
      description: "Manage your profile"
    },
    {
      label: "Scheduled Rides",
      icon: Calendar,
      path: "/driver/scheduled",
      description: "View upcoming rides"
    },
    {
      label: "Ongoing Rides",
      icon: Clock,
      path: "/driver/ongoing",
      description: "Current active rides"
    }
  ];

  const currentItem = menuItems.find(item => item.path === location.pathname) || menuItems[0];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
                {profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <currentItem.icon className="h-4 w-4" />
                <span className="font-medium">{currentItem.label}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {currentItem.description}
              </div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64 bg-white" align="start">
        {menuItems.map((item) => (
          <DropdownMenuItem
            key={item.path}
            onClick={() => {
              navigate(item.path);
              setIsOpen(false);
            }}
            className={`cursor-pointer ${
              location.pathname === item.path 
                ? 'bg-accent text-accent-foreground' 
                : ''
            }`}
          >
            <item.icon className="h-4 w-4 mr-3" />
            <div>
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-muted-foreground">
                {item.description}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-3" />
          <div>
            <div className="font-medium">Sign Out</div>
            <div className="text-xs text-muted-foreground">
              Logout from your account
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DriverNavigation;