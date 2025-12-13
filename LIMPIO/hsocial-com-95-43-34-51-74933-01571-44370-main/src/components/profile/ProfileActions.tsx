import { Button } from "@/components/ui/button";
import { Edit2, Heart, MessageCircle } from "lucide-react";
import { FollowButton } from "@/components/FollowButton";
import { ProfileOptionsMenu } from "./ProfileOptionsMenu";
import { useNavigate } from "react-router-dom";
import { useChatSystem } from "@/hooks/use-chat-system";

interface ProfileActionsProps {
  isOwner: boolean;
  profileId: string;
  username?: string;
  avatarUrl?: string | null;
  hasGivenHeart: boolean;
  heartLoading: boolean;
  currentUserId: string | null;
  onEditClick: () => void;
  onMessageClick: () => void;
  onToggleHeart: () => void;
}

export function ProfileActions({
  isOwner,
  profileId,
  username = 'usuario',
  avatarUrl,
  hasGivenHeart,
  heartLoading,
  currentUserId,
  onEditClick,
  onMessageClick,
  onToggleHeart
}: ProfileActionsProps) {
  const navigate = useNavigate();

  const handleMessageClick = () => {
    // Navegar a la página de mensajes con el parámetro user para abrir el chat privado
    navigate(`/messages?user=${profileId}`);
  };

  if (isOwner) {
    return (
      <Button variant="outline" onClick={onEditClick}>
        <Edit2 className="h-4 w-4 mr-2" />
        Editar perfil
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleMessageClick}>
        <MessageCircle className="h-4 w-4 mr-2" />
        Mensaje
      </Button>
      <FollowButton targetUserId={profileId} />
      <ProfileOptionsMenu profileId={profileId} username={username} />
    </div>
  );
}
