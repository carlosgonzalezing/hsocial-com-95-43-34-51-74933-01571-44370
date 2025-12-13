
import { Link2, Share } from "lucide-react";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import type { Post } from "@/types/post";

interface ShareOptionsProps {
  post: Post;
  children: React.ReactNode;
  onLongPress?: () => void;
}

export function ShareOptions({ post, children, onLongPress }: ShareOptionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    await navigator.clipboard.writeText(url);
    toast({
      title: "Enlace copiado",
      description: "El enlace se copió al portapapeles",
      duration: 2000,
    });
  };

  const handleQuickShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await handleCopyLink();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Compartir publicación",
          text: post.content,
          url: `${window.location.origin}/post/${post.id}`,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  const handleShareToProfile = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para compartir",
        });
        return;
      }

      // Get author information to store in the content
      const authorUsername = post.profiles?.username || "Usuario";
      
      // Create the base post data with required fields
      const postData: {
        content: string;
        user_id: string;
        media_type: null;
        visibility: 'public' | 'friends' | 'private';
        shared_post_id?: string;
      } = {
        content: `Compartido de ${authorUsername}: ${post.content?.substring(0, 50)}${post.content && post.content.length > 50 ? '...' : ''}`,
        user_id: userId,
        media_type: null,
        visibility: 'public',
        shared_post_id: post.id
      };
      
      const { error } = await (supabase as any)
        .from('posts')
        .insert(postData);

      if (error) {
        console.error("Error sharing post:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo compartir la publicación",
        });
      } else {
        // Invalidate the posts query to refresh the feed
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        
        toast({
          title: "¡Publicación compartida!",
          description: "La publicación ha sido compartida en tu perfil",
        });
      }
    } catch (error) {
      console.error("Error in share function:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al compartir la publicación",
      });
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={handleShareToProfile}>
          <Share className="h-4 w-4 mr-2" />
          Compartir en mi perfil
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCopyLink}>
          <Link2 className="h-4 w-4 mr-2" />
          Copiar enlace
        </ContextMenuItem>
        {navigator.share && (
          <ContextMenuItem onClick={handleShare}>
            <Share className="h-4 w-4 mr-2" />
            Compartir con...
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
