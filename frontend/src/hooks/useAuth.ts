'use client';

import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';

export const useAuth = () => {
  const { user, accessToken, isAuthenticated, isHydrated, clearAuth, setAuth, setUser } = useAuthStore();

  const login = async (credentials: any) => {
    const res = await authService.login(credentials);
    if (res.success && res.data) {
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
    }
    return res;
  };

  const register = async (formData: FormData) => {
    const res = await authService.register(formData);
    if (res.success && res.data) {
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
    }
    return res;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.warn('Network logout failed, clearing local session states');
    } finally {
      clearAuth();
    }
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    isHydrated,
    login,
    register,
    logout,
    updateUser: setUser,
  };
};
export default useAuth;
