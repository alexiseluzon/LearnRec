import axios from 'axios';
import { tokenStorage } from './tokenStorage';

// TODO: move to app.config.ts / EAS env vars before production build
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Attach JWT to every outgoing request if present
apiClient.interceptors.request.use(async (config) => {
  const token = await tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handling: clear stale token so the app can redirect to login.
// Screens/context still handle the actual navigation.
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await tokenStorage.clear();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);