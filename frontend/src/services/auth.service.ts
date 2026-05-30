import { api } from './api';
import { APIResponse, User } from '../types';

const DEFAULT_API_BASE = 'http://localhost:5000/api/v1';

const resolveAuthUrl = (path: string): string => {
  const base = (api.defaults.baseURL || DEFAULT_API_BASE).replace(/\/+$/, '');
  return `${base}${path}`;
};

export const authService = {
  /**
   * Register a new user account.
   * If an avatar file is provided, submits as FormData.
   */
  async register(credentials: FormData): Promise<APIResponse<{ user: User; accessToken: string; refreshToken: string }>> {
    const { data } = await api.post(resolveAuthUrl('/auth/register'), credentials, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
  

  /**
   * Log in user and retrieve Access/Refresh tokens.
   */
  async login(credentials: any): Promise<APIResponse<{ user: User; accessToken: string; refreshToken: string }>> {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  /**
   * Check refresh tokens and fetch current authenticated user profile.
   */
  async getMe(): Promise<APIResponse<{ user: User; badges: any[]; runs: any[]; territoriesCount: number }>> {
    const { data } = await api.get('/profile/me');
    return data;
  },

  /**
   * Log out a user.
   */
  async logout(): Promise<APIResponse<void>> {
    const { data } = await api.post('/auth/logout');
    return data;
  },
};
export default authService;
