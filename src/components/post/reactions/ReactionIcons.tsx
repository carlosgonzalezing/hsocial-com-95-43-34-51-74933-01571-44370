// 3 tipos de reacciones para H Social

import { Handshake, Lightbulb, PartyPopper, Star, ThumbsUp } from "lucide-react";

export const reactionIcons = {
  love: {
    icon: ThumbsUp,
    color: "text-blue-600",
    label: "Me gusta",
    emoji: "👍",
    animationClass: "reaction-love",
    size: "text-3xl",
  },
  awesome: {
    icon: Lightbulb,
    color: "text-amber-600",
    label: "Interesante",
    emoji: "💡",
    animationClass: "reaction-awesome",
    size: "text-3xl",
  },
  incredible: {
    icon: Handshake,
    color: "text-emerald-600",
    label: "Apoyo",
    emoji: "🤝",
    animationClass: "reaction-incredible",
    size: "text-3xl",
  },
  funny: {
    icon: PartyPopper,
    color: "text-fuchsia-600",
    label: "Celebrar",
    emoji: "🎉",
    animationClass: "reaction-funny",
    size: "text-3xl",
  },
  surprised: {
    icon: Star,
    color: "text-yellow-600",
    label: "\u00datil",
    emoji: "⭐",
    animationClass: "reaction-surprised",
    size: "text-3xl",
  },
} as const;

export type ReactionType = keyof typeof reactionIcons;