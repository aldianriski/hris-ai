/**
 * Enhanced API Client for HRIS Platform
 * Features:
 * - Automatic authentication token injection
 * - Request/response interceptors
 * - Retry logic for failed requests
 * - Request/response logging
 * - Comprehensive error handling
 */

import { createClient } from '@/lib/supabase/client';

interface ApiError {
  error: string;
  details?: string;
  code?: string;
}

interface RequestConfig extends RequestInit {
  retry?: number;
  retryDelay?: number;
  skipAuth?: boolean;
  skipLogging?: boolean;
}

type RequestInterceptor = (config: RequestConfig) => Promise<RequestConfig> | RequestConfig;
type ResponseInterceptor = (response: Response) => Promise<Response> | Response;
type ErrorInterceptor = (error: Error) => Promise<Error> | Error;

class ApiClient {
  private baseUrl: string;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private enableLogging: boolean;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
    this.enableLogging = process.env.NODE_ENV === 'development';
    this.setupDefaultInterceptors();
  }

  /**
   * Setup default interceptors for auth and logging
   */
  private setupDefaultInterceptors() {
    // Request interceptor for authentication
    this.addRequestInterceptor(async (config) => {
      if (config.skipAuth) {
        return config;
      }

      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.access_token) {
          config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${session.access_token}`,
          };
        }
      } catch (error) {
        console.warn('Failed to get auth token:', error);
      }

      return config;
    });

    // Request interceptor for logging
    this.addRequestInterceptor((config) => {
      if (this.enableLogging && !config.skipLogging) {
        console.group(`🚀 API Request: ${config.method || 'GET'}`);
        console.log('Headers:', config.headers);
        if (config.body) {
          console.log('Body:', JSON.parse(config.body as string));
        }
        console.groupEnd();
      }
      return config;
    });

    // Response interceptor for logging
    this.addResponseInterceptor(async (response) => {
      if (this.enableLogging) {
        const clonedResponse = response.clone();
        try {
          const data = await clonedResponse.json();
          console.group(`✅ API Response: ${response.status} ${response.statusText}`);
          console.log('Data:', data);
          console.groupEnd();
        } catch {
          // Response is not JSON, skip logging
        }
      }
      return response;
    });
  }

  /**
   * Add a request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add a response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Add an error interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor) {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Execute all request interceptors
   */
  private async executeRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let modifiedConfig = config;
    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }
    return modifiedConfig;
  }

  /**
   * Execute all response interceptors
   */
  private async executeResponseInterceptors(response: Response): Promise<Response> {
    let modifiedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }
    return modifiedResponse;
  }

  /**
   * Execute all error interceptors
   */
  private async executeErrorInterceptors(error: Error): Promise<Error> {
    let modifiedError = error;
    for (const interceptor of this.errorInterceptors) {
      modifiedError = await interceptor(modifiedError);
    }
    return modifiedError;
  }

  /**
   * Main request method with retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestConfig = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const maxRetries = options.retry ?? 0;
    const retryDelay = options.retryDelay ?? 1000;

    let lastError: Error | null = null;

    // Apply request interceptors
    const config = await this.executeRequestInterceptors({
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, config);

        // Apply response interceptors
        const interceptedResponse = await this.executeResponseInterceptors(response);

        if (!interceptedResponse.ok) {
          let errorMessage = 'Request failed';
          let errorCode = 'UNKNOWN_ERROR';

          try {
            const errorData: ApiError = await interceptedResponse.clone().json();
            errorMessage = errorData.details || errorData.error || errorMessage;
            errorCode = errorData.code || errorCode;
          } catch {
            errorMessage = interceptedResponse.statusText || errorMessage;
          }

          const error = new Error(errorMessage);
          (error as any).code = errorCode;
          (error as any).status = interceptedResponse.status;
          throw error;
        }

        // Return empty object for 204 No Content
        if (interceptedResponse.status === 204) {
          return {} as T;
        }

        return interceptedResponse.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Network error occurred');

        // Apply error interceptors
        lastError = await this.executeErrorInterceptors(lastError);

        // Log retry attempt
        if (attempt < maxRetries) {
          if (this.enableLogging) {
            console.warn(`⚠️ Request failed, retrying (${attempt + 1}/${maxRetries})...`);
          }
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    // All retries exhausted
    if (this.enableLogging) {
      console.error('❌ API Request Failed:', lastError);
    }
    throw lastError;
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>, config?: RequestConfig): Promise<T> {
    const searchParams = params
      ? `?${new URLSearchParams(
          Object.entries(params).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        ).toString()}`
      : '';
    return this.request<T>(`${endpoint}${searchParams}`, {
      method: 'GET',
      ...config,
    });
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...config,
    });
  }

  /**
   * Enable/disable request logging
   */
  setLogging(enabled: boolean) {
    this.enableLogging = enabled;
  }

  /**
   * Get the base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

export const apiClient = new ApiClient();
