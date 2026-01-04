import { useState, createContext, useContext, ReactNode } from 'react';

export interface ChatWindow {
  id: string;
  username: string;
  avatar_url: string | null;
  isMinimized: boolean;
  unreadCount: number;
}

interface ChatSystemContextType {
  chatWindows: ChatWindow[];
  openChat: (userId: string, username: string, avatarUrl: string | null) => void;
  closeChat: (userId: string) => void;
  toggleMinimize: (userId: string) => void;
  updateUnreadCount: (userId: string, count: number) => void;
  getTotalUnreadCount: () => number;
}

const ChatSystemContext = createContext<ChatSystemContextType | undefined>(undefined);

export function ChatSystemProvider({ children }: { children: ReactNode }) {
  const [chatWindows, setChatWindows] = useState<ChatWindow[]>([]);

  const openChat = (userId: string, username: string, avatarUrl: string | null) => {
    const existingChat = chatWindows.find(chat => chat.id === userId);
    
    if (existingChat) {
      // Bring to front and unminimize
      setChatWindows(prev => 
        prev.map(chat => 
          chat.id === userId 
            ? { ...chat, isMinimized: false }
            : chat
        )
      );
    } else {
      // Add new chat window (max 3 windows)
      setChatWindows(prev => {
        const newChat: ChatWindow = {
          id: userId,
          username,
          avatar_url: avatarUrl,
          isMinimized: false,
          unreadCount: 0
        };
        
        // Keep only last 3 chats
        const updatedChats = [newChat, ...prev].slice(0, 3);
        return updatedChats;
      });
    }
  };

  const closeChat = (userId: string) => {
    setChatWindows(prev => prev.filter(chat => chat.id !== userId));
  };

  const toggleMinimize = (userId: string) => {
    setChatWindows(prev => 
      prev.map(chat => 
        chat.id === userId 
          ? { ...chat, isMinimized: !chat.isMinimized }
          : chat
      )
    );
  };

  const updateUnreadCount = (userId: string, count: number) => {
    setChatWindows(prev =>
      prev.map(chat =>
        chat.id === userId
          ? { ...chat, unreadCount: count }
          : chat
      )
    );
  };

  const getTotalUnreadCount = () => {
    return chatWindows.reduce((total, chat) => total + chat.unreadCount, 0);
  };

  return (
    <ChatSystemContext.Provider value={{
      chatWindows,
      openChat,
      closeChat,
      toggleMinimize,
      updateUnreadCount,
      getTotalUnreadCount
    }}>
      {children}
    </ChatSystemContext.Provider>
  );
}

export function useChatSystem() {
  const context = useContext(ChatSystemContext);
  if (context === undefined) {
    throw new Error('useChatSystem must be used within a ChatSystemProvider');
  }
  return context;
}
