import { get, getToken, post } from '../apiService';
import environment from '../../environments/environment';

export async function getShortUrl(url: string): Promise<any> {
  try {
    // Fetch the auth token
    const token = await getToken();
    if (!token) {
      throw new Error('Failed to retrieve authentication token');
    }

    // Make the POST request to shorten URL
    const response = await post(`${environment.shortenAPI}/v1/alias`, { url }, token);

    return response;
  } catch (error) {
    console.error('Error fetching shortened URL:', error);
    throw error;
  }
}
