import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { ReactionType } from "@/types/database/social.types";
import { useToast } from "@/hooks/use-toast";
import { toggleReactionOptimized, getUserPostReaction } from "@/lib/api/reactions/optimized-reactions";

/**
 * Hook optimizado para manejar las reacciones de los posts
 * Usa la nueva API optimizada que previene duplicados y auto-reacciones
 */
export function usePostReactions(postId: string) {
  const [isReacting, setIsReacting] = useState(false);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Verificar si el usuario ya reaccionó al post
  useEffect(() => {
    const checkUserReaction = async () => {
      try {
        const reaction = await getUserPostReaction(postId);
        setUserReaction(reaction);
      } catch (error) {
        console.error("Error checking user reaction:", error);
        setUserReaction(null);
      }
    };

    if (postId) {
      checkUserReaction();
    }
  }, [postId]);

  const onReaction = useCallback(async (postId: string, type: ReactionType) => {
    if (isReacting) return;
    
    setIsReacting(true);
    
    // Optimistic update: actualizar UI inmediatamente
    const previousReaction = userReaction;
    const newReaction = userReaction === type ? null : type;
    setUserReaction(newReaction);
    
    try {
      // Verificar autenticación
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Revertir cambio optimista
        setUserReaction(previousReaction);
        toast({
          title: "Error",
          description: "Debes iniciar sesión para reaccionar",
          variant: "destructive"
        });
        return;
      }

      // Actualizar cache de React Query optimistamente
      queryClient.setQueryData(['posts'], (oldData: any) => {
        if (!oldData?.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data?.map((post: any) => {
              if (post.id !== postId) return post;
              
              // Actualizar contadores de reacciones
              const reactions = post.reactions || [];
              let newReactions = [...reactions];
              
              if (newReaction) {
                // Añadir o cambiar reacción
                const existingIndex = newReactions.findIndex((r: any) => r.user_id === user.id);
                if (existingIndex >= 0) {
                  newReactions[existingIndex] = { ...newReactions[existingIndex], reaction_type: newReaction };
                } else {
                  newReactions.push({ user_id: user.id, reaction_type: newReaction });
                }
              } else {
                // Eliminar reacción
                newReactions = newReactions.filter((r: any) => r.user_id !== user.id);
              }
              
              return { ...post, reactions: newReactions, user_reaction: newReaction };
            })
          }))
        };
      });

      // Usar la función optimizada
      const result = await toggleReactionOptimized(postId, undefined, type);

      if (!result.success) {
        // Revertir cambio optimista en caso de error
        setUserReaction(previousReaction);
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        
        toast({
          title: "Error",
          description: result.error || "Error al procesar la reacción",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error in onReaction:', error);
      // Revertir cambio optimista
      setUserReaction(previousReaction);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      toast({
        title: "Error",
        description: error.message || "Error al procesar la reacción",
        variant: "destructive"
      });
    } finally {
      setIsReacting(false);
    }
  }, [isReacting, queryClient, toast, userReaction]);

  return {
    isReacting,
    onReaction,
    userReaction
  };
}