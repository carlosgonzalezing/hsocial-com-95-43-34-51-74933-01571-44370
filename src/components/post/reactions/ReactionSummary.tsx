import React, { useState } from "react";
import { reactionIcons } from "./ReactionIcons";
import { ReactionsListDialog } from "./ReactionsListDialog";

interface ReactionSummaryProps {
  reactions: Record<string, number>;
  postId: string;
}

export function ReactionSummary({ reactions, postId }: ReactionSummaryProps) {
  const [showDialog, setShowDialog] = useState(false);
  
  // Obtener el conteo total
  const totalCount = Object.values(reactions).reduce((sum, count) => sum + count, 0);
  
  if (totalCount === 0) {
    return null;
  }

  // Ordenar las reacciones por conteo (las más populares primero)
  const sortedReactions = Object.entries(reactions)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  // Obtener los emojis de las reacciones más populares (máximo 5)
  const topReactionEmojis = sortedReactions.slice(0, 5).map(([type]) => {
    const reaction = reactionIcons[type as keyof typeof reactionIcons];
    return reaction?.emoji || "❤️";
  });

  return (
    <>
      {/* Instagram style: emojis in a row with total count */}
      <button 
        className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setShowDialog(true)}
      >
        {/* Emoji row */}
        <span className="flex items-center -space-x-1">
          {topReactionEmojis.map((emoji, idx) => (
            <span 
              key={idx} 
              className="text-base inline-flex items-center justify-center w-5 h-5 rounded-full bg-white dark:bg-gray-800 border border-border"
            >
              {emoji}
            </span>
          ))}
        </span>
        
        {/* Total count */}
        <span className="text-sm font-medium text-muted-foreground">
          {totalCount}
        </span>
      </button>
      
      <ReactionsListDialog
        postId={postId}
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}
