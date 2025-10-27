import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  getOptimizedImageUrl, 
  generateResponsiveSrcSet, 
  getOptimalFormat,
  createLazyLoader 
} from '@/lib/image-optimization';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  lazy?: boolean;
  responsive?: boolean;
  priority?: boolean;
  className?: string;
  fallback?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 85,
  lazy = true,
  responsive = true,
  priority = false,
  className,
  fallback = '/placeholder.svg',
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [observer, setObserver] = useState<IntersectionObserver | null>(null);

  // Get optimal format based on browser support
  const format = getOptimalFormat();
  
  // Generate optimized URLs
  const optimizedSrc = getOptimizedImageUrl(src, { width, height, quality, format });
  const responsiveSrcSet = responsive ? generateResponsiveSrcSet(src, width || 800) : undefined;

  useEffect(() => {
    if (lazy && !priority) {
      const lazyObserver = createLazyLoader();
      setObserver(lazyObserver);
      
      if (lazyObserver && imgRef.current) {
        lazyObserver.observe(imgRef.current);
      }
      
      return () => {
        if (lazyObserver) {
          lazyObserver.disconnect();
        }
      };
    }
  }, [lazy, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (observer && imgRef.current) {
      observer.unobserve(imgRef.current);
    }
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // Determine which src to use
  const imgSrc = lazy && !priority && !isLoaded ? undefined : (hasError ? fallback : optimizedSrc);
  const dataSrc = lazy && !priority ? optimizedSrc : undefined;
  const dataSrcSet = lazy && !priority ? responsiveSrcSet : undefined;

  return (
    <div className={cn("relative", className)}>
      <img
        ref={imgRef}
        src={imgSrc}
        srcSet={!lazy || priority ? responsiveSrcSet : undefined}
        data-src={dataSrc}
        data-srcset={dataSrcSet}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          lazy && !isLoaded && "lazy-loading opacity-0",
          isLoaded && "lazy-loaded opacity-100",
          !lazy && "opacity-100"
        )}
        {...props}
      />
      
      {/* Loading placeholder */}
      {lazy && !isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
}

// Preset components for common use cases
export function AvatarImage({ src, alt, size = 40, ...props }: {
  src: string;
  alt: string;
  size?: number;
} & Omit<OptimizedImageProps, 'width' | 'height'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      quality={90}
      lazy={false}
      responsive={false}
      className="rounded-full object-cover"
      {...props}
    />
  );
}

export function PostImage({ src, alt, ...props }: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={800}
      height={600}
      quality={85}
      lazy={true}
      responsive={true}
      className="rounded-lg object-contain w-full bg-muted/30"
      {...props}
    />
  );
}

export function HeroImage({ src, alt, ...props }: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={1920}
      height={1080}
      quality={90}
      lazy={false}
      priority={true}
      responsive={true}
      className="w-full h-full object-cover"
      {...props}
    />
  );
}