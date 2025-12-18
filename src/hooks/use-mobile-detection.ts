import { useState, useEffect } from 'react';

export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTabletUA = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Screen size detection
      const width = window.innerWidth;
      let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
      
      if (width < 640) size = 'sm';
      else if (width < 768) size = 'md';
      else if (width < 1024) size = 'lg';
      else size = 'xl';

      setIsMobile(isMobileUA && !isTabletUA);
      setIsTablet(isTabletUA);
      setIsTouchDevice(hasTouchScreen);
      setScreenSize(size);
    };

    checkDevice();
    
    const handleResize = () => {
      checkDevice();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSmallScreen = screenSize === 'sm';
  const isMediumScreen = screenSize === 'md';
  const isLargeScreen = screenSize === 'lg' || screenSize === 'xl';

  return {
    isMobile,
    isTablet,
    isTouchDevice,
    screenSize,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    // Helper functions
    shouldUseMobileLayout: isMobile || isSmallScreen,
    shouldShowCompactUI: isMobile || screenSize === 'sm',
    touchTargetSize: isTouchDevice ? '48px' : '40px'
  };
}