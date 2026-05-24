import { api } from './api';
import { APIResponse, User } from '../types';

export const profileService = {
  /**
   * Fetch complete consolidated user profile statistics, badges, and run history.
   */
  async getProfile(userId: string): Promise<APIResponse<{ user: User; badges: any[]; runs: any[]; territoriesCount: number }>> {
    const { data } = await api.get(`/profile/${userId}`);
    return data;
  },

  /**
   * Update core user account details.
   */
  async updateProfile(username?: string, email?: string): Promise<APIResponse<User>> {
    const { data } = await api.put('/profile', { username, email });
    return data;
  },

  /**
   * Upload user avatar photo.
   */
  async uploadAvatar(avatarFile: File): Promise<APIResponse<User>> {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const { data } = await api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};
export default profileService;
