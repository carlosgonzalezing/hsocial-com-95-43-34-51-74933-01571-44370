
import React, { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { FriendsSidebar } from "@/components/sidebar/FriendsSidebar";
import { EngagementSidebar } from "@/components/engagement/EngagementSidebar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useRealtimeInteractions } from "@/hooks/feed/hooks/use-realtime-interactions";
import { usePerformanceOptimization } from "@/hooks/use-performance-optimization";
import { useMemoryCleanup } from "@/hooks/use-memory-cleanup";
import { usePerformanceMonitor } from "@/hooks/use-performance-monitor";

export function Layout({ children }: { children: React.ReactNode }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { optimizeImages } = usePerformanceOptimization();
  const { logWarnings } = usePerformanceMonitor();
  
  // Initialize performance optimizations
  useMemoryCleanup();
  
  // Set up real-time interactions - only once per layout
  useRealtimeInteractions();

  // Optimize images on mount and route changes
  useEffect(() => {
    const cleanup = optimizeImages();
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('🔧 Service Worker registered'))
        .catch(err => console.error('❌ Service Worker registration failed:', err));
    }
    
    // Performance monitoring
    const perfInterval = setInterval(logWarnings, 30000); // Every 30 seconds
    
    return () => {
      cleanup?.();
      clearInterval(perfInterval);
    };
  }, [optimizeImages, logWarnings]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main Sidebar */}
      <Sidebar>
        <div></div>
      </Sidebar>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header>
          <div></div>
        </Header>
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Right Sidebar - Friends and Engagement */}
      {isDesktop && (
        <div className="hidden lg:block lg:w-80 border-l border-border p-4 space-y-6">
          <FriendsSidebar />
          <EngagementSidebar />
        </div>
      )}
    </div>
  );
}
