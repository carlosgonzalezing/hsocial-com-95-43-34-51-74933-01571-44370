import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FacebookLayout } from '@/components/layout/FacebookLayout';
import { ReelsInfiniteViewer } from '@/components/reels/ReelsInfiniteViewer';
import { ReelsDesktopLayout } from '@/components/reels/ReelsDesktopLayout';
import { useReelsFeed } from '@/hooks/reels/use-reels-feed';
import { useMobileDetection } from '@/hooks/use-mobile-detection';

export default function Reels() {
  const { 
    videosPosts, 
    isLoading, 
    trackReelView, 
    trackReelInteraction,
    hasVideos 
  } = useReelsFeed();

  const { shouldUseMobileLayout } = useMobileDetection();

  // Contenido de reels
  const reelsContent = isLoading ? (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  ) : hasVideos ? (
    <ReelsInfiniteViewer 
      posts={videosPosts} 
      onReaction={trackReelInteraction}
      onViewTracked={trackReelView}
    />
  ) : (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-center text-white">
        <div className="text-6xl mb-4">🎬</div>
        <h3 className="text-xl font-semibold mb-2">
          No hay videos disponibles
        </h3>
        <p className="text-gray-400">
          Sé el primero en compartir un video creativo
        </p>
      </div>
    </div>
  );

  return (
    <FacebookLayout>
      <Helmet>
        <title>Reels - HSocial</title>
        <meta name="description" content="Descubre videos cortos y creativos de la comunidad universitaria" />
      </Helmet>

      {/* Header solo en móvil */}
      {shouldUseMobileLayout && (
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-center">
              Reels
            </h1>
            <p className="text-center opacity-90 mt-2 text-sm">
              Videos creativos de la comunidad
            </p>
          </div>
        </div>
      )}

      {/* Layout responsive */}
      <ReelsDesktopLayout>
        {reelsContent}
      </ReelsDesktopLayout>
    </FacebookLayout>
  );
}