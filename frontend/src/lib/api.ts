import axios, { AxiosHeaders, type AxiosError, type AxiosRequestConfig } from 'axios';
import { authStore } from '@/store/auth';
import type { AuthUser } from '@/store/auth';
import type { ApiResponse } from '@/types/api';

const STORAGE_KEY = 'tactical-education-auth';

type PersistedAuth = {
  state?: {
    accessToken?: string;
    refreshToken?: string;
  };
};

const getPersistedTokens = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PersistedAuth;
    return {
      accessToken: parsed.state?.accessToken,
      refreshToken: parsed.state?.refreshToken,
    };
  } catch {
    return {};
  }
};

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
export const API_BASE_URL = apiBase;
export const API_BASE_ORIGIN = (() => {
  try {
    const parsed = new URL(apiBase);
    return parsed.origin;
  } catch {
    return '';
  }
})();

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
});

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken ?? getPersistedTokens().accessToken;
  if (token) {
    if (config.headers instanceof AxiosHeaders) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      const headers = new AxiosHeaders(config.headers);
      headers.set('Authorization', `Bearer ${token}`);
      config.headers = headers;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = authStore.getState().refreshToken ?? getPersistedTokens().refreshToken;
      if (!refreshToken) {
        authStore.logout();
        return Promise.reject(error);
      }

      try {
        originalRequest._retry = true;
        const { data } = await refreshClient.post<ApiResponse<{ accessToken: string; refreshToken: string; user: AuthUser }>>(
          '/auth/refresh',
          { refreshToken },
        );
        authStore.setSession(data.data);
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${data.data.accessToken}`,
        };
        return api(originalRequest);
      } catch (refreshError) {
        authStore.logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export async function apiGet<T>(url: string, config?: AxiosRequestConfig) {
  const { data } = await api.get<ApiResponse<T>>(url, config);
  return data.data;
}

export async function apiPost<T, B = Record<string, unknown>>(url: string, body?: B, config?: AxiosRequestConfig) {
  const { data } = await api.post<ApiResponse<T>>(url, body, config);
  return data.data;
}

export async function apiPatch<T, B = Record<string, unknown>>(url: string, body?: B, config?: AxiosRequestConfig) {
  const { data } = await api.patch<ApiResponse<T>>(url, body, config);
  return data.data;
}

export async function apiPut<T, B = Record<string, unknown>>(url: string, body?: B, config?: AxiosRequestConfig) {
  const { data } = await api.put<ApiResponse<T>>(url, body, config);
  return data.data;
}

export async function apiDelete(url: string, config?: AxiosRequestConfig) {
  await api.delete(url, config);
}
