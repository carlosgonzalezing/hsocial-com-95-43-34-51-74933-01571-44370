import { useState, useEffect } from 'react';

export function useHoverSupport() {
  const [supportsHover, setSupportsHover] = useState(false);

  useEffect(() => {
    // Detectar si el dispositivo soporta hover
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setSupportsHover(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setSupportsHover(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return supportsHover;
}