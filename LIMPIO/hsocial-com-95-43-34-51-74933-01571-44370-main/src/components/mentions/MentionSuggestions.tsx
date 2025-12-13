
import { useRef, useLayoutEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MentionUser, MentionPosition } from "@/hooks/mentions/types";

interface MentionSuggestionsProps {
  users: MentionUser[];
  isVisible?: boolean;
  position: MentionPosition;
  selectedIndex: number;
  onSelectUser: (user: MentionUser) => void;
  onSetIndex: (index: number) => void;
}

export function MentionSuggestions({
  users,
  isVisible = true,
  position,
  selectedIndex,
  onSelectUser,
  onSetIndex
}: MentionSuggestionsProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Scroll selected item into view with safe DOM operations
  useLayoutEffect(() => {
    if (isVisible && menuRef.current && selectedIndex >= 0) {
      requestAnimationFrame(() => {
        try {
          const selectedElement = menuRef.current?.children[selectedIndex] as HTMLElement;
          if (selectedElement && selectedElement.scrollIntoView && selectedElement.parentNode) {
            selectedElement.scrollIntoView({
              block: 'nearest',
              behavior: 'smooth'
            });
          }
        } catch (e) {
          console.warn('Scroll to element failed:', e);
        }
      });
    }
  }, [selectedIndex, isVisible]);
  
  if (!isVisible || users.length === 0) {
    return null;
  }
  
  // Agrupar usuarios por tipo (primero especiales, luego amigos, luego seguidores, luego otros)
  const groupedUsers = {
    special: users.filter(user => user.isSpecial),
    friends: users.filter(user => !user.isSpecial && user.relationship === 'Amigo'),
    followers: users.filter(user => !user.isSpecial && user.relationship === 'Seguidor'),
    others: users.filter(user => !user.isSpecial && !user.relationship)
  };

  // Función para renderizar grupos de usuarios con encabezados
  const renderUserGroup = (groupLabel: string, groupUsers: MentionUser[], startIndex: number) => {
    if (groupUsers.length === 0) return null;
    
    return (
      <div key={groupLabel}>
        {groupLabel !== 'none' && (
          <div className="px-2 py-1 text-xs text-muted-foreground bg-muted/50">
            {groupLabel === 'Amigos' ? 'Amigos' : 
             groupLabel === 'Seguidores' ? 'Seguidores' : ''}
          </div>
        )}
        {groupUsers.map((user, idx) => {
          const actualIndex = startIndex + idx;
          return (
            <div
              key={user.id}
              onClick={() => onSelectUser(user)}
              onMouseEnter={() => onSetIndex(actualIndex)}
              className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-muted transition-colors ${
                actualIndex === selectedIndex ? 'bg-muted' : ''
              }`}
            >
              {user.isSpecial ? (
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {user.specialType === 'seguidores' ? '👥' : '⭐'}
                  </span>
                </div>
              ) : (
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.avatar_url || ""} alt={user.username} />
                  <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
              <div className="flex flex-col">
                <span className="font-medium">@{user.username}</span>
                {user.isSpecial && user.description ? (
                  <span className="text-xs text-muted-foreground">{user.description}</span>
                ) : user.relationship ? (
                  <span className="text-xs text-muted-foreground">{user.relationship}</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-background border rounded-lg shadow-md max-h-[300px] w-[250px] overflow-y-auto"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      {users.length > 0 ? (
        <>
          {renderUserGroup('none', groupedUsers.special, 0)}
          {renderUserGroup('Amigos', groupedUsers.friends, groupedUsers.special.length)}
          {renderUserGroup('Seguidores', groupedUsers.followers, groupedUsers.special.length + groupedUsers.friends.length)}
          {renderUserGroup('none', groupedUsers.others, groupedUsers.special.length + groupedUsers.friends.length + groupedUsers.followers.length)}
        </>
      ) : (
        <div className="p-2 text-sm text-muted-foreground">
          No se encontraron usuarios
        </div>
      )}
    </div>
  );
}
