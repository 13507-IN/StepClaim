import { apiClient } from '../lib/apiClient';
import { User } from '../store/useUserStore';

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user: User;
  };
}

export const authService = {
  login: async (data: Record<string, any>): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: Record<string, any>): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  getMe: async (): Promise<AuthResponse> => {
    const response = await apiClient.get<AuthResponse>('/auth/me');
    return response.data;
  },
};
