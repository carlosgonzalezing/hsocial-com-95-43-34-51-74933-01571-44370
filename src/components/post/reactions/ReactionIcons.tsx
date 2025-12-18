// 3 tipos de reacciones para H Social

import { Heart, Lightbulb, Rocket, Smile, Sparkles } from "lucide-react";

export const reactionIcons = {
  love: {
    icon: Heart,
    color: "text-red-500",
    label: "Me gusta",
    emoji: "❤️",
    animationClass: "reaction-love",
    size: "text-3xl",
  },
  awesome: {
    icon: Lightbulb,
    color: "text-yellow-500",
    label: "Idea brillante",
    emoji: "💡",
    animationClass: "reaction-awesome",
    size: "text-3xl",
  },
  incredible: {
    icon: Rocket,
    color: "text-blue-500",
    label: "Increíble",
    emoji: "🚀",
    animationClass: "reaction-incredible",
    size: "text-3xl",
  },
  funny: {
    icon: Smile,
    color: "text-orange-500",
    label: "Me divierte",
    emoji: "😂",
    animationClass: "reaction-funny",
    size: "text-3xl",
  },
  surprised: {
    icon: Sparkles,
    color: "text-purple-500",
    label: "Me sorprende",
    emoji: "😮",
    animationClass: "reaction-surprised",
    size: "text-3xl",
  },
} as const;

export type ReactionType = keyof typeof reactionIcons;