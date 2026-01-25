import { memo, useMemo, useCallback, useState, useEffect, useRef } from 'react';

// Componente optimizado para imágenes con lazy loading
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage = memo<OptimizedImageProps>(({ 
  src, 
  alt, 
  className, 
  placeholder = '/placeholder.jpg',
  onLoad,
  onError 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      onLoad?.();
    };
    
    img.onerror = () => {
      setImageSrc(placeholder);
      setIsLoading(false);
      onError?.();
    };
    
    img.src = src;
  }, [src, placeholder, onLoad, onError]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading="lazy"
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Componente para virtual scrolling de listas grandes
interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
}

export function VirtualList<T>({ 
  items, 
  itemHeight, 
  containerHeight, 
  renderItem,
  overscan = 5 
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index
    }));
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div 
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook para memoización de cálculos pesados
export function useMemoWithDeps<T>(
  factory: () => T,
  deps: React.DependencyList,
  shouldRecalculate?: (prevDeps: React.DependencyList, nextDeps: React.DependencyList) => boolean
) {
  const prevDepsRef = useRef<React.DependencyList>();
  
  return useMemo(() => {
    if (shouldRecalculate && prevDepsRef.current) {
      if (!shouldRecalculate(prevDepsRef.current, deps)) {
        return; // No recalcular
      }
    }
    prevDepsRef.current = deps;
    return factory();
  }, deps);
}

// Componente para renderizado condicional optimizado
interface ConditionalRenderProps {
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ConditionalRender = memo<ConditionalRenderProps>(({ 
  condition, 
  children, 
  fallback = null 
}) => {
  return condition ? <>{children}</> : <>{fallback}</>;
});

ConditionalRender.displayName = 'ConditionalRender';
