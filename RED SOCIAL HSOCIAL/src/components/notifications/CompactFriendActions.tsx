
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface CompactFriendActionsProps {
  notificationId: string;
  senderId: string;
  onHandleFriendRequest: (notificationId: string, senderId: string, accept: boolean) => void;
}

export const CompactFriendActions = ({
  notificationId,
  senderId,
  onHandleFriendRequest
}: CompactFriendActionsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex gap-2 mt-2">
      <Button
        size="sm"
        variant="default"
        onClick={(e) => {
          e.stopPropagation();
          onHandleFriendRequest(notificationId, senderId, true);
        }}
        className={`${isMobile ? 'h-8' : 'h-7'} px-3 text-xs w-full`}
      >
        Confirmar
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={(e) => {
          e.stopPropagation();
          onHandleFriendRequest(notificationId, senderId, false);
        }}
        className={`${isMobile ? 'h-8' : 'h-7'} px-3 text-xs w-full`}
      >
        Eliminar
      </Button>
    </div>
  );
};
