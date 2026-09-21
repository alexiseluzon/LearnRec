import { apiClient } from './client';
import { Resource, ResourceType, Rating } from '../types';

export const resourcesApi = {
  list: () => apiClient.get<Resource[]>('/resources').then((res) => res.data),

  getOne: (id: string) =>
    apiClient.get<Resource>(`/resources/${id}`).then((res) => res.data),

  create: (title: string, url: string, type: ResourceType, tags: string[]) =>
    apiClient
      .post<Resource>('/resources', { title, url, type, tags })
      .then((res) => res.data),

  rate: (id: string, score: number) =>
    apiClient
      .post<Rating>(`/resources/${id}/rate`, { score })
      .then((res) => res.data),
};