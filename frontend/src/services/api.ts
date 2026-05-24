import axios from 'axios';

const DEFAULT_API_URL = 'http://localhost:5000/api/v1';

const getApiUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl || envUrl === 'undefined' || envUrl === 'null') {
    return DEFAULT_API_URL;
  }

  const normalized = envUrl.trim();

  // Support relative values like "/api/v1" while still targeting backend :5000.
  if (normalized.startsWith('/')) {
    return `http://localhost:5000${normalized}`;
  }

  if (normalized.startsWith('http')) {
    try {
      const parsed = new URL(normalized);

      // Prevent accidental local misrouting to Next.js dev server (:3000).
      if (
        (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') &&
        parsed.port === '3000'
      ) {
        return DEFAULT_API_URL;
      }
    } catch {
      return DEFAULT_API_URL;
    }

    return normalized;
  }

  return DEFAULT_API_URL;
};

const API_URL = getApiUrl();
console.log('[StepClaim] API_URL resolved to:', API_URL);

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent infinite retry loops during token refresh failures
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request Interceptor: Inject JWT token into headers
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Seamless automatic JWT Token refreshing on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
        
        // Call token refresh route
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true },
        );

        if (response.data.success) {
          const { accessToken } = response.data.data;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken);
            if (response.data.data.refreshToken) {
              localStorage.setItem('refreshToken', response.data.data.refreshToken);
            }
          }

          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          processQueue(null, accessToken);
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Refresh token failed -> Force user logout
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Trigger redirect to login page
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
