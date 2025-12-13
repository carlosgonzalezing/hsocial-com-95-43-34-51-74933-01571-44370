
import { ReactionType } from "@/types/database/social.types";

export interface CommentData {
  content: string;
  replyToId?: string;
}

export interface CommentReactionParams {
  commentId: string;
  type: ReactionType;
}

export interface PollVoteParams {
  optionId: string;
}
