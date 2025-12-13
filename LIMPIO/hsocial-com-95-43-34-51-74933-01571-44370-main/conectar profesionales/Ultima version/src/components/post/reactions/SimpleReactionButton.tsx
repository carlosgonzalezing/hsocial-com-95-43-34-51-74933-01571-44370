import { Heart, Lightbulb, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SimpleReactionType } from "@/types/database/reaction.types";
import { cn } from "@/lib/utils";

interface SimpleReactionButtonProps {
  postId: string;
  userReaction: SimpleReactionType | null;
  reactions: Record<string, number>;
  onReactionClick: (type: SimpleReactionType) => void;
}

const reactionConfig = {
  love: { icon: Heart, label: "Me gusta", color: "text-red-500" },
  awesome: { icon: Lightbulb, label: "Idea brillante", color: "text-yellow-500" },
  incredible: { icon: Rocket, label: "Increíble", color: "text-blue-500" },
};

export function SimpleReactionButton({
  postId,
  userReaction,
  reactions,
  onReactionClick,
}: SimpleReactionButtonProps) {
  
  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
  
  const CurrentIcon = userReaction ? reactionConfig[userReaction].icon : Heart;
  const currentColor = userReaction ? reactionConfig[userReaction].color : "";

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onReactionClick(userReaction === 'love' ? 'love' : 'love')}
        className={cn(
          "gap-2 hover:bg-accent",
          userReaction && currentColor
        )}
      >
        <CurrentIcon className={cn("h-5 w-5", currentColor)} />
        {totalReactions > 0 && (
          <span className="text-sm font-medium">{totalReactions}</span>
        )}
      </Button>

      {/* Quick reaction options on hover */}
      <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {(Object.keys(reactionConfig) as SimpleReactionType[]).map((type) => {
          const { icon: Icon, label, color } = reactionConfig[type];
          return (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              onClick={() => onReactionClick(type)}
              className={cn("h-8 w-8 p-0", userReaction === type && color)}
              title={label}
            >
              <Icon className={cn("h-4 w-4", userReaction === type && color)} />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
