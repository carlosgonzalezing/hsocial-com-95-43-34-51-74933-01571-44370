
export interface MessageTable {
  Row: {
    id: string;
    content: string;
    sender_id: string;
    receiver_id: string;
    created_at: string;
    read_at: string | null;
    is_deleted: boolean;
  };
  Insert: {
    id?: string;
    content: string;
    sender_id: string;
    receiver_id: string;
    created_at?: string;
    read_at?: string | null;
    is_deleted?: boolean;
  };
  Update: {
    id?: string;
    content?: string;
    sender_id?: string;
    receiver_id?: string;
    created_at?: string;
    read_at?: string | null;
    is_deleted?: boolean;
  };
}

export interface GroupMessageTable {
  Row: {
    id: string;
    content: string;
    sender_id: string;
    type: 'text' | 'audio' | 'image';
    media_url: string | null;
    created_at: string;
    is_deleted: boolean;
  };
  Insert: {
    id?: string;
    content: string;
    sender_id: string;
    type: 'text' | 'audio' | 'image';
    media_url?: string | null;
    created_at?: string;
    is_deleted?: boolean;
  };
  Update: {
    id?: string;
    content?: string;
    sender_id?: string;
    type?: 'text' | 'audio' | 'image';
    media_url?: string | null;
    created_at?: string;
    is_deleted?: boolean;
  };
}
