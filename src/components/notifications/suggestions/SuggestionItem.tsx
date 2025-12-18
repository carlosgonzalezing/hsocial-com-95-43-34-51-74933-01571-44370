
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X, UserPlus, UserCheck, Briefcase, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FriendSuggestion } from "@/types/friends";
import { useIsMobile } from "@/hooks/use-mobile";

interface SuggestionItemProps {
  suggestion: FriendSuggestion;
  isPending: boolean;
  isLoading: boolean;
  onAddFriend: (userId: string) => void;
  onDismiss: (userId: string) => void;
  setOpen: (open: boolean) => void;
}

export function SuggestionItem({
  suggestion,
  isPending,
  isLoading,
  onAddFriend,
  onDismiss,
  setOpen
}: SuggestionItemProps) {
  const isMobile = useIsMobile();
  
  return (
    <div 
      className={`p-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        suggestion.careerMatch || suggestion.semesterMatch ? 'bg-primary/5' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <Link to={`/profile/${suggestion.id}`} onClick={() => setOpen(false)}>
          <Avatar>
            <AvatarImage src={suggestion.avatar_url || undefined} />
            <AvatarFallback>{suggestion.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <Link 
            to={`/profile/${suggestion.id}`}
            className="font-medium hover:underline"
            onClick={() => setOpen(false)}
          >
            {suggestion.username}
          </Link>
          <div className="flex flex-wrap gap-2 mt-1">
            {suggestion.career && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Briefcase className="inline-block h-3 w-3 mr-1" />
                <span className={suggestion.careerMatch ? "font-medium text-primary" : ""}>
                  {suggestion.career.length > 20 ? suggestion.career.substring(0, 20) + "..." : suggestion.career}
                  {suggestion.careerMatch && 
                    <Badge variant="outline" className="ml-1 bg-primary/10 text-primary text-[10px] py-0 h-4">
                      Coincide
                    </Badge>
                  }
                </span>
              </div>
            )}
            {suggestion.semester && (
              <div className="flex items-center text-xs text-muted-foreground">
                <GraduationCap className="inline-block h-3 w-3 mr-1" />
                <span className={suggestion.semesterMatch ? "font-medium text-primary" : ""}>
                  {suggestion.semester}
                  {suggestion.semesterMatch && 
                    <Badge variant="outline" className="ml-1 bg-primary/10 text-primary text-[10px] py-0 h-4">
                      Coincide
                    </Badge>
                  }
                </span>
              </div>
            )}
          </div>
          {suggestion.mutual_friends_count > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              {suggestion.mutual_friends_count} amigos en común
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 ml-auto mt-2 sm:mt-0">
        {isPending ? (
          <Button 
            size="sm" 
            variant="outline"
            className="h-8 flex items-center gap-1"
            disabled
          >
            <UserCheck className="h-4 w-4" />
            <span>Enviado</span>
          </Button>
        ) : (
          <Button 
            size="sm" 
            variant="default"
            className="h-8 flex items-center gap-1"
            onClick={() => onAddFriend(suggestion.id)}
            disabled={isLoading}
          >
            <UserPlus className="h-4 w-4" />
            <span>Añadir</span>
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          onClick={() => onDismiss(suggestion.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
