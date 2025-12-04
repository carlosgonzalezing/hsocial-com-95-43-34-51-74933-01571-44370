
import { LucideIcon } from "lucide-react";

export interface NavigationLink {
  to: string;
  icon: LucideIcon;
  label: string;
  hideLabel?: boolean; // Added this property to hide labels on mobile
  onClick?: () => void;
  badge?: number | null;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}
