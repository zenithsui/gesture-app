import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zenithsui.gesture',
  appName: 'Gesture',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#0a0a0c',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0a0a0c',
      overlaysWebView: true,
    },
    Haptics: {},
  },
  android: {
    minWebViewVersion: 60,
    allowMixedContent: false,
    captureInput: false,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
