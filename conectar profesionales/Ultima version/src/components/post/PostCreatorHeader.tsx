
import { Button } from "@/components/ui/button";
import { MessageCircle, Lightbulb, Briefcase } from "lucide-react";

type PostType = 'regular' | 'idea' | 'proyecto';

interface PostCreatorHeaderProps {
  postType: PostType;
  setPostType: (type: PostType) => void;
}

export function PostCreatorHeader({ 
  postType, 
  setPostType 
}: PostCreatorHeaderProps) {
  return (
    <div className="flex items-center gap-2 pb-4 border-b">
      <Button
        variant={postType === 'regular' ? "default" : "ghost"}
        size="sm"
        onClick={() => setPostType('regular')}
        className="flex items-center gap-2 px-4 py-2"
      >
        <MessageCircle className="h-4 w-4" />
        <span>Publicación</span>
      </Button>
      
      <Button
        variant={postType === 'idea' ? "default" : "ghost"}
        size="sm"
        onClick={() => setPostType('idea')}
        className="flex items-center gap-2 px-4 py-2"
      >
        <Lightbulb className="h-4 w-4" />
        <span>Idea</span>
      </Button>
      
      <Button
        variant={postType === 'proyecto' ? "default" : "ghost"}
        size="sm"
        onClick={() => setPostType('proyecto')}
        className="flex items-center gap-2 px-4 py-2"
      >
        <Briefcase className="h-4 w-4" />
        <span>Proyecto</span>
      </Button>
    </div>
  );
}
