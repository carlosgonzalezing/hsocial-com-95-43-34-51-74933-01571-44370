import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { toggleReactionOptimized } from '@/lib/api/reactions/optimized-reactions';
import type { CommentReactionParams } from '../types';

/**
 * Hook optimizado para manejar las reacciones de comentarios usando React Query
 * Usa la nueva API optimizada que previene duplicados y auto-reacciones
 */
export function useCommentReaction(postId: string, checkAuth: (showToast?: boolean) => Promise<boolean>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const toggleCommentReaction = useMutation({
    mutationFn: async ({ commentId, type = 'love' }: CommentReactionParams) => {
      // Verificar autenticación
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        throw new Error('Usuario no autenticado');
      }

      // Usar la función optimizada
      const result = await toggleReactionOptimized(undefined, commentId, type);
      
      if (!result.success) {
        throw new Error(result.error || 'Error al procesar la reacción');
      }

      return result;
    },
    onSuccess: (result, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      
      // Mostrar toast de éxito
      if (result.action === 'added') {
        toast({
          title: "¡Reacción añadida!",
          description: "Tu reacción se ha guardado en el comentario",
        });
      } else {
        toast({
          title: "Reacción eliminada",
          description: "Tu reacción se ha eliminado del comentario",
        });
      }
    },
    onError: (error: Error) => {
      console.error('Error toggling comment reaction:', error);
      toast({
        title: "Error",
        description: error.message || "Error al procesar la reacción del comentario",
        variant: "destructive"
      });
    }
  });

  return {
    toggleCommentReaction: toggleCommentReaction.mutate,
    isLoading: toggleCommentReaction.isPending
  };
}