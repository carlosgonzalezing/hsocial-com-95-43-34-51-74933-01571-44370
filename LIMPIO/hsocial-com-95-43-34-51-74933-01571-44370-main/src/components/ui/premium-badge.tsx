import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  className?: string;
  variant?: "small" | "large";
}

export function PremiumBadge({ className, variant = "small" }: PremiumBadgeProps) {
  const sizes = {
    small: "h-5 w-5",
    large: "h-6 w-6"
  };

  return (
    <div className={cn(
      "absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full p-1 shadow-lg border-2 border-white",
      className
    )}>
      <Crown className={cn("text-white", sizes[variant])} />
    </div>
  );
}