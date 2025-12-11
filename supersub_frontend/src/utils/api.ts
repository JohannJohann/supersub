// Base API configuration and utilities
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Default headers for API requests
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

// API response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}

// Get headers for requests
const getHeaders = (): HeadersInit => {
  return { ...DEFAULT_HEADERS };
};

// Generic API request function
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    credentials: "include", // Include HTTP-only cookies
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    let data: T | string;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      data = (await response.json()) as T;
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorData =
        typeof data === "object" && data !== null
          ? (data as Record<string, unknown>)
          : {};
      throw {
        message:
          (errorData.message as string) ||
          (errorData.detail as string) ||
          "Request failed",
        status: response.status,
        details: data,
      } as ApiError;
    }

    return {
      data: data as T,
      status: response.status,
      message:
        typeof data === "object" && data !== null
          ? ((data as Record<string, unknown>).message as string)
          : undefined,
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw {
        message: "Network error - please check your connection",
        status: 0,
        details: error,
      } as ApiError;
    }

    throw error as ApiError;
  }
};

// HTTP method helpers
export const api = {
  get: <T>(endpoint: string): Promise<ApiResponse<T>> =>
    apiRequest<T>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, data?: object): Promise<ApiResponse<T>> =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: object): Promise<ApiResponse<T>> =>
    apiRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: object): Promise<ApiResponse<T>> =>
    apiRequest<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string): Promise<ApiResponse<T>> =>
    apiRequest<T>(endpoint, { method: "DELETE" }),
};

export default api;
