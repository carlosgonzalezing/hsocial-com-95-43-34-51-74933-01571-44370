import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, UserPlus, Check } from "lucide-react";
import { useFriendshipStatus } from "@/hooks/use-friendship-status";
import { useNavigate } from "react-router-dom";

interface ReactionUserItemProps {
  reaction: {
    id: string;
    reaction_type: string;
    user_id: string;
    username: string;
    avatar_url?: string;
    career?: string;
    mutualFriendsCount?: number;
  };
  currentUserId?: string;
  getReactionEmoji: (type: string) => string;
}

export function ReactionUserItem({ reaction, currentUserId, getReactionEmoji }: ReactionUserItemProps) {
  const navigate = useNavigate();
  const { isFriend, isPending, sendFriendRequest } = useFriendshipStatus(reaction.user_id);
  const isOwnProfile = currentUserId === reaction.user_id;

  const handleSendMessage = () => {
    navigate("/messages", { state: { userId: reaction.user_id } });
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-12 w-12 flex-shrink-0">
          {reaction.avatar_url ? (
            <AvatarImage src={reaction.avatar_url} alt={reaction.username} />
          ) : (
            <AvatarFallback>
              {reaction.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">{reaction.username}</span>
            <span className="text-lg">{getReactionEmoji(reaction.reaction_type)}</span>
          </div>
          
          {reaction.mutualFriendsCount !== undefined && reaction.mutualFriendsCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {reaction.mutualFriendsCount} {reaction.mutualFriendsCount === 1 ? "amigo en común" : "amigos en común"}
            </p>
          )}
          
          {reaction.career && (
            <Badge variant="outline" className="mt-1 text-xs">
              🎓 {reaction.career}
            </Badge>
          )}
        </div>
      </div>

      {!isOwnProfile && (
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSendMessage}
            className="h-8"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Mensaje
          </Button>
          
          {isFriend ? (
            <Button variant="ghost" size="sm" disabled className="h-8">
              <Check className="w-4 h-4 mr-1" />
              Amigos
            </Button>
          ) : isPending ? (
            <Button variant="ghost" size="sm" disabled className="h-8">
              Solicitud enviada
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={sendFriendRequest}
              className="h-8"
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Agregar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
