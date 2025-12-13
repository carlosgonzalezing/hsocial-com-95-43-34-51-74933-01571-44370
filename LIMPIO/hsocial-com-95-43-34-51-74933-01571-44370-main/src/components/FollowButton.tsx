import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { followUser, unfollowUser, isFollowing } from "@/lib/api/followers";
import { supabase } from "@/integrations/supabase/client";

interface FollowButtonProps {
  targetUserId: string;
  size?: "sm" | "default" | "lg" | "icon";
  batchFollowingStatus?: boolean;
  onBatchFollowingUpdate?: (userId: string, isFollowing: boolean) => void;
}

export function FollowButton({ 
  targetUserId, 
  size = "default", 
  batchFollowingStatus,
  onBatchFollowingUpdate 
}: FollowButtonProps) {
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          
          // Don't check relationship with self
          if (user.id === targetUserId) {
            setIsLoading(false);
            return;
          }
          
          // Use batch status if provided, otherwise fallback to individual query
          if (batchFollowingStatus !== undefined) {
            setIsFollowingUser(batchFollowingStatus);
            setIsLoading(false);
          } else {
            const following = await isFollowing(targetUserId);
            setIsFollowingUser(following);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
        setIsLoading(false);
      }
    };

    checkCurrentUser();
  }, [targetUserId, batchFollowingStatus]);

  const handleFollowToggle = async () => {
    if (!currentUserId) return;
    
    setIsLoading(true);
    try {
      if (isFollowingUser) {
        const success = await unfollowUser(targetUserId);
        if (success) {
          setIsFollowingUser(false);
          onBatchFollowingUpdate?.(targetUserId, false);
        }
      } else {
        const success = await followUser(targetUserId);
        if (success) {
          setIsFollowingUser(true);
          onBatchFollowingUpdate?.(targetUserId, true);
        }
      }
    } catch (error) {
      console.error('Error in follow toggle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button for own profile
  if (currentUserId === targetUserId) {
    return null;
  }

  const buttonText = isFollowingUser ? "Siguiendo" : "Seguir";
  const buttonIcon = isFollowingUser ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />;
  const buttonVariant = isFollowingUser ? "secondary" : "default";

  return (
    <Button
      variant={buttonVariant}
      size={size}
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={`flex items-center gap-2 ${size === "sm" ? "px-3 py-1 h-8 text-xs" : "min-w-[100px]"}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {size !== "icon" && buttonIcon}
          <span>{buttonText}</span>
        </>
      )}
    </Button>
  );
}