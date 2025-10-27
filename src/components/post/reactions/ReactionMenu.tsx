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
  if (!show) return null; // Mostramos las 7 reacciones

  const reactionTypes: ReactionType[] = ["love", "awesome", "haha", "join", "wow", "angry", "interesting"];
  return (
    <div
      className={cn(
        "flex items-center gap-1",
        "bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-full",
        "px-2 py-1.5 shadow-2xl transition-all duration-200",
        // CORRECCIÓN CRÍTICA:
        // 'flex-nowrap' asegura que se mantenga en una línea.
        // 'min-w-max' fuerza que el ancho mínimo sea el necesario para el contenido (7 emojis).
        "flex-nowrap min-w-max",
        show ? "opacity-100 scale-100" : "opacity-0 scale-95",
      )}
      onPointerLeave={onPointerLeave}
    >
      {" "}
      {reactionTypes.map((type) => {
        const reaction = reactionIcons[type];
        const isActive = activeReaction === type;
        return (
          <button
            key={type}
            className={cn(
              "reaction-menu-item p-1 rounded-full transition-all duration-150 hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0",
              isActive && "scale-110 ring-2 ring-primary bg-gray-100 dark:bg-gray-800",
            )}
            onClick={() => onReactionSelected(type)}
            onPointerEnter={() => setActiveReaction(type)}
            onPointerLeave={() => setActiveReaction(null)}
            title={reaction.label}
          >
            <span className="text-xl leading-none block">{reaction.emoji}</span>{" "}
          </button>
        );
      })}{" "}
    </div>
  );
}
