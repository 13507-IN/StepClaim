import axios from 'axios';
import { useUserStore } from '../store/useUserStore';

// Determine the base URL based on environment
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors (e.g. 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and user data if unauthorized
      useUserStore.getState().clearAuth();
      // Optionally redirect to login, but handle mostly in UI layer
    }
    return Promise.reject(error);
  }
);
