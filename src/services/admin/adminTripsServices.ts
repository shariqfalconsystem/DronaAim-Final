import { get, post, getToken } from '../apiService';
import environment from '../../environments/environment';

export async function getInsurerTrips(requestBody: any = {}, page: number, limit: number): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  // Only include page and limit as query parameters
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const url = `${environment.baseAPI}lonestar/trips?${queryParams}`;

  // Send request body as POST data
  return await post(url, requestBody, token);
}
