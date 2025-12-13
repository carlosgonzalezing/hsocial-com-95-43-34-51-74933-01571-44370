
import { ReactionType } from "@/types/database/social.types";

// Types for creating posts
export type Visibility = 'public' | 'friends' | 'private' | 'incognito';

export interface ContentStyle {
  backgroundKey: string;
  textColor: string;
  isTextOnly: boolean;
}

export interface CreatePostParams {
  content: string;
  file?: File | null;
  pollData?: PollData | null;
  ideaData?: IdeaData | null;
  marketplaceData?: MarketplaceData | null;
  eventData?: EventData | null;
  visibility?: Visibility;
  contentStyle?: ContentStyle | null;
}

export interface CreatePostResponse {
  success: boolean;
  post?: any;
  error?: string;
}

export interface PollData {
  question: string;
  options: string[];
}

export interface IdeaData {
  title: string;
  description?: string;
  participants: any[];
}

export interface MarketplaceData {
  title: string;
  description: string;
  subject: string;
  price: number;
  document_preview_url?: string;
  document_full_url?: string;
  contact_info?: string;
}

export interface EventData {
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  location: string;
  location_type: 'presencial' | 'virtual' | 'híbrido';
  max_attendees?: number;
  category: 'conference' | 'seminar' | 'workshop' | 'hackathon' | 'webinar' | 'networking' | 'career_fair';
  registration_required?: boolean;
  registration_deadline?: string;
  contact_info?: string;
}

// Types for post API responses
export interface PostApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Add this type for reactions
export interface ReactionQueryResult {
  id: string;
  user_id: string;
  post_id: string;
  reaction_type: ReactionType;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url?: string | null;
    id: string;
  };
}
