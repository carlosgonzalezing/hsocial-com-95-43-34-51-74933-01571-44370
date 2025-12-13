import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostImage } from "@/components/ui/optimized-image";
import { ImageModal } from "./ImageModal";
import { VideoModal } from "./VideoModal";

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface MediaCarouselProps {
  mediaItems: MediaItem[];
  className?: string;
}

export function MediaCarousel({ mediaItems, className = "" }: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  if (!mediaItems || mediaItems.length === 0) return null;

  const currentMedia = mediaItems[currentIndex];
  const hasMultiple = mediaItems.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  const handleMediaClick = () => {
    if (currentMedia.type === 'image') {
      setIsImageModalOpen(true);
    } else {
      setIsVideoModalOpen(true);
    }
  };

  // Estilo LinkedIn: primera imagen grande, resto pequeñas abajo
  if (mediaItems.length === 1) {
    return (
      <div className={`w-full ${className}`}>
        {currentMedia.type === 'image' ? (
          <PostImage
            src={currentMedia.url}
            alt="Contenido multimedia"
            className="w-full h-auto rounded-none cursor-zoom-in"
            onClick={handleMediaClick}
          />
        ) : (
          <video
            src={currentMedia.url}
            className="w-full max-h-[600px] object-contain rounded-none cursor-pointer"
            onClick={handleMediaClick}
            controls
            preload="metadata"
          />
        )}
      </div>
    );
  }

  // Múltiples medios: estilo LinkedIn
  return (
    <div className={`relative w-full ${className}`}>
      {/* Media principal */}
      <div className="relative w-full">
        {currentMedia.type === 'image' ? (
          <PostImage
            src={currentMedia.url}
            alt={`Media ${currentIndex + 1} de ${mediaItems.length}`}
            className="w-full h-auto rounded-none cursor-zoom-in"
            onClick={handleMediaClick}
          />
        ) : (
          <video
            src={currentMedia.url}
            className="w-full max-h-[600px] object-contain rounded-none cursor-pointer"
            onClick={handleMediaClick}
            controls
            preload="metadata"
          />
        )}

        {/* Navegación si hay múltiples */}
        {hasMultiple && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Indicador de posición */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
              {currentIndex + 1} / {mediaItems.length}
            </div>
          </>
        )}
      </div>

      {/* Miniaturas estilo LinkedIn (si hay más de 1) */}
      {hasMultiple && mediaItems.length > 1 && (
        <div className="grid grid-cols-2 gap-1 mt-1">
          {mediaItems.slice(0, 4).map((item, index) => (
            <div
              key={index}
              className={`relative cursor-pointer border-2 transition-all ${
                index === currentIndex ? 'border-primary' : 'border-transparent'
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              {item.type === 'image' ? (
                <PostImage
                  src={item.url}
                  alt={`Miniatura ${index + 1}`}
                  className="w-full h-24 object-cover"
                  lazy={false}
                />
              ) : (
                <div className="relative w-full h-24 bg-black">
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 rounded-full p-1">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {mediaItems.length > 4 && (
            <div
              className="relative cursor-pointer border-2 border-transparent bg-muted flex items-center justify-center"
              onClick={() => setCurrentIndex(4)}
            >
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">+{mediaItems.length - 4}</div>
                <div className="text-xs text-muted-foreground">más</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      {currentMedia.type === 'image' && (
        <ImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          imageUrl={currentMedia.url}
          altText={`Imagen ${currentIndex + 1} de ${mediaItems.length}`}
        />
      )}
      {currentMedia.type === 'video' && (
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={currentMedia.url}
          altText={`Video ${currentIndex + 1} de ${mediaItems.length}`}
        />
      )}
    </div>
  );
}
