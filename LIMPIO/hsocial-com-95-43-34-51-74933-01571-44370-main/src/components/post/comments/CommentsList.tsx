
import { SingleComment } from "./SingleComment";
import type { Comment } from "@/types/post";
import type { ReactionType } from "@/components/post/reactions/ReactionIcons";

interface CommentsListProps {
  comments: Comment[];
  onReaction: (commentId: string, type: ReactionType) => void;
  onReply: (id: string, username: string) => void;
  onDeleteComment: (commentId: string) => void;
  postAuthorId?: string;
}

export function CommentsList({
  comments,
  onReaction,
  onReply,
  onDeleteComment,
  postAuthorId
}: CommentsListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center">
        No hay comentarios. ¡Sé el primero en comentar!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <SingleComment
          key={comment.id}
          comment={comment}
          onReaction={onReaction}
          onReply={onReply}
          onDeleteComment={onDeleteComment}
          postAuthorId={postAuthorId}
        />
      ))}
    </div>
  );
}
