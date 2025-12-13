import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Clock } from "lucide-react";

interface SimpleUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface SimpleFriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  user: SimpleUser;
}

interface SimpleFriendRequestsListProps {
  requests: SimpleFriendRequest[];
  type: 'pending' | 'sent';
  loading: boolean;
  actionLoading: Record<string, boolean>;
  onAccept?: (requestId: string, senderId: string) => Promise<void>;
  onReject?: (requestId: string) => Promise<void>;
  onCancel?: (requestId: string) => Promise<void>;
}

export function SimpleFriendRequestsList({
  requests,
  type,
  loading,
  actionLoading,
  onAccept,
  onReject,
  onCancel
}: SimpleFriendRequestsListProps) {
  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">
          Cargando {type === 'pending' ? 'solicitudes' : 'solicitudes enviadas'}...
        </p>
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          {type === 'pending' ? (
            <UserPlus className="h-6 w-6 text-muted-foreground" />
          ) : (
            <Clock className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <h3 className="text-lg font-medium">
          {type === 'pending' ? 'No hay solicitudes pendientes' : 'No hay solicitudes enviadas'}
        </h3>
        <p className="text-muted-foreground mt-1">
          {type === 'pending' 
            ? 'Cuando alguien te envíe una solicitud de amistad, aparecerá aquí'
            : 'Cuando envíes una solicitud de amistad, aparecerá aquí'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {requests.map(request => {
        const userId = type === 'pending' ? request.user_id : request.friend_id;
        const isLoading = actionLoading[request.id];
        
        return (
          <div key={request.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Link to={`/profile/${userId}`}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={request.user.avatar_url || undefined} />
                  <AvatarFallback>
                    {request.user.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link to={`/profile/${userId}`} className="font-medium hover:underline">
                  {request.user.username || 'Usuario'}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {type === 'pending' ? 'Hace' : 'Enviada el'} {' '}
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 ml-auto">
              {type === 'pending' ? (
                <>
                  <Button
                    onClick={() => onAccept?.(request.id, request.user_id)}
                    disabled={isLoading}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Confirmar
                  </Button>
                  <Button
                    onClick={() => onReject?.(request.id)}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Eliminar
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => onCancel?.(request.id)}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="sm:ml-auto"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}