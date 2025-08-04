import { CheckCircle, Clock, XCircle, AlertTriangle, FileX } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type VerificationStatus = 
  | "not_verified" 
  | "pending_verification" 
  | "under_review" 
  | "verified" 
  | "rejected" 
  | "documents_missing";

interface VerificationBadgeProps {
  status: VerificationStatus;
  className?: string;
}

const statusConfig = {
  not_verified: {
    label: "Not Verified",
    icon: XCircle,
    className: "bg-muted text-muted-foreground",
  },
  pending_verification: {
    label: "Pending Verification",
    icon: Clock,
    className: "bg-secondary text-secondary-foreground",
  },
  under_review: {
    label: "Under Review",
    icon: Clock,
    className: "bg-info text-info-foreground",
  },
  verified: {
    label: "Verified",
    icon: CheckCircle,
    className: "bg-success text-success-foreground",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-destructive text-destructive-foreground",
  },
  documents_missing: {
    label: "Documents Missing",
    icon: FileX,
    className: "bg-warning text-warning-foreground",
  },
};

export const VerificationBadge = ({ status, className }: VerificationBadgeProps) => {
  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <Badge 
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium ${config.className} ${className}`}
    >
      <IconComponent className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};