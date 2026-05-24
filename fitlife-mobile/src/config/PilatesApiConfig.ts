import { getApiOrigin } from '../constants/apiConfig';

export function getApiBaseUrl(): string {
  return getApiOrigin();
}
