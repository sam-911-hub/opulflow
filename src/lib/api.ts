import { toast } from "sonner";

/**
 * Base API request options
 */
interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

/**
 * Make an API request
 * @param endpoint API endpoint
 * @param options Request options
 * @returns Promise with response data
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  try {
    const { method = 'GET', body, headers = {} } = options;
    
    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      credentials: 'include' // Include cookies for authentication
    };
    
    // Add body if provided
    if (body) {
      requestOptions.body = JSON.stringify(body);
    }
    
    // Make request
    const response = await fetch(endpoint, requestOptions);
    
    // Parse response
    const data = await response.json();
    
    // Handle error responses
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data as T;
  } catch (error: any) {
    // Show error toast
    toast.error(error.message || 'API request failed');
    throw error;
  }
}

/**
 * Make a GET request
 * @param endpoint API endpoint
 * @param headers Optional headers
 * @returns Promise with response data
 */
export function get<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET', headers });
}

/**
 * Make a POST request
 * @param endpoint API endpoint
 * @param body Request body
 * @param headers Optional headers
 * @returns Promise with response data
 */
export function post<T = any>(endpoint: string, body: any, headers?: Record<string, string>): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'POST', body, headers });
}

/**
 * Make a PUT request
 * @param endpoint API endpoint
 * @param body Request body
 * @param headers Optional headers
 * @returns Promise with response data
 */
export function put<T = any>(endpoint: string, body: any, headers?: Record<string, string>): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'PUT', body, headers });
}

/**
 * Make a DELETE request
 * @param endpoint API endpoint
 * @param headers Optional headers
 * @returns Promise with response data
 */
export function del<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE', headers });
}