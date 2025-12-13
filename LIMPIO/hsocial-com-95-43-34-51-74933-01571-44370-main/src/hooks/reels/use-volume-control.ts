import { useState, useEffect, useCallback, useRef } from 'react';

const VOLUME_STORAGE_KEY = 'reels_volume';
const MUTE_STORAGE_KEY = 'reels_muted';

export function useVolumeControl(videoRef: React.RefObject<HTMLVideoElement>) {
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem(VOLUME_STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 50;
  });
  
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem(MUTE_STORAGE_KEY);
    return saved === 'true';
  });
  
  const [showSlider, setShowSlider] = useState(false);
  const sliderTimeoutRef = useRef<NodeJS.Timeout>();

  // Aplicar volumen al video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted, videoRef]);

  // Persistir en localStorage
  useEffect(() => {
    localStorage.setItem(VOLUME_STORAGE_KEY, volume.toString());
    localStorage.setItem(MUTE_STORAGE_KEY, isMuted.toString());
  }, [volume, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    showSliderTemporarily();
  }, []);

  const changeVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, newVolume));
    setVolume(clampedVolume);
    if (clampedVolume > 0 && isMuted) {
      setIsMuted(false);
    }
    showSliderTemporarily();
  }, [isMuted]);

  const showSliderTemporarily = useCallback(() => {
    setShowSlider(true);
    if (sliderTimeoutRef.current) {
      clearTimeout(sliderTimeoutRef.current);
    }
    sliderTimeoutRef.current = setTimeout(() => {
      setShowSlider(false);
    }, 2000);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'ArrowUp' && e.shiftKey) {
        e.preventDefault();
        changeVolume(volume + 10);
      } else if (e.code === 'ArrowDown' && e.shiftKey) {
        e.preventDefault();
        changeVolume(volume - 10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, toggleMute, changeVolume]);

  return {
    volume,
    isMuted,
    showSlider,
    toggleMute,
    changeVolume,
    showSliderTemporarily
  };
}
