import { apiClient } from './client';
import { Resource } from '../types';

export const recommendationsApi = {
  getForUser: () =>
    apiClient.get<Resource[]>('/recommendations').then((res) => res.data),
};