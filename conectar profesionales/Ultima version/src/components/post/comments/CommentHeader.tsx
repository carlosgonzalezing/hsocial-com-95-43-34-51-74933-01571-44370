import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommentAuthor } from "./CommentAuthor";
import { useNavigate } from "react-router-dom";

interface CommentHeaderProps {
  userId: string;
  profileData?: {
    username?: string;
    avatar_url?: string;
    id?: string;
  };
  timestamp: string;
  isReply?: boolean;
  postAuthorId?: string;
}

export function CommentHeader({ userId, profileData, timestamp, isReply = false, postAuthorId }: CommentHeaderProps) {
  const navigate = useNavigate();
  const username = profileData?.username || "Usuario";
  const avatarUrl = profileData?.avatar_url;

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="flex items-start gap-2">
      <button 
        onClick={handleAvatarClick}
        className="flex-shrink-0 transition-opacity hover:opacity-80"
      >
        <Avatar className={`${isReply ? 'h-6 w-6' : 'h-8 w-8'}`}>
          <AvatarImage src={avatarUrl || undefined} alt={username} />
          <AvatarFallback>{username[0]?.toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
      </button>
      <CommentAuthor 
        userId={userId}
        username={username}
        timestamp={timestamp}
        isPostAuthor={postAuthorId === userId}
      />
    </div>
  );
}
