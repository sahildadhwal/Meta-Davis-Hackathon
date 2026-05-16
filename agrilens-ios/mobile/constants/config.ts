import { Platform } from 'react-native';

// On simulator: localhost works. On physical device: use your Mac's local IP.
// Run `ifconfig | grep "inet "` to find it, e.g. http://192.168.1.100:3001
export const DEFAULT_BACKEND_URL = Platform.OS === 'ios'
  ? 'http://localhost:3001'
  : 'http://10.0.2.2:3001';

export const LOT_NUMBER = 'Lot #6';
export const BOB_NAME = 'Bob';
export const APP_VERSION = '0.1.0';
