
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { FriendSuggestion } from "@/types/friends";
import { FollowButton } from "@/components/FollowButton";

interface PeopleYouMayKnowItemProps {
  suggestion: FriendSuggestion;
  onDismiss: (id: string) => void;
}

export function PeopleYouMayKnowItem({ 
  suggestion, 
  onDismiss
}: PeopleYouMayKnowItemProps) {
  return (
    <div className="relative rounded-lg p-3 hover:bg-muted/30 transition-colors">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full bg-gray-200 dark:bg-gray-700 opacity-70 hover:opacity-100 z-10"
        onClick={() => onDismiss(suggestion.id)}
      >
        <X className="h-3 w-3" />
      </Button>
      
      <div className="flex flex-col items-center text-center gap-2 h-[180px] justify-between">
        <div className="flex flex-col items-center">
          <Link to={`/profile/${suggestion.id}`}>
            <Avatar className="h-16 w-16">
              <AvatarImage src={suggestion.avatar_url || undefined} />
              <AvatarFallback>
                {suggestion.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="mt-2">
            <Link to={`/profile/${suggestion.id}`} className="font-medium text-sm hover:underline line-clamp-1">
              {suggestion.username}
            </Link>
          </div>
        </div>
        
        <div className="flex-1 flex items-center">
          {suggestion.mutual_friends_count > 0 && (
            <div className="text-xs text-muted-foreground">
              <span className="line-clamp-1">
                {suggestion.mutual_friends_count} {suggestion.mutual_friends_count === 1 ? 'seguidor' : 'seguidores'} en común
              </span>
            </div>
          )}
        </div>
        
        <FollowButton 
          targetUserId={suggestion.id}
          size="sm"
        />
      </div>
    </div>
  );
}
