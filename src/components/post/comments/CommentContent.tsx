
import { MediaDisplay } from "@/components/post/MediaDisplay";
import { MentionsText } from "@/components/post/MentionsText";

interface CommentContentProps {
  content: string;
  media?: string | null;
  mediaType?: string | null;
}

export function CommentContent({ content, media, mediaType }: CommentContentProps) {
  return (
    <div className="w-full">
      <div className="bg-muted p-2 rounded-lg text-sm">
        <MentionsText content={content} className="whitespace-pre-wrap break-words" />
        
        {media && mediaType && (
          <div className="mt-2 -mx-2 md:mx-0">
            <MediaDisplay 
              url={media} 
              type={mediaType}
              className="max-h-[200px] object-contain w-full rounded-none md:rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}
