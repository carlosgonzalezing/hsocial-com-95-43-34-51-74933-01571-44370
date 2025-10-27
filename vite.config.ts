import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Console removal is now handled by Terser configuration

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      // Ensure correct MIME types for JS modules
      'Content-Type': 'application/javascript; charset=utf-8',
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Production optimizations
    minify: 'terser',
    sourcemap: false,
    assetsInlineLimit: 0, // Prevent inline assets that can cause MIME issues
    terserOptions: {
      compress: {
        // Remove console.log, console.debug, console.info in production
        // Keep console.warn and console.error for important debugging
        drop_console: false,
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor libraries
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          
          // Database and query management
          supabase: ['@supabase/supabase-js'],
          query: ['@tanstack/react-query'],
          
          // UI component libraries
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-avatar'],
          radix: ['@radix-ui/react-toast', '@radix-ui/react-tabs', '@radix-ui/react-select'],
          
          // Animation and styling
          animations: ['framer-motion'],
          icons: ['lucide-react'],
          
          // Utilities
          utils: ['date-fns', 'lodash-es', 'clsx', 'class-variance-authority'],
        },
      },
    },
  },
}));
