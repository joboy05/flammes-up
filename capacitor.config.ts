import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.flammesup.app',
  appName: 'Flammes UP',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
