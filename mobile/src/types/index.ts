export type ResourceType = 'COURSE' | 'ARTICLE' | 'VIDEO';

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  tags: string[];
  createdById: string;
  createdAt: string;
  _count?: { ratings: number };
}

export interface Rating {
  id: string;
  userId: string;
  resourceId: string;
  score: number;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface ApiError {
  message: string | string[];
  error?: string;
  statusCode: number;
}