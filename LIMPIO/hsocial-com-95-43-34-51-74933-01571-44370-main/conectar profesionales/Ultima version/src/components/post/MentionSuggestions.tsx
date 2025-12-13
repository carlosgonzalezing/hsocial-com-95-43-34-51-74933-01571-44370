import { useLayoutEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MentionUser } from "@/hooks/mentions/types";

interface MentionSuggestionsProps {
  users: MentionUser[];
  selectedIndex: number;
  position: { top: number; left: number };
  visible: boolean;
  onUserSelect: (user: MentionUser) => void;
}

export function MentionSuggestions({
  users,
  selectedIndex,
  position,
  visible,
  onUserSelect
}: MentionSuggestionsProps) {
  if (!visible || users.length === 0) {
    return null;
  }

  // Safe scroll for selected item with double RAF for stability
  const scrollToSelected = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          const selectedElement = document.querySelector(`[data-mention-index="${selectedIndex}"]`);
          if (selectedElement && selectedElement.scrollIntoView && selectedElement.parentNode) {
            selectedElement.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest'
            });
          }
        } catch (e) {
          console.warn('Scroll to element failed:', e);
        }
      });
    });
  };

  // Use useLayoutEffect for DOM operations to avoid conflicts
  useLayoutEffect(() => {
    if (selectedIndex >= 0 && visible) {
      scrollToSelected();
    }
  }, [selectedIndex, visible]);

  return (
    <div
      className="fixed z-50 bg-background border rounded-lg shadow-lg max-h-48 overflow-y-auto min-w-[200px]"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {users.map((user, index) => (
        <div
          key={user.id}
          data-mention-index={index}
          className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-muted ${
            index === selectedIndex ? 'bg-muted' : ''
          }`}
          onClick={() => onUserSelect(user)}
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">@{user.username}</span>
          {user.isSpecial && (
            <span className="text-xs text-muted-foreground ml-auto">
              {user.specialType}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}