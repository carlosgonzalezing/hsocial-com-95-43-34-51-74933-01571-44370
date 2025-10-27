
import { useState } from "react";
import { FilePreview } from "../FilePreview";
import { ImageModal } from "./ImageModal";
import { VideoModal } from "./VideoModal";
// PostPoll removed for performance
import { Post } from "@/types/post";
import { PostIdea } from "./PostIdea";
import { EventCard } from "./EventCard";
import { EventModal } from "./EventModal";
// Removed marketplace display
import { PostImage } from "@/components/ui/optimized-image";
import { backgroundPresets } from "./TextBackgroundPalette";
import { MentionsText } from "./MentionsText";

interface PostContentProps {
  post: Post;
  postId: string;
}

export function PostContent({ post, postId }: PostContentProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  
  // Check if the post has media
  const hasMedia = !!post.media_url;
  
  // Check if the post has a poll
  const hasPoll = post.poll && post.poll.options?.length > 0;
  
  // Check if the post has idea
  const hasIdea = !!post.idea;

  // Check if the post has marketplace
  const hasMarketplace = !!post.marketplace;

  // Check if the post has event
  const hasEvent = !!post.event;

  console.log('PostContent rendering:', { 
    postId: post.id, 
    hasMedia, 
    mediaUrl: post.media_url, 
    mediaType: post.media_type,
    hasMarketplace,
    hasIdea,
    hasEvent,
    hasPoll
  });

  // Get background preset for styled content
  const backgroundPreset = post.content_style?.backgroundKey 
    ? backgroundPresets.find(p => p.key === post.content_style?.backgroundKey)
    : null;

  // Check if this is a text-only post with background
  const isStyledTextPost = post.content_style?.isTextOnly && 
                          post.content_style?.backgroundKey !== 'none' && 
                          backgroundPreset && 
                          !hasMedia;

  // Truncar texto si es muy largo
  const contentLength = post.content?.length || 0;
  const shouldTruncate = contentLength > 100 && !isStyledTextPost;
  const displayContent = shouldTruncate && !showFullText 
    ? post.content?.substring(0, 100) + '...' 
    : post.content;

  return (
    <div className="px-0 md:px-4 pb-0 pt-0">
      {post.content && (
        <div className={isStyledTextPost ? "relative rounded-lg overflow-hidden mb-4" : ""}>
          {/* Background layer for styled text posts */}
          {isStyledTextPost && (
            <div className={`absolute inset-0 ${backgroundPreset.gradient}`} />
          )}
          
          <div>
            <MentionsText 
              content={displayContent || ''}
              className={
                isStyledTextPost 
                  ? "relative z-10 text-xl font-semibold text-white text-center py-16 px-4 md:px-6 whitespace-pre-wrap break-words"
                  : "text-[15px] leading-relaxed whitespace-pre-wrap break-words post-content px-4 md:px-0 text-foreground"
              }
            />
            {shouldTruncate && (
              <button
                onClick={() => setShowFullText(!showFullText)}
                className="text-muted-foreground text-sm hover:underline px-4 md:px-0 mt-1"
              >
                {showFullText ? 'Ver menos →' : 'Ver más →'}
              </button>
            )}
          </div>
        </div>
      )}
      
      {hasMedia && !hasMarketplace && (
        <div className="mt-2 mb-0 w-full flex justify-center">
          {post.media_type?.startsWith('image') || post.media_type === 'image' ? (
            <PostImage
              src={post.media_url || ''}
              alt="Contenido multimedia del post"
              className="w-full h-auto rounded-none cursor-zoom-in"
              onClick={() => setIsImageModalOpen(true)}
            />
          ) : post.media_type?.startsWith('video') || post.media_type === 'video' ? (
            <video
              src={post.media_url || ''}
              className="max-w-full max-h-[400px] object-contain rounded-lg cursor-pointer shadow-md"
              onClick={() => setIsVideoModalOpen(true)}
              onError={(e) => {
                console.error('Error cargando video:', e);
                console.log('URL fallida:', post.media_url);
                // Show fallback content
                const target = e.target as HTMLVideoElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                      <p class="text-muted-foreground text-sm">No se pudo cargar el video</p>
                    </div>
                  `;
                }
              }}
              onLoadedData={() => {
                console.log('Video cargado exitosamente:', post.media_url);
              }}
              controls
              preload="metadata"
              crossOrigin="anonymous"
            />
          ) : (
            <FilePreview 
              url={post.media_url || ''} 
              type={post.media_type ?? 'file'}
            />
          )}
        </div>
      )}
      
      {/* Poll component removed for performance */}
      
      {hasIdea && (
        <div className="mt-4">
          <PostIdea idea={post.idea} postId={postId} post={post} />
        </div>
      )}

      {hasEvent && (
        <div className="mt-4">
          <EventCard 
            event={post.event!}
            onMoreInfo={() => setIsEventModalOpen(true)}
            onRegister={() => {
              // Aquí se implementaría la lógica de registro
              console.log('Registrar en evento:', post.event?.title);
            }}
          />
        </div>
      )}

      {/* Marketplace display removed for performance */}
      
      {/* Image Modal */}
      {post.media_type?.startsWith('image') && (
        <ImageModal 
          isOpen={isImageModalOpen} 
          onClose={() => setIsImageModalOpen(false)}
          imageUrl={post.media_url || ''}
          altText="Post image"
        />
      )}
      
      {/* Video Modal */}
      {post.media_type?.startsWith('video') && (
        <VideoModal 
          isOpen={isVideoModalOpen} 
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={post.media_url || ''}
          altText="Post video"
        />
      )}

      {/* Event Modal - Solo renderizar si hay evento */}
      {hasEvent && post.event && (
        <EventModal 
          event={post.event}
          isOpen={isEventModalOpen} 
          onClose={() => setIsEventModalOpen(false)}
          onRegister={() => {
            console.log('Registrar en evento:', post.event?.title);
            setIsEventModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
