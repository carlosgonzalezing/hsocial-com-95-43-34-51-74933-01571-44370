
import { Friend } from "@/hooks/use-friends";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface AllFriendsListProps {
  friends: Friend[];
}

export function AllFriendsList({ friends }: AllFriendsListProps) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Todos los amigos</h2>
      {friends.length === 0 ? (
        <p className="text-center text-muted-foreground">
          Aún no tienes amigos agregados
        </p>
      ) : (
        <div className="space-y-4">
          {friends.map((friend) => (
            <Link
              key={friend.id || friend.friend_id}
              to={`/profile/${friend.id || friend.friend_id}`}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-accent block"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={friend.avatar_url || friend.friend_avatar_url || undefined} />
                  <AvatarFallback>
                    {(friend.username || friend.friend_username || '?')[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="font-medium">{friend.username || friend.friend_username}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
