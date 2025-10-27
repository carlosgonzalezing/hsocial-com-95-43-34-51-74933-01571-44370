import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { sharePost } from "@/lib/api/posts/queries/shares";
import type { Post } from "@/types/post";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
}

export function ShareModal({ isOpen, onClose, post }: ShareModalProps) {
  const [shareComment, setShareComment] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleShareToProfile = async () => {
    setIsSharing(true);
    console.log('🔄 [ShareModal] Iniciando proceso de compartir post:', post.id);
    
    try {
      // 1. Verificar sesión del usuario
      console.log('🔍 [ShareModal] Obteniendo sesión de usuario...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ [ShareModal] Error obteniendo sesión:', sessionError);
        throw new Error('Error al verificar sesión');
      }
      
      const userId = sessionData.session?.user.id;
      console.log('👤 [ShareModal] Usuario ID:', userId || 'NO ENCONTRADO');
      
      if (!userId) {
        console.warn('⚠️ [ShareModal] Usuario no autenticado');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para compartir",
        });
        return;
      }

      // 2. Registrar el compartir en post_shares
      console.log('📝 [ShareModal] Registrando compartir en post_shares...');
      const shareSuccess = await sharePost(post.id, 'profile', shareComment);
      
      if (!shareSuccess) {
        console.error('❌ [ShareModal] No se pudo registrar el compartir');
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo registrar el compartir",
        });
        return;
      }
      console.log('✅ [ShareModal] Compartir registrado exitosamente');

      // 3. Crear el post compartido
      const authorUsername = post.profiles?.username || "Usuario";
      const postData = {
        content: shareComment || `Compartido de ${authorUsername}: ${post.content?.substring(0, 50)}${post.content && post.content.length > 50 ? '...' : ''}`,
        user_id: userId,
        media_type: null,
        visibility: 'public' as const,
        shared_post_id: post.id
      };
      
      console.log('📤 [ShareModal] Creando post compartido:', postData);
      const { error: insertError } = await supabase
        .from('posts')
        .insert(postData);

      if (insertError) {
        console.error('❌ [ShareModal] Error creando post compartido:', insertError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo compartir la publicación",
        });
        return;
      }
      
      console.log('✅ [ShareModal] Post compartido creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: "¡Publicación compartida!",
        description: "La publicación ha sido compartida en tu perfil",
      });
      onClose();
      setShareComment("");
      
    } catch (error) {
      console.error('❌ [ShareModal] Error inesperado:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al compartir la publicación",
      });
    } finally {
      console.log('🏁 [ShareModal] Finalizando proceso de compartir');
      setIsSharing(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartir publicación
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            value={shareComment}
            onChange={(e) => setShareComment(e.target.value)}
            placeholder="¿Qué piensas sobre esto?"
            rows={4}
            className="resize-none"
          />

          <Button
            onClick={handleShareToProfile}
            disabled={isSharing}
            className="w-full"
          >
            {isSharing ? "Compartiendo..." : "Compartir"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}