
import { Heart, MessageCircle, UserPlus, MessageSquare, Bell } from "lucide-react";
import type { NotificationType } from "@/types/notifications";

export const NotificationIcon = ({ type, className = "" }: { type: NotificationType, className?: string }) => {
  const size = className ? undefined : "h-4 w-4";
  
  switch (type) {
    case "friend_request":
    case "friend_accepted":
      return <UserPlus className={`${size} text-blue-500 ${className}`} />;
    case "message":
      return <MessageCircle className={`${size} text-blue-500 ${className}`} />;
    case "post_like":
      return <Heart className={`${size} text-red-500 ${className}`} />;
    case "post_comment":
    case "comment_reply":
      return <MessageSquare className={`${size} text-blue-500 ${className}`} />;
    case "new_post":
      return <Bell className={`${size} text-purple-500 ${className}`} />;
    default:
      return <Bell className={`${size} text-gray-500 ${className}`} />;
  }
};
