import { useEffect } from 'react';
import { preloadImage } from '@/lib/image-optimization';

/**
 * Hook to preload critical images for better performance
 */
export function useImagePreloader(images: Array<{ src: string; priority?: 'high' | 'low' }>) {
  useEffect(() => {
    images.forEach(({ src, priority = 'low' }) => {
      if (src) {
        preloadImage(src, priority);
      }
    });
  }, [images]);
}

/**
 * Hook to preload user avatar and cover images
 */
export function useUserImagePreloader(user: { avatar_url?: string; cover_image_url?: string } | null) {
  useImagePreloader([
    { src: user?.avatar_url || '', priority: 'high' },
    { src: user?.cover_image_url || '', priority: 'low' }
  ]);
}