// 3 tipos de reacciones para H Social

import { Heart, Lightbulb, Rocket } from "lucide-react";

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
} as const;

export type ReactionType = keyof typeof reactionIcons;