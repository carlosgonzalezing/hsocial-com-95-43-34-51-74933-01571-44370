// Safe SEO utilities for React apps using react-helmet-async
import { ReactNode } from 'react';

export interface SEOData {
  title: string;
  description: string;
  canonical?: string;
  robots?: string;
}

// Helper function to create safe SEO updates using useEffect
export const createSEOEffect = (seoData: SEOData) => {
  return () => {
    // Update title directly (safe)
    document.title = seoData.title;

    // Update or create meta description
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', seoData.description);

    // Update or create canonical link
    if (seoData.canonical) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', seoData.canonical);
    }

    // Update or create robots meta
    if (seoData.robots) {
      let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
      if (!robots) {
        robots = document.createElement('meta');
        robots.setAttribute('name', 'robots');
        document.head.appendChild(robots);
      }
      robots.setAttribute('content', seoData.robots);
    }

    // Return cleanup function
    return () => {
      // Cleanup is handled by React when component unmounts
      // No need to manually remove elements
    };
  };
};

// Safe download utility to prevent DOM conflicts
export const safeDownload = (url: string, filename: string) => {
  // Use a more React-friendly approach
  const downloadFile = () => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      // Add to body temporarily
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up immediately using setTimeout to avoid timing issues
      setTimeout(() => {
        if (link.parentNode) {
          document.body.removeChild(link);
        }
      }, 100);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new window
      window.open(url, '_blank');
    }
  };

  downloadFile();
};