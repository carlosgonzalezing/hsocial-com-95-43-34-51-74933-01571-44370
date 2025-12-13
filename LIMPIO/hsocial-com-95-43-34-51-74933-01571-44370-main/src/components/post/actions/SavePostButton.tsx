import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSavePost } from "@/hooks/use-save-post";

interface SavePostButtonProps {
  postId: string;
}

export function SavePostButton({ postId }: SavePostButtonProps) {
  const { isSaved, toggleSave, isLoading } = useSavePost(postId);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="p-0 h-auto hover:bg-transparent"
      onClick={toggleSave}
      disabled={isLoading}
    >
      <Bookmark 
        className={`h-6 w-6 transition-all ${
          isSaved 
            ? 'fill-current text-foreground' 
            : 'text-foreground'
        }`}
        strokeWidth={1.5}
      />
    </Button>
  );
}
