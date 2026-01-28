import { useCallback, useRef } from 'react';

// Optimización de imágenes con WebP y diferentes tamaños
export const getOptimizedImageUrl = (
  baseUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
  } = {}
): string => {
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // Si es URL externa, retornar tal cual
  if (baseUrl.startsWith('http')) {
    return baseUrl;
  }
  
  // Construir URL optimizada
  const params = new URLSearchParams();
  
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  if (quality !== 80) params.append('q', quality.toString());
  if (format !== 'webp') params.append('f', format);
  
  const paramString = params.toString();
  return paramString ? `${baseUrl}?${paramString}` : baseUrl;
};

// Generación de srcset para imágenes responsivas
export const generateSrcSet = (
  baseUrl: string,
  sizes: number[],
  format: 'webp' | 'avif' | 'jpg' | 'png' = 'webp'
): string => {
  return sizes
    .map(size => `${getOptimizedImageUrl(baseUrl, { width: size, format })} ${size}w`)
    .join(', ');
};

// Detectar soporte de formatos de imagen modernos
export const supportsWebP = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

export const supportsAVIF = async (): Promise<boolean> => {
  const avif = new Image();
  avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  
  return new Promise((resolve) => {
    avif.onload = () => resolve(true);
    avif.onerror = () => resolve(false);
    setTimeout(() => resolve(false), 1000);
  });
};

// Carga diferida de scripts
export const loadScript = (src: string, async = true, defer = false): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = async;
    script.defer = defer;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    
    document.head.appendChild(script);
  });
};

// Prefetch de recursos críticos
export const prefetchResources = (resources: string[]) => {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = resource;
    link.as = resource.endsWith('.js') ? 'script' : 
              resource.endsWith('.css') ? 'style' : 
              resource.match(/\.(jpg|jpeg|png|webp|avif)$/i) ? 'image' : 'fetch';
    
    document.head.appendChild(link);
  });
};

// Preload de recursos críticos
export const preloadCriticalResources = (resources: string[]) => {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.js') ? 'script' : 
              resource.endsWith('.css') ? 'style' : 
              resource.match(/\.(jpg|jpeg|png|webp|avif)$/i) ? 'image' : 'fetch';
    
    document.head.appendChild(link);
  });
};

// Optimización de CSS - carga diferida
export const loadCSS = (href: string, media = 'all'): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print';
    link.onload = () => {
      link.media = media;
      resolve();
    };
    link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
    
    document.head.appendChild(link);
  });
};

// Medición de performance
export const measurePerformance = (name: string, fn: () => void | Promise<void>) => {
  const start = performance.now();
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.then(() => {
      const end = performance.now();
      console.log(`${name}: ${end - start}ms`);
    });
  } else {
    const end = performance.now();
    console.log(`${name}: ${end - start}ms`);
    return result;
  }
};

// Debounce para eventos frecuentes
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle para eventos frecuentes
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Hook personalizado para Intersection Observer optimizado
export const useOptimizedIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const observe = useCallback((element: Element, callback: (isIntersecting: boolean) => void) => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            callback(entry.isIntersecting);
          });
        },
        {
          threshold: 0.1,
          rootMargin: '50px',
          ...options
        }
      );
    }
    
    observerRef.current.observe(element);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.unobserve(element);
      }
    };
  }, [options]);
  
  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);
  
  return { observe, disconnect };
};
