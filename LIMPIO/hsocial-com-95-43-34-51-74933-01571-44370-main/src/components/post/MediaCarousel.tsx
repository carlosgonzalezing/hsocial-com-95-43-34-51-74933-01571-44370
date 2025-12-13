import { useState } from "react";
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

  const openAtIndex = (index: number) => {
    const item = mediaItems[index];
    if (!item) return;
    setCurrentIndex(index);
    if (item.type === 'image') {
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
          <div className="w-full overflow-hidden h-[420px] sm:h-[520px]">
            <PostImage
              src={currentMedia.url}
              alt="Contenido multimedia"
              className="w-full h-full object-cover rounded-none cursor-zoom-in"
              onClick={() => openAtIndex(0)}
            />
          </div>
        ) : (
          <video
            src={currentMedia.url}
            className="w-full max-h-[520px] object-contain rounded-none cursor-pointer"
            onClick={() => openAtIndex(0)}
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
      <div className="w-full overflow-hidden">
        {/* Grid tipo Facebook con altura fija */}
        {(() => {
          const total = mediaItems.length;
          const heightClass = "h-[420px] sm:h-[520px]";

          const Tile = ({ item, index, overlayText }: { item: MediaItem; index: number; overlayText?: string }) => (
            <button
              type="button"
              className="relative w-full h-full overflow-hidden"
              onClick={() => openAtIndex(index)}
            >
              {item.type === 'image' ? (
                <PostImage
                  src={item.url}
                  alt={`Media ${index + 1} de ${total}`}
                  className="w-full h-full object-cover"
                  lazy={false}
                />
              ) : (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              )}
              {overlayText && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">{overlayText}</span>
                </div>
              )}
            </button>
          );

          if (total === 2) {
            return (
              <div className={`grid grid-cols-2 gap-[2px] ${heightClass}`}>
                <Tile item={mediaItems[0]} index={0} />
                <Tile item={mediaItems[1]} index={1} />
              </div>
            );
          }

          if (total === 3) {
            return (
              <div className={`grid grid-cols-2 grid-rows-2 gap-[2px] ${heightClass}`}>
                <div className="row-span-2">
                  <Tile item={mediaItems[0]} index={0} />
                </div>
                <Tile item={mediaItems[1]} index={1} />
                <Tile item={mediaItems[2]} index={2} />
              </div>
            );
          }

          if (total === 4) {
            return (
              <div className={`grid grid-cols-2 gap-[2px] ${heightClass}`}>
                <div className="h-full">
                  <Tile item={mediaItems[0]} index={0} />
                </div>
                <div className="grid grid-rows-3 gap-[2px] h-full">
                  <Tile item={mediaItems[1]} index={1} />
                  <Tile item={mediaItems[2]} index={2} />
                  <Tile item={mediaItems[3]} index={3} />
                </div>
              </div>
            );
          }

          const extra = total - 5;
          return (
            <div className={`grid grid-cols-2 gap-[2px] ${heightClass}`}>
              <div className="h-full">
                <Tile item={mediaItems[0]} index={0} />
              </div>
              <div className="grid grid-cols-2 grid-rows-2 gap-[2px] h-full">
                <Tile item={mediaItems[1]} index={1} />
                <Tile item={mediaItems[2]} index={2} />
                <Tile item={mediaItems[3]} index={3} />
                <Tile item={mediaItems[4]} index={4} overlayText={extra > 0 ? `+${extra}` : undefined} />
              </div>
            </div>
          );
        })()}
      </div>

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
