import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { FacebookLayout } from '@/components/layout/FacebookLayout';
import { ReelsInfiniteViewer } from '@/components/reels/ReelsInfiniteViewer';
import { ReelsDesktopLayout } from '@/components/reels/ReelsDesktopLayout';
import { useReelsFeed } from '@/hooks/reels/use-reels-feed';
import { useMobileDetection } from '@/hooks/use-mobile-detection';

export default function Reels() {
  const { reelId } = useParams();
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
      initialPostId={reelId}
    />
  ) : (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-center text-white max-w-md mx-auto px-6">
        <div className="text-6xl mb-4">🎬</div>
        <h3 className="text-xl font-semibold mb-2">
          No hay videos disponibles
        </h3>
        <p className="text-gray-400 mb-4">
          No se encontraron videos en la base de datos. 
          {videosPosts.length === 0 && ' Intenta subir un video para probar los reels.'}
        </p>
        <div className="text-xs text-gray-500 bg-gray-800 rounded p-3 text-left">
          <p className="font-semibold mb-1">Debug info:</p>
          <p>Total posts: {videosPosts.length}</p>
          <p>Reels encontrados: {videosPosts.length}</p>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );

  return (
    <FacebookLayout hideNavigation={!shouldUseMobileLayout} hideLeftSidebar={!shouldUseMobileLayout}>
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