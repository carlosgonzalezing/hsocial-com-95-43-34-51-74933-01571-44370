import { useMemo } from "react";
import { usePersonalizedFeed } from "@/hooks/feed/use-personalized-feed";
import type { Post } from "@/types/post";

/**
 * Hook optimizado para obtener posts de video (Reels)
 * Filtra videos de la data existente sin queries adicionales
 */
export function useReelsFeed() {
  const { 
    posts, 
    isLoading, 
    trackPostView, 
    trackPostInteraction,
    refetch
  } = usePersonalizedFeed();

  // Filtrar solo posts con videos - simplificado para Supabase Storage
  const videosPosts = useMemo(() => {
    return posts.filter((post: Post) => {
      // Verificar que tenga URL de media
      if (!post.media_url) return false;
      
      // Verificar que sea de Supabase Storage
      if (!post.media_url.includes('supabase')) return false;
      
      // Verificar por extensión de archivo
      const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];
      const hasVideoExtension = videoExtensions.some(ext => 
        post.media_url?.toLowerCase().includes(ext)
      );
      
      // Verificar por media_type
      const hasVideoType = post.media_type === 'video';
      
      return hasVideoExtension || hasVideoType;
    });
  }, [posts]);

  // Track view específico para reels con duración optimizado
  const trackReelView = (postId: string, durationSeconds?: number) => {
    try {
      trackPostView(postId, durationSeconds);
      // Bonus para videos vistos completamente solo si es significativo
      if (durationSeconds && durationSeconds > 15) {
        trackPostInteraction(postId, 'like');
      }
    } catch (error) {
      console.warn('Error tracking reel view:', error);
    }
  };

  const trackReelInteraction = (postId: string, type: 'like' | 'comment' | 'share') => {
    try {
      trackPostInteraction(postId, type);
    } catch (error) {
      console.warn('Error tracking reel interaction:', error);
    }
  };

  return {
    videosPosts,
    isLoading,
    trackReelView,
    trackReelInteraction,
    refetch,
    hasVideos: videosPosts.length > 0
  };
}