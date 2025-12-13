import { useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  fps: number;
  networkRequests: number;
}

export function usePerformanceMonitor() {
  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    fps: 0,
    networkRequests: 0
  });
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const renderStartRef = useRef<number>();

  // Monitor FPS
  const measureFPS = useCallback(() => {
    const now = performance.now();
    frameCountRef.current++;
    
    if (now - lastTimeRef.current >= 1000) {
      metricsRef.current.fps = Math.round(
        (frameCountRef.current * 1000) / (now - lastTimeRef.current)
      );
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }
    
    requestAnimationFrame(measureFPS);
  }, []);

  // Monitor memory usage
  const measureMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metricsRef.current.memoryUsage = Math.round(
        memory.usedJSHeapSize / 1024 / 1024
      );
    }
  }, []);

  // Mark render start
  const markRenderStart = useCallback(() => {
    renderStartRef.current = performance.now();
  }, []);

  // Mark render end
  const markRenderEnd = useCallback(() => {
    if (renderStartRef.current) {
      metricsRef.current.renderTime = performance.now() - renderStartRef.current;
    }
  }, []);

  // Get current metrics
  const getMetrics = useCallback((): PerformanceMetrics => {
    measureMemory();
    return { ...metricsRef.current };
  }, [measureMemory]);

  // Log performance warnings (reduced frequency for production)
  const logWarnings = useCallback(() => {
    // Only log warnings in development for better performance
    if (process.env.NODE_ENV === 'development') {
      const metrics = getMetrics();
      
      if (metrics.renderTime > 16) {
        console.warn(`🐌 Slow render detected: ${metrics.renderTime.toFixed(2)}ms`);
      }
      
      if (metrics.memoryUsage > 100) {
        console.warn(`🧠 High memory usage: ${metrics.memoryUsage}MB`);
      }
      
      if (metrics.fps < 30) {
        console.warn(`📱 Low FPS detected: ${metrics.fps}`);
      }
    }
  }, [getMetrics]);

  useEffect(() => {
    // Start FPS monitoring
    requestAnimationFrame(measureFPS);
    
    // Monitor performance every 10 seconds (reduced frequency)
    const interval = setInterval(logWarnings, 10000);
    
    return () => clearInterval(interval);
  }, [measureFPS, logWarnings]);

  return {
    getMetrics,
    markRenderStart,
    markRenderEnd,
    logWarnings
  };
}