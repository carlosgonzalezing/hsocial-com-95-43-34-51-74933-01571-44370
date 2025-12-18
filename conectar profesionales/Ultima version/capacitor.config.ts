import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.393404ceed804f3d8b004201f9d67790',
  appName: 'hsocial-com-95-43-34-51-34',
  webDir: 'dist',
  server: {
    url: 'https://393404ce-ed80-4f3d-8b00-4201f9d67790.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#000000",
      androidSplashResourceName: "splash",
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#9b87f5",
      showSpinner: true,
      splashFullScreen: true,
      splashImmersive: true,
    },
  }
};

export default config;
