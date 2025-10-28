import { Heart, Star, Lightbulb, HandshakeIcon } from "lucide-react";

export const reactionIcons = {
  love: { 
    icon: Heart, 
    color: "text-red-500", 
    label: "Me Encanta",
    emoji: "❤️",
    animationClass: "reaction-love",
    size: "text-3xl"
  },
  awesome: {
    icon: Star,
    color: "text-yellow-400",
    label: "Éxito",
    emoji: "⭐",
    animationClass: "reaction-awesome",
    size: "text-3xl"
  },
  haha: {
    icon: Heart,
    color: "text-yellow-500",
    label: "Me Divierte",
    emoji: "😂",
    animationClass: "reaction-haha",
    size: "text-3xl"
  },
  join: {
    icon: HandshakeIcon,
    color: "text-yellow-400",
    label: "Me Uno",
    emoji: "🤝",
    animationClass: "reaction-join",
    size: "text-3xl"
  },
  wow: {
    icon: Heart,
    color: "text-purple-400",
    label: "Me sorprende",
    emoji: "😮",
    animationClass: "reaction-wow",
    size: "text-3xl"
  },
  angry: {
    icon: Heart,
    color: "text-red-600",
    label: "Me Enoja",
    emoji: "😠",
    animationClass: "reaction-angry",
    size: "text-3xl"
  },
  interesting: {
    icon: Lightbulb,
    color: "text-orange-500",
    label: "Gran idea",
    emoji: "💡",
    animationClass: "reaction-interesting",
    size: "text-3xl"
  }
} as const;

export type ReactionType = keyof typeof reactionIcons;
