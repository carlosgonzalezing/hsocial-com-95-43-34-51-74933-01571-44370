
import { useState } from 'react';

export function useArchivedChats() {
  const [archivedChats, setArchivedChats] = useState<Set<string>>(new Set());
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleChatLongPress = (friendId: string) => {
    const timer = setTimeout(() => {
      setArchivedChats(prev => {
        const newSet = new Set(prev);
        newSet.add(friendId);
        return newSet;
      });
    }, 500);
    setLongPressTimer(timer);
  };

  const handleChatPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleUnarchiveChat = (friendId: string) => {
    setArchivedChats(prev => {
      const newSet = new Set(prev);
      newSet.delete(friendId);
      return newSet;
    });
  };

  return {
    archivedChats,
    handleChatLongPress,
    handleChatPressEnd,
    handleUnarchiveChat
  };
}
