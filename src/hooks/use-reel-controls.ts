
import { useState, useEffect, RefObject } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function useReelControls(
  videoRef: RefObject<HTMLVideoElement>,
  setIsFullscreen: (value: boolean) => void
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Intentar iniciar con sonido
  const isMobile = useIsMobile();

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.error("Play failed:", error);
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const enableFullscreen = () => {
    const videoEl = videoRef.current as any;
    const card = videoRef.current?.closest('.reel-card') as any;

    if (!card && !videoEl) {
      console.error("No se pudo encontrar el contenedor del reel ni el video");
      return;
    }

    // iOS Safari: solo permite fullscreen en el elemento <video>
    if (videoEl && typeof videoEl.webkitEnterFullscreen === 'function') {
      try {
        videoEl.webkitEnterFullscreen();
        setIsFullscreen(true);
        console.log("Reel en pantalla completa (iOS video)");
        return;
      } catch (err: any) {
        console.warn("Fallo webkitEnterFullscreen, probando estándar:", err?.message);
      }
    }

    const target = card || videoEl;
    try {
      const req = target?.requestFullscreen?.()
        || target?.webkitRequestFullscreen?.()
        || target?.mozRequestFullScreen?.()
        || target?.msRequestFullscreen?.();

      if (req && typeof req.then === 'function') {
        req
          .then(() => {
            setIsFullscreen(true);
            console.log("Reel en pantalla completa");
          })
          .catch((err: any) => {
            console.error(`Error al activar pantalla completa: ${err?.message ?? err}`);
          });
      } else {
        // Algunos prefijos no devuelven promesa
        setIsFullscreen(true);
        console.log("Reel en pantalla completa (sin promesa)");
      }
    } catch (err: any) {
      console.error(`Error al activar pantalla completa: ${err?.message ?? err}`);
    }
  };

  const toggleFullscreen = () => {
    const videoEl = videoRef.current as any;

    if (!document.fullscreenElement) {
      // Entrar a fullscreen (con fallbacks e iOS)
      enableFullscreen();
      return;
    }

    // Salir de fullscreen estándar
    if (document.exitFullscreen) {
      document.exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
          console.log("Saliendo de pantalla completa");
        })
        .catch((err: any) => {
          console.error(`Error al salir de pantalla completa: ${err?.message ?? err}`);
        });
      return;
    }

    // iOS video fullscreen (webkit)
    try {
      if (videoEl && typeof videoEl.webkitExitFullscreen === 'function') {
        videoEl.webkitExitFullscreen();
        setIsFullscreen(false);
        console.log("Saliendo de pantalla completa (iOS video)");
        return;
      }
    } catch (err: any) {
      console.error(`Error al salir de pantalla completa (iOS): ${err?.message ?? err}`);
    }
  };

  const handleReelClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    togglePlay();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Intentar iniciar con sonido por defecto
    video.muted = false;
    setIsMuted(false);
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => setIsMuted(video.muted);
    
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [videoRef]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      console.log("Estado de fullscreen cambiado:", !!document.fullscreenElement);
    };

    const videoEl = videoRef.current as any;
    const handleWebkitBegin = () => {
      setIsFullscreen(true);
      console.log("webkitbeginfullscreen");
    };
    const handleWebkitEnd = () => {
      setIsFullscreen(false);
      console.log("webkitendfullscreen");
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    if (videoEl) {
      videoEl.addEventListener('webkitbeginfullscreen', handleWebkitBegin);
      videoEl.addEventListener('webkitendfullscreen', handleWebkitEnd);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (videoEl) {
        videoEl.removeEventListener('webkitbeginfullscreen', handleWebkitBegin);
        videoEl.removeEventListener('webkitendfullscreen', handleWebkitEnd);
      }
    };
  }, [setIsFullscreen, videoRef]);

  return {
    isPlaying,
    isMuted,
    togglePlay,
    toggleMute,
    handleReelClick,
    toggleFullscreen,
    enableFullscreen
  };
}
