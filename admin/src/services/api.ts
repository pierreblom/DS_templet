import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse, ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'admin_access_token';
const REFRESH_TOKEN_KEY = 'admin_refresh_token';

export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Request interceptor to add auth header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        window.location.href = '/admin/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        setTokens(accessToken, newRefreshToken);

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        clearTokens();
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  logout: () => api.post('/auth/logout'),

  getMe: () => api.get('/auth/me'),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }),
};

// Products API
export const productsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/products', { params }),

  get: (id: number) => api.get(`/products/${id}`),

  create: (data: Partial<import('../types').Product>) =>
    api.post('/products', data),

  update: (id: number, data: Partial<import('../types').Product>) =>
    api.put(`/products/${id}`, data),

  updateStock: (id: number, stock: number) =>
    api.patch(`/products/${id}/stock`, { stock }),

  delete: (id: number) => api.delete(`/products/${id}`),

  restore: (id: number) => api.patch(`/products/${id}/restore`),

  listAll: () => api.get('/products/admin/all'),
};

// Orders API
export const ordersApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/orders', { params }),

  get: (id: string) => api.get(`/orders/${id}`),

  updateStatus: (id: string, status: string, trackingNumber?: string) =>
    api.patch(`/orders/${id}/status`, { status, trackingNumber }),

  cancel: (id: string) => api.post(`/orders/${id}/cancel`),
};

// Users API
export const usersApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/users', { params }),

  get: (id: number) => api.get(`/users/${id}`),

  updateRole: (id: number, role: string) =>
    api.patch(`/users/${id}/role`, { role }),
};

// Analytics API
export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard'),

  sales: (params?: { period?: string; startDate?: string; endDate?: string }) =>
    api.get('/analytics/sales', { params }),

  products: () => api.get('/analytics/products'),

  orders: () => api.get('/analytics/orders'),
};

// Contact API
export const contactApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/contact', { params }),
};
