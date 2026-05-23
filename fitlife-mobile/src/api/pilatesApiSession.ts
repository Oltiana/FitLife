import { tokenStorage } from '../storage/tokenStorage';


export async function hasAuthToken(): Promise<boolean> {
  const t = await tokenStorage.getToken();
  return t != null && String(t).trim().length > 0;
}
