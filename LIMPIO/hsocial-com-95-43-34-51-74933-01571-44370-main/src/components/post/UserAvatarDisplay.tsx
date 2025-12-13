
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface UserAvatarDisplayProps {
  currentUser: { 
    id: string;
    avatar_url: string | null;
    username: string | null;
  } | null;
}

export function UserAvatarDisplay({ currentUser }: UserAvatarDisplayProps) {
  // If no user id is provided, just render the avatar without a link
  if (!currentUser?.id) {
    return (
      <Avatar className="h-10 w-10 border-2 border-primary/10">
        <AvatarImage 
          src={currentUser?.avatar_url || undefined} 
          alt={currentUser?.username || "Usuario"}
        />
        <AvatarFallback>{currentUser?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
      </Avatar>
    );
  }
  
  // If user id exists, wrap in a Link to profile
  return (
    <Link to={`/profile/${currentUser.id}`}>
      <Avatar className="h-10 w-10 border-2 border-primary/10 hover:border-primary/30 transition-colors">
        <AvatarImage 
          src={currentUser.avatar_url || undefined} 
          alt={currentUser.username || "Usuario"}
        />
        <AvatarFallback>{currentUser.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
      </Avatar>
    </Link>
  );
}
