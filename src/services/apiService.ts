import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

export const getToken = async (): Promise<string | null> => {
  try {
    const session = await fetchAuthSession();
    return session?.tokens?.accessToken?.toString() ?? null;
  } catch (error) {
    console.error('Error fetching auth token:', error);
    return null;
  }
};

export async function apiRequest(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: any,
  token?: string | null,
  customHeaders?: Record<string, string>
): Promise<any> {
  try {
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(customHeaders || {}),
    };

    const response = await axios({ method, url, data, headers });
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error occurred while performing ${method.toUpperCase()} request:`, error);
    throw error;
  }
}

export const get = (url: string, token?: string | null, customHeaders?: Record<string, string>) => apiRequest('get', url, undefined, token,customHeaders);
export const post = (url: string, data: any, token?: string | null, customHeaders?: Record<string, string>) =>
  apiRequest('post', url, data, token, customHeaders);
export const put = (url: string, data: any, token?: string | null) => apiRequest('put', url, data, token);
export const deleteRequest = (url: string, token?: string | null) => apiRequest('delete', url, undefined, token);
export const deleteRequestWithBody = (url: string, data: any, token?: string | null) =>
  apiRequest('delete', url, data, token);

export async function apiRequestWithHeaders(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: any,
  token?: string | null,
  customHeaders?: Record<string, string>
): Promise<any> {
  try {
    let headers: Record<string, string> = {};

    // Add authorization if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add custom headers if provided
    if (customHeaders) {
      headers = { ...headers, ...customHeaders };
    }

    const response = await axios({ method, url, data, headers });
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error occurred while performing ${method.toUpperCase()} request:`, error);
    throw error;
  }
}

// Add a new function to support POST with custom headers
export const postWithHeaders = (
  url: string,
  data: any,
  token?: string | null,
  customHeaders?: Record<string, string>
) => apiRequestWithHeaders('post', url, data, token, customHeaders);

export const putWithHeaders = (url: string, data: any, token?: string | null, customHeaders?: Record<string, string>) =>
  apiRequestWithHeaders('put', url, data, token, customHeaders);

export const getWithHeaders = (url: string, token?: string | null, customHeaders?: Record<string, string>) =>
  apiRequestWithHeaders('get', url, undefined, token, customHeaders);

export const deleteWithHeaders = (url: string, token?: string | null, customHeaders?: Record<string, string>) =>
  apiRequestWithHeaders('delete', url, undefined, token, customHeaders);
