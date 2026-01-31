import { auth } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiClient = {
  get: async (endpoint: string, options?: RequestInit): Promise<Response> => {
    const token = auth.getToken();
    const headers = new Headers(options?.headers);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'GET',
      headers,
    });
  },

  post: async (endpoint: string, body?: unknown, options?: RequestInit): Promise<Response> => {
    const token = auth.getToken();
    const headers = new Headers(options?.headers);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    headers.set('Content-Type', 'application/json');

    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  },
};
