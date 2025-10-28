import React from "react";
import { reactionIcons, type ReactionType } from "./ReactionIcons";
import { cn } from "@/lib/utils";

interface ReactionMenuProps {
  show: boolean;
  activeReaction: ReactionType | null;
  setActiveReaction: (reaction: ReactionType | null) => void;
  onReactionSelected: (type: ReactionType) => void;
  onPointerLeave: () => void;
}

export function ReactionMenu({
  show,
  activeReaction,
  setActiveReaction,
  onReactionSelected,
  onPointerLeave,
}: ReactionMenuProps) {
  if (!show) return null;

  const reactionTypes: ReactionType[] = ["interesting", "love", "awesome", "haha", "join", "wow", "angry"];
  
  return (
    <div
      className={cn(
        "flex items-center gap-1.5",
        "bg-white dark:bg-gray-900 border border-border rounded-2xl",
        "px-3 py-2.5 shadow-xl transition-all duration-200",
        "flex-nowrap min-w-max",
        show ? "opacity-100 scale-100" : "opacity-0 scale-95",
      )}
      onPointerLeave={onPointerLeave}
    >
      {reactionTypes.map((type) => {
        const reaction = reactionIcons[type];
        const isActive = activeReaction === type;
        return (
          <button
            key={type}
            className={cn(
              "flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all duration-150",
              "hover:scale-110 hover:bg-muted/50 flex-shrink-0",
              isActive && "scale-110 bg-muted"
            )}
            onClick={() => onReactionSelected(type)}
            onPointerEnter={() => setActiveReaction(type)}
            onPointerLeave={() => setActiveReaction(null)}
          >
            <span className="text-2xl leading-none block">{reaction.emoji}</span>
            <span className="text-[9px] font-medium text-muted-foreground whitespace-nowrap">
              {reaction.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
