/**
 * Service Wrapper Utilities
 * Provides graceful degradation for external service calls
 */

interface ServiceOptions {
  serviceName: string;
  timeout?: number;
  retries?: number;
  fallbackValue?: any;
  logErrors?: boolean;
}

/**
 * Wrap external service calls with error handling and fallback
 */
export async function withServiceFallback<T>(
  serviceCall: () => Promise<T>,
  options: ServiceOptions
): Promise<T | null> {
  const {
    serviceName,
    timeout = 5000,
    retries = 0,
    fallbackValue = null,
    logErrors = true,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Add timeout to service call
      const result = await Promise.race([
        serviceCall(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Service timeout')), timeout)
        ),
      ]);

      return result;
    } catch (error) {
      lastError = error as Error;

      if (logErrors && process.env.NODE_ENV === 'development') {
        console.warn(
          `[${serviceName}] Attempt ${attempt + 1}/${retries + 1} failed:`,
          error
        );
      }

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // All retries failed - return fallback
  if (logErrors) {
    console.error(
      `[${serviceName}] Service unavailable after ${retries + 1} attempts. Using fallback.`,
      lastError
    );
  }

  return fallbackValue;
}

/**
 * Check if service is available
 */
export async function checkServiceHealth(
  serviceName: string,
  healthCheck: () => Promise<boolean>
): Promise<boolean> {
  try {
    const isHealthy = await Promise.race([
      healthCheck(),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 3000)),
    ]);

    return isHealthy;
  } catch (error) {
    console.warn(`[${serviceName}] Health check failed:`, error);
    return false;
  }
}

/**
 * Safe API call wrapper
 */
export async function safeApiCall<T>(
  url: string,
  options?: RequestInit,
  fallback?: T
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error(`[API Call] ${url} failed:`, error);
    return {
      data: fallback ?? null,
      error: error as Error,
    };
  }
}

/**
 * Safe database query wrapper
 */
export async function safeDbQuery<T>(
  queryFn: () => Promise<T>,
  fallback?: T
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await queryFn();
    return { data, error: null };
  } catch (error) {
    console.error('[DB Query] Failed:', error);
    return {
      data: fallback ?? null,
      error: error as Error,
    };
  }
}

/**
 * Graceful component loader with fallback
 */
export function withComponentFallback<P extends object>(
  loader: () => Promise<{ default: React.ComponentType<P> }>,
  fallback: React.ComponentType<P>
) {
  return async (props: P) => {
    try {
      const { default: Component } = await loader();
      return <Component {...props} />;
    } catch (error) {
      console.error('Component loading failed, using fallback:', error);
      const Fallback = fallback;
      return <Fallback {...props} />;
    }
  };
}

/**
 * Safe local storage wrapper
 */
export const safeLocalStorage = {
  getItem(key: string, fallback: string | null = null): string | null {
    try {
      if (typeof window === 'undefined') return fallback;
      return localStorage.getItem(key) ?? fallback;
    } catch (error) {
      console.warn('[localStorage] getItem failed:', error);
      return fallback;
    }
  },

  setItem(key: string, value: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('[localStorage] setItem failed:', error);
      return false;
    }
  },

  removeItem(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('[localStorage] removeItem failed:', error);
      return false;
    }
  },
};

/**
 * Safe session storage wrapper
 */
export const safeSessionStorage = {
  getItem(key: string, fallback: string | null = null): string | null {
    try {
      if (typeof window === 'undefined') return fallback;
      return sessionStorage.getItem(key) ?? fallback;
    } catch (error) {
      console.warn('[sessionStorage] getItem failed:', error);
      return fallback;
    }
  },

  setItem(key: string, value: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      sessionStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('[sessionStorage] setItem failed:', error);
      return false;
    }
  },

  removeItem(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('[sessionStorage] removeItem failed:', error);
      return false;
    }
  },
};
