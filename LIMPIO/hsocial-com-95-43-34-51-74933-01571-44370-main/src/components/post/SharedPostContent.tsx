
import { Post } from "@/types/post";
import { FilePreview } from "@/components/FilePreview";
import { useState } from "react";
import { ImageModal } from "@/components/post/ImageModal";
import { IdeaDisplay } from "./idea/IdeaDisplay";
import { PostImage } from "@/components/ui/optimized-image";
import { MentionsText } from "./MentionsText";
import { EventCard } from "@/components/events/EventCard";

interface SharedPostContentProps {
  post: Post;
}

export function SharedPostContent({ post }: SharedPostContentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Si el post compartido es una idea y el objeto idea existe, renderizarlo usando el componente IdeaDisplay
  if (post && post.idea) {
    return (
      <div className="space-y-2">
        <IdeaDisplay 
          post={post}
          showHeader={true}
        />
      </div>
    );
  }
  
  // Si el post compartido es un evento académico
  if (post && post.event) {
    return (
      <div className="space-y-2">
        <EventCard 
          title={post.event.title}
          description={post.event.description}
          startDate={post.event.start_date}
          endDate={post.event.end_date}
          location={post.event.location}
          isVirtual={post.event.location_type === 'virtual'}
          maxAttendees={post.event.max_attendees}
          category={post.event.category}
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <MentionsText content={post.content} className="text-sm whitespace-pre-wrap break-words" />
      
      {post.media_url && post.media_type && post.media_type.startsWith('image') && (
        <>
          <div className="relative flex justify-center">
            <PostImage
              src={post.media_url}
              alt="Media"
              className="w-full h-auto rounded-lg cursor-zoom-in"
              onClick={() => setIsModalOpen(true)}
            />
          </div>
          
          <ImageModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            imageUrl={post.media_url}
            altText="Shared post image"
          />
        </>
      )}
      
      {post.media_url && (!post.media_type || !post.media_type.startsWith('image')) && (
        <FilePreview 
          url={post.media_url} 
          type={post.media_type ?? 'file'}
        />
      )}
    </div>
  );
}
