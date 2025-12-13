import { debounce } from 'lodash-es';

class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private observers: Map<string, IntersectionObserver> = new Map();
  private animationFrames: Set<number> = new Set();

  static getInstance() {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Optimized image lazy loading
  createLazyImageObserver(callback: (entries: IntersectionObserverEntry[]) => void) {
    const observerId = Math.random().toString(36).substr(2, 9);
    
    const observer = new IntersectionObserver(
      debounce(callback, 50),
      {
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    this.observers.set(observerId, observer);
    return { observer, observerId };
  }

  // Cleanup observer
  cleanupObserver(observerId: string) {
    const observer = this.observers.get(observerId);
    if (observer) {
      observer.disconnect();
      this.observers.delete(observerId);
    }
  }

  // Optimized scroll handler
  createScrollHandler(callback: () => void, delay = 16) {
    return debounce(callback, delay);
  }

  // Request animation frame with cleanup tracking
  requestAnimationFrame(callback: FrameRequestCallback) {
    const frameId = requestAnimationFrame((timestamp) => {
      this.animationFrames.delete(frameId);
      callback(timestamp);
    });
    
    this.animationFrames.add(frameId);
    return frameId;
  }

  // Cancel animation frame
  cancelAnimationFrame(frameId: number) {
    cancelAnimationFrame(frameId);
    this.animationFrames.delete(frameId);
  }

  // Cleanup all pending animations
  cleanup() {
    // Cancel all pending animation frames
    this.animationFrames.forEach(frameId => {
      cancelAnimationFrame(frameId);
    });
    this.animationFrames.clear();

    // Disconnect all observers
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
  }

  // Memory usage optimization
  cleanupMemory() {
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }

    // Clear unused event listeners
    this.cleanup();
  }

  // Bundle splitting helper
  lazy<T>(importFn: () => Promise<{ default: T }>) {
    return importFn;
  }

  // Preload critical resources
  preloadResource(url: string, type: 'script' | 'style' | 'image' = 'script') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    switch (type) {
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
      case 'image':
        link.as = 'image';
        break;
    }
    
    document.head.appendChild(link);
  }
}

export const performanceOptimizer = PerformanceOptimizer.getInstance();

// Auto cleanup on page unload
window.addEventListener('beforeunload', () => {
  performanceOptimizer.cleanup();
});