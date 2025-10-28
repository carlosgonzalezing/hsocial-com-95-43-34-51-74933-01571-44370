import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Story {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  has_viewed: boolean;
  story_count: number;
}

interface StoryCircleProps {
  story?: Story;
  isCreate?: boolean;
  onClick?: () => void;
  currentUserAvatar?: string | null;
  currentUsername?: string;
}

export function StoryCircle({ story, isCreate, onClick, currentUserAvatar, currentUsername }: StoryCircleProps) {
  if (isCreate) {
    return (
      <button
        onClick={onClick}
        className="flex-shrink-0 flex flex-col items-center gap-1 group"
      >
        <div className="relative">
          {/* User avatar with dashed border */}
          <div className="w-16 h-16 rounded-full p-[2px] border-2 border-dashed border-muted-foreground hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
              <Avatar className="w-full h-full">
                <AvatarImage src={currentUserAvatar || undefined} />
                <AvatarFallback className="bg-muted text-foreground">
                  {currentUsername?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          {/* Small plus icon in bottom right corner */}
          <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#1877F2] border-2 border-background flex items-center justify-center">
            <Plus className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        </div>
        <span className="text-xs font-medium max-w-16 truncate text-foreground">
          Tu historia
        </span>
      </button>
    );
  }

  const hasGradient = !story?.has_viewed;

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 flex flex-col items-center gap-1 group"
    >
      <div className="relative">
        {/* Border for stories */}
        <div
          className={cn(
            "w-16 h-16 rounded-full p-[2px] transition-all",
            hasGradient
              ? "bg-[#1877F2]"
              : "bg-border"
          )}
        >
          <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
            <Avatar className="w-full h-full">
              <AvatarImage src={story?.avatar_url || undefined} />
              <AvatarFallback className="bg-muted text-foreground">
                {story?.username?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Story count badge */}
        {story && story.story_count > 1 && (
          <div className="absolute -bottom-1 -right-1 bg-[#1877F2] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-background">
            {story.story_count}
          </div>
        )}
      </div>
      <span className="text-xs font-medium max-w-16 truncate text-foreground">
        {story?.username || "Usuario"}
      </span>
    </button>
  );
}
