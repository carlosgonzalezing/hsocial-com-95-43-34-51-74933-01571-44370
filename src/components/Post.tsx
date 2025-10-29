import { Card } from "@/components/ui/card";
import { Comments } from "@/components/post/Comments";
// CAMBIO: Se elimina la importación de PostActions y se usa ActionsButtons
// import { PostActions } from "@/components/post/PostActions";
import { ActionsButtons } from "@/components/post/actions/ActionsButtons";
import { PostContent } from "@/components/post/PostContent";
import { PostHeader } from "@/components/post/PostHeader";
import { type Post as PostType } from "@/types/post";
import { SharedPostContent } from "./post/SharedPostContent";
import { usePost } from "@/hooks/use-post";
import { PostWrapper } from "./post/PostWrapper";
import { useEffect, useState } from "react";
import { IdeaContent } from "./post/IdeaContent";
import { PostOptionsMenu } from "./post/actions/PostOptionsMenu";
import { EventCard } from "./events/EventCard";
import { EventDetailModal } from "./events/EventDetailModal";

interface PostProps {
  post: PostType;
  hideComments?: boolean;
  isHidden?: boolean;
}

export function Post({ post, hideComments = false, isHidden = false }: PostProps) {
  // Verificación de seguridad si el post es inválido
  if (!post || !post.id) {
    console.error("Invalid post object:", post);
    return null;
  }
  
  // Detectar si es un post de demostración (no permite interacciones)
  const isDemoPost = post.id.startsWith('demo-');

  const {
    showComments,
    comments,
    newComment,
    commentImage,
    setCommentImage,
    replyTo,
    isCurrentUserAuthor,
    onDeletePost,
    toggleComments,
    handleCommentReaction,
    handleReply,
    handleSubmitComment,
    handleCancelReply,
    handleDeleteComment,
    setNewComment,
  } = usePost(post, hideComments);

  // Determinar si esta es una publicación compartida
  const isSharedPost = !!post.shared_post;
  // Determinar si esta es una publicación de idea
  const isIdeaPost = !!post.idea && post.post_type !== 'project';
  // Determinar si es un evento
  const isEventPost = post.post_type === 'academic_event' && !!post.event;
  // Determinar si es un proyecto
  const isProjectPost = post.post_type === 'project';
  // Determinar si la publicación está fijada
  const isPinned = post.is_pinned;

  return (
    <PostWrapper isHidden={isHidden} isIdeaPost={isIdeaPost} isPinned={isPinned}>
      <PostHeader 
        post={post} 
        onDelete={isDemoPost ? undefined : onDeletePost}
        isAuthor={isDemoPost ? false : isCurrentUserAuthor}
        isHidden={isHidden}
        content={post.content || ""}
        isIdeaPost={isIdeaPost}
        isDemoPost={isDemoPost}
      />
      
      {isSharedPost ? (
        <SharedPostView post={post} />
      ) : isIdeaPost ? (
        <IdeaPostView post={post} />
      ) : isEventPost ? (
        <EventPostView post={post} />
      ) : isProjectPost ? (
        <ProjectPostView post={post} />
      ) : (
        <StandardPostView post={post} />
      )}
      
      {!isDemoPost && (
        <ActionsButtons 
          post={post}
          postId={post.id}
          userReaction={null}
          onComment={toggleComments}
          commentsExpanded={showComments}
        />
      )}
      
      {!isDemoPost && !hideComments && showComments && (
        <Comments 
          postId={post.id}
          comments={comments}
          onReaction={handleCommentReaction}
          onReply={handleReply}
          onSubmitComment={handleSubmitComment}
          onDeleteComment={handleDeleteComment}
          newComment={newComment}
          onNewCommentChange={setNewComment}
          replyTo={replyTo}
          onCancelReply={handleCancelReply}
          showComments={showComments}
          commentImage={commentImage}
          setCommentImage={setCommentImage}
          postAuthorId={post.user_id}
        />
      )}
    </PostWrapper>
  );
}

// ... (El resto de las funciones auxiliares EventPostView, SharedPostView, IdeaPostView, StandardPostView) permanecen INALTERADAS.

// Componente de ayuda para la vista de publicación compartida
function SharedPostView({ post }: { post: PostType }) {
  return (
    <div className="px-0 md:px-4 pb-4">
      {post.content && (
        <p className="text-sm whitespace-pre-wrap break-words mb-4 px-4 md:px-0">{post.content}</p>
      )}
      <div className="border border-border rounded-none md:rounded-lg overflow-hidden">
        <div className="flex items-center mb-2 px-4">
          <span className="text-sm text-muted-foreground">
            Publicación original
          </span>
        </div>
        {post.shared_post && (
          <SharedPostContent post={post.shared_post} />
        )}
      </div>
    </div>
  );
}

// Componente para las publicaciones de tipo Evento
function EventPostView({ post }: { post: PostType }) {
  const [showEventDetail, setShowEventDetail] = useState(false);
  
  if (!post.event) return null;
  
  return (
    <div className="px-0 md:px-4 pb-2">
      {post.content && (
        <p className="text-sm whitespace-pre-wrap break-words mb-4 px-4 md:px-0">{post.content}</p>
      )}
      <EventCard
        title={post.event.title}
        subtitle={post.profiles?.username || 'Organizador'}
        description={post.event.description}
        startDate={post.event.start_date}
        endDate={post.event.end_date}
        location={post.event.location}
        isVirtual={post.event.location_type === 'virtual'}
        maxAttendees={post.event.max_attendees}
        currentAttendees={0} // TODO: Get from registrations
        category={post.event.category}
        gradientColor="gradient-1" // TODO: Get from event data
        onClick={() => setShowEventDetail(true)}
      />
      
      {showEventDetail && (
        <EventDetailModal
          isOpen={showEventDetail}
          onClose={() => setShowEventDetail(false)}
          event={{
            title: post.event.title,
            subtitle: post.profiles?.username || 'Organizador',
            description: post.event.description,
            startDate: post.event.start_date,
            endDate: post.event.end_date,
            location: post.event.location,
            isVirtual: post.event.location_type === 'virtual',
            maxAttendees: post.event.max_attendees,
            currentAttendees: 0, // TODO: Get from registrations
            category: post.event.category,
            organizer: post.profiles?.username || 'Organizador'
          }}
        />
      )}
    </div>
  );
}

// Componente para las publicaciones de tipo Idea
function IdeaPostView({ post }: { post: PostType }) {
  if (!post.idea) return null;
  
  return (
    <div className="px-0 md:px-4 pb-2">
      <IdeaContent 
        idea={post.idea} 
        content={post.content || ''}
      />
    </div>
  );
}

// Componente para las publicaciones de tipo Proyecto
function ProjectPostView({ post }: { post: PostType }) {
  if (!post.idea) return null;
  
  const projectData = (typeof post.idea === 'object' && !Array.isArray(post.idea) ? post.idea : {}) as {
    title?: string;
    description?: string;
  };
  
  return (
    <div className="px-0 md:px-4 pb-2">
      <IdeaContent 
        idea={post.idea} 
        content={post.content || ''}
      />
    </div>
  );
}

// Componente de ayuda para la vista de publicación estándar
function StandardPostView({ post }: { post: PostType }) {
  return (
    <>
      <PostContent 
        post={post} 
        postId={post.id}
      />
      
      {post.shared_post && (
        <div className="px-0 md:px-4 pb-4 mt-2">
          <div className="border border-border rounded-none md:rounded-lg overflow-hidden">
            <SharedPostContent post={post.shared_post} />
          </div>
        </div>
      )}
    </>
  );
}