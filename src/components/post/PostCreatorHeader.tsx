
import { Button } from "@/components/ui/button";
import { SparklesIcon, MessageCircle, Calendar, Plus } from "lucide-react";

type PostType = 'regular' | 'idea' | 'evento';

interface PostCreatorHeaderProps {
  postType: PostType;
  setPostType: (type: PostType) => void;
}

export function PostCreatorHeader({ 
  postType, 
  setPostType 
}: PostCreatorHeaderProps) {
  return (
    <div className="flex items-center gap-1 pb-3 border-b overflow-x-auto scrollbar-hide">
      <Button
        variant={postType === 'regular' ? "default" : "ghost"}
        size="sm"
        onClick={() => setPostType('regular')}
        className="flex items-center gap-1 px-2 py-1 min-w-fit text-xs whitespace-nowrap"
      >
        <MessageCircle className="h-3 w-3" />
        <span className="hidden xs:inline">Regular</span>
      </Button>
      
      <Button
        variant={postType === 'idea' ? "default" : "ghost"}
        size="sm"
        onClick={() => setPostType('idea')}
        className="flex items-center gap-1 px-2 py-1 min-w-fit text-xs whitespace-nowrap"
      >
        <SparklesIcon className="h-3 w-3" />
        <span className="hidden xs:inline">Idea</span>
      </Button>
      
      <Button
        variant={postType === 'evento' ? "default" : "ghost"}
        size="sm"
        onClick={() => setPostType('evento')}
        className="flex items-center gap-1 px-2 py-1 min-w-fit text-xs whitespace-nowrap"
      >
        <Plus className="h-3 w-3" />
        <Calendar className="h-3 w-3" />
        <span className="hidden xs:inline">Crear Evento</span>
      </Button>
    </div>
  );
}
