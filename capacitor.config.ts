import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7f24e7a48e2544598774a9f77d3a74cd',
  appName: 'arabiatv',
  webDir: 'dist',
  server: {
    url: 'https://7f24e7a4-8e25-4459-8774-a9f77d3a74cd.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    // Force landscape orientation
    overrideUserAgent: 'ArabiaTV Android',
  },
  ios: {
    // Force landscape orientation  
    overrideUserAgent: 'ArabiaTV iOS',
  }
};

export default config;
