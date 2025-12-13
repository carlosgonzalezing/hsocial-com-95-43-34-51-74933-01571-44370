
import { Json } from "@/types/database/json.types";

export interface UseIdeaJoinMutationProps {
  postId: string;
  onSuccess?: () => void;
}

export interface JoinIdeaCallbacks {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

// Define the local interface for participants
export interface IdeaParticipant {
  user_id: string;
  profession: string;
  joined_at: string;
  username?: string;
  avatar_url?: string | null;
}

// Simplified type for JSON operations that avoids recursive types
export type JsonSafeParticipant = {
  user_id: string;
  profession: string;
  joined_at: string;
  username?: string;
  avatar_url?: string | null;
};

// Result type for join operations
export interface JoinIdeaResult {
  success: boolean;
  alreadyJoined?: boolean;
  message?: string;
}

// Type for idea data from JSON field
export interface IdeaJson {
  title?: string;
  description?: string;
  participants?: (JsonSafeParticipant | string)[];
  [key: string]: any;
}

// Use the proper type for toast
export type ToastType = ReturnType<typeof import("@/hooks/use-toast").toast>;
