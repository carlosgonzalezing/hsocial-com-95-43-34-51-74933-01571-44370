
import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareModal } from "./ShareModal";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Post } from "@/types/post";

interface ShareButtonProps {
  post: Post;
}

export function ShareButton({ post }: ShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={`flex-1 justify-center items-center ${isMobile ? "w-1/2 mx-auto" : "w-full"}`}
        onClick={() => setIsModalOpen(true)}
      >
        <Share2 className="h-4 w-4 mr-2" />
        <span>Compartir</span>
      </Button>

      <ShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        post={post}
      />
    </>
  );
}
