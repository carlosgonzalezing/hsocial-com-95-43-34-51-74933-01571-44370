
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Friend {
  id: string;
  username: string;
  avatar_url: string | null;
  mutual_friends_count?: number;
}

interface FriendsListSectionProps {
  friends: Friend[];
}

export function FriendsListSection({ friends }: FriendsListSectionProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Todos tus amigos</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {friends.length === 0 ? (
          <p className="text-center text-muted-foreground py-3">
            Aún no tienes amigos
          </p>
        ) : (
          <div className="divide-y divide-border">
            {friends.map((friend) => (
              <Link 
                key={friend.id} 
                to={`/profile/${friend.id}`}
                className="flex items-center py-3 hover:bg-accent/50 rounded-md px-2"
              >
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage src={friend.avatar_url || undefined} />
                  <AvatarFallback>{friend.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{friend.username}</p>
                  {friend.mutual_friends_count && friend.mutual_friends_count > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {friend.mutual_friends_count} {friend.mutual_friends_count === 1 ? 'amigo' : 'amigos'} en común
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
