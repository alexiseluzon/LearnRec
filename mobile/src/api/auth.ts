import { apiClient } from './client';
import { AuthResponse } from '../types';

export const authApi = {
  signup: (email: string, password: string, name: string) =>
    apiClient
      .post<AuthResponse>('/auth/signup', { email, password, name })
      .then((res) => res.data),

  login: (email: string, password: string) =>
    apiClient
      .post<AuthResponse>('/auth/login', { email, password })
      .then((res) => res.data),
};