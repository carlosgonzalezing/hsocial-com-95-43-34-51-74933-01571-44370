import { useNavigate } from "react-router-dom";
import { formatRelativeTime } from "@/lib/date-utils";
import { Badge } from "@/components/ui/badge";

interface CommentAuthorProps {
  userId: string;
  username: string;
  timestamp: string;
  isPostAuthor?: boolean;
}

export function CommentAuthor({ userId, username, timestamp, isPostAuthor = false }: CommentAuthorProps) {
  const navigate = useNavigate();
  const displayTime = formatRelativeTime(timestamp);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={handleClick}
        className="font-semibold text-sm hover:underline transition-all"
      >
        {username}
      </button>
      {isPostAuthor && (
        <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
          Autor
        </Badge>
      )}
      <span className="text-xs text-muted-foreground">
        {displayTime}
      </span>
    </div>
  );
}
