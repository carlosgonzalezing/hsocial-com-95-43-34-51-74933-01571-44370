import { Button } from "@/components/ui/button";
import { Edit2, Heart, MessageCircle } from "lucide-react";
import { FollowButton } from "@/components/FollowButton";
import { ProfileOptionsMenu } from "./ProfileOptionsMenu";

interface ProfileActionsProps {
  isOwner: boolean;
  profileId: string;
  username?: string;
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
  hasGivenHeart,
  heartLoading,
  currentUserId,
  onEditClick,
  onMessageClick,
  onToggleHeart
}: ProfileActionsProps) {
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
      <Button variant="outline" onClick={onMessageClick}>
        <MessageCircle className="h-4 w-4 mr-2" />
        Mensaje
      </Button>
      <FollowButton targetUserId={profileId} />
      <ProfileOptionsMenu profileId={profileId} username={username} />
    </div>
  );
}
