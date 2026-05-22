import { Platform } from 'react-native';

const LOCAL_PORT = '5099';

const MOBILE_LOCAL_IP = 'YOUR_LOCAL_IP';

export const API_BASE_URL =
  Platform.OS === 'web'
    ? `http://localhost:${LOCAL_PORT}/api`
    : `http://${MOBILE_LOCAL_IP}:${LOCAL_PORT}/api`;