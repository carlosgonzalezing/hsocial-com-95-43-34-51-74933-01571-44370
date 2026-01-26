// vite.config.ts
import { defineConfig } from "file:///C:/Users/Admin/Desktop/Nueva%20carpeta%20(2)/HsocialVersionFinal-main/LIMPIO/hsocial-com-95-43-34-51-74933-01571-44370-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Admin/Desktop/Nueva%20carpeta%20(2)/HsocialVersionFinal-main/LIMPIO/hsocial-com-95-43-34-51-74933-01571-44370-main/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///C:/Users/Admin/Desktop/Nueva%20carpeta%20(2)/HsocialVersionFinal-main/LIMPIO/hsocial-com-95-43-34-51-74933-01571-44370-main/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Admin\\Desktop\\Nueva carpeta (2)\\HsocialVersionFinal-main\\LIMPIO\\hsocial-com-95-43-34-51-74933-01571-44370-main";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
    // Headers removidos para evitar conflictos con el servidor de Vite
    // Vite maneja automáticamente los tipos MIME correctos
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  // Configuración para producción en Render.com
  base: mode === "production" ? "/" : "/",
  build: {
    // Production optimizations
    minify: "esbuild",
    sourcemap: false,
    assetsInlineLimit: 0,
    // Prevent inline assets that can cause MIME issues
    terserOptions: {
      compress: {
        // Remove console.log, console.debug, console.info in production
        // Keep console.warn and console.error for important debugging
        drop_console: false,
        pure_funcs: ["console.log", "console.debug", "console.info"]
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor libraries
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          // Database and query management
          supabase: ["@supabase/supabase-js"],
          query: ["@tanstack/react-query"],
          // UI component libraries
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-avatar"],
          radix: ["@radix-ui/react-toast", "@radix-ui/react-tabs", "@radix-ui/react-select"],
          // Animation and styling
          animations: ["framer-motion"],
          icons: ["lucide-react"],
          // Utilities
          utils: ["date-fns", "lodash-es", "clsx", "class-variance-authority"]
        }
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pblxcXFxEZXNrdG9wXFxcXE51ZXZhIGNhcnBldGEgKDIpXFxcXEhzb2NpYWxWZXJzaW9uRmluYWwtbWFpblxcXFxMSU1QSU9cXFxcaHNvY2lhbC1jb20tOTUtNDMtMzQtNTEtNzQ5MzMtMDE1NzEtNDQzNzAtbWFpblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcQWRtaW5cXFxcRGVza3RvcFxcXFxOdWV2YSBjYXJwZXRhICgyKVxcXFxIc29jaWFsVmVyc2lvbkZpbmFsLW1haW5cXFxcTElNUElPXFxcXGhzb2NpYWwtY29tLTk1LTQzLTM0LTUxLTc0OTMzLTAxNTcxLTQ0MzcwLW1haW5cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0FkbWluL0Rlc2t0b3AvTnVldmElMjBjYXJwZXRhJTIwKDIpL0hzb2NpYWxWZXJzaW9uRmluYWwtbWFpbi9MSU1QSU8vaHNvY2lhbC1jb20tOTUtNDMtMzQtNTEtNzQ5MzMtMDE1NzEtNDQzNzAtbWFpbi92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xyXG5cclxuLy8gQ29uc29sZSByZW1vdmFsIGlzIG5vdyBoYW5kbGVkIGJ5IFRlcnNlciBjb25maWd1cmF0aW9uXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCI6OlwiLFxyXG4gICAgcG9ydDogODA4MCxcclxuICAgIC8vIEhlYWRlcnMgcmVtb3ZpZG9zIHBhcmEgZXZpdGFyIGNvbmZsaWN0b3MgY29uIGVsIHNlcnZpZG9yIGRlIFZpdGVcclxuICAgIC8vIFZpdGUgbWFuZWphIGF1dG9tXHUwMEUxdGljYW1lbnRlIGxvcyB0aXBvcyBNSU1FIGNvcnJlY3Rvc1xyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiYgY29tcG9uZW50VGFnZ2VyKCksXHJcbiAgXS5maWx0ZXIoQm9vbGVhbiksXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgLy8gQ29uZmlndXJhY2lcdTAwRjNuIHBhcmEgcHJvZHVjY2lcdTAwRjNuIGVuIFJlbmRlci5jb21cclxuICBiYXNlOiBtb2RlID09PSAncHJvZHVjdGlvbicgPyAnLycgOiAnLycsXHJcbiAgYnVpbGQ6IHtcclxuICAgIC8vIFByb2R1Y3Rpb24gb3B0aW1pemF0aW9uc1xyXG4gICAgbWluaWZ5OiAnZXNidWlsZCcsXHJcbiAgICBzb3VyY2VtYXA6IGZhbHNlLFxyXG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDAsIC8vIFByZXZlbnQgaW5saW5lIGFzc2V0cyB0aGF0IGNhbiBjYXVzZSBNSU1FIGlzc3Vlc1xyXG4gICAgdGVyc2VyT3B0aW9uczoge1xyXG4gICAgICBjb21wcmVzczoge1xyXG4gICAgICAgIC8vIFJlbW92ZSBjb25zb2xlLmxvZywgY29uc29sZS5kZWJ1ZywgY29uc29sZS5pbmZvIGluIHByb2R1Y3Rpb25cclxuICAgICAgICAvLyBLZWVwIGNvbnNvbGUud2FybiBhbmQgY29uc29sZS5lcnJvciBmb3IgaW1wb3J0YW50IGRlYnVnZ2luZ1xyXG4gICAgICAgIGRyb3BfY29uc29sZTogZmFsc2UsXHJcbiAgICAgICAgcHVyZV9mdW5jczogWydjb25zb2xlLmxvZycsICdjb25zb2xlLmRlYnVnJywgJ2NvbnNvbGUuaW5mbyddLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XHJcbiAgICAgICAgICAvLyBDb3JlIHZlbmRvciBsaWJyYXJpZXNcclxuICAgICAgICAgIHZlbmRvcjogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcclxuICAgICAgICAgIHJvdXRlcjogWydyZWFjdC1yb3V0ZXItZG9tJ10sXHJcbiAgICAgICAgICBcclxuICAgICAgICAgIC8vIERhdGFiYXNlIGFuZCBxdWVyeSBtYW5hZ2VtZW50XHJcbiAgICAgICAgICBzdXBhYmFzZTogWydAc3VwYWJhc2Uvc3VwYWJhc2UtanMnXSxcclxuICAgICAgICAgIHF1ZXJ5OiBbJ0B0YW5zdGFjay9yZWFjdC1xdWVyeSddLFxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAvLyBVSSBjb21wb25lbnQgbGlicmFyaWVzXHJcbiAgICAgICAgICB1aTogWydAcmFkaXgtdWkvcmVhY3QtZGlhbG9nJywgJ0ByYWRpeC11aS9yZWFjdC1kcm9wZG93bi1tZW51JywgJ0ByYWRpeC11aS9yZWFjdC1hdmF0YXInXSxcclxuICAgICAgICAgIHJhZGl4OiBbJ0ByYWRpeC11aS9yZWFjdC10b2FzdCcsICdAcmFkaXgtdWkvcmVhY3QtdGFicycsICdAcmFkaXgtdWkvcmVhY3Qtc2VsZWN0J10sXHJcbiAgICAgICAgICBcclxuICAgICAgICAgIC8vIEFuaW1hdGlvbiBhbmQgc3R5bGluZ1xyXG4gICAgICAgICAgYW5pbWF0aW9uczogWydmcmFtZXItbW90aW9uJ10sXHJcbiAgICAgICAgICBpY29uczogWydsdWNpZGUtcmVhY3QnXSxcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gVXRpbGl0aWVzXHJcbiAgICAgICAgICB1dGlsczogWydkYXRlLWZucycsICdsb2Rhc2gtZXMnLCAnY2xzeCcsICdjbGFzcy12YXJpYW5jZS1hdXRob3JpdHknXSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG59KSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMmlCLFNBQVMsb0JBQW9CO0FBQ3hrQixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSGhDLElBQU0sbUNBQW1DO0FBUXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUE7QUFBQSxFQUdSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTLGlCQUFpQixnQkFBZ0I7QUFBQSxFQUM1QyxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBRUEsTUFBTSxTQUFTLGVBQWUsTUFBTTtBQUFBLEVBQ3BDLE9BQU87QUFBQTtBQUFBLElBRUwsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsbUJBQW1CO0FBQUE7QUFBQSxJQUNuQixlQUFlO0FBQUEsTUFDYixVQUFVO0FBQUE7QUFBQTtBQUFBLFFBR1IsY0FBYztBQUFBLFFBQ2QsWUFBWSxDQUFDLGVBQWUsaUJBQWlCLGNBQWM7QUFBQSxNQUM3RDtBQUFBLElBQ0Y7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQTtBQUFBLFVBRVosUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBLFVBQzdCLFFBQVEsQ0FBQyxrQkFBa0I7QUFBQTtBQUFBLFVBRzNCLFVBQVUsQ0FBQyx1QkFBdUI7QUFBQSxVQUNsQyxPQUFPLENBQUMsdUJBQXVCO0FBQUE7QUFBQSxVQUcvQixJQUFJLENBQUMsMEJBQTBCLGlDQUFpQyx3QkFBd0I7QUFBQSxVQUN4RixPQUFPLENBQUMseUJBQXlCLHdCQUF3Qix3QkFBd0I7QUFBQTtBQUFBLFVBR2pGLFlBQVksQ0FBQyxlQUFlO0FBQUEsVUFDNUIsT0FBTyxDQUFDLGNBQWM7QUFBQTtBQUFBLFVBR3RCLE9BQU8sQ0FBQyxZQUFZLGFBQWEsUUFBUSwwQkFBMEI7QUFBQSxRQUNyRTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
