import configService from '../services/config';

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = configService.getApiUrl();
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Get auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new HttpError(
      response.status,
      data.message || response.statusText,
      data
    );
  }

  return data;
}

export async function get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = params 
    ? `${endpoint}?${new URLSearchParams(params)}`
    : endpoint;
  
  return fetchApi<T>(url, { method: 'GET' });
}

export async function post<T>(endpoint: string, data?: unknown): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function put<T>(endpoint: string, data?: unknown): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function del<T>(endpoint: string): Promise<T> {
  return fetchApi<T>(endpoint, { method: 'DELETE' });
}

export const http = {
  get,
  post,
  put,
  delete: del,
  fetch: fetchApi,
};

export default http;
