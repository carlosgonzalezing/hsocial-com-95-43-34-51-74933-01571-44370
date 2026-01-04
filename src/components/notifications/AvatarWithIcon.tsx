
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationIcon } from "./NotificationIcon";
import { NotificationType } from "@/types/notifications";

interface AvatarWithIconProps {
  avatarUrl: string | null;
  username: string;
  notificationType: NotificationType;
  compact?: boolean;
}

export function AvatarWithIcon({ 
  avatarUrl, 
  username, 
  notificationType, 
  compact = false 
}: AvatarWithIconProps) {
  return (
    <div className="relative">
      <Avatar className={compact ? "h-10 w-10" : ""}>
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback>{username[0]}</AvatarFallback>
      </Avatar>
      <div className="absolute -bottom-1 -right-1 rounded-full bg-blue-500 p-1 border-2 border-background">
        <NotificationIcon type={notificationType} />
      </div>
    </div>
  );
}
