
import { FriendRequest } from "@/hooks/use-friends";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FriendRequestItem } from "./FriendRequestItem";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface FriendRequestsListProps {
  requests: FriendRequest[];
  showHeader?: boolean;
  showViewAll?: boolean;
  onRespond: (requestId: string, accept: boolean) => Promise<void>;
}

export function FriendRequestsList({ 
  requests, 
  showHeader = true,
  showViewAll = false,
  onRespond 
}: FriendRequestsListProps) {
  const handleAccept = async (requestId: string) => {
    await onRespond(requestId, true);
  };
  
  const handleReject = async (requestId: string) => {
    await onRespond(requestId, false);
  };
  
  if (requests.length === 0) {
    return showHeader ? (
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-2">Solicitudes de amistad</h2>
        <p className="text-center text-muted-foreground py-4">
          No tienes solicitudes de amistad pendientes
        </p>
      </Card>
    ) : null;
  }

  return (
    <div className="space-y-1">
      {showHeader && (
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Solicitudes de amistad</h2>
          {showViewAll && requests.length > 3 && (
            <Link to="/friends/requests" className="text-sm text-primary flex items-center">
              Ver todo
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
      <div className="space-y-1">
        {requests.map((request) => (
          <FriendRequestItem
            key={request.id}
            id={request.id}
            sender={{
              id: request.user_id,
              username: request.user.username,
              avatar_url: request.user.avatar_url
            }}
            created_at={request.created_at}
            mutual_friends={request.mutual_friends || []}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        ))}
      </div>
    </div>
  );
}
