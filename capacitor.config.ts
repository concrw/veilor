import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'kr.veilor.app',
  appName: 'VEILOR',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  ios: {
    backgroundColor: '#1C1917',
  },
  plugins: {
    StatusBar: {
      style: 'LIGHT',
      overlaysWebView: true,
    },
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
