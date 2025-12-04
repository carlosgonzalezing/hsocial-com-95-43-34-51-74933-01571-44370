import { Helmet } from 'react-helmet-async';
import React from 'react';

export interface SEOData {
  title: string;
  description: string;
  canonical?: string;
  robots?: string;
}

// Safe SEO component using react-helmet-async
export const SEOHead: React.FC<SEOData> = ({ title, description, canonical, robots }) => {
  return React.createElement(Helmet, {}, [
    React.createElement('title', { key: 'title' }, title),
    React.createElement('meta', { 
      key: 'description', 
      name: 'description', 
      content: description 
    }),
    canonical && React.createElement('link', { 
      key: 'canonical', 
      rel: 'canonical', 
      href: canonical 
    }),
    robots && React.createElement('meta', { 
      key: 'robots', 
      name: 'robots', 
      content: robots 
    })
  ].filter(Boolean));
};

// Safe download utility
export const safeDownload = (url: string, filename: string) => {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Add to body, trigger download, then remove
    document.body.appendChild(link);
    link.click();
    
    // Use setTimeout to ensure download starts before cleanup
    setTimeout(() => {
      if (link && link.parentNode) {
        document.body.removeChild(link);
      }
    }, 100);
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback: open in new window
    window.open(url, '_blank');
  }
};