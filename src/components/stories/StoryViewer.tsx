import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Heart, Send } from "lucide-react";
import { useStoryViewer } from "@/hooks/stories/use-story-viewer";
import { cn } from "@/lib/utils";

interface StoryViewerProps {
  storyId: string;
  allStories: any[];
  onClose: () => void;
  onNavigate: (storyId: string) => void;
}

export function StoryViewer({ storyId, allStories, onClose, onNavigate }: StoryViewerProps) {
  const {
    currentStory,
    currentMediaIndex,
    progress,
    isPaused,
    isLoading,
    handleNext,
    handlePrevious,
    handlePause,
    handleResume,
    handleReaction,
  } = useStoryViewer(storyId, allStories, onNavigate, onClose);

  const [showReactionAnimation, setShowReactionAnimation] = useState(false);

  const handleReactionClick = async () => {
    await handleReaction();
    setShowReactionAnimation(true);
    setTimeout(() => setShowReactionAnimation(false), 1000);
  };

  const currentUserIndex = allStories.findIndex((s) => s.id === storyId);
  const hasPrevUser = currentUserIndex > 0;
  const hasNextUser = currentUserIndex < allStories.length - 1;

  const handlePrevUser = () => {
    if (hasPrevUser) {
      onNavigate(allStories[currentUserIndex - 1].id);
    }
  };

  const handleNextUser = () => {
    if (hasNextUser) {
      onNavigate(allStories[currentUserIndex + 1].id);
    } else {
      onClose();
    }
  };

  if (!currentStory) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full h-[90vh] p-0 bg-black border-none">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Progress bars */}
          <div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
            {currentStory.media_items?.map((_, index) => (
              <div
                key={index}
                className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{
                    width:
                      index < currentMediaIndex
                        ? "100%"
                        : index === currentMediaIndex
                        ? `${progress}%`
                        : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-4 left-2 right-2 z-20 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 border-2 border-white">
                <AvatarImage src={currentStory.avatar_url || undefined} />
                <AvatarFallback>
                  {currentStory.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white text-sm font-semibold">
                  {currentStory.username}
                </p>
                <p className="text-white/70 text-xs">{currentStory.time_ago}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Story Image/Video */}
          <div
            className="w-full h-full flex items-center justify-center"
            onTouchStart={handlePause}
            onTouchEnd={handleResume}
            onMouseDown={handlePause}
            onMouseUp={handleResume}
          >
            <img
              src={currentStory.media_items?.[currentMediaIndex]?.url}
              alt="Story"
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Navigation areas (invisible) */}
          <div className="absolute inset-0 flex z-10">
            <button
              className="flex-1"
              onClick={handlePrevious}
              aria-label="Previous"
            />
            <button
              className="flex-1"
              onClick={handleNext}
              aria-label="Next"
            />
          </div>

          {/* User Navigation Arrows */}
          {hasPrevUser && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-white bg-black/50 hover:bg-black/70"
              onClick={handlePrevUser}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}
          {hasNextUser && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-white bg-black/50 hover:bg-black/70"
              onClick={handleNextUser}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          )}

          {/* Bottom Actions */}
          <div className="absolute bottom-4 left-2 right-2 z-20 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-white hover:bg-white/20 transition-transform",
                showReactionAnimation && "scale-125"
              )}
              onClick={handleReactionClick}
            >
              <Heart
                className={cn(
                  "w-6 h-6",
                  showReactionAnimation && "fill-red-500 text-red-500"
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>

          {/* Heart Animation */}
          {showReactionAnimation && (
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
              <Heart className="w-24 h-24 text-red-500 fill-red-500 animate-ping" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
