
import { useNavigate } from "react-router-dom";
import { NotificationType } from "@/types/notifications";
import { formatDate } from "./utils/date-formatter";
import { NotificationContent } from "./NotificationContent";
import { NotificationPreview } from "./NotificationPreview";
import { CompactFriendActions } from "./CompactFriendActions";
import { AvatarWithIcon } from "./AvatarWithIcon";
import { NotificationReadIndicator } from "./NotificationReadIndicator";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface NotificationItemProps {
  notification: {
    id: string;
    type: NotificationType;
    sender: {
      id: string;
      username: string;
      avatar_url: string | null;
      full_name?: string;
    };
    created_at: string;
    message?: string;
    post_id?: string;
    comment_id?: string;
    read: boolean;
    post_content?: string;
    post_media?: string | null;
    comment_content?: string;
  };
  onHandleFriendRequest?: (notificationId: string, senderId: string, accept: boolean) => void;
  onClick?: () => void;
  onMarkAsRead?: () => void;
  onRemove?: () => void;
  compact?: boolean;
}

export const NotificationItem = ({ 
  notification, 
  onHandleFriendRequest, 
  onClick, 
  onMarkAsRead,
  onRemove,
  compact = false 
}: NotificationItemProps) => {
  const navigate = useNavigate();
  const [showRemoveButton, setShowRemoveButton] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const MIN_SWIPE_DISTANCE = 50;

  // Get the name to display (full name or username)
  const getSenderDisplayName = () => {
    return notification.sender.full_name || notification.sender.username;
  };

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger click if we're showing remove button or swiping
    if (showRemoveButton || Math.abs(translateX) > 20) {
      setShowRemoveButton(false);
      setTranslateX(0);
      return;
    }

    if (notification.type === 'friend_request') {
      return; // No navigation for friend requests
    }
    
    if (onClick) {
      onClick();
    } else if (notification.post_id) {
      navigate(`/post/${notification.post_id}`);
      
      if (onMarkAsRead) {
        onMarkAsRead();
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchCurrentX.current - touchStartX.current;
    
    // Only allow swipe left (negative values) up to -80px
    if (diff < 0 && diff > -80) {
      setTranslateX(diff);
    }
  };

  const handleTouchEnd = () => {
    const diff = touchCurrentX.current - touchStartX.current;
    
    if (diff < -MIN_SWIPE_DISTANCE) {
      // Show remove button
      setShowRemoveButton(true);
      setTranslateX(-80);
    } else {
      // Reset position
      setShowRemoveButton(false);
      setTranslateX(0);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
    setShowRemoveButton(false);
    setTranslateX(0);
  };

  const handleResetSwipe = () => {
    setShowRemoveButton(false);
    setTranslateX(0);
  };

  const isClickable = notification.post_id || notification.type === 'friend_request';
  const formattedDate = formatDate(notification.created_at);

  return (
    <div className="relative overflow-hidden">
      <div 
        className={`flex items-start gap-4 hover:bg-muted/50 transition-colors border-b last:border-b-0 ${
          isClickable ? 'cursor-pointer' : ''
        } ${!notification.read ? 'bg-primary/5' : ''} ${
          compact ? 'p-3' : 'p-4'
        }`}
        onClick={isClickable ? handleClick : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          transform: `translateX(${translateX}px)`,
          transition: 'transform 0.2s ease'
        }}
      >
        <AvatarWithIcon
          avatarUrl={notification.sender.avatar_url}
          username={notification.sender.username}
          notificationType={notification.type}
          compact={compact}
        />
        
        <div className={`flex-1 ${compact ? 'pr-8' : ''}`}>
          <div className={compact ? 'text-sm' : ''}>
            <NotificationContent 
              type={notification.type}
              senderName={getSenderDisplayName()}
              message={notification.message}
              notificationId={notification.id}
              senderId={notification.sender.id}
              onHandleFriendRequest={onHandleFriendRequest}
              compact={compact}
            />
          </div>
          <p className={`text-muted-foreground ${compact ? 'text-xs mt-0.5' : 'text-sm mt-1'}`}>
            {formattedDate}
          </p>
          
          {/* Preview of post or comment */}
          {!compact && notification.type !== 'friend_request' && (
            <NotificationPreview
              type={notification.type}
              postContent={notification.post_content}
              postMedia={notification.post_media}
              commentContent={notification.comment_content}
            />
          )}
          
          {/* Compact friend request actions */}
          {compact && notification.type === 'friend_request' && onHandleFriendRequest && (
            <CompactFriendActions
              notificationId={notification.id}
              senderId={notification.sender.id}
              onHandleFriendRequest={onHandleFriendRequest}
            />
          )}
        </div>
        
        {/* Read indicator and menu */}
        <NotificationReadIndicator
          type={notification.type}
          isRead={notification.read}
          onMarkAsRead={onMarkAsRead}
          compact={compact}
        />
      </div>

      {/* Delete button that appears when swiped */}
      <div 
        className="absolute top-0 right-0 bottom-0 flex items-center justify-center bg-red-500 text-white"
        style={{ 
          width: '80px',
          transform: showRemoveButton ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.2s ease'
        }}
      >
        <Button 
          variant="ghost" 
          className="h-full w-full text-white hover:bg-red-600 rounded-none"
          onClick={handleRemove}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Tap outside to reset swipe */}
      {showRemoveButton && (
        <div 
          className="fixed inset-0 z-50" 
          onClick={handleResetSwipe}
        />
      )}
    </div>
  );
};
