/**
 * Image optimization utilities for better performance
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
  lazy?: boolean;
}

/**
 * Generate optimized image URL with Cloudflare transformations
 */
export function getOptimizedImageUrl(
  originalUrl: string, 
  options: ImageOptimizationOptions = {}
): string {
  if (!originalUrl) return originalUrl;
  
  const { width, height, quality = 85, format = 'auto' } = options;
  
  // If it's already a Cloudflare R2 URL, add transformations
  if (originalUrl.includes('r2.dev') || originalUrl.includes('r2.cloudflarestorage.com')) {
    const url = new URL(originalUrl);
    const params = new URLSearchParams();
    
    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    if (quality !== 85) params.append('quality', quality.toString());
    if (format !== 'auto') params.append('format', format);
    
    // Add cf-resizing for Cloudflare image optimization
    if (params.toString()) {
      url.searchParams.append('cf', params.toString());
    }
    
    return url.toString();
  }
  
  return originalUrl;
}

/**
 * Generate responsive image srcSet for different screen sizes
 */
export function generateResponsiveSrcSet(originalUrl: string, baseWidth: number = 800): string {
  if (!originalUrl) return '';
  
  const sizes = [
    { width: Math.round(baseWidth * 0.5), descriptor: '480w' },
    { width: baseWidth, descriptor: '800w' },
    { width: Math.round(baseWidth * 1.5), descriptor: '1200w' },
    { width: Math.round(baseWidth * 2), descriptor: '1600w' }
  ];
  
  return sizes
    .map(({ width, descriptor }) => 
      `${getOptimizedImageUrl(originalUrl, { width, quality: 85 })} ${descriptor}`
    )
    .join(', ');
}

/**
 * Check if browser supports WebP format
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Check if browser supports AVIF format
 */
export function supportsAVIF(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  try {
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  } catch {
    return false;
  }
}

/**
 * Get optimal image format based on browser support
 */
export function getOptimalFormat(): 'avif' | 'webp' | 'auto' {
  if (supportsAVIF()) return 'avif';
  if (supportsWebP()) return 'webp';
  return 'auto';
}

/**
 * Preload critical images for better performance
 */
export function preloadImage(src: string, priority: 'high' | 'low' = 'low'): void {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  link.fetchPriority = priority;
  
  document.head.appendChild(link);
}

/**
 * Lazy load images with intersection observer
 */
export function createLazyLoader() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          const srcset = img.dataset.srcset;
          
          if (src) img.src = src;
          if (srcset) img.srcset = srcset;
          
          img.classList.remove('lazy-loading');
          img.classList.add('lazy-loaded');
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01
    }
  );
}