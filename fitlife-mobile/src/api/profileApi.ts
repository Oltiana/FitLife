import { apiClient } from './apiClient';

export const profileApi = {
  getProfile: () =>
    apiClient.get('/User/profile'),

  updateProfile: (fullName: string, email: string) =>
    apiClient.put('/User/profile', { fullName, email }),

  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) =>
    apiClient.put('/User/change-password', {
      currentPassword,
      newPassword,
    }),

  deleteAccount: () =>
    apiClient.delete('/User/account'),

  getSessions: () =>
    apiClient.get('/User/sessions'),
};
