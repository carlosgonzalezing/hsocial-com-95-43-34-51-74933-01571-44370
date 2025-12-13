
interface NotificationPreviewProps {
  type: string;
  postContent?: string;
  postMedia?: string | null;
  commentContent?: string;
}

export const NotificationPreview = ({
  type,
  postContent,
  postMedia,
  commentContent
}: NotificationPreviewProps) => {
  // Render post preview (for post_like, post_comment, new_post)
  if ((type === 'post_like' || type === 'post_comment' || type === 'new_post') && 
      (postContent || postMedia)) {
    return (
      <div className="mt-2 bg-muted/30 p-2 rounded text-sm border border-border/30 line-clamp-2">
        {postMedia && (
          <div className="mb-1">
            <img 
              src={postMedia} 
              alt="Media de la publicación" 
              className="h-16 w-auto object-contain rounded"
            />
          </div>
        )}
        {postContent && (
          <p className="text-muted-foreground line-clamp-2">{postContent}</p>
        )}
      </div>
    );
  }
  
  // Render comment preview (for comment_reply)
  if (type === 'comment_reply' && commentContent) {
    return (
      <div className="mt-2 bg-muted/30 p-2 rounded text-sm border border-border/30">
        <p className="text-muted-foreground italic line-clamp-2">"{commentContent}"</p>
      </div>
    );
  }
  
  return null;
};
