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
          {/* User avatar with blue gradient border */}
          <div className="w-[68px] h-[68px] rounded-full p-[2px] bg-gradient-to-br from-[#0095f6] via-[#0081d9] to-[#0095f6] hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center p-[3px]">
              <Avatar className="w-full h-full">
                <AvatarImage src={currentUserAvatar || undefined} />
                <AvatarFallback className="bg-gray-700 text-white">
                  {currentUsername?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          {/* Small plus icon in bottom right corner */}
          <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#0095f6] border-2 border-black flex items-center justify-center">
            <Plus className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        </div>
        <span className="text-xs font-medium max-w-[68px] truncate text-white">
          {currentUsername || "tu_historia"}
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
        {/* Gradient border for unviewed stories */}
        <div
          className={cn(
            "w-[68px] h-[68px] rounded-full p-[2px] transition-all",
            hasGradient
              ? "bg-gradient-to-br from-[#0095f6] via-[#0081d9] to-[#0095f6]"
              : "bg-gray-600"
          )}
        >
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center p-[3px]">
            <Avatar className="w-full h-full">
              <AvatarImage src={story?.avatar_url || undefined} />
              <AvatarFallback className="bg-gray-700 text-white">
                {story?.username?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Story count badge */}
        {story && story.story_count > 1 && (
          <div className="absolute -bottom-1 -right-1 bg-[#0095f6] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-black">
            {story.story_count}
          </div>
        )}
      </div>
      <span className="text-xs font-medium max-w-[68px] truncate text-white">
        {story?.username || "Usuario"}
      </span>
    </button>
  );
}
