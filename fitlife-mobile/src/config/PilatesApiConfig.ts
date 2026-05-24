import { getApiBaseUrl as getApiBaseUrlFromConfig } from '../constants/apiConfig';

export function getApiBaseUrl(): string {
  return getApiBaseUrlFromConfig();
}
