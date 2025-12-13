
export type ReportReason = 'spam' | 'violence' | 'hate_speech' | 'nudity' | 'other';

export interface ReportPostParams {
  postId: string;
  userId: string;
  reason: ReportReason;
  description?: string;
}
