import { useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Performance optimization hook to handle fast navigation
export function usePerformanceOptimization() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationTimeoutRef = useRef<NodeJS.Timeout>();
  const lastNavigationTime = useRef<number>(0);
  
  // Debounced navigation to prevent rapid route changes
  const optimizedNavigate = useCallback((path: string, options?: any) => {
    const now = Date.now();
    const timeSinceLastNav = now - lastNavigationTime.current;
    
    // Prevent navigation if too recent (less than 300ms)
    if (timeSinceLastNav < 300) {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      
      navigationTimeoutRef.current = setTimeout(() => {
        navigate(path, options);
        lastNavigationTime.current = Date.now();
      }, 300 - timeSinceLastNav);
      
      return;
    }
    
    navigate(path, options);
    lastNavigationTime.current = now;
  }, [navigate]);

  // Preload critical routes
  useEffect(() => {
    const preloadRoutes = ['/friends', '/messages', '/notifications', '/profile'];
    
    const preloadPromises = preloadRoutes.map(route => {
      return import(`../pages${route.split('/').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')}.tsx`)
        .catch(() => {
          // Ignore preload errors
        });
    });

    Promise.all(preloadPromises);
  }, []);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  // Image lazy loading optimization
  const optimizeImages = useCallback(() => {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px'
    });

    images.forEach(img => imageObserver.observe(img));

    return () => imageObserver.disconnect();
  }, []);

  // Memory cleanup on route change
  useEffect(() => {
    const cleanup = () => {
      // Clear any pending timeouts
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      
      // Force garbage collection hint
      if (window.gc) {
        window.gc();
      }
    };

    return cleanup;
  }, [location.pathname]);

  return {
    optimizedNavigate,
    optimizeImages
  };
}