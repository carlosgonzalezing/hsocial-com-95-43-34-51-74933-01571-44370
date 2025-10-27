import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Play, Volume2, VolumeX, Heart, MessageCircle, Share2 } from "lucide-react";
import { Post } from "@/types/post";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { usePostReactions } from "@/hooks/posts/use-post-reactions";
import { useDoubleClick } from "@/hooks/use-double-click";
import { useVolumeControl } from "@/hooks/reels/use-volume-control";
import { VolumeSlider } from "./VolumeSlider";

interface ReelItemProps {
  post: Post;
  isActive: boolean;
  onReaction: (postId: string, type: string) => void;
  onViewTracked: (postId: string, duration: number) => void;
}

const ReelItem = memo(function ReelItem({ post, isActive, onReaction, onViewTracked }: ReelItemProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(post.media_url);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { userReaction, onReaction: handleReaction } = usePostReactions(post.id);
  
  // Control de volumen mejorado
  const { volume, isMuted, showSlider, toggleMute, changeVolume, showSliderTemporarily } = useVolumeControl(videoRef);

  // Auto-play cuando está visible
  const { isIntersecting } = useIntersectionObserver(containerRef, {
    threshold: 0.7, // 70% visible para activar
  });

  useEffect(() => {
    if (isActive && isIntersecting && videoRef.current) {
      setIsPlaying(true);
      setStartTime(Date.now());
      videoRef.current.play().catch(console.error);
    } else if (videoRef.current && (!isActive || !isIntersecting)) {
      setIsPlaying(false);
      videoRef.current.pause();
      
      // Track view duration
      if (startTime) {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        if (duration > 1) { // Solo trackear si vio más de 1 segundo
          onViewTracked(post.id, duration);
        }
        setStartTime(null);
      }
    }
  }, [isActive, isIntersecting, post.id, startTime, onViewTracked]);

  // El volumen se maneja en el hook useVolumeControl

  // Manejar errores de video con fallback automático
  const handleVideoError = useCallback(() => {
    // Si es un error en URL de Cloudflare R2, intentar con Supabase fallback
    if (currentSrc?.includes('cloudflare') || currentSrc?.includes('r2.dev')) {
      const fallbackUrl = currentSrc.replace(/https:\/\/[^\/]+/, 'https://wgbbaxvuuinubkgffpiq.supabase.co/storage/v1/object/public/media');
      setCurrentSrc(fallbackUrl);
    } else {
      setHasError(true);
    }
  }, [currentSrc]);

  // Reset error cuando cambia el post
  useEffect(() => {
    setHasError(false);
    setCurrentSrc(post.media_url);
  }, [post.media_url]);

  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
    if (videoRef.current) {
      if (!isPlaying) {
        videoRef.current.play();
        setStartTime(Date.now());
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Doble click para mute/unmute, single click para play/pause
  const handleVideoClick = useDoubleClick(
    togglePlay,
    () => {
      toggleMute();
      showSliderTemporarily();
    },
    300
  );

  const handleLike = () => {
    handleReaction(post.id, 'love');
    onReaction(post.id, 'love');
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen bg-black flex items-center justify-center snap-start"
    >
      {/* Video o mensaje de error */}
      {hasError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">Video no disponible</h3>
            <p className="text-gray-400">No se pudo cargar este video</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setHasError(false);
                setCurrentSrc(post.media_url);
              }}
            >
              Reintentar
            </Button>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={currentSrc || undefined}
          className="w-full h-full object-cover"
          loop
          playsInline
          muted={isMuted}
          onClick={handleVideoClick}
          onError={handleVideoError}
          onLoadStart={() => {}} // Reduce console spam
          onCanPlay={() => {}} // Reduce console spam
        />
      )}

      {/* Play/Pause overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/50 text-white hover:bg-black/70 h-16 w-16"
            onClick={() => setIsPlaying(true)}
          >
            <Play className="h-8 w-8" />
          </Button>
        </div>
      )}

      {/* Volume Slider Flotante */}
      <VolumeSlider
        volume={volume}
        isMuted={isMuted}
        show={showSlider}
        onChange={changeVolume}
        onMuteToggle={toggleMute}
      />

      {/* Indicador de estado de volumen (esquina inferior izquierda) */}
      <div className="absolute bottom-20 left-4 pointer-events-none">
        {isMuted ? (
          <VolumeX className="h-5 w-5 text-white/70" />
        ) : (
          <Volume2 className="h-5 w-5 text-white/70" />
        )}
      </div>

      {/* Action buttons - Vertical en la derecha (estilo Instagram Reels) */}
      <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center">
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className={`h-12 w-12 rounded-full ${
              userReaction === 'love' 
                ? 'bg-transparent text-red-500' 
                : 'bg-transparent text-white hover:bg-white/10'
            }`}
            onClick={handleLike}
          >
            <Heart className={`h-7 w-7 ${userReaction === 'love' ? 'fill-current' : ''}`} />
          </Button>
          <span className="text-white text-xs mt-1">{post.reactions_count || 0}</span>
        </div>

        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-transparent text-white hover:bg-white/10"
            onClick={() => onReaction(post.id, 'comment')}
          >
            <MessageCircle className="h-7 w-7" />
          </Button>
          <span className="text-white text-xs mt-1">{post.comments_count || 0}</span>
        </div>

        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-transparent text-white hover:bg-white/10"
            onClick={() => onReaction(post.id, 'share')}
          >
            <Share2 className="h-7 w-7" />
          </Button>
        </div>
      </div>

      {/* User info - Parte inferior izquierda */}
      <div className="absolute bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={post.profiles?.avatar_url} alt={post.profiles?.username} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {(post.profiles?.username || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-white">
              {post.profiles?.username || 'Usuario'}
            </h3>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-transparent border-white text-white hover:bg-white hover:text-black"
          >
            Seguir
          </Button>
        </div>
        
        {post.content && (
          <p className="text-sm text-white line-clamp-2 max-w-[70%]">
            {post.content}
          </p>
        )}
      </div>
    </div>
  );
});

interface ReelsInfiniteViewerProps {
  posts: Post[];
  onReaction: (postId: string, type: string) => void;
  onViewTracked: (postId: string, duration: number) => void;
}

export const ReelsInfiniteViewer = memo(function ReelsInfiniteViewer({ 
  posts, 
  onReaction, 
  onViewTracked 
}: ReelsInfiniteViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault();
        setCurrentIndex(currentIndex - 1);
      } else if (e.code === 'ArrowDown' && currentIndex < posts.length - 1) {
        e.preventDefault();
        setCurrentIndex(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, posts.length]);

  // Scroll to current reel
  useEffect(() => {
    if (containerRef.current) {
      const targetElement = containerRef.current.children[currentIndex] as HTMLElement;
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentIndex]);

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-muted-foreground">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold mb-2">No hay videos disponibles</h3>
          <p>Sé el primero en compartir un video creativo</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {posts.map((post, index) => (
        <ReelItem
          key={post.id}
          post={post}
          isActive={index === currentIndex}
          onReaction={onReaction}
          onViewTracked={onViewTracked}
        />
      ))}
    </div>
  );
});