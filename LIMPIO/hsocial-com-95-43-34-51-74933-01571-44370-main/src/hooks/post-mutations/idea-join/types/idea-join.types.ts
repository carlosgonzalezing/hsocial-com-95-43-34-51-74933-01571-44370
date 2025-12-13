
import { type ToasterToast } from "@/hooks/use-toast";

// Type for the toast function
export type ToastType = ReturnType<typeof import("@/hooks/use-toast").toast>;

// Structure for idea participants
export interface IdeaParticipant {
  user_id: string;
  profession: string;
  joined_at: string;
  username?: string;
  avatar_url?: string | null;
}

// Structure for the idea JSON object
export interface IdeaJsonData {
  title?: string;
  description?: string;
  participants?: IdeaParticipant[];
  [key: string]: any;
}
