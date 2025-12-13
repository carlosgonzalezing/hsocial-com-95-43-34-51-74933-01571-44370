// Hook deshabilitado - tabla messages eliminada
export interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read_at: string | null;
  is_deleted?: boolean;
}

export function usePrivateMessages(currentUserId?: string | null) {
  return { 
    messages: [] as Message[], 
    loadMessages: async () => {}, 
    sendMessage: async () => false, 
    deleteMessage: async () => false 
  };
}
