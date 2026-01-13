import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";

interface PremiumBadgeProps {
  isPremium: boolean;
  className?: string;
}

export function PremiumBadge({ isPremium, className }: PremiumBadgeProps) {
  if (!isPremium) return null;

  return (
    <Badge variant="secondary" className={`flex items-center gap-1 ${className}`}>
      <Crown className="h-3.5 w-3.5" />
      Premium Pro
    </Badge>
  );
}
