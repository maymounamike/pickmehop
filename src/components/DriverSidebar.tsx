import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  ClipboardList, 
  Clock, 
  CheckCircle,
  User,
  Calendar
} from "lucide-react";

interface DriverSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  stats: {
    pendingRides: number;
    completedRides: number;
  };
}

const DriverSidebar = ({ activeTab, onTabChange, stats }: DriverSidebarProps) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const menuItems = [
    {
      id: "unassigned",
      label: "Available Rides",
      icon: Calendar,
      description: "Rides available for you"
    },
    {
      id: "confirmed",
      label: "Confirmed Rides",
      icon: ClipboardList,
      count: stats.pendingRides,
      description: "Your assigned rides"
    },
    {
      id: "completed",
      label: "Completed",
      icon: CheckCircle,
      count: stats.completedRides,
      description: "Finished rides"
    },
    {
      id: "profile",
      label: "My Profile",
      icon: User,
      description: "Profile & vehicle info"
    }
  ];

  return (
    <Sidebar
      className={`${isCollapsed ? "w-16" : "w-64"} bg-gradient-to-b from-emerald-600 to-emerald-800 border-r-0`}
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end text-white hover:bg-white/20" />
      
      <SidebarContent className="bg-transparent">
        <SidebarGroup>
          <SidebarGroupLabel className="text-emerald-100 font-semibold px-4 py-2">
            {!isCollapsed && "Driver Panel"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    asChild
                    className={`
                      mx-2 rounded-lg transition-all duration-200
                      ${activeTab === item.id 
                        ? 'bg-white text-emerald-800 shadow-md font-semibold' 
                        : 'text-white hover:bg-white/20 hover:text-white'
                      }
                    `}
                  >
                    <button
                      onClick={() => onTabChange(item.id)}
                      className="w-full flex items-center justify-start p-3"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="ml-3 flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.label}</span>
                            {item.count !== undefined && (
                              <span className={`
                                text-xs px-2 py-1 rounded-full
                                ${activeTab === item.id 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-white/20 text-white'
                                }
                              `}>
                                {item.count}
                              </span>
                            )}
                          </div>
                          <div className={`
                            text-xs mt-1
                            ${activeTab === item.id 
                              ? 'text-emerald-600' 
                              : 'text-emerald-100'
                            }
                          `}>
                            {item.description}
                          </div>
                        </div>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DriverSidebar;