import { Badge } from "@/components/ui/badge";

interface RoleIndicatorProps {
  role: string;
}

export const RoleIndicator = ({ role }: RoleIndicatorProps) => {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Administrator',
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: 'A'
        };
      case 'driver':
        return {
          label: 'Driver',
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: 'D'
        };
      case 'user':
        return {
          label: 'Customer',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: 'C'
        };
      case 'partner':
        return {
          label: 'Partner',
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: 'P'
        };
      default:
        return {
          label: 'User',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: 'U'
        };
    }
  };

  const config = getRoleConfig(role);

  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.className}`}>
        <span className="font-bold text-sm">{config.icon}</span>
      </div>
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    </div>
  );
};